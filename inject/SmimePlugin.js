const { ContentInfo, SignedData, Certificate, EnvelopedData } = require('pkijs');
const asn1js = require('asn1js');
const MimeParser = require('emailjs-mime-parser');
const { stringToArrayBuffer, utilConcatBuf } = require('pvutils');
const crypto = require('crypto');

const PREFIX_SIGNED = 'data:multipart/signed;base64,';
const PREFIX_ENCRYPTED = 'data:application/pkcs7-mime;base64,';

class SmimePlugin {
    Initialize(_, settingsJson) {
        const settings = JSON.parse(settingsJson);
        console.log("Initialize", settings);
        return JSON.stringify({
            Data: {
                Version: settings.OwaControlVersion
            }
        });
    }
    
    CreateMessageFromSmimeAsync(smime, cb) {
        console.log("CreateMessageFromSmimeAsync", smime);
        
        try {
            if (smime.startsWith(PREFIX_SIGNED)) {
                this.processSignedMessage(window.atob(smime.substring(PREFIX_SIGNED.length).replace("/\n/g", "")), cb);
            } else if (smime.startsWith(PREFIX_ENCRYPTED)) {
                this.processEncryptedMessage(window.atob(smime.substring(PREFIX_ENCRYPTED.length).replace("/\n/g", "")), cb);
            } else {
                throw new Error("Unsupported message type");
            }
        } catch (e) {
            console.log(e);
        }
    }
    
    processSignedMessage(msg, cb) {
        const parser = new MimeParser();
        parser.write(msg);
        parser.end();
        
        const lastNode = parser.getNode("2");
        // Get signature buffer
        const signedBuffer = utilConcatBuf(new ArrayBuffer(0), lastNode.content);
			
        // Parse into pkijs types
        const asn1 = asn1js.fromBER(signedBuffer);
        if (asn1.offset === (-1)) {
            throw new Error("Incorrect message format!");
        }
        
        const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
        const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
        const signerCert = cmsSignedSimpl.certificates[0];
        
        // Get signed data buffer
        const signedDataBuffer = stringToArrayBuffer(parser.nodes.node1.raw.replace(/\n/g, "\r\n"));

        cmsSignedSimpl.verify({ signer: 0, data: signedDataBuffer }).then(function(result) {
            const textContent = getContent(parser, "text/plain");
            const htmlContent = getContent(parser, "text/html");
            cb(JSON.stringify({Data: {
                ItemClass: "IPM.Note.SMIME.MultipartSigned",
                ItemId: {
                    Id: "smime-" + crypto.randomBytes(16).toString('hex')
                },
                NormalizedBody: {
                    BodyType: htmlContent ? "HTML" : "Text",
                    Value: htmlContent || textContent
                },
                SmimeSignature: {
                    CertIssuedTo: formatDN(signerCert.subject),
                    CertIssuedBy: formatDN(signerCert.issuer),
                    CertValidFrom: signerCert.notBefore.value.toLocaleString(),
                    CertValidTo: signerCert.notAfter.value.toLocaleString(),
                    CertRawData: certToBase64(signerCert),
                    ClientVerificationResult: 0,
                    IsCertValidToClient: true,
                    IsCertValidToServer: false,
                    IsHashMatched: result,
                    ServerVerificationResult: -1
                },
                SmimeType: 11
            }, ErrorCode: 0}));
        }, function(err) {
            cb(JSON.stringify({ErrorCode: err}));
        });
    }
    
    processEncryptedMessage(msg, cb) {
        const cmsEnvelopedBuffer = Uint8Array.from(msg, c => c.charCodeAt(0)).buffer
        
        let asn1 = asn1js.fromBER(cmsEnvelopedBuffer);
        if (asn1.offset === (-1)) {
            throw new Error("Incorrect message format!");
        }
        
        const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
        const cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });

        console.log(cmsEnvelopedSimp)
        
        cb(JSON.stringify({ErrorCode: 67}));
    }
    
    CreateSmimeFromMessageAsync(smimeType, emailMessage, encryptionCertificates, signingCertificate, cb) {
        console.log("CreateSmimeFromMessageAsync", smimeType, emailMessage, encryptionCertificates, signingCertificate);
    }
    CreateMessageFromItemAttachment(mime) {
        console.log("CreateMessageFromItemAttachment", mime);
    }
    GetSigningCertificate(subjectKeyIdentifier) {
        console.log("GetSigningCertificate", subjectKeyIdentifier);
    }
}

function formatDN(relativeDNs) {
    const rdnmap = {
        "2.5.4.6": "C",
        "2.5.4.10": "OU",
        "2.5.4.11": "O",
        "2.5.4.3": "CN",
        "2.5.4.7": "L",
        "2.5.4.8": "S",
        "2.5.4.12": "T",
        "2.5.4.42": "GN",
        "2.5.4.43": "I",
        "2.5.4.4": "SN",
        "2.5.4.13": "Description",
        "1.2.840.113549.1.9.1": "E"
    };
    
    let result = "";
    let first = true;
    for (let i = relativeDNs.typesAndValues.length - 1; i >= 0; i--) {
        const attr = relativeDNs.typesAndValues[i];
        if (!rdnmap[attr.type]) {
            continue;
        }
        if (!first) {
            result = result + ", ";
        }
        first = false;
        result = result + rdnmap[attr.type] + "=" + attr.value.valueBlock.value;
    }
    return result;
}

function getContent(parser, contentType) {
    for (let key of Object.keys(parser.nodes)) {
        if (parser.nodes[key].contentType && parser.nodes[key].contentType.value === contentType) {
            const binContent = parser.nodes[key].content;
            return Buffer.from(binContent).toString(parser.nodes[key].charset);
        }
    }
}

function certToBase64(certificate) {
    const certificateBuffer = certificate.toSchema(true).toBER(false);
    const certificateString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));
    return window.btoa(certificateString);
}

module.exports = SmimePlugin;
