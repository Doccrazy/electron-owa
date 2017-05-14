const ErrorCode = {
    NoError: 0,
    UnknownError: 11,
    CannotDecrypt: 13,
    CannotVerify: 14,
    CannotVerifyOpaque: 15,
    CannotEncrypt: 16,
    CannotSign: 17,
    CannotGetSignatureBlobSize: 18,
    DataPackageTooLarge: 52,
    CannotParseMimeContent: 53,
    CannotBuildMimeContent: 54,
    CannotAcquireCspContext: 55,
    CannotEncodeSigningTime: 56,
    CannotOpenMsgToEncode: 57,
    CannotOpenMsgToDecode: 58,
    CannotProcessMessage: 59,
    CannotGetMessageParam: 60,
    CannotGetCertContextProperty: 61,
    CannotGetSigningTimes: 62,
    CannotGetCertsInMessage: 63,
    CannotAddSignerToMessage: 64,
    CannotAddCertsToMessage: 65,
    CannotOpenCertStore: 66,
    CannotGetSubjectCertFromStore: 67,
    UserCanceledSelectingCert: 68,
    CannotAccessSmartcard: 69,
    CannotParseEncryptionAlgorithms: 70,
    CannotParseSigningAlgorithms: 71,
    CannotEncodeSmimeCapabilities: 72
};

const SmimeType = {
    Unknown: -1,
    None: 0,
    Data: 1,
    Signed: 2,
    Enveloped: 3,
    SignedAndEnveloped: 4,
    Hashed: 5,
    Encrypted: 6,
    OpaqueSigned: 10,
    ClearSigned: 11,
    SignedThenEncrypted: 12,
    EncryptedThenSigned: 13,
    TripleWrapped: 14
};

module.exports = { ErrorCode, SmimeType };
