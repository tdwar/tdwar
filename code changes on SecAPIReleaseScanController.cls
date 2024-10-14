218--if (Schema.sObjectType.Istsecscanresults.fields.Id.isUpdateable()) {
    scanResult.Id = id;
} else {
    throw new AuthorizationException('User is not authorized to update field Id.');
}
219
if (Schema.sObjectType.Istsecscanresults.fields.status_url__c.isUpdateable()) {
    scanResult.status_url__c = statusUrl;
} else {
    throw new AuthorizationException('User is not authorized to update field status_url__c.');
}
220
if (Schema.sObjectType.Istsecscanresults.fields.release_copado__c.isUpdateable()) {
    scanResult.release_copado__c = releaseCopado;
} else {
    throw new AuthorizationException('User is not authorized to update field release_copado__c.');
}
222
if (Schema.sObjectType.Istsecscanresults.fields.recordtypeid.isUpdateable()) {
    scanResult.recordTypeId = recordTypeId;
} else {
    throw new AuthorizationException('User is not authorized to update field recordtypeid.');
}
223
if (Schema.sObjectType.Istsecscanresults.fields.secapi_scan_id__c.isUpdateable()) {
    scanResult.secapi_scan_id__c = secapiScanId;
} else {
    throw new AuthorizationException('User is not authorized to update field secapi_scan_id__c.');
}
231
if (Schema.sObjectType.Istsecscanresults.fields.error_message__c.isUpdateable()) {
    scanResult.error_message__c = errorMessage;
} else {
    throw new AuthorizationException('User is not authorized to update field error_message__c.');
}
240
if (!Schema.sObjectType.Istsecscanresults.isUpdateable()) {
    throw new AuthorizationException('User is not authorized to update Istsecscanresults.');
}
