({
    doInit : function(component, event, helper) {
        component.set('v.calloutStatusSAST','Not Started');
        component.set('v.calloutStatusOSA','Not Started');
        
        //Get Release Details
        var action2 = component.get('c.getReleaseDetails'); 
        action2.setParams({
            "releaseId" : component.get("v.recordId")
        });
        action2.setCallback(this, function(a){
            var state2 = a.getState();
            console.log('action2 state : '+state2);
            if(state2 == "SUCCESS"){
                console.log('action2 response : '+JSON.stringify(a.getReturnValue()));
                if(a.getReturnValue() != null && a.getReturnValue() != ''&& a.getReturnValue() != undefined){
                    console.log('action2 response in if : '+JSON.stringify(a.getReturnValue()));
                    component.set('v.ReleaseObject',a.getReturnValue());
                    console.log('SAST Scan Status : '+component.get('v.ReleaseObject').SEC_API_Scan_Status__c);
                    console.log('OSA/SCA Scan Status : '+component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c);
                    component.set('v.calloutStatusSAST',component.get('v.ReleaseObject').SEC_API_Scan_Status__c);
                    component.set('v.calloutStatusOSA',component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c);
                    component.set('v.SecAPIScanId',component.get('v.ReleaseObject').SecAPI_Scan_Id__c);
                    var showSec = component.get("v.showSecAPI");
                    console.log('boolean val : ' + showSec);
                    component.set('v.calloutStatusSAST',component.get('v.ReleaseObject').SEC_API_Scan_Status__c);
                    component.set('v.calloutStatusOSA',component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c);
                    if((component.get('v.ReleaseObject').Current_Glapi_Status__c == undefined || component.get('v.ReleaseObject').Current_Glapi_Status__c == 'Validation Failed') && showSec == false){
                        helper.validateUserStories(component,event,helper);
                    }
                    console.log('Release Status-->'+component.get('v.ReleaseObject').Current_Glapi_Status__c);
                    console.log('Locked__c-->'+component.get('v.ReleaseObject').Locked__c);
                    if(!component.get('v.ReleaseObject').Locked__c && component.get('v.ReleaseObject').Current_Glapi_Status__c != 'Validation Failed'  && component.get('v.ReleaseObject').Current_Glapi_Status__c != undefined){
                        component.set("v.showLockScreen",true);
                        component.set("v.showSecAPI",false);
                    }
                    if(component.get('v.ReleaseObject').Locked__c && component.get('v.ReleaseObject').Current_Glapi_Status__c != 'Validation Failed'  && component.get('v.ReleaseObject').Current_Glapi_Status__c != undefined){
                        component.set("v.showLockScreen",false);
                        component.set("v.showSecAPI",true);
                    }
                    console.log('hi'+component.get('v.ReleaseObject').SEC_API_Scan_Status__c);
                    if((component.get('v.ReleaseObject').SEC_API_Scan_Status__c != undefined && component.get('v.ReleaseObject').SEC_API_Scan_Status__c != 'Not Started' && component.get('v.ReleaseObject').SEC_API_Scan_Status__c != 'Completed') ||
                       (component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c != undefined && component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c != 'Not Started' && component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c != 'Completed')){
                        console.log('sec status : '+component.get('v.ReleaseObject').SEC_API_Scan_Status__c);
                        console.log('sec status : '+component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c);
                        if(component.get('v.ReleaseObject').Current_Glapi_Status__c != 'Validation Failed'){
                            component.find("secApiButton").set("v.disabled", true);
                        }
                        component.set("v.stopPolling", false);
                        component.set('v.progressNumberSAST',33);
                        component.set('v.progressNumberOSA',33);
                    }
                    
                    else if((component.get('v.ReleaseObject').SEC_API_Scan_Status__c != undefined && component.get('v.ReleaseObject').SEC_API_Scan_Status__c == 'Not Started' ) ||
                            (component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c != undefined && component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c == 'Not Started' )) {
                                           console.log('hi1'+component.get('v.ReleaseObject').SEC_API_Scan_Status__c);
                                           console.log('hi1'+component.get('v.ReleaseObject').SCA_OSA_Scan_Status__c);
                        if(component.find("secApiButton") != undefined){
                        	component.find("secApiButton").set("v.disabled", false);
                        }
                        component.set("v.stopPolling", true);

                    }
                    else{
                        component.set("v.stopPolling", true);
                    }
                }
            }
            else{
                var errors = a.getError();
                console.log('message error : '+errors);
                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
                
            }
        });
        $A.enqueueAction(action2);
        var action = component.get('c.fetchScanStatus'); 
        action.setParams({
            "releaseId" : component.get("v.recordId")
        });
        action.setCallback(this, function(a){
            var state = a.getState();
            if(!component.get("v.ReleaseObject").SEC_API_Scan_Status__c == 'Completed'){
                console.log("in show false");
                component.set('v.showSpinner',false);}
            if(state == 'SUCCESS'){
                if(a.getReturnValue() != null && a.getReturnValue() != ''){
                    console.log("res1 : "+JSON.stringify(a.getReturnValue()));
                    if(component.get("v.ReleaseObject").SEC_API_Scan_Status__c == 'In-Progress'){
                        component.set('v.statusURL', a.getReturnValue());
                    }
                }
            }
            else{
                var errors = a.getError();
                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
                
            }           
        });
        $A.enqueueAction(action);
        // scan status OSA/SCA
        var actionSCA = component.get('c.fetchScanStatus'); 
        actionSCA.setParams({
            "releaseId" : component.get("v.recordId")
        });
        actionSCA.setCallback(this, function(a){
            var state = a.getState();
            if(!component.get("v.ReleaseObject").SCA_OSA_Scan_Status__c == 'Completed'){
                console.log("in show false");
                component.set('v.showSpinner',false);}
            if(state == 'SUCCESS'){
                if(a.getReturnValue() != null && a.getReturnValue() != ''){
                    console.log("res1 : "+JSON.stringify(a.getReturnValue()));
                    if(component.get("v.ReleaseObject").SCA_OSA_Scan_Status__c == 'In-Progress'){
                        component.set('v.statusURL', a.getReturnValue());
                    }
                }
            }
            else{
                var errors = a.getError();
                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
                
            }           
        });
        $A.enqueueAction(actionSCA);
        
    },
    
    handleClick : function(component, event, helper){
        component.set('v.showSpinner',true);
        component.set('v.stopPolling',true);
        component.set('v.calloutStatusSAST','In-Progress');
        component.set('v.calloutStatusOSA','In-Progress');
        helper.regulerStatusCheck(component, event, helper);
        helper.regulerSCAStatusCheck(component, event, helper);
    },
    
    handleRunSecApi : function(component, event, helper){
        component.find("secApiButton").set("v.disabled", true);
        component.set('v.showSpinner',true)
        component.set('v.calloutStatusSAST','In-Progress');
        component.set('v.progressNumberSAST',33);
        component.set('v.calloutStatusOSA','In-Progress');
        component.set('v.progressNumberOSA',33);
        helper.callSecApi(component, event, helper);
        helper.callSCAScan(component, event, helper);
    },
    
    handleClose : function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
        $A.get("e.force:refreshView").fire();
    },
    
    handleLockChange: function(component, event, helper) {
        var changeValue = event.getParam("value");
        console.log('changeValue: '+changeValue);
        let button = component.find('savebuttonid');
        if(changeValue === 'Yes'){
            button.set('v.disabled',false);
        }else{
            button.set('v.disabled',true);
        }
    },
    
    handleSave : function(component, event, helper) {
        component.set('v.showSpinner',true);
        helper.lockReleaseRecord(component, event, helper);
    },
    
    checkEvtType : function(component, event, helper) {
        console.log("in handler cmp");
        var evtType = event.getParam("cmptype");
        console.log("evtType : "+evtType);
    },
    
    
    
    statusChange : function (component, event, helper) {
        //Check Flow Status
        if (event.getParam('status') === "FINISHED_SCREEN" || event.getParam('status') === "FINISHED") {
            console.log("in status change");
            var a = component.get('c.doInit');
        	$A.enqueueAction(a);
        } else if (event.getParam('status') === "ERROR") {
            component.set("v.hasError", true);
        }
    },
    
    handleResetScan : function(component, event, helper){
         component.set('v.showSpinner',true);
        
 		var action = component.get('c.resetSecAPIScan'); 
        action.setParams({
            "releaseId" : component.get("v.recordId")
        });        
        action.setCallback(this, function(a){
            var state = a.getState();
            if(state=='SUCCESS'){
                
                component.set('v.progressNumberSAST',0);
                 component.set('v.scanStatusSAST','');
                component.set('v.progressNumberOSA',0);
                 component.set('v.scanStatusOSA','');
                component.set('v.showSpinner',false);
                $A.get('e.force:refreshView').fire();
				var a = component.get('c.doInit');
        		$A.enqueueAction(a);
            }
        
        });
        $A.enqueueAction(action); 
    }
})
