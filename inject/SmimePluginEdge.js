const edge = require('edge');
const path = require('path');
const fs = require('fs');

const clrLib = path.join(__dirname, 'lib', 'Microsoft.Exchange.Clients.SmimeAX.dll')

const createSmimeAX = function() { return edge.func(`
    #r "${clrLib}"
    #r "System.Windows.Forms.dll"
    
    using Microsoft.Exchange.Clients;
    
    using System;
    using System.Threading.Tasks;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            SmimeAX ax = null;
            return new {
                Initialize = (Func<object,Task<object>>)(
                    async (settings) => 
                    { 
                        ax = new SmimeAX();
                        return ax.Initialize(null, (string)settings); 
                    }
                ),
                CreateMessageFromSmime = (Func<object,Task<object>>)(
                    async (smime) => 
                    { 
                        return ax.CreateMessageFromSmime((string)smime); 
                    }
                ),
                CreateSmimeFromMessage = (Func<object,Task<object>>)(
                    async (dynamic data) => 
                    { 
                        return ax.CreateSmimeFromMessage((int)data.smimeType, (string)data.emailMessage, (string)data.encryptionCertificates, (string)data.signingCertificate); 
                    }
                ),
                CreateMessageFromItemAttachment = (Func<object,Task<object>>)(
                    async (mime) => 
                    { 
                        return ax.CreateMessageFromItemAttachment((string)mime); 
                    }
                ),
                GetSigningCertificate = (Func<object,Task<object>>)(
                    async (subjectKeyIdentifier) => 
                    { 
                        return ax.GetSigningCertificate((string)subjectKeyIdentifier); 
                    }
                ),
                Dispose = (Func<object,Task<object>>)(
                    async (_) => 
                    { 
                        ax.Dispose();
                        ax = null;
                        return null;
                    }
                )
            };
        }
    }
`)(null, true)};

class SmimePlugin {
    constructor() {
        if (!fs.existsSync(clrLib)) {
            throw new Error("SmimeAX .NET library not found in path " + clrLib);
        }
    }
    
    Initialize(_, settings) {
        console.log("Initialize", settings);
        this.smimeAX = createSmimeAX();
        return this.smimeAX.Initialize(settings, true);
    }
    
    CreateMessageFromSmimeAsync(smime, cb) {
        console.log("CreateMessageFromSmimeAsync", smime);
        this.smimeAX.CreateMessageFromSmime(smime, (error, result) => cb(result));
    }
    CreateSmimeFromMessageAsync(smimeType, emailMessage, encryptionCertificates, signingCertificate, cb) {
        console.log("CreateSmimeFromMessageAsync", smimeType, emailMessage, encryptionCertificates, signingCertificate);
        this.smimeAX.CreateSmimeFromMessage({smimeType, emailMessage, encryptionCertificates, signingCertificate}, (error, result) => cb(result));
    }
    CreateMessageFromItemAttachment(mime) {
        console.log("CreateMessageFromItemAttachment", mime);
        return this.smimeAX.CreateMessageFromItemAttachment(mime, true);
    }
    GetSigningCertificate(subjectKeyIdentifier) {
        console.log("GetSigningCertificate", subjectKeyIdentifier);
        return this.smimeAX.GetSigningCertificate(subjectKeyIdentifier, true);
    }
    Dispose() {
        console.log("Dispose");
        this.smimeAX.Dispose();
    }
}

module.exports = SmimePlugin;
