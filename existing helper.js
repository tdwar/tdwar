//callSecApi function for SAST Scan

({  callSecApi : function(component, event, helper) { 
         console.log('KAMAL SAST -2');  
        component.set('v.calloutStatusSAST','In-Progress');
        var action1 = component.get('c.getBuildId'); 
        action1.setParams({
            "releaseId" : component.get("v.recordId")
        });
        action1.setCallback(this, function(a){
            var state = a.getState(); 
             console.log("getBuildId SecAPI state: " + state); //Debugging state of getBuildId
             console.log('KAMAL SAST -3');
            if(state == 'SUCCESS'){
                if(a.getReturnValue() != null && a.getReturnValue() != ''){
                    console.log("getBuildId return value : " + a.getReturnValue()); //confirming return value
                     console.log('KAMAL SAST -4');
                    var action = component.get('c.secAPIScan'); 
                    action.setParams({
                        "releaseId" : component.get("v.recordId")
                    });
                     console.log('KAMAL SAST -5');
                    action.setCallback(this, function(a){
                        var state = a.getState();
                        console.log('state : '+ state);
                         console.log('KAMAL SAST -6');
                        if(state ==  "SUCCESS"){
                            if(a.getReturnValue() != null && a.getReturnValue() != ''){
                                console.log("secAPIScan res : "+a.getReturnValue()); //confirming secAPIScan response
                                var response = a.getReturnValue();
                                
                                if(response.includes("Error")){
                                    helper.displayToast(component,event,'Error 1',response,'Error','sticky');
                                    $A.get('e.force:refreshView').fire();
                                    $A.get("e.force:closeQuickAction").fire();
                                }
                                else if(response != 'NoApexCmp'){
                                    console.log("inside successful response processing for secAPIScan ");
                                    component.set('v.showModal',true);
                                    console.log("res status url : "+response);
                                    component.set('v.statusURL', response);
                                    component.set('v.progressNumberSAST',33);
                                     console.log('KAMAL SAST -7');
                                    helper.regulerStatusCheck(component, event, helper);
                                }
                            }
                        }
                        else{
                            var errors = a.getError();
                            console.log('secAPIScan error : '+ JSON.stringify(errors)); //logging secAPIScan errors
                            helper.displayToast(component,event,'Error 2',errors[0].message,'Error','sticky');
                            $A.get("e.force:closeQuickAction").fire();
                            $A.get('e.force:refreshView').fire();
                            
                        }   
                        
                         console.log('error here before SECAPI getReleasedetails');
                        var action2 = component.get('c.getReleaseDetails'); 
                        action2.setParams({
                            "releaseId" : component.get("v.recordId")
                        });
                        action2.setCallback(this, function(a){
                            var state2 = a.getState();
                            console.log("getReleaseDetails state: " + state2); //Debugging getReleaseDetails state
                            
                            if(state2 == "SUCCESS"){
                                if(a.getReturnValue() != null && a.getReturnValue() != ''){
                                    console.log("getReleaseDetails returned value : " + a.getReturnValue()); //confirming getReleaseDetails return value
                                    component.set('v.ReleaseObject',a.getReturnValue());
                                }
                            }
                            else{
                                var errors = a.getError();
                                console.log('getReleaseDetails error: '+JSON.stringify(errors)); //logging getReleaseDetails errors
                                helper.displayToast(component,event,'Error 3',errors[0].message,'Error','dismissible');
                                
                            }
                        });
                        $A.enqueueAction(action2); //enqueue getReleaseDetails
                        
                    });
                    $A.enqueueAction(action); //enqueue secAPIScan
                }
            }
            else{
                var errors = a.getError();
                console.log("getBuildId error: " +JSON.stringify(errors)); //logging getBuildId errors
                helper.displayToast(component,event,'Error 4',errors[0].message,'Error','dismissible');
                
            }           
        });
        $A.enqueueAction(action1); //enqueue getBuildId
        
    },
    
    lockReleaseRecord : function(component, event, helper) { 

        var action1 = component.get('c.lockReleaseRec'); 
        action1.setParams({
            "releaseId" : component.get("v.recordId")
        });
        action1.setCallback(this, function(a){
            var state = a.getState();
            console.log("lockReleaseRec state: " + state); //Debugging state of lockReleaseRec
            
            if(state == 'SUCCESS'){
                component.set("v.showSecAPI",true);
                component.set("v.showLockScreen",false);
            }
            else{
                var errors = a.getError();
                console.log("lockReleaseRec error: " +JSON.stringify(errors)); //logging lockReleaseRec errors
                helper.displayToast(component,event,'Error 5',errors[0].message,'Error','dismissible');
            }
            component.set('v.showSpinner',false);
        });
        $A.enqueueAction(action1); //enqueue lockReleaseRec
        
    },
    
    regulerStatusCheck : function (component,event,helper){
         console.log('KAMAL SAST -8');
        var action = component.get('c.runSecAPIStatusCheck'); 
        console.log("checking statusURL for runSecAPIStatusCheck : "+component.get("v.statusURL")); //Debugging statusURL
        
        action.setParams({
            "statusURL" : component.get("v.statusURL"),
            "releaseId" : component.get("v.recordId")
        }); 
         console.log('KAMAL SAST -9');
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log("runSecAPIStatusCheck state: "+state); //Debugging runSecAPIStatusCheck state
            $A.get('e.force:refreshView').fire();
             console.log('KAMAL SAST -10');
            if(state == "SUCCESS"){
                var retVal = response.getReturnValue();
                console.log('runSecAPIStatusCheck retur value: '+ JSON.stringify(retVal)); // confirming return value
                
                //new logic: skip updating if the SAST scan is already at 100%
                if (component.get('v.progressNumberSAST') === 100) {
                    console.log('SAST scan is already completed. Skipping the update.');
                    return;
                }
                component.set("v.scanStatus",retVal.currentStatus);
                component.set('v.showSpinner',false);
                
                
                if(retVal.currentStatus.includes("Error occured")){
                    helper.displayToast(component,event,'Error 6',retVal,'Error','sticky');
                    
                }
                else if(retVal.currentStatus == 'ERROR' || retVal.currentStatus == 'CANCELED' || retVal.currentStatus == 'FAILED'){
                    component.set('v.stopPolling',true);
                    component.set('v.calloutStatusSAST', 'Failed');
                }
               
                else if(retVal.currentStatus == 'FINISHED'){
                    component.set('v.stopPolling',true);
                    component.set('v.progressNumberSAST',66);
                    console.log('KAMAL SAST -11-1');
                    helper.getSECAPIScore(component,helper);
                    console.log('KAMAL SAST -11-7');
                }
                else{
                     console.log('KAMAL SAST -11');
                    if(retVal.statusURL){
                        component.set('v.statusURL', retVal.statusURL);
                    }
                    setTimeout(function(){component.set("v.stopPolling",false);},30000);
                }
            }
            else{
                var errors = response.getError();
                console.log('runSecAPIStatusCheck error: '+ JSON.stringify(errors)); // logging runSecAPIStatusCheck errors
                helper.displayToast(component,event,'Error 7',errors[0].message,'Error','dismissible');
            }
        });
        
        $A.enqueueAction(action); // enqueue runSecAPIStatusCheck
    },
    
    getSECAPIScore : function (component,helper){
        var statusURL = component.get("v.statusURL");
        console.log('KAMAL SAST -11-2');
        var action = component.get('c.getSECAPIScoreCard'); 
        action.setParams({
            "scoreCardURL" : statusURL,
            "releaseId" : component.get("v.recordId")
        }); 
        console.log('KAMAL SAST -11-3');
        action.setCallback(this, function(a){
            var state = a.getState();
            console.log("getSECAPIScoreCard state: " + state); //Debugging state of getSECAPIScoreCard
            $A.get('e.force:refreshView').fire();
            console.log('KAMAL SAST -11-4');
            if(state=='SUCCESS'){
                var response = a.getReturnValue();
                if(response.includes("Error occured")){
                    helper.displayToast(component,event,'Error 8',response,'Error','sticky');
                }
                else{
                    console.log('KAMAL SAST -11-5');
                    component.set('v.calloutStatusSAST', 'Completed');
                    component.set('v.progressNumberSAST',100);
                }
            }
            else{
                var errors = a.getError();
                console.log('getSECAPIScoreCard error: '+ JSON.stringify(errors)); // logging getSECAPIScoreCard errors
                helper.displayToast(component,event,'Error 9',errors[0].message,'Error','dismissible');
            }
        });
        $A.enqueueAction(action); // enqueue getSECAPIScoreCard
        console.log('KAMAL SAST -11-6');
    },
    
    displayToast : function(component, event, title, message, type, mode) {
        
        $A.get('e.force:refreshView').fire();
        $A.get("e.force:closeQuickAction").fire();
        component.find('notifLib').showNotice({
            "title": title,
            "variant": type,
            "header": "Something has gone wrong!",
            "message": message,
            "mode": mode || 'dismissible'
           
        });
    },
    
    validateUserStories : function(component, event, helper) {
        var flow = component.find("validateUSFlow");
        var inputVariables = [{
                name : "recordId",
                type : "String",
                value : component.get("v.recordId")
        }]
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
        $A.enqueueAction(action); //enqueue resetSecAPIScan
    },

