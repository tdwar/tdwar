/******************************************************************************************************************************
Apex Class Name  : SecAPIScanReportController
Version          : 1.0 
Created Date     : 27/05/2021
Function         : 

Modification Log :
* Developer                       Date                 Description
* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------                
* Vaibhav Tripathi               27/05/2021          This controller use to get Sec API scan Report pd save in attachment and redirect it.

***************************************************************************************************************************************************************************/
public with sharing class SecAPIScanReportController {
    
    
    public PageReference getSecAPIScanReport() {
        String recordId = '';
        String endPointUrl = '';
        String appRequestId = '';
        String pdfId ='';
        string reportUrl = '';
        String reportName='';
        try{
            if(ApexPages.currentPage().getParameters().get('id').escapeHtml4() != null){
                recordId = ApexPages.currentPage().getParameters().get('id').escapeHtml4();
                
                if(recordId != null && Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Pdf_Report__c.isAccessible()){
                //if(Schema.sObjectType.SEC_API_Scan_Result__c.isAccessible() && Schema.sObjectType.SEC_API_Scan_Result__c.fields.Pdf_Report__c.isAccessible()){
                    SEC_API_Scan_Result__c scanResult = [select id,Name,Pdf_Report__c from SEC_API_Scan_Result__c where Id=:recordId and OwnerId != null]; 
                    reportUrl = scanResult.Pdf_Report__c;
                    reportName = scanResult.Name;
                }
                    
                    if(String.isNotEmpty(reportUrl)){
                        appRequestId = reportUrl.substringAfter('pdf/');
                        endPointUrl = '/report/pdf/'+appRequestId;
                        reportName = 'SecAPI_Scan_Result_' +reportName;
                        HttpResponse response = SecAPIScanController.getCalloutResponse(endPointUrl,'GET',null);
                        if(response.getStatusCode() == 200 && String.isNotEmpty(response.getBody())){
                            blob Fileret = response.getBodyAsBlob();
                            pdfId = createAttachment(Fileret,ApexPages.currentPage().getParameters().get('id').escapeHtml4(),'application/pdf',reportName);
                        }
                        else if(response.getStatusCode() != 200 || String.isEmpty(response.getBody())){
                            ApexPages.addmessage(new ApexPages.message(ApexPages.severity.ERROR,'Scan Report N/A - please check the scan status before view the scan report')); 
                        	return null;
                        }
                        
                    }
                    else{
                        ApexPages.addmessage(new ApexPages.message(ApexPages.severity.ERROR,'SecAPI Scan Report is not available to process')); 
                        return null;
                    }
                
            }
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            ApexPages.addmessage(new ApexPages.message(ApexPages.severity.ERROR,'Error occured during processing the Report Pdf'));  
           
        }
        PageReference redirectPage = new PageReference('/servlet/servlet.FileDownload?file='+pdfId);
        redirectPage.setRedirect(true);
        return redirectPage;
        
    }
    
    
    public String createAttachment(blob fileContent, String recordId, String fileType, String reportName){
        Attachment attach = new Attachment();
        try{
        if(string.isNotEmpty(recordId) && Schema.sObjectType.Attachment.isAccessible()){
            List<attachment> lstAttachment = [Select id from Attachment where ParentId=:recordId and OwnerId != null];
            if(!lstAttachment.isEmpty()){
                for(Attachment att : lstAttachment){
                    if(Schema.sObjectType.Attachment.isDeletable() && Schema.sObjectType.Attachment.isAccessible() && Attachment.sObjectType.getDescribe().isDeletable()){
                        Delete att;
                    }
                }
            }
        }
         if(string.isNotEmpty(recordId) && Schema.sObjectType.Attachment.isAccessible() && Schema.sObjectType.Attachment.isCreateable()){ 
             attach = new Attachment(ParentId = recordId,Name=reportName,Body = fileContent,contentType=fileType);
             insert attach;  
         }
        }catch(Exception e){
            system.debug('exception '+e +e.getCause()+e.getLineNumber()+e.getMessage());
            ApexPages.addmessage(new ApexPages.message(ApexPages.severity.ERROR,'Error occured during inserting the attachment of report pdf'));  
           
        }
        if(Schema.sObjectType.Attachment.isAccessible() && string.isNotEmpty(attach.id)){
            return attach.id;
        }
        else return null;
        
    }
}
