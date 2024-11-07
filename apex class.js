/******************************************************************************************************************************
Apex Class Name  : SecAPIReleaseScanController
Version          : 1.0 
Created Date     : 14/04/2021
Function         : 

Modification Log :
* Developer                       Date                 Description
* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------                
* Vaibhav Tripathi               04/03/2021          This controller call from Aura component and used to do SEC api 3 different sequential callouts for checkmarx scan.
* Krishna Prasad                  07/20/2022          Retrieve Scorecard from secapi and pass to GLAPI call out
* Krishna Prasad                  08/07/2022          Retrieve Scorecard after secapi call out completed
* Krishna Prasad                  06/26/2023          Adding New Headers along with SECAPI 2.0 Upgrades
***************************************************************************************************************************************************************************/
public with sharing class SecAPIReleaseScanController {
    
    /*
*Post - https://humana-sparq-appsecapi-gateway-east2-qa.azurewebsites.net/api/v2/sast/scan/report/pdf/85195574-6df5-4222-8aa1-9f4d98fa0a0f/a6a39654-92f8-46aa-bb40-0ddfbfbbafa6 
* request - {"repoBranchToScan": "refs/heads/feature/US-0014996","incremental": True,"force": false}
* response - {"statusUrl": "https://humana-sparq-appsecapi-gateway-east2-qa.azurewebsites.net/api/v2/sast/scan/status/8e023c69-a465-4eb8-9ced-e34a963f0482/6148bb47-402e-4058-a2e2-0cedc74f05c1"} 

*/    
    
    @AuraEnabled
    public Static copado__Release__c getReleaseDetails(String releaseId) {
        string cpuid = EncodingUtil.urlEncode(releaseId, 'UTF-8');
        if(releaseId != null && Schema.sObjectType.copado__Release__c.isAccessible()){
            copado__Release__c lstReleaseRecords = new copado__Release__c();
            lstReleaseRecords = [SELECT Id,Name,OwnerId,SecAPI_Scan_Id__c,SCA_OSA_Scan_Id__c, Owner.Name,SEC_API_Scan_Status__c,SCA_OSA_Scan_Status__c, Current_Glapi_Status__c,SecAPI_Scan_Passed__c,SCA_OSA_Scan_Passed__c,Locked__c FROM copado__Release__c where Id =:cpuid AND OwnerId != null WITH SECURITY_ENFORCED];
            return lstReleaseRecords;
        }
        else 
        throw new AuraHandledException('Users do not have appropriate access');
        
        
    }

    @AuraEnabled
    public Static String resetSecAPIScan(String releaseId) {
        List<copado__Release__c> lstReleaseToUpdate = new List<copado__Release__c> ();
        if(releaseId != null && Schema.sObjectType.copado__Release__c.isUpdateable()){
            lstReleaseToUpdate.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='Not Started',SCA_OSA_Scan_Status__c='Not Started', SecApiScanProjectCounter__c = 0,SCAScanProjectCounter__c = 0));
                if(!lstReleaseToUpdate.isEmpty()){
                    update lstReleaseToUpdate;
                    
                }       
        }
        else{
        throw new AuraHandledException('Users do not have appropriate access to reset the scan');
        }
        return null;
    }
    
        @AuraEnabled

   public static String getBuildId(String releaseId){
        List<SEC_API_Scan_Result__c> lstScanResults =  new List<SEC_API_Scan_Result__c>();
        List<copado__Release__c> toUpdateRelease = new List<copado__Release__c>();
        Set<Id> envIds = new Set<Id>();
        String buildId = '';
        String BranchName = '';
       
        try{
             if(!Schema.sObjectType.Copado__User_Story__c.isUpdateable() || !Schema.SObjectType.Copado__User_Story__c.isCreateable()){
             throw new addException('The user does not have object access permissions');
    }
            if(String.isNotEmpty(releaseId)){
                for(Copado__User_Story__c us :[Select Id,copado__Environment__c From Copado__User_Story__c Where copado__Release__c =:releaseId]){
                    if(String.isNotBlank(us.copado__Environment__c) && us.copado__Environment__c!= null ){
                        envIds.add(us.copado__Environment__c);
                    }
                }
            }
            if(!envIds.isEmpty()){
                BranchName = [SELECT Id, copado__branch__c, copado__Source_Environment__c FROM copado__Deployment_Flow_Step__c WHERE copado__Source_Environment__c IN: envIds Limit 1].copado__branch__c;
                System.debug('BranchName val = '+BranchName);
            }
            lstScanResults.add(new SEC_API_Scan_Result__c(Release_Copado__c = releaseId,RecordTypeId=Schema.SObjectType.SEC_API_Scan_Result__c.getRecordTypeInfosByName().get('Release').getRecordTypeId(),Repo_Branch__c=BranchName));
             if(!lstScanResults.isEmpty() && Schema.sObjectType.SEC_API_Scan_Result__c.isCreateable()){
                Insert lstScanResults;
             }
            if(Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Build_Id__c.isAccessible()){
              buildId = [Select Id,Build_Id__c From SEC_API_Scan_Result__c Where Build_Id__c != null AND Release_Copado__c =:releaseId Order by CreatedDate Desc limit 1].Build_Id__c;
            }
            if(Schema.sObjectType.copado__Release__c.isUpdateable() && String.isNotEmpty(buildId)){
                toUpdateRelease.add(new copado__Release__c(Id=releaseId,Artifact_Id__c = buildId));
                Update toUpdateRelease;
            }

        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
        }
       return buildId;
    }
    
    @AuraEnabled
    public static String lockReleaseRec(String releaseId){
        List<copado__Release__c> lstReleaseToUpdate = new List<copado__Release__c> ();
        if(releaseId != null && Schema.sObjectType.copado__Release__c.isUpdateable()){
            lstReleaseToUpdate.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='In-Progress',Current_Glapi_Status__c='SecAPI Scan In Progress',Locked__c=true));
            if(!lstReleaseToUpdate.isEmpty()){
                update lstReleaseToUpdate;
            }       
        }
        else{
            throw new AuraHandledException('Users do not have appropriate access to Lock the record');
        }
        return null;
    }
    
    public static List<SEC_API_Scan_Result__c> getScanResultRecord(String releaseId){
        List<SEC_API_Scan_Result__c> secResList =  new  List<SEC_API_Scan_Result__c>();
        if(releaseId != null && Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Scan_Status__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.FailScan__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Critical__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.High__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Medium__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Low__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Scan_Type__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Req_Id__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Status_Url__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Json_Report__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.pdf_Report__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.xml_Report__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Score_Card__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Last_Updated__c.isAccessible()){
            secResList = [select Id,Scan_Status__c,OSA_SCA_scan_Status__c,FailScan__c,SCA_OSA_Scan_Failed__c,Critical__c,High__c,High_SCA_OSA__c,Medium__c,Medium_OSA_SCA__c,Low__c,Low_OSA_SCA__c,Scan_Type__c,Req_Id__c,Status_Url__c,SCA_OSA_Status_URL__c,Json_Report__c,pdf_Report__c,xml_Report__c,Score_Card__c,Last_Updated__c from SEC_API_Scan_Result__c where Release_Copado__c =:releaseId order by createddate desc limit 1];
        }
        return secResList;
    }
    
    @AuraEnabled
    public static String fetchScanStatus(String releaseId){
        String statusUrl = '';
        List<SEC_API_Scan_Result__c> secResList = getScanResultRecord(releaseId);  
        if(!secResList.isEmpty()){
            statusUrl = secResList[0].status_URL__c;
        }
        return statusUrl;
    }
    @AuraEnabled
    public static String secAPIScan(String releaseId) {
        String statusURL ='';
        String appReqId = '';
        String resp = '';
        String repoBranch = '';
        String initiatingSource = '';
        String mandatoryCol = '';
        String guId = '';
        String excludeFiles = '';
        String excludeFolders = '';
        String projectAppId ='';
        boolean forceFlag = true;
        Integer scanCounter = 0;
        List<copado__Release__c> toUpdateRelease = new List<copado__Release__c>();
        List<copado__User_Story__c> lstUserStory = new List<copado__User_Story__c>();
         List<copado__Release__c> lstRelease = new List<copado__Release__c>();
        if (!Schema.sObjectType.SEC_API_Scan_Result__c.isCreateable() || !Schema.sObjectType.SEC_API_Scan_Result__c.fields.status_URL__c.isCreateable()) {
            throw new AuraHandledException('User do not have appropriate access to create SEC_API_Scan_Result__c records.');
        }
        SEC_API_Scan_Result__c sr = new SEC_API_Scan_Result__c();
        List<string> listOfProjectIDs = new List<string>();
        
              
        try{
            if(String.isNotEmpty(releaseId) && Schema.sObjectType.Copado__User_Story__c.isAccessible()){
            // lstUserStory = [SELECT Id,Copado__Project__c, Copado__Project__r.App_Id__c,copado__Project__r.Exclude_Files__c,copado__Project__r.Exclude_Folders__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null];
               lstUserStory = [SELECT Id,Copado__Project__c, Copado__Project__r.SNOW_APPSVCID__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null];
            }
            if(String.isNotEmpty(releaseId) && Schema.sObjectType.copado__Release__c.isAccessible()){
                lstRelease = [select Id,Name,Artifact_Id__c, SecApiScanProjectCounter__c from copado__Release__c where Id =:releaseId limit 1];
            }
            // add all project to list
             for(copado__User_Story__c us : lstUserStory){
                listOfProjectIDs.add(us.Copado__Project__r.SNOW_APPSVCID__c);
            }
            scanCounter  =  lstRelease[0].SecApiScanProjectCounter__c != null ?  lstRelease[0].SecApiScanProjectCounter__c.intValue() : 0;
            system.debug('@@@lstRelease[0].SecApiScanProjectCounter__c.intValue() : ' +scanCounter);
            // remove duplicates from list
            List<String> UniqueProjectIDs = new List<String>(new Set<String>(listOfProjectIDs));
            system.debug('@@@UniqueProjectIDs : ' + UniqueProjectIDs);
            // get current index of project
            string currentIterationProjectID = UniqueProjectIDs[scanCounter];
            system.debug('@@@currentIterationProjectID'+currentIterationProjectID);
            // get project info
            copado__Project__c projectForSecApiCall;
            if(Schema.sObjectType.copado__Project__c.isAccessible()){
                projectForSecApiCall = [select App_Id__c, Exclude_Files__c, Exclude_Folders__c from copado__Project__c where SNOW_APPSVCID__c =:currentIterationProjectID limit 1];
                // populate info for project 
                projectAppId =projectForSecApiCall.App_Id__c;
                excludeFiles = projectForSecApiCall.Exclude_Files__c;
                excludeFolders = projectForSecApiCall.Exclude_Folders__c;  
            }
            if(Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible()){
                // get repo branch
                repoBranch = [Select Id,Repo_Branch__c From SEC_API_Scan_Result__c Where Release_Copado__c =: releaseId Order by CreatedDate Desc Limit 1].Repo_Branch__c;
            }
            //get data
            initiatingSource = [Select Id,Value__c From Glapi_Callout_Settings__c Where Name = 'SecAPIInitiatingSource' Limit 1].Value__c;
            mandatoryCol = [Select Id,Value__c From Glapi_Callout_Settings__c Where Name = 'SecAPIMandatoryCol' Limit 1].Value__c;
      guID =   [Select Id,Value__c From Glapi_Callout_Settings__c Where Name = 'TechGUID' Limit 1].Value__c;
            system.debug('repoBranch val = '+repoBranch);
            if(scanCounter > 0){
                forceFlag = false;
            }
            String reqBody = '{"repoBranchToScan": "refs/heads/'+repoBranch+'","incremental": true,"force":'+forceFlag+',"devOpsInfo": { "intiatingSource": "'+initiatingSource+'", "teamProjectName": "'+mandatoryCol+'", "teamProjectId": "'+guID+'", "buildInfo": { "buildId": "'+lstRelease[0].Artifact_Id__c+'", "buildName": "'+mandatoryCol+'", "buildDefinitionName": "'+mandatoryCol+'", "buildReason": "'+mandatoryCol+'", "buildRepositoryID": "'+mandatoryCol+'", "buildRepositoryName": "'+mandatoryCol+'", "buildSourceBranch": "refs/heads/'+repoBranch+'" }},"excludeFoldersPattern": "'+excludeFolders+'","excludeFilesPattern": "'+excludeFiles+'"}';
            system.debug('reqBody val = '+reqBody);
            HTTPResponse res = new HTTPResponse();
            String endURL = '/start/'+projectAppId;
            String recordId = [Select Id From SEC_API_Scan_Result__c Where Release_Copado__c =:ReleaseId Order by CreatedDate Desc limit 1].Id;
            res = getCalloutResponse(endURL,'POST',reqBody);
            system.debug('niharika 1 endurl' + endURL + 'and reqbody ..' + reqBody);
            system.debug('niharika sast getstatuscode' + res.getStatusCode());
            
            if(res != null && res.getStatusCode() == 202){
               
                // Parse JSON response to get the statusUrl field values.
                JSONParser parser = JSON.createParser(res.getBody());
                while (parser.nextToken() != null) {
                    if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                        (parser.getText() == 'statusUrl')) {
                            parser.nextToken();
                            // Get the value.
                            statusURL = parser.getText();
                        }
                }
                if(!String.isEmpty(statusUrl)){
                    appReqId = statusUrl.substringAfter('status/');
                    if(appReqId.length() > 0 && appReqId.contains('/')){
                      toUpdateRelease.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='In-Progress',SecurityGrade__c = '',SecAPI_Scan_Passed__c=false,Current_Glapi_Status__c='SecAPI Scan In Progress',SecApiScanProjectCounter__c = scanCounter + 1, SecAPI_Scan_Id__c = appReqId.split('/')[1]));    
                    }
                }else{
                      toUpdateRelease.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='In-Progress',SecurityGrade__c = '',SecAPI_Scan_Passed__c=false,Current_Glapi_Status__c='SecAPI Scan In Progress', SecApiScanProjectCounter__c = scanCounter + 1));
                }
                system.debug('@@@ appReqId'+appReqId);
                sr.Id = recordId;
                sr.status_URL__c = appReqId;
                sr.Release_Copado__c = releaseId;
                sr.Scan_Status__c = 'Callout 1 Completed';
                sr.RecordTypeId = Schema.SObjectType.SEC_API_Scan_Result__c.getRecordTypeInfosByName().get('Release').getRecordTypeId();
                sr.SecAPI_Scan_Id__c = appReqId.split('/')[1];
                resp = appReqId;
            }
            else{
                sr.Id = recordId;
                sr.Release_Copado__c = releaseId;
                sr.Scan_Status__c = 'Callout 1 Failed';
                sr.RecordTypeId = Schema.SObjectType.SEC_API_Scan_Result__c.getRecordTypeInfosByName().get('Release').getRecordTypeId();
                sr.Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                toUpdateRelease.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='Completed',Current_Glapi_Status__c = 'SecAPI Scan Failed', SecApiScanProjectCounter__c = scanCounter));  
                resp = 'Error occured during 1st Callout. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
            }
            if(!toUpdateRelease.isEmpty() && Schema.sObjectType.copado__Release__c.isUpdateable()){
                update toUpdateRelease;
            }
            List<SEC_API_Scan_Result__c> lstSecScanResults =  new List<SEC_API_Scan_Result__c>{sr};
                if(!lstSecScanResults.isEmpty() && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable() && Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible()){
                    Update lstSecScanResults;
                }
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during 1st Callout. Exception Cause : ' +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : ' + e.getMessage());
        } 
        return resp;
    }
    
    //method added by niharika for SCA/OSA scan
    @AuraEnabled
    public static String SCAScan(String releaseId) {
        system.debug('Enters scan');
        string statusURLSCA ='';
        String appReqIdSCA ='';
        string resp ='';
        String repoBranch = '';
        String initiatingSource = '';
        String mandatoryCol = '';
        String guId = '';
        String excludeFiles = '';
        String excludeFolders = '';
        String projectAppId ='';
        boolean forceFlag = true;
        Integer scanCounter = 0;
        List<copado__Release__c> toUpdateRelease = new List<copado__Release__c>();
        List<copado__User_Story__c> lstUserStory = new List<copado__User_Story__c>();
         List<copado__Release__c> lstRelease = new List<copado__Release__c>();
        if (!Schema.sObjectType.SEC_API_Scan_Result__c.isCreateable() || !Schema.sObjectType.SEC_API_Scan_Result__c.fields.status_URL__c.isCreateable()) {
            throw new AuraHandledException('User do not have appropriate access to create SEC_API_Scan_Result__c records.');
        }
        SEC_API_Scan_Result__c sr = new SEC_API_Scan_Result__c();
        List<string> listOfProjectIDs = new List<string>();
              
        try{
            if(String.isNotEmpty(releaseId) && Schema.sObjectType.Copado__User_Story__c.isAccessible()){
            // lstUserStory = [SELECT Id,Copado__Project__c, Copado__Project__r.App_Id__c,copado__Project__r.Exclude_Files__c,copado__Project__r.Exclude_Folders__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null];
               lstUserStory = [SELECT Id,Copado__Project__c, Copado__Project__r.SNOW_APPSVCID__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null];
            }
            if(String.isNotEmpty(releaseId) && Schema.sObjectType.copado__Release__c.isAccessible()){
                lstRelease = [select Id,Name,Artifact_Id__c, SCAScanProjectCounter__c from copado__Release__c where Id =:releaseId limit 1];
            }
            system.debug('error before scan counter....niharika2');
            // add all project to list
             for(copado__User_Story__c us : lstUserStory){
                listOfProjectIDs.add(us.Copado__Project__r.SNOW_APPSVCID__c);
            }
            system.debug('SCAScanProjectCounter__c value:' + lstRelease[0].SCAScanProjectCounter__c);
            system.debug('SCAScanProjectCounter__c:' + lstRelease[0].SCAScanProjectCounter__c.intValue());
            scanCounter  =  lstRelease[0].SCAScanProjectCounter__c != null ?  lstRelease[0].SCAScanProjectCounter__c.intValue() : 0;
            system.debug('@@@lstRelease[0].SCAScanProjectCounter__c.intValue() : ' +scanCounter);
            // remove duplicates from list
            List<String> UniqueProjectIDs = new List<String>(new Set<String>(listOfProjectIDs));
            system.debug('@@@UniqueProjectIDs : ' + UniqueProjectIDs);            
            // get current index of project
            string currentIterationProjectID; 
                if(UniqueProjectIDs.size() == 1){
                   currentIterationProjectID = UniqueProjectIDs[0];  
                }   
                else{
                   currentIterationProjectID = UniqueProjectIDs[scanCounter]; 
                }
                //UniqueProjectIDs[scanCounter-2];
            system.debug('@@@currentIterationProjectID'+currentIterationProjectID);
            // get project info
            copado__Project__c projectForSecApiCall;
            if(Schema.sObjectType.copado__Project__c.isAccessible()){
                projectForSecApiCall = [select App_Id__c, Exclude_Files__c, Exclude_Folders__c from copado__Project__c where SNOW_APPSVCID__c =:currentIterationProjectID limit 1];
                // populate info for project 
                projectAppId =projectForSecApiCall.App_Id__c;
                excludeFiles = projectForSecApiCall.Exclude_Files__c;
                excludeFolders = projectForSecApiCall.Exclude_Folders__c;  
            }
            if(Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible()){
                // get repo branch
                repoBranch = [Select Id,Repo_Branch__c From SEC_API_Scan_Result__c Where Release_Copado__c =: releaseId Order by CreatedDate Desc Limit 1].Repo_Branch__c;
            }
            //get data
            initiatingSource = [Select Id,Value__c From Glapi_Callout_Settings__c Where Name = 'SecAPIInitiatingSource' Limit 1].Value__c;
            mandatoryCol = [Select Id,Value__c From Glapi_Callout_Settings__c Where Name = 'SecAPIMandatoryCol' Limit 1].Value__c;
      guID =   [Select Id,Value__c From Glapi_Callout_Settings__c Where Name = 'TechGUID' Limit 1].Value__c;
            system.debug('repoBranch val = '+repoBranch);
            if(scanCounter > 0){
                forceFlag = false;
            }
            
            String SCAreqBody = '{"repoBranchToScan": "refs/heads/'+repoBranch+'","incremental": true,"force":'+forceFlag+',"devOpsInfo": { "intiatingSource": "'+initiatingSource+'", "teamProjectName": "'+mandatoryCol+'", "teamProjectId": "'+guID+'", "buildInfo": { "buildId": "'+lstRelease[0].Artifact_Id__c+'", "buildName": "'+mandatoryCol+'", "buildDefinitionName": "'+mandatoryCol+'", "buildReason": "'+mandatoryCol+'", "buildRepositoryID": "'+mandatoryCol+'", "buildRepositoryName": "'+mandatoryCol+'", "buildSourceBranch": "refs/heads/'+repoBranch+'" }},"excludeFoldersPattern": "'+excludeFolders+'","excludeFilesPattern": "'+excludeFiles+'"}';
            HTTPResponse SCAres = new HTTPResponse();
            String SCAendURL = '/start/'+projectAppId;
            String recordId = [Select Id From SEC_API_Scan_Result__c Where Release_Copado__c =:ReleaseId Order by CreatedDate Desc limit 1].Id;
            system.debug('scaendUrl + tejaswi' + SCAendURL);
            
            
            system.debug('scareqbody + tejaswi' + SCAreqBody);
            SCAres = getSCACalloutResponse(SCAendURL,'POST',SCAreqBody,ReleaseId);
            system.debug('response Tejaswi body...' + SCAres.getBody());
            
            if(SCAres != null && SCAres.getStatusCode() == 202){
               
                // Parse JSON response to get the statusUrl field values.
                JSONParser SCAparser = JSON.createParser(SCAres.getBody());
                while (SCAparser.nextToken() != null) {
                    if ((SCAparser.getCurrentToken() == JSONToken.FIELD_NAME) && 
   //                     (SCAparser.getText() == 'statusUrlSCA')) {
   						  (SCAparser.getText() == 'statusUrl')) {
                            SCAparser.nextToken();
                            // Get the value.
                            statusURLSCA = SCAparser.getText();
                        }
                }
                if(!String.isEmpty(statusURLSCA)){
                    appReqIdSCA = statusURLSCA.substringAfter('status/');
                    if(appReqIdSCA.length() > 0 && appReqIdSCA.contains('/')){
                      toUpdateRelease.add(new copado__Release__c(Id=releaseId,SCA_OSA_Scan_Passed__c=false,SCA_OSA_Scan_Status__c='In-Progress',SCAScanProjectCounter__c = scanCounter +1,SCA_OSA_Scan_Id__c = appReqId.split('/')[1]));    
                    }
                }else{
                      toUpdateRelease.add(new copado__Release__c(Id=releaseId,SCA_OSA_Scan_Passed__c=false,SCA_OSA_Scan_Status__c='In-Progress',SCAScanProjectCounter__c = scanCounter +1));
                }
                system.debug('@@@ appReqIdforSCA'+appReqIdSCA);
                sr.Id = recordId;
                sr.SCA_OSA_Status_URL__c = appReqIdSCA;
                sr.OSA_SCA_scan_Status__c = 'Callout 1 Completed';
                //sr.SecAPI_Scan_Id__c = appReqIdSCA.split('/')[1];
                sr.SCA_OSA_Scan_Id__c = appReqIdSCA.split('/')[1];
                resp = appReqIdSCA;
            }
            else{
                sr.Id = recordId;
                sr.OSA_SCA_scan_Status__c = 'Callout 1 Failed';
                sr.SCA_OSA_Error_Message__c = 'Status Code '+SCAres.getStatusCode() +', Error Message '+SCAres.getBody();
                toUpdateRelease.add(new copado__Release__c(Id=releaseId,SCA_OSA_Scan_Status__c='Completed',SCAScanProjectCounter__c = scanCounter));  
                resp = 'Error occured during 1st Callout. Response Status Code : ' +SCAres.getStatusCode()+ ', Response Status : ' + SCAres.getStatus()+', Response Message : ' + SCAres.getBody();
            }
            if(!toUpdateRelease.isEmpty() && Schema.sObjectType.copado__Release__c.isUpdateable()){
                update toUpdateRelease;
            }
            List<SEC_API_Scan_Result__c> lstSecScanResults =  new List<SEC_API_Scan_Result__c>{sr};
                if(!lstSecScanResults.isEmpty() && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable() && Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible()){
                    Update lstSecScanResults;
                }
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during 1st Callout. Exception Cause : ' +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : ' + e.getMessage());
        } 
        return resp;
    }
    
    @AuraEnabled
    public Static scanStatusWrapper runSecAPIStatusCheck(String statusURL,String releaseId) {
        scanStatusWrapper resposeRes = new scanStatusWrapper();
        //String currentStatus = '';
        String jsonReport = '';
        String pdfReport = '';
        String xmlReport = '';
        String scoreCard = '';
        String message = '';
        String submitedDateTime = '';
          Integer scanCounter = 0;
        SEC_API_Scan_Result__c sr = new SEC_API_Scan_Result__c();
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        copado__Release__c releaseDetails = [SELECT Id, SecApiScanProjectCounter__c FROM copado__Release__c Where id =: releaseId limit 1];
        scanCounter = releaseDetails.SecApiScanProjectCounter__c != null ? releaseDetails.SecApiScanProjectCounter__c.intValue() : 0;
        List<string> listOfProjectIDs = new List<string>();
        HTTPResponse res = new HTTPResponse();
        for(copado__User_Story__c us : [SELECT Id,Copado__Project__c,Copado__Project__r.SNOW_APPSVCID__c , Copado__Project__r.App_Id__c,copado__Project__r.Exclude_Files__c,copado__Project__r.Exclude_Folders__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null]){
            listOfProjectIDs.add(us.Copado__Project__r.SNOW_APPSVCID__c);
        }
          List<String> UniqueProjectIDs = new List<String>(new Set<String>(listOfProjectIDs));
        system.debug('UniqueProjectIDs : '+ UniqueProjectIDs);
        String endUrl =  '/status/'+statusURL;
        try{
            List<SEC_API_Scan_Result__c> secResList = getScanResultRecord(releaseId);
            res =  getCalloutResponse(endURL,'GET',null);
            if(res != null && res.getStatusCode() == 200){
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in checksec api : '+ res.getBody());
                while (parser.nextToken() != null) {
                    if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                        (parser.getText() == 'status')) {
                            parser.nextToken();
                            resposeRes.currentStatus = parser.getText();
                        }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'jsonReport')) {
                                 parser.nextToken();
                                 jsonReport = parser.getText();
                             } 
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'pdfReport')) {
                                 parser.nextToken();
                                 pdfReport = parser.getText();
                             }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'xmlReport')) {
                                 parser.nextToken();
                                 xmlReport = parser.getText();
                             }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'scoreCard')) {
                                 parser.nextToken();
                                 scoreCard = parser.getText();
                             }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'submitedDateTime')) {
                                 parser.nextToken();
                                 submitedDateTime = parser.getText();
                             } 
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'message')) {
                                 parser.nextToken();
                                 message = parser.getText();
                             }
                }
                
                if(!secResList.isEmpty()){
                    secResList[0].Json_Report__c  = jsonReport;
                    secResList[0].Pdf_Report__c  = pdfReport;
                    secResList[0].Xml_Report__c  = xmlReport;
                    secResList[0].Score_Card__c  = scoreCard;
                    if(submitedDateTime != null && String.isNotEmpty(submitedDateTime))
                        secResList[0].Submitted_Date__c  = convertStringtoDateTime(submitedDateTime);
                    secResList[0].Error_Message__c  = message;
                    
                    if(resposeRes.currentStatus == 'FINISHED'){
                        system.debug('scanCounter: '+scanCounter);
                        system.debug('UniqueProjectIDs.size(): '+UniqueProjectIDs.size());
                        if(scanCounter != UniqueProjectIDs.size()){
                            resposeRes.currentStatus = 'PARTIAL FINISHED';
                             resposeRes.statusURL =  secAPIScan(releaseID);
                            if(resposeRes.statusURL.contains('error')){
                                resposeRes.currentStatus = '2nd Sec API call Error occured';
                            }
                        }else{
                            string securityGrade = getSECAPISecurityScoreCard(UniqueProjectIDs[0], releaseId);
                            if(securityGrade.toLowerCase().contains('error')){
                                resposeRes.currentStatus = 'ERROR';
                                secResList[0].Scan_Status__c = 'Callout 2.5 Failed';
                                toUpdateReleases.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='Completed',Current_Glapi_Status__c='SecAPI Scan Failed'));
                            }
                            else{
                                secResList[0].Scan_Status__c = 'Callout 2 Completed';  
                            }  
                        }
                    }
                    else if(resposeRes.currentStatus == 'ERROR' || resposeRes.currentStatus == 'CANCELED' || resposeRes.currentStatus == 'FAILED'){
                        secResList[0].Scan_Status__c = 'Callout 2 Failed';
                        toUpdateReleases.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='Completed',Current_Glapi_Status__c='SecAPI Scan Failed'));
                    }
                    
                }
            }
            else{
                secResList[0].Scan_Status__c = 'Callout 2 Failed';
                secResList[0].Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                toUpdateReleases.add(new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='Completed',Current_Glapi_Status__c='SecAPI Scan Failed'));
                resposeRes.currentStatus = 'Error occured during 2nd Callout. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
            }
            
            if(Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
                update secResList;
            }
            if(!toUpdateReleases.isEmpty() && Schema.sObjectType.copado__Release__c.isUpdateable()){
                update toUpdateReleases;
            }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during 2nd Callout. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : ' + e.getMessage());
            
        }
        return resposeRes;
    }
    
    @AuraEnabled
    public Static scanStatusWrapper runSCAStatusCheck(String statusURL,String releaseId) {
        scanStatusWrapper resposeRes = new scanStatusWrapper();
        //String currentStatus = '';
        String jsonReport = '';
        String pdfReport = '';
        String xmlReport = '';
        String scoreCard = '';
        String message = '';
        String submitedDateTime = '';
          Integer scanCounter = 0;
        SEC_API_Scan_Result__c sr = new SEC_API_Scan_Result__c();
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        copado__Release__c releaseDetails = [SELECT Id,SCAScanProjectCounter__c  FROM copado__Release__c Where id =: releaseId limit 1];
        scanCounter = releaseDetails.SCAScanProjectCounter__c != null ? releaseDetails.SCAScanProjectCounter__c.intValue() : 0;
        List<string> listOfProjectIDs = new List<string>();
        HTTPResponse res = new HTTPResponse();
        for(copado__User_Story__c us : [SELECT Id,Copado__Project__c,Copado__Project__r.SNOW_APPSVCID__c , Copado__Project__r.App_Id__c,copado__Project__r.Exclude_Files__c,copado__Project__r.Exclude_Folders__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null]){
            listOfProjectIDs.add(us.Copado__Project__r.SNOW_APPSVCID__c);
        }
          List<String> UniqueProjectIDs = new List<String>(new Set<String>(listOfProjectIDs));
        system.debug('UniqueProjectIDs : '+ UniqueProjectIDs);
        String endUrl =  '/status/'+statusURL;
        try{
            List<SEC_API_Scan_Result__c> secResList = getScanResultRecord(releaseId);
            res =  getSCACalloutResponse(endURL,'GET',null,ReleaseId);
            if(res != null && res.getStatusCode() == 200){
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in SCA api : '+ res.getBody());
                while (parser.nextToken() != null) {
                    if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                        (parser.getText() == 'status')) {
                            parser.nextToken();
                            resposeRes.currentStatus = parser.getText();
                        }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'jsonReport')) {
                                 parser.nextToken();
                                 jsonReport = parser.getText();
                             } 
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'pdfReport')) {
                                 parser.nextToken();
                                 pdfReport = parser.getText();
                             }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'xmlReport')) {
                                 parser.nextToken();
                                 xmlReport = parser.getText();
                             }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'scoreCard')) {
                                 parser.nextToken();
                                 scoreCard = parser.getText();
                             }
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'submitedDateTime')) {
                                 parser.nextToken();
                                 submitedDateTime = parser.getText();
                             } 
                    else if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                             (parser.getText() == 'message')) {
                                 parser.nextToken();
                                 message = parser.getText();
                             }
                }
                
                if(!secResList.isEmpty()){
                    secResList[0].Json_Report__c  = jsonReport;
                    secResList[0].Pdf_Report__c  = pdfReport;
                    secResList[0].Xml_Report__c  = xmlReport;
                    secResList[0].Score_Card__c  = scoreCard;
                    if(submitedDateTime != null && String.isNotEmpty(submitedDateTime))
                        secResList[0].Submitted_Date__c  = convertStringtoDateTime(submitedDateTime);
                    secResList[0].SCA_OSA_Error_Message__c  = message;
                    
                    if(resposeRes.currentStatus == 'FINISHED'){
                        system.debug('SCA scanCounter: '+scanCounter);
                        system.debug('SCA UniqueProjectIDs.size(): '+UniqueProjectIDs.size());
                        if(scanCounter != UniqueProjectIDs.size()){
                            resposeRes.currentStatus = 'PARTIAL FINISHED';
                             resposeRes.statusURL =  SCAScan(releaseID);
                            if(resposeRes.statusURL.contains('error')){
                                resposeRes.currentStatus = '2nd Sec API call Error occured';
                            }
                        }else{
                            string securityGrade = getSCASecurityScoreCard(UniqueProjectIDs[0], releaseId);
                            if(securityGrade.toLowerCase().contains('error')){
                                resposeRes.currentStatus = 'ERROR';
                                secResList[0].Scan_Status__c = 'Callout 2.5 Failed';
                                toUpdateReleases.add(new copado__Release__c(Id=releaseId,SCA_OSA_Scan_Status__c='Completed'));
                            }
                            else{
                                secResList[0].Scan_Status__c = 'Callout 2 Completed';  
                            }  
                        }
                    }
                    else if(resposeRes.currentStatus == 'ERROR' || resposeRes.currentStatus == 'CANCELED' || resposeRes.currentStatus == 'FAILED'){
                        secResList[0].Scan_Status__c = 'Callout 2 Failed';
                        toUpdateReleases.add(new copado__Release__c(Id=releaseId,SCA_OSA_Scan_Status__c='Completed'));
                    }
                    
                }
            }
            else{
                secResList[0].OSA_SCA_scan_Status__c = 'Callout 2 Failed';
                secResList[0].SCA_OSA_Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                toUpdateReleases.add(new copado__Release__c(Id=releaseId,SCA_OSA_Scan_Status__c='Completed'));
                resposeRes.currentStatus = 'Error occured during 2nd Callout. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
            }
            
            if(Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
                update secResList;
            }
            if(!toUpdateReleases.isEmpty() && Schema.sObjectType.copado__Release__c.isUpdateable()){
                update toUpdateReleases;
            }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during 2nd Callout. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : ' + e.getMessage());
            
        }
        return resposeRes;
    }
    
    @AuraEnabled
    public Static String getSECAPIScoreCard(String scoreCardURL, String releaseId) {
        Boolean failScan;
        String scanType ='';
        String resp = '';
        SECAPIParser scparser;
        SEC_API_Scan_Result__c sr;
        String endUrl = '/score/'+scoreCardURL;
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        HTTPResponse res = new HTTPResponse();
        try{
            res =  getCalloutResponse(endURL,'GET',null);
            List<SEC_API_Scan_Result__c> srList = getScanResultRecord(releaseId);
            
            if(res.getStatusCode() == 200){
                
                
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in acorecRD api : '+ res.getBody());
                while (parser.nextToken() != null) {
                            system.debug('@@@@ parser' +  parser.getText());
                }
                
                
                scparser = (SECAPIParser)JSON.deserialize(res.getBody(), SECAPIParser.class);
                                
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.FailScan__c = scparser.failScan;
                    sr.Critical__c = scparser.critical!=null?Decimal.valueOf(scparser.critical):0;
                    sr.High__c = scparser.high!=null?Decimal.valueOf(scparser.high):0;
                    sr.Medium__c = scparser.medium!=null?Decimal.valueOf(scparser.medium):0;
                    sr.Low__c = scparser.low!=null?Decimal.valueOf(scparser.low):0;
                    sr.Release_Copado__c = releaseId;
                    sr.Scan_Type__c = scparser.scanType;
                    sr.Req_Id__c = scparser.reqId;
                    sr.Scan_Status__c = 'Callout 3 Completed';
                    if(scparser.lastUpdated != null && scparser.lastUpdated != '')
                        sr.Last_Updated__c = convertStringtoDateTime(scparser.lastUpdated);
                }
            }
            
            else{
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.Scan_Status__c = 'Callout 3 Failed';
                    sr.Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                    resp = 'Error occured during 3rd Callout. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
                }
            }
            
            
            
            copado__Release__c cr = new copado__Release__c(Id=releaseId,SEC_API_Scan_Status__c='Completed');
            
                       
            List<copado__User_Story__c> lstUserStory = new List<copado__User_Story__c>();         
            Map<string,String> mapOfProjectIDs = new map<string,String>();
            string finalscanresult ='';
            string projectscanresult =''; 
            Boolean failureResult = false;
        
            if(String.isNotEmpty(releaseId) && Schema.sObjectType.Copado__User_Story__c.isAccessible()){
            // lstUserStory = [SELECT Id,Copado__Project__c, Copado__Project__r.App_Id__c,copado__Project__r.Exclude_Files__c,copado__Project__r.Exclude_Folders__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null];
               lstUserStory = [SELECT Id,Copado__Project__c, Copado__Project__r.SNOW_APPSVCID__c,copado__Release__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null];
            } 
           
            // add all project to list
             for(copado__User_Story__c us : lstUserStory){
                mapOfProjectIDs.put(us.Copado__Project__r.SNOW_APPSVCID__c,us.copado__Release__c);
            }
           
            
            for(String  proId :mapOfProjectIDs.keyset() ){
                  
                 projectscanresult = getFinalSECAPISecurityScoreCard(proId,mapOfProjectIDs.get(proId));    
                  
                if(projectscanresult != 'A'){
                   failureResult = True; 
                }                                
            }
            
            
            if(!failureResult){
               cr.SecurityGrade__c = 'A';
               cr.SecAPI_Scan_Passed__c  = true;
               cr.Current_Glapi_Status__c = 'SecAPI Scan Completed';  
            }
            else{
               cr.SecurityGrade__c = 'F'; 
               cr.SecAPI_Scan_Passed__c  = false;
               cr.Current_Glapi_Status__c = 'SecAPI Scan Failed';  
            }
            
            
            
            /*
            //check the checkbox only if there are no High and medium security violations
            if(sr.High__c==0 && sr.Medium__c==0){
                cr.SecAPI_Scan_Passed__c  = true;
                cr.Current_Glapi_Status__c = 'SecAPI Scan Completed';
            }
            else{
                cr.SecAPI_Scan_Passed__c  = false;
                cr.Current_Glapi_Status__c = 'SecAPI Scan Failed';                
            }
            */
            // Start
           // cr.SecAPI_Scan_Passed__c  = true;
           // cr.Current_Glapi_Status__c = 'SecAPI Scan Completed';
            // End
            toUpdateReleases.add(cr);
            
            
            if(sr != null && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
                update sr;
            }
           
            if(!toUpdateReleases.isEmpty() && Schema.sObjectType.copado__Release__c.isUpdateable()){
                update toUpdateReleases;
            }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during 3rd Callout. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
            
        }
        return resp;
    }
    //method added by niharika to getSCAScoreCard
    @AuraEnabled
    public Static String getSCAScoreCard(String scoreCardURL, String releaseId) {
        Boolean SCAfailScan;
        String scanType ='';
        String resp = '';
        SECAPIParser scparser;
        SEC_API_Scan_Result__c sr;
        String endUrl = '/score/'+scoreCardURL;
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        HTTPResponse res = new HTTPResponse();
        try{
            res =  getSCACalloutResponse(endURL,'GET',null,ReleaseId);
            List<SEC_API_Scan_Result__c> srList = getScanResultRecord(releaseId);
            
            if(res.getStatusCode() == 200){
                
                
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in SCA scorecRD api : '+ res.getBody());
                while (parser.nextToken() != null) {
                            system.debug('@@@@ parser' +  parser.getText());
                }
                
                
                scparser = (SECAPIParser)JSON.deserialize(res.getBody(), SECAPIParser.class);
                                
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.SCA_OSA_Scan_Failed__c = scparser.SCAfailScan;
                    sr.High_SCA_OSA__c = scparser.SCAhigh!=null?Decimal.valueOf(scparser.high):0;
                    sr.Medium_OSA_SCA__c = scparser.SCAmedium!=null?Decimal.valueOf(scparser.medium):0;
                    sr.Low_OSA_SCA__c = scparser.SCAlow!=null?Decimal.valueOf(scparser.low):0;
                    sr.OSA_SCA_scan_Status__c = 'Callout 3 Completed';
                    }
            }
            
            else{
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.OSA_SCA_scan_Status__c = 'Callout 3 Failed';
                    sr.SCA_OSA_Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                    resp = 'Error occured during 3rd Callout. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
                }
            }
            
            
            
            copado__Release__c cr = new copado__Release__c(Id=releaseId,SCA_OSA_Scan_Status__c='Completed');
            
                       
            List<copado__User_Story__c> lstUserStory = new List<copado__User_Story__c>();         
            Map<string,String> mapOfProjectIDs = new map<string,String>();
            string finalscanresult ='';
            string projectscanresult =''; 
            Boolean failureResult = false;
        
            if(String.isNotEmpty(releaseId) && Schema.sObjectType.Copado__User_Story__c.isAccessible()){
           		lstUserStory = [SELECT Id,Copado__Project__c, Copado__Project__r.SNOW_APPSVCID__c,copado__Release__c FROM Copado__User_Story__c Where copado__Release__c =: releaseId AND Copado__Project__r.App_Id__c != null];
            } 
           
            for(copado__User_Story__c us : lstUserStory){
                mapOfProjectIDs.put(us.Copado__Project__r.SNOW_APPSVCID__c,us.copado__Release__c);
            }
           
            
            for(String  proId :mapOfProjectIDs.keyset() ){
                  
                 projectscanresult = getFinalSECAPISecurityScoreCard(proId,mapOfProjectIDs.get(proId));    
                  
                if(projectscanresult != 'A'){
                   failureResult = True; 
                }                                
            }
            if(!failureResult){
               
               cr.SCA_OSA_Scan_Passed__c  = true;
               }
            else{
               cr.SecAPI_Scan_Passed__c  = false;
                }
            toUpdateReleases.add(cr);
            
            
            if(sr != null && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
                update sr;
            }
           
            if(!toUpdateReleases.isEmpty() && Schema.sObjectType.copado__Release__c.isUpdateable()){
                update toUpdateReleases;
            }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during 3rd Callout. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
            
        }
        return resp;
    }
    
    @AuraEnabled
    public Static String getSECAPISecurityScoreCard(String appServiceId, String releaseId) {

        
        String endUrl = '/scorecard/score/'+appServiceId;
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        SEC_API_Scan_Result__c sr;
        string score = '';
        system.debug('@@@@@ asd' + appServiceId + ' '+ releaseId);
        HTTPResponse res = new HTTPResponse();
        String resp = ''; 
        try{
            res =  getCalloutResponseV3(endURL,'GET',null);
            List<SEC_API_Scan_Result__c> srList = getScanResultRecord(releaseId);
            sr= srList[0];
            system.debug('@@@@@ asd' +res);
            if(res != null && res.getStatusCode() == 200){
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in acorecRD api : '+ res.getBody());
                while (parser.nextToken() != null) {
                    if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                        (parser.getText() == 'secApiGrade')) {
                            parser.nextToken();
                            score = parser.getText();
                            sr.Scan_Status__c = 'Callout 3 Completed';
                           
                        }
                    
                }
                
                if(Schema.sObjectType.copado__Release__c.isUpdateable()){
                    update new copado__Release__c(Id=releaseId,SecurityGrade__c=score);
                }
                
                resp = score;
            }  
            else{
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.Scan_Status__c = 'Callout 2.5 Failed';
                    sr.Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                    resp = 'Error occured after 2nd Callout for Security Score Card. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
                }
               
            }
             if(sr != null && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
                update sr;
              }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            // throw new AuraHandledException('Error occured after 2nd Callout for Security Score Card. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
            resp = 'Status Code '+res.getStatusCode() +', Error Message '+e.getMessage();
        }
        return resp;
    }
    
    @AuraEnabled
    public Static String getSCASecurityScoreCard(String appServiceId, String releaseId) {

        
        String endUrl = '/scorecard/score/'+appServiceId;
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        SEC_API_Scan_Result__c sr;
        string score = '';
        system.debug('@@@@@ asd' + appServiceId + ' '+ releaseId);
        HTTPResponse res = new HTTPResponse();
        String resp = ''; 
        try{
            res =  getSCACalloutResponseV3(endURL,'GET',null,ReleaseId);
            List<SEC_API_Scan_Result__c> srList = getScanResultRecord(releaseId);
            sr= srList[0];
            system.debug('@@@@@ asd' +res);
            if(res != null && res.getStatusCode() == 200){
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in SCA scoreCARD api : '+ res.getBody());
                while (parser.nextToken() != null) {
                    if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                        (parser.getText() == 'SCAapiGrade')) {
                            parser.nextToken();
                            score = parser.getText();
                            sr.OSA_SCA_scan_Status__c = 'Callout 3 Completed';
                           
                        }
                    
                }
                
                if(Schema.sObjectType.copado__Release__c.isUpdateable()){
                    update new copado__Release__c(Id=releaseId,SecurityGrade__c=score);
                }
                
                resp = score;
            }  
            else{
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.OSA_SCA_scan_Status__c = 'Callout 2.5 Failed';
                    sr.SCA_OSA_Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                    resp = 'Error occured after 2nd Callout for SCA Security Score Card. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
                }
               
            }
             if(sr != null && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
                update sr;
              }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            // throw new AuraHandledException('Error occured after 2nd Callout for Security Score Card. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
            resp = 'Status Code '+res.getStatusCode() +', Error Message '+e.getMessage();
        }
        return resp;
    }
    
    @AuraEnabled
    public Static String getFinalSECAPISecurityScoreCard(String appServiceId, String releaseId) {

        
        String endUrl = '/scorecard/score/'+appServiceId;
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        SEC_API_Scan_Result__c sr;
        string score = '';
       
        HTTPResponse res = new HTTPResponse();
        String resp = ''; 
        try{
            res =  getCalloutResponseV3(endURL,'GET',null);
            List<SEC_API_Scan_Result__c> srList = getScanResultRecord(releaseId);
            sr= srList[0];
           
            if(res != null && res.getStatusCode() == 200){
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in acorecRD api :33333-- '+ res.getBody());
                while (parser.nextToken() != null) {
                    if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                        (parser.getText() == 'secApiGrade')) {
                            parser.nextToken();
                            score = parser.getText();
                            sr.Scan_Status__c = 'Callout 3 Completed';
                           
                        }
                    
                }
               
                if(Schema.sObjectType.copado__Release__c.isUpdateable()){
                    //update new copado__Release__c(Id=releaseId,SecurityGrade__c=score);
                }
                
                resp = score;
                
            }  
            else{
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.Scan_Status__c = 'Callout 2.5 Failed';
                    sr.Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                    resp = 'Error occured after 2nd Callout for Security Score Card. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
                }
               
            }
             if(sr != null && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
               // update sr;
              }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            // throw new AuraHandledException('Error occured after 2nd Callout for Security Score Card. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
            resp = 'Status Code '+res.getStatusCode() +', Error Message '+e.getMessage();
        }
        return resp;
    }
    
     @AuraEnabled
    public Static String getFinalSCASecurityScoreCard(String appServiceId, String releaseId) {

        
        String endUrl = '/scorecard/score/'+appServiceId;
        List<copado__Release__c> toUpdateReleases = new List<copado__Release__c>();
        SEC_API_Scan_Result__c sr;
        string score = '';
       
        HTTPResponse res = new HTTPResponse();
        String resp = ''; 
        try{
            res =  getSCACalloutResponseV3(endURL,'GET',null,ReleaseId);
            List<SEC_API_Scan_Result__c> srList = getScanResultRecord(releaseId);
            sr= srList[0];
           
            if(res != null && res.getStatusCode() == 200){
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('res in SCA ScoreCard api :33333-- '+ res.getBody());
                while (parser.nextToken() != null) {
                    if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                        (parser.getText() == 'SCAApiGrade')) {
                            parser.nextToken();
                            score = parser.getText();
                            sr.OSA_SCA_scan_Status__c = 'Callout 3 Completed';
                           
                        }
                    
                }
               
                if(Schema.sObjectType.copado__Release__c.isUpdateable()){
                    //update new copado__Release__c(Id=releaseId,SecurityGrade__c=score);
                }
                
                resp = score;
                
            }  
            else{
                if(!srList.isEmpty()){
                    sr = srList[0];
                    sr.OSA_SCA_scan_Status__c = 'Callout 2.5 Failed';
                    sr.SCA_OSA_Error_Message__c = 'Status Code '+res.getStatusCode() +', Error Message '+res.getBody();
                    resp = 'Error occured after 2nd Callout for SCA Security Score Card. Response Status Code : ' +res.getStatusCode()+ ', Response Status : ' + res.getStatus()+', Response Message : ' + res.getBody();
                }
               
            }
             if(sr != null && Schema.sObjectType.SEC_API_Scan_Result__c.isUpdateable()){
               // update sr;
              }
            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            // throw new AuraHandledException('Error occured after 2nd Callout for Security Score Card. Exception Cause : ' + +e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
            resp = 'Status Code '+res.getStatusCode() +', Error Message '+e.getMessage();
        }
        return resp;
    }
    
    Private Static DateTime convertStringtoDateTime(String dat){
        Map<String,Integer> monthMap = new Map<String,Integer>{'January' => 1,  'February' => 2,  'March' => 3,  'April' => 4,  'May' => 5,  'June' => 6,  'July' => 7,  'August' => 8,  'September' => 9,  'October' => 10,  'November' => 11,  'December' => 12};
            DateTime dt1;       
        try{
            String[] myDateOnly = dat.split(',');
            String myDateStr = myDateOnly[1].replaceAll(' ',','); 
            String[] strDate = myDateStr.split(',');
            Integer myIntDate = integer.valueOf(strDate[1]);
            Integer myIntMonth = monthMap.get(strDate[2]);
            Integer myIntYear = integer.valueOf(strDate[3]);
            String mytime = strDate[4];
            String dt = myIntYear + '-' + myIntMonth + '-' + myIntDate + ' ' + myTime;
            
            dt1 = datetime.valueOfGmt(dt);
        }
        catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
        }
        return dt1;
    }
    public static HttpResponse getCalloutResponse(String endPointUrl, String requestType, String requestBody){
        HTTPResponse res = new HTTPResponse();
        HttpRequest req = new HttpRequest();
        try{
            if(requestType == 'GET'){
                req.setMethod('GET');
            }
            else if(requestType == 'POST'){
                req.setMethod('POST');
                req.setBody(requestBody);
            }
            req.setEndpoint('callout:SecAPI_SAST_Scan' + endPointUrl);
            system.debug('@@@ url'+ req.getEndpoint());
            req.setHeader('X-Api-Key', '{!$Credential.Password}'); //1c4b2765-369c-4fac-a6dc-abfe93dcdbaa
            req.setHeader('Content-Type','application/json');
            req.setHeader('userName', '{!$Credential.Username}');
            req.setHeader('EnterpriseSuite', Label.EnterpriseSuite);
            req.setHeader('EnterpriseValue', Label.EnterpriseValue);
            Http http = new Http();
            res = http.send(req);            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during HTTP callout. Exception Cause : ' + e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
        }
        return res;
    }
    
     public static HttpResponse getCalloutResponseV3(String endPointUrl, String requestType, String requestBody){
        HTTPResponse res = new HTTPResponse();
        HttpRequest req = new HttpRequest();
        try{
            if(requestType == 'GET'){
                req.setMethod('GET');
            }
            else if(requestType == 'POST'){
                req.setMethod('POST');
                req.setBody(requestBody);
            }
            req.setEndpoint('callout:SecApiScanV3' + endPointUrl);
            system.debug('@@@ url'+ req.getEndpoint());
            req.setHeader('x-api-Key', '{!$Credential.Password}'); //1c4b2765-369c-4fac-a6dc-abfe93dcdbaa
            req.setHeader('Content-Type','application/json');
            req.setHeader('userName', '{!$Credential.Username}');
            req.setHeader('EnterpriseSuite', Label.EnterpriseSuite);
            req.setHeader('EnterpriseValue', Label.EnterpriseValue);
            Http http = new Http();
            res = http.send(req);            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during HTTP callout. Exception Cause : ' + e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
        }
        return res;
    }
    
    //code added by niharika for callout for SCA/OSA
    public static HttpResponse getSCACalloutResponse(String endPointUrl, String requestType, String requestBody, String ReleaseId){
        HTTPResponse res = new HTTPResponse();
        HttpRequest req = new HttpRequest();
        copado__Release__c releaseRecord = [Select Id,SCA_Scan_Type__c From copado__Release__c Where ID =:ReleaseId Order by CreatedDate Desc limit 1];
        try{
            if(requestType == 'GET'){
                req.setMethod('GET');
            }
            else if(requestType == 'POST'){
                req.setMethod('POST');
                req.setBody(requestBody);
            }
            if(releaseRecord.SCA_Scan_Type__c == true){
                req.setEndpoint('callout:SecAPI_SCA_Scan' + endPointUrl);
            }else{
              req.setEndpoint('callout:SecAPI_OSA_Scan' + endPointUrl);  
            }
            system.debug('@@@ url'+ req.getEndpoint());
            req.setHeader('X-Api-Key', '{!$Credential.Password}'); //1c4b2765-369c-4fac-a6dc-abfe93dcdbaa
            req.setHeader('Content-Type','application/json');
            req.setHeader('userName', '{!$Credential.Username}');
            req.setHeader('EnterpriseSuite', Label.EnterpriseSuite);
            req.setHeader('EnterpriseValue', Label.EnterpriseValue);
            Http http = new Http();
            
            res = http.send(req);  
            system.debug('requestBody' + requestBody);
            system.debug('response tejaswi' + res);
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during HTTP callout. Exception Cause : ' + e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
        }
        return res;
    }
    
     public static HttpResponse getSCACalloutResponseV3(String endPointUrl, String requestType, String requestBody, String ReleaseId){
        HTTPResponse res = new HTTPResponse();
        HttpRequest req = new HttpRequest();
         copado__Release__c releaseRecord = [Select Id,SCA_Scan_Type__c From copado__Release__c Where ID =:ReleaseId Order by CreatedDate Desc limit 1];
        try{
            if(requestType == 'GET'){
                req.setMethod('GET');
            }
            else if(requestType == 'POST'){
                req.setMethod('POST');
                req.setBody(requestBody);
            }
            if(releaseRecord.SCA_Scan_Type__c == true){
                req.setEndpoint('callout:SecAPI_SCA_Scan' + endPointUrl);
            }else{
              req.setEndpoint('callout:SecAPI_OSA_Scan' + endPointUrl);  
            }
            system.debug('@@@ url'+ req.getEndpoint());
            req.setHeader('x-api-Key', '{!$Credential.Password}'); //1c4b2765-369c-4fac-a6dc-abfe93dcdbaa
            req.setHeader('Content-Type','application/json');
            req.setHeader('userName', '{!$Credential.Username}');
            req.setHeader('EnterpriseSuite', Label.EnterpriseSuite);
            req.setHeader('EnterpriseValue', Label.EnterpriseValue);
            Http http = new Http();
            res = http.send(req);            
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            throw new AuraHandledException('Error occured during HTTP callout. Exception Cause : ' + e.getCause()+ ' at Line No. ' + e.getLineNumber()+' Error Message : '+e.getMessage());
        }
        return res;
    }
    public class SECAPIParser{
        public String medium{get;set;}
        public String high{get;set;}
        public String low{get;set;}
        public String critical{get;set;}
        public String reqId{get;set;}
        public String scanType{get;set;}
        public String lastUpdated{get;set;}
        public Boolean failScan{get;set;}
        public String SCAmedium{get;set;}
        public String SCAhigh{get;set;}
        public String SCAlow{get;set;}
       // public String SCAcritical{get;set;}
        public Boolean SCAfailScan{get;set;}
    }
    
    
    public class scanStatusWrapper {
        @AuraEnabled public String currentStatus;
        @AuraEnabled public String statusURL;
    }
}