//callSCAScan function for SCAScan

    callSCAScan : function(component, event, helper) { 
        console.log('KAMAL SCA -2');
        component.set('v.calloutStatusOSA','In-Progress');
        var action1 = component.get('c.getBuildId'); 
        action1.setParams({
            "releaseId" : component.get("v.recordId")
        });
        console.log('KAMAL SCA -3');
        action1.setCallback(this, function(a){
            var state = a.getState();
            console.log("getBuildId SCA state: " + state); //Debugging state of getBuildId
            console.log("getBuildId SCA return value : " + a.getReturnValue()); //confirming return value
            if(state == 'SUCCESS'){
                if(a.getReturnValue() != null && a.getReturnValue() != ''){
                    console.log('KAMAL SCA -4');
                    var action = component.get('c.SCAScan'); 
                    action.setParams({
                        "releaseId" : component.get("v.recordId")
                    });
                    action.setCallback(this, function(a){
                        var state = a.getState();
                        console.log('state : '+ state);
                        if(state ==  "SUCCESS"){
                             console.log('KAMAL SCA -5');
                            if(a.getReturnValue() != null && a.getReturnValue() != ''){
                                console.log("res 11/11: "+a.getReturnValue());
                                var response = a.getReturnValue();
                                if(response.includes("Error")){
                                    helper.displayToast(component,event,'Error 10',response,'Error','sticky');
                                    $A.get('e.force:refreshView').fire();
                                    $A.get("e.force:closeQuickAction").fire();
                                }
                                else if(response != 'NoApexCmp'){
                                    console.log("inside res 1");
                                    component.set('v.showModal',true);
                                    console.log("res status url SCA: "+response);
                                    component.set('v.statusURLSCA', response);
                                    component.set('v.progressNumberOSA',33);
                                    
                                     console.log('KAMAL SCA -6');
                                    helper.regulerSCAStatusCheck(component, event, helper);
                                }
                            }
                        }
                        else{
                            var errors = a.getError();
                            console.log('error : '+ JSON.stringify(errors));
                            helper.displayToast(component,event,'Error 11',errors[0].message,'Error','sticky');
                            $A.get("e.force:closeQuickAction").fire();
                            $A.get('e.force:refreshView').fire();
                            
                        }   
                        if (typeof console !== 'undefined') {
                            console.log('VXD3378 - error here before SCA getReleasedetails');
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
                                helper.displayToast(component,event,'Error 12',errors[0].message,'Error','dismissible');
                                
                            }
                        });
                        $A.enqueueAction(action2);
                        
                        
                        
                    });
                    $A.enqueueAction(action);
                }
            }
            else{
                var errors = a.getError();
                helper.displayToast(component,event,'Error 13',errors[0].message,'Error','dismissible');
                
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
                helper.displayToast(component,event,'Error 14',errors[0].message,'Error','dismissible');
            }
            component.set('v.showSpinner',false);
        });
        $A.enqueueAction(action1);
        
    },
    
    regulerSCAStatusCheck : function (component,event,helper){
         console.log('KAMAL SCA -7');
                
        var action = component.get('c.runSCAStatusCheck'); 
        console.log("res status RAMA: "+component.get("v.statusURL"));        
        console.log("SCA Status URL RAMA : "+component.get("v.statusURLSCA")); //Debugging statusURL
        
        action.setParams({
            "statusURLSCA" : component.get("v.statusURLSCA"),
            "releaseId" : component.get("v.recordId")
        });
        
        
        
         console.log('KAMAL SCA -8');
        action.setCallback(this, function(response) {
            //console.log("Error 15 debugg statement : "+response);
            //console.log("Error 15 debugg statement2 : "+response.getReturnValue);
            var state = response.getState(); //success
            $A.get('e.force:refreshView').fire();
            console.log('TEJASWI SCA -8');
            if(state == "SUCCESS"){
                var retVal = response.getReturnValue();
                console.log('Rama Current status for SCA '+retVal.currentStatus);
                console.log('retval: '+retVal); //retval: [object Object]
                component.set("v.scanStatusOSA",retVal.currentStatus);
                component.set('v.showSpinner',false);
                console.log("scan status OSA : "+component.get("v.scanStatusOSA")); //error
                if(retVal.currentStatus.includes("Error occured")){
                    helper.displayToast(component,event,'Error 15',retVal,'Error','sticky');
                    
                }
                else if(retVal.currentStatus == 'ERROR' || retVal.currentStatus == 'CANCELED' || retVal.currentStatus == 'FAILED'){
                    component.set('v.stopPolling',true);
                    console.log('in if condition');
                    component.set('v.calloutStatusOSA', 'Failed');
                }
                else if(retVal.currentStatus == 'FINISHED'){
                    component.set('v.stopPolling',true);
                    component.set('v.progressNumberOSA',66);
                    console.log('KAMAL SCA -11 -0');
                    helper.getSCAScore(component,helper);
                    console.log('KAMAL SCA -11-6');
                }
                else{
                    
                     console.log('KAMAL SCA -9');
                    console.log('retVal.statusURLSCA: '+retVal.statusURLSCA);
                    console.log('retVal.statusURL: '+retVal.statusURL);
                    if(retVal.statusURL){
                        component.set('v.statusURLSCA', retVal.statusURL);
                    }
                     console.log('KAMAL SCA -10');
                    setTimeout(function(){component.set("v.stopPolling",false);},30000);
                }
            }
            else{
                var errors = response.getError();
                helper.displayToast(component,event,'Error 16',errors[0].message,'Error','dismissible');
            }
        });
        
        $A.enqueueAction(action);
    },
    
    getSCAScore : function (component,helper){
        console.log('KAMAL SCA -11-1');
        var statusURL = component.get("v.statusURL");
        var action = component.get('c.getSCAScoreCard'); 
        action.setParams({
            "scoreCardURL" : statusURL,
            "releaseId" : component.get("v.recordId")
        }); 
        console.log('KAMAL SCA -11-2');
        action.setCallback(this, function(a){
            var state = a.getState();
            $A.get('e.force:refreshView').fire();
            if(state=='SUCCESS'){
                var response = a.getReturnValue();
                if(response.includes("Error occured")){
                    helper.displayToast(component,event,'Error 17',response,'Error','sticky');
                }
                else{
                    console.log('KAMAL SCA -11-3');
                    component.set('v.calloutStatusOSA', 'Completed');
                    component.set('v.progressNumberOSA',100);
                    console.log('KAMAL SCA -11-4');
                }
            }
            else{
                var errors = a.getError();
                helper.displayToast(component,event,'Error 18',errors[0].message,'Error','dismissible');
            }
        });
        $A.enqueueAction(action); 
        console.log('KAMAL SCA -11-5');
    },
    
    displayToast : function(component, event, title, message, type, mode) {
        
        $A.get('e.force:refreshView').fire();
        $A.get("e.force:closeQuickAction").fire();
        component.find('notifLib').showNotice({
            "title": title,
            "variant": type,
            "header": "Something has gone wrong!",
            "message": message,
            "mode": mode || 'dismissible'
           
        });
    },
    
    validateUserStories : function(component, event, helper) {
        var flow = component.find("validateUSFlow");
        var inputVariables = [{
                name : "recordId",
                type : "String",
                value : component.get("v.recordId")
            }]
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

               helper.callSCAApi(component, event, helper);
            }
        
        });
        $A.enqueueAction(action); 
    }
    
    
})
