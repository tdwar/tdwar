({
    callSecApi : function(component, event, helper) { 

        component.set('v.calloutStatus','In-Progress');
        var action1 = component.get('c.getBuildId'); 
        action1.setParams({
            "releaseId" : component.get("v.recordId")
        });
        action1.setCallback(this, function(a){
            var state = a.getState();
            
            if(state == 'SUCCESS'){
                if(a.getReturnValue() != null && a.getReturnValue() != ''){
                    
                    var action = component.get('c.secAPIScan'); 
                    action.setParams({
                        "releaseId" : component.get("v.recordId")
                    });
                    action.setCallback(this, function(a){
                        var state = a.getState();
                        console.log('state : '+ state);
                        if(state ==  "SUCCESS"){
                            
                            if(a.getReturnValue() != null && a.getReturnValue() != ''){
                                console.log("res : "+a.getReturnValue());
                                var response = a.getReturnValue();
                                if(response.includes("Error")){
                                    helper.displayToast(component,event,'Error',response,'Error','sticky');
                                    $A.get('e.force:refreshView').fire();
                                    $A.get("e.force:closeQuickAction").fire();
                                }
                                else if(response != 'NoApexCmp'){
                                    console.log("inside res 1");
                                    component.set('v.showModal',true);
                                    console.log("res status url : "+response);
                                    component.set('v.statusURL', response);
                                    component.set('v.progressNumber',33);
                                    helper.regulerStatusCheck(component, event, helper);
                                }
                            }
                        }
                        else{
                            var errors = a.getError();
                            console.log('error : '+ JSON.stringify(errors));
                            helper.displayToast(component,event,'Error',errors[0].message,'Error','sticky');
                            $A.get("e.force:closeQuickAction").fire();
                            $A.get('e.force:refreshView').fire();
                            
                        }   
                        
                        
                        var action2 = component.get('c.getReleaseDetails'); 
                        action2.setParams({
                            "releaseId" : component.get("v.recordId")
                        });
                        action2.setCallback(this, function(a){
                            var state2 = a.getState();
                            if(state2 == "SUCCESS"){
                                if(a.getReturnValue() != null && a.getReturnValue() != ''){
                                    component.set('v.ReleaseObject',a.getReturnValue());
                                }
                            }
                            else{
                                var errors = a.getError();
                                console.log('error ab : '+errors);
                                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
                                
                            }
                        });
                        $A.enqueueAction(action2);
                        
                        
                        
                    });
                    $A.enqueueAction(action);
                }
            }
            else{
                var errors = a.getError();
                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
                
            }           
        });
        $A.enqueueAction(action1);
        
    },
    
    lockReleaseRecord : function(component, event, helper) { 

        var action1 = component.get('c.lockReleaseRec'); 
        action1.setParams({
            "releaseId" : component.get("v.recordId")
        });
        action1.setCallback(this, function(a){
            var state = a.getState();
            
            if(state == 'SUCCESS'){
                component.set("v.showSecAPI",true);
                component.set("v.showLockScreen",false);
            }
            else{
                var errors = a.getError();
                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
            }
            component.set('v.showSpinner',false);
        });
        $A.enqueueAction(action1);
        
    },
    
    regulerStatusCheck : function (component,event,helper){
        
        var action = component.get('c.runSecAPIStatusCheck'); 
        console.log("res status : "+component.get("v.statusURL"));
        action.setParams({
            "statusURL" : component.get("v.statusURL"),
            "releaseId" : component.get("v.recordId")
        });        
        action.setCallback(this, function(response) {
            var state = response.getState();
            $A.get('e.force:refreshView').fire();
            if(state == "SUCCESS"){
                var retVal = response.getReturnValue();
                console.log('retval: '+retVal);
                component.set("v.scanStatus",retVal.currentStatus);
                component.set('v.showSpinner',false);
                console.log("scna status : "+component.get("v.scanStatus"));
                if(retVal.currentStatus.includes("Error occured")){
                    helper.displayToast(component,event,'Error',retVal,'Error','sticky');
                    
                }
                else if(retVal.currentStatus == 'ERROR' || retVal.currentStatus == 'CANCELED' || retVal.currentStatus == 'FAILED'){
                    component.set('v.stopPolling',true);
                    console.log('in if condition');
                    component.set('v.calloutStatus', 'Failed');
                }
                else if(retVal.currentStatus == 'FINISHED'){
                    component.set('v.stopPolling',true);
                    component.set('v.progressNumber',66);
                    helper.getSECAPIScore(component,helper);
                }
                else{
                    console.log('retVal.statusURL: '+retVal.statusURL);
                    if(retVal.statusURL){
                        component.set('v.statusURL', retVal.statusURL);
                    }
                    setTimeout(function(){component.set("v.stopPolling",false);},30000);
                }
            }
            else{
                var errors = response.getError();
                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
            }
        });
        
        $A.enqueueAction(action);
    },
    
    getSECAPIScore : function (component,helper){
        var statusURL = component.get("v.statusURL");
        var action = component.get('c.getSECAPIScoreCard'); 
        action.setParams({
            "scoreCardURL" : statusURL,
            "releaseId" : component.get("v.recordId")
        });        
        action.setCallback(this, function(a){
            var state = a.getState();
            $A.get('e.force:refreshView').fire();
            if(state=='SUCCESS'){
                var response = a.getReturnValue();
                if(response.includes("Error occured")){
                    helper.displayToast(component,event,'Error',response,'Error','sticky');
                }
                else{
                    component.set('v.calloutStatus', 'Completed');
                    component.set('v.progressNumber',100);
                }
            }
            else{
                var errors = a.getError();
                helper.displayToast(component,event,'Error',errors[0].message,'Error','dismissible');
            }
        });
        $A.enqueueAction(action); 
    },
    
    displayToast : function(component, event, title, message, type, mode) {
        
        $A.get('e.force:refreshView').fire();
        $A.get("e.force:closeQuickAction").fire();
        component.find('notifLib').showNotice({
            "title": title,
            "variant": "error",
            "header": "Something has gone wrong!",
            "message": message
           
        });
    },
    
    validateUserStories : function(component, event, helper) {
        var flow = component.find("validateUSFlow");
        var inputVariables = [
            {
                name : "recordId",
                type : "String",
                value : component.get("v.recordId")
            }
        ]
        flow.startFlow("User_Stories_Validation",inputVariables);
    },
    
    reinitiateSecAPIScan : function(component, event, helper) {

        var action = component.get('c.resetSecAPIScan'); 
        action.setParams({
            "releaseId" : component.get("v.recordId")
        });        
        action.setCallback(this, function(a){
            var state = a.getState();
            if(state=='SUCCESS'){
                component.set('v.showSpinner',false);

        		$A.get('e.force:refreshView').fire();

               helper.callSecApi(component, event, helper);
            }
        
        });
        $A.enqueueAction(action); 
    }
    
    
})
