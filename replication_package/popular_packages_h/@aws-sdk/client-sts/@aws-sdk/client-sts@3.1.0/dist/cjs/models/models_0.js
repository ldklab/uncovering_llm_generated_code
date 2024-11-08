"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSessionTokenResponse = exports.GetSessionTokenRequest = exports.GetFederationTokenResponse = exports.FederatedUser = exports.GetFederationTokenRequest = exports.GetCallerIdentityResponse = exports.GetCallerIdentityRequest = exports.GetAccessKeyInfoResponse = exports.GetAccessKeyInfoRequest = exports.InvalidAuthorizationMessageException = exports.DecodeAuthorizationMessageResponse = exports.DecodeAuthorizationMessageRequest = exports.IDPCommunicationErrorException = exports.AssumeRoleWithWebIdentityResponse = exports.AssumeRoleWithWebIdentityRequest = exports.InvalidIdentityTokenException = exports.IDPRejectedClaimException = exports.AssumeRoleWithSAMLResponse = exports.AssumeRoleWithSAMLRequest = exports.RegionDisabledException = exports.PackedPolicyTooLargeException = exports.MalformedPolicyDocumentException = exports.ExpiredTokenException = exports.AssumeRoleResponse = exports.Credentials = exports.AssumeRoleRequest = exports.Tag = exports.PolicyDescriptorType = exports.AssumedRoleUser = void 0;
var AssumedRoleUser;
(function (AssumedRoleUser) {
    AssumedRoleUser.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(AssumedRoleUser = exports.AssumedRoleUser || (exports.AssumedRoleUser = {}));
var PolicyDescriptorType;
(function (PolicyDescriptorType) {
    PolicyDescriptorType.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(PolicyDescriptorType = exports.PolicyDescriptorType || (exports.PolicyDescriptorType = {}));
var Tag;
(function (Tag) {
    Tag.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(Tag = exports.Tag || (exports.Tag = {}));
var AssumeRoleRequest;
(function (AssumeRoleRequest) {
    AssumeRoleRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(AssumeRoleRequest = exports.AssumeRoleRequest || (exports.AssumeRoleRequest = {}));
var Credentials;
(function (Credentials) {
    Credentials.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(Credentials = exports.Credentials || (exports.Credentials = {}));
var AssumeRoleResponse;
(function (AssumeRoleResponse) {
    AssumeRoleResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(AssumeRoleResponse = exports.AssumeRoleResponse || (exports.AssumeRoleResponse = {}));
var ExpiredTokenException;
(function (ExpiredTokenException) {
    ExpiredTokenException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ExpiredTokenException = exports.ExpiredTokenException || (exports.ExpiredTokenException = {}));
var MalformedPolicyDocumentException;
(function (MalformedPolicyDocumentException) {
    MalformedPolicyDocumentException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(MalformedPolicyDocumentException = exports.MalformedPolicyDocumentException || (exports.MalformedPolicyDocumentException = {}));
var PackedPolicyTooLargeException;
(function (PackedPolicyTooLargeException) {
    PackedPolicyTooLargeException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(PackedPolicyTooLargeException = exports.PackedPolicyTooLargeException || (exports.PackedPolicyTooLargeException = {}));
var RegionDisabledException;
(function (RegionDisabledException) {
    RegionDisabledException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RegionDisabledException = exports.RegionDisabledException || (exports.RegionDisabledException = {}));
var AssumeRoleWithSAMLRequest;
(function (AssumeRoleWithSAMLRequest) {
    AssumeRoleWithSAMLRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(AssumeRoleWithSAMLRequest = exports.AssumeRoleWithSAMLRequest || (exports.AssumeRoleWithSAMLRequest = {}));
var AssumeRoleWithSAMLResponse;
(function (AssumeRoleWithSAMLResponse) {
    AssumeRoleWithSAMLResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(AssumeRoleWithSAMLResponse = exports.AssumeRoleWithSAMLResponse || (exports.AssumeRoleWithSAMLResponse = {}));
var IDPRejectedClaimException;
(function (IDPRejectedClaimException) {
    IDPRejectedClaimException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(IDPRejectedClaimException = exports.IDPRejectedClaimException || (exports.IDPRejectedClaimException = {}));
var InvalidIdentityTokenException;
(function (InvalidIdentityTokenException) {
    InvalidIdentityTokenException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(InvalidIdentityTokenException = exports.InvalidIdentityTokenException || (exports.InvalidIdentityTokenException = {}));
var AssumeRoleWithWebIdentityRequest;
(function (AssumeRoleWithWebIdentityRequest) {
    AssumeRoleWithWebIdentityRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(AssumeRoleWithWebIdentityRequest = exports.AssumeRoleWithWebIdentityRequest || (exports.AssumeRoleWithWebIdentityRequest = {}));
var AssumeRoleWithWebIdentityResponse;
(function (AssumeRoleWithWebIdentityResponse) {
    AssumeRoleWithWebIdentityResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(AssumeRoleWithWebIdentityResponse = exports.AssumeRoleWithWebIdentityResponse || (exports.AssumeRoleWithWebIdentityResponse = {}));
var IDPCommunicationErrorException;
(function (IDPCommunicationErrorException) {
    IDPCommunicationErrorException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(IDPCommunicationErrorException = exports.IDPCommunicationErrorException || (exports.IDPCommunicationErrorException = {}));
var DecodeAuthorizationMessageRequest;
(function (DecodeAuthorizationMessageRequest) {
    DecodeAuthorizationMessageRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DecodeAuthorizationMessageRequest = exports.DecodeAuthorizationMessageRequest || (exports.DecodeAuthorizationMessageRequest = {}));
var DecodeAuthorizationMessageResponse;
(function (DecodeAuthorizationMessageResponse) {
    DecodeAuthorizationMessageResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DecodeAuthorizationMessageResponse = exports.DecodeAuthorizationMessageResponse || (exports.DecodeAuthorizationMessageResponse = {}));
var InvalidAuthorizationMessageException;
(function (InvalidAuthorizationMessageException) {
    InvalidAuthorizationMessageException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(InvalidAuthorizationMessageException = exports.InvalidAuthorizationMessageException || (exports.InvalidAuthorizationMessageException = {}));
var GetAccessKeyInfoRequest;
(function (GetAccessKeyInfoRequest) {
    GetAccessKeyInfoRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetAccessKeyInfoRequest = exports.GetAccessKeyInfoRequest || (exports.GetAccessKeyInfoRequest = {}));
var GetAccessKeyInfoResponse;
(function (GetAccessKeyInfoResponse) {
    GetAccessKeyInfoResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetAccessKeyInfoResponse = exports.GetAccessKeyInfoResponse || (exports.GetAccessKeyInfoResponse = {}));
var GetCallerIdentityRequest;
(function (GetCallerIdentityRequest) {
    GetCallerIdentityRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetCallerIdentityRequest = exports.GetCallerIdentityRequest || (exports.GetCallerIdentityRequest = {}));
var GetCallerIdentityResponse;
(function (GetCallerIdentityResponse) {
    GetCallerIdentityResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetCallerIdentityResponse = exports.GetCallerIdentityResponse || (exports.GetCallerIdentityResponse = {}));
var GetFederationTokenRequest;
(function (GetFederationTokenRequest) {
    GetFederationTokenRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetFederationTokenRequest = exports.GetFederationTokenRequest || (exports.GetFederationTokenRequest = {}));
var FederatedUser;
(function (FederatedUser) {
    FederatedUser.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(FederatedUser = exports.FederatedUser || (exports.FederatedUser = {}));
var GetFederationTokenResponse;
(function (GetFederationTokenResponse) {
    GetFederationTokenResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetFederationTokenResponse = exports.GetFederationTokenResponse || (exports.GetFederationTokenResponse = {}));
var GetSessionTokenRequest;
(function (GetSessionTokenRequest) {
    GetSessionTokenRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetSessionTokenRequest = exports.GetSessionTokenRequest || (exports.GetSessionTokenRequest = {}));
var GetSessionTokenResponse;
(function (GetSessionTokenResponse) {
    GetSessionTokenResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetSessionTokenResponse = exports.GetSessionTokenResponse || (exports.GetSessionTokenResponse = {}));
//# sourceMappingURL=models_0.js.map