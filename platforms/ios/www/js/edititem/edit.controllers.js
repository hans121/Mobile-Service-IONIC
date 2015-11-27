angular.module('starter.edit.controller',[])

.controller('EDEditItemCtrl', function($scope, $state, EditButtonList, PictureService, $rootScope, DBAdapter, Util, $http, $ionicLoading){
    $scope.menuitems = EditButtonList.buttons;
    $scope.gotoPage = function(idx){
        console.log("edit button controller"+ idx);
        switch (parseInt(idx)) {
          case 0:
            DBAdapter.isAnyTaskIncomplete().then(function(result){
                if(result)
                {
            
                }else{
                    DBAdapter.isPasswordBlank(Util.schedule_pk).then(function(res){
                        if(res)
                        {
                            var time = getUTCDateForPunch(new Date());
                            var querydata={};
                            querydata.tbname = "data_sched";
                            querydata.data = {
                                "Schedule_PK": Util.schedule_pk,
                                "ArrivalTime": time
                            };
                            DBAdapter.insertData(querydata).then(function(ires){
                                if(ires<0)
                                {
                                    querydata.tbname="data_sched";
                                    querydata.columns=[{
                                        name:'DepartureTime',
                                        data:''
                                    }];
                                    querydata.cond=[{
                                        name:'schedule_PK',
                                        data: Util.schedule_pk
                                    }];
                                    DBAdapter.updateData(querydata);
                                    window.plugins.toast.showShortBottom("Re-Arrived at"+time);
                                }else{
                                    window.plugins.toast.showShortBottom("Arrived at"+time);
                                }
                                EditButtonList.buttons[0].disabled = true;
                                for (var i=1; i<EditButtonList.buttons.length; i++ )
                                    EditButtonList.buttons[i].disabled = false;
                                $rootScope.$broadcast('statuschange');
                            });
                        }else{
                            $state.go("tab.edititem.arrive");
                        }
                    });
                }
            });
            break;
          case 1:
            $state.go('tab.edititem.editmobilenote');
            break;
          case 2:
            $state.go('tab.edititem.notestatus');
            break;
          case 3:
            $state.go('tab.edititem.selsiteprofile');
            break;
          case 4:             
            $state.go('tab.edititem.selserviceprompt');
            break;
          case 5:
            $state.go('tab.edititem.additem');
            break;
          case 6:
            $state.go('tab.edititem.takepicture');  
            break;
            /*
          case 7:
            $state.go('tab.edititem.imagequeue');
            break;
            */
          case 7:
            
            var time = getUTCDateForPunch(new Date());
            var querydata={};
            querydata.tbname="data_sched";
            querydata.columns=[{
                                name:'DepartureTime',
                                data: time}];
            querydata.cond=[{name:'schedule_PK',
                             data: Util.schedule_pk
              }];
            DBAdapter.updateData(querydata);
            window.plugins.toast.showShortBottom("Departed at " + time);
            EditButtonList.buttons[0].disabled = false;
            for (var i=1; i<EditButtonList.buttons.length; i++ )
                EditButtonList.buttons[i].disabled = true;
            $rootScope.$broadcast('statuschange');
            $state.go("tab.itemdetail");


            if(Util.wifiOn == true)
            {
                Util.uploadCount = 0;

                console.log("Upload Picture");
                PictureService.uploadPicture(function(){
                  // $rootScope.$broadcast('statuschange');
                  // $state.go("tab.itemdetail");
                });
            }
            else
            {
                Util.canUpload = true;
                window.plugins.toast.showLongBottom("No WIFI available for now queued images will be uploaded when WIFI is available");
            }
            
            break;
        
        }
                                          
    }          

})

.controller('EDAddItemCtrl', function($scope, $state, DBAdapter, Util){
    
    var items = [];
    $scope.model ={
      itemcode:'',
      quantity:'',
      items: []
    };
    DBAdapter.getOrderItems(Util.schedule_pk).then(function(result){
        console.log(result);
        
        for(i=0;i<result.length;i++)
        {
            var item = {};
            item.itemcode = result[i].ItemCodeUPC;
            item.quantity = result[i].Quantity;
            items.push(item);
        }

        $scope.model.items = items;

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });
    $scope.onScan = function(){
        cordova.plugins.barcodeScanner.scan(function(result){
            $scope.model.itemcode = result.text;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, function(error){
            console.log(error);    
        });   
    }
    
    $scope.onAddItem = function(){
        var item={};
        item.itemcode = $scope.model.itemcode;
        item.quantity = $scope.model.quantity;
        items.push(item);
        $scope.model.items = items;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    
    $scope.onDeleteItem = function(idx)
    {
        items.splice(idx, 1);
        $scope.model.items = items;
        if (!$scope.$$phase) {
            $scope.$apply();   
        }        
    }
    
    $scope.onSave = function()
    {
        for (var i=0; i<$scope.model.items.length; i++)
        {
            var item = $scope.model.items[i];
            var querydata = {};
            querydata.tbname = "data_order_items";
            var data = {};
            data["Schedule_PK"] = Util.schedule_pk;
            data["ItemCodeUPC"] = item.itemcode;
            data["Quantity"] = item.quantity;
            querydata.data = data;
            DBAdapter.insertData(querydata);
            
        }
        $state.go("tab.edititem.commandlist");
    }
})

.controller('EDEditMobileNoteCtrl', function($scope, $state, $ionicModal,DBAdapter, Util){
    $scope.model = {
        quickText: '',        
        noteitems:[],
        isSaveDisabled : true
        };

    $ionicModal.fromTemplateUrl('templates/edititem/notetextdialog.html',{
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal){
        
            $scope.noteModal = modal;
        });
    var noteitems = [];
    var type_list = [];
    var shortDesc_list = [];
    var oldText = "";
    DBAdapter.getNarrativesType().then(function(result){
        type_list = result;
        console.log(type_list);
        for (var i=0 ; i< type_list.length; i++)
        {
            shortDesc_list.push("--"+type_list[i]);
            DBAdapter.getNarrativesShortDesc(type_list[i]).then(function(res){
                noteitems.push(res);
                $scope.model.noteitems = noteitems;
                if (!$scope.$$phase) {
                   // console.log(shortDesc_list);
                    $scope.$apply();
                }
            })
        }
          
    });

    DBAdapter.getMobNotes(Util.schedule_pk).then(function(res){
        var row = res[0];
        $scope.model.status = row['Status_PK'];
        $scope.model.quickText = row['MobileNotes'];
        oldText = row['MobileNotes'];
        $scope.model.noteChanged = row['MobileNotesChanged'];
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    })  

    $scope.onShowQuickNote = function()
    {
        $scope.noteModal.show();  
    }
          
    $scope.addNoteText = function(typeidx,idx)
    {
        $scope.noteModal.hide();
        DBAdapter.isNarrativeType(noteitems[typeidx].type).then(function(result){
            if (result){
                DBAdapter.getLongNarratives(noteitems[typeidx].data[idx], noteitems[typeidx].type).then(function(res){

                    $scope.model.quickText = $scope.model.quickText + "  " + res;

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            }   
        });
    }

    $scope.$watch('model.quickText', function(newValue, oldValue, scope) {
        if(oldText != newValue && $scope.model.isSaveDisabled == true)
        {
            $scope.model.isSaveDisabled = false;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
        if(oldText == newValue)
        {
            $scope.model.isSaveDisabled = true;
            if (!$scope.$$phase) {
                $scope.$apply();   
            }
        }
        //console.log(newValue);
    });

    $scope.onSave = function()
    {
        oldText = ($scope.model.quickText).trim();
        $scope.model.isSaveDisabled = true;
        if (!$scope.$$phase) {
            $scope.$apply();   
        }
        var updatedata = [
                          {
                            name:'MobileNotes',
                            data: ($scope.model.quickText).trim()
                          }
                          ];
        DBAdapter.updateDataSchedules(updatedata, Util.schedule_pk);
        window.plugins.toast.showShortBottom("Data saved");
        $state.go("tab.edititem.commandlist");

    }
})
.controller('EDNoteStatusCtrl', function($scope, $state, $ionicModal,DBAdapter, Util){
    var reasons=[
        {
            value:'1029',
            label:'Requires Callback',
            checked:false,
        },
        {
            value:'1030',
            label:'Need Parts-Warehouses',
            checked:false,
        },
        {
            value:'1031',
            label:'Need Parts-Vender',
            checked:false,
        },
        {
            value:'1032',
            label:'Unable to Repair',
            checked:false,
        },
        {
            value:'1033',
            label:'Reschedule',
            checked:false,
        },
    ];
    $ionicModal.fromTemplateUrl('templates/edititem/notetextdialog.html',{
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal){
        
            $scope.noteModal = modal;
        });
    //initialize///
    var type_list = [];
    var shortDesc_list = [];
    var icReason = document.getElementById("icReason");
    icReason.style.display = "none";
    //init scope variables
    $scope.model = {
        options : [{
                        name: 'Complete',
                        value:'1026'
                      },
                      {
                        name: 'Incomplete',
                        value:'1027'
                      },
                      {
                        name: 'Non-call',
                        value:'1028'
                      },
                    ],
        status: '1026',    
        reasons: reasons,
        quickText1: '',
        quickText2: '',
        isWarranty: false,
        noteitems:[]
        };
    
    var noteitems = [];
    DBAdapter.getNarrativesType().then(function(result){
        type_list = result;
        for (var i=0 ; i< type_list.length; i++)
        {
            shortDesc_list.push("--"+type_list[i]);
            DBAdapter.getNarrativesShortDesc(type_list[i]).then(function(res){
                noteitems.push(res);
                $scope.model.noteitems = noteitems;
                if (!$scope.$$phase) {
                   // console.log(shortDesc_list);
                    $scope.$apply();
                }
            })
        }
          
    });
    
    
    DBAdapter.isStatusEmpty(Util.schedule_pk).then(function(result){
        if (!result) {
            DBAdapter.getDataSched(Util.schedule_pk).then(function(res){
                var row = res[0];
                console.log(res);
                $scope.model.status = row['Status_PK'];
                if ($scope.model.status =="1027") {
                    icReason.style.display = "block";
                }
                var substatus_PK = row['SubStatus_PK'].split(",");
                for (var i=0; i<reasons.length; i++)
                {
                    for(var j=0; j<substatus_PK.length; j++)
                    {
                        if (reasons[i].value == substatus_PK[j]) {
                            reasons[i].checked = true;
                        }
                    }
                }
                $scope.model.quickText1 = row['TechNotes'];
                $scope.model.quickText2 = row['MobileAdminNotes'];
                $scope.model.isWarranty = (row['IsWarranty']==='true');
                $scope.model.reasons = reasons;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            })    
        
        }
    });
          
    
    //Event Handler method//
    $scope.onSave = function() //click save button
    {
        if ($scope.model.status=="1027" && !$scope.model.reasons[0].checked && !$scope.model.reasons[1].checked && !$scope.model.reasons[2].checked && !$scope.model.reasons[3].checked && !$scope.model.reasons[4].checked ) {
            window.plugins.toast.showShortBottom("Please Select the reason!");
            return;
        }    
        
        var subStatus_PK_array=[];
        var subStatus_PK;
        var isWarranty = $scope.model.isWarranty.toString();
        for (var i=0; i<$scope.model.reasons.length;i++)
        {
            if ($scope.model.reasons[i].checked) {
                subStatus_PK_array.push($scope.model.reasons[i].value);
            }
        }
        if ($scope.model.status == "1026") {
            subStatus_PK = "";
        }else{
            subStatus_PK = subStatus_PK_array.join(',');    
        }
        
        var updatedata = [
                          {
                            name:'TechNotes',
                            data: $scope.model.quickText1
                          },
                          {
                            name:'MobileAdminNotes',
                            data: $scope.model.quickText2
                          },
                          {
                            name:'Status_PK',
                            data: $scope.model.status
                          },
                          {
                            name:'SubStatus_PK',
                            data: subStatus_PK
                          },
                          {
                            name: 'IsWarranty',
                            data: isWarranty
                          }
                          ];
        DBAdapter.updateDataSchedules(updatedata, Util.schedule_pk);
        window.plugins.toast.showShortBottom("Data saved");
        $state.go("tab.edititem.commandlist");
    }
    
    $scope.onShowQuickNote = function() //click show quick tip button     
    {
        $scope.model.quickType = 1;
        $scope.noteModal.show();  
    }
    $scope.onShowMobileNote = function()
    {
        $scope.model.quickType = 2;
        $scope.noteModal.show();  
    }
          
    $scope.addNoteText = function(typeidx,idx)
    {
        $scope.noteModal.hide();
        DBAdapter.isNarrativeType(noteitems[typeidx].type).then(function(result){
            if (result){
                DBAdapter.getLongNarratives(noteitems[typeidx].data[idx], noteitems[typeidx].type).then(function(res){
                    if ($scope.model.quickType ==1 ) {
                        $scope.model.quickText1 = $scope.model.quickText1 + "  " + res;
                    }else{
                        $scope.model.quickText2 = $scope.model.quickText2 + "  " + res;
                    }
                    
                    
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            }   
        });
    }
    $scope.onChangeStatus = function()//change status option
    {
        icReason.style.display = "none";
        console.log($scope.model.status);
        if ($scope.model.status=="1027") {
            icReason.style.display = "block";
        }
    }
})
.controller('EDEditServicePromptCtrl', function($scope, $state, $q, DBAdapter, Util){
    $scope.model={
        list:[]
    }
    var list=[];
    var attribNames =[];
    
    DBAdapter.getPromptAttribsNames(Util.mobServPrompt_PK).then(function(result){
        for(var key in result)
        {
            var row={};
            var mobServPromptQ_PK = key;
            var name = result[key];
            var promise1 = DBAdapter.getPromptAttribValue(mobServPromptQ_PK, Util.schedule_pk, true);
            var promise2 = DBAdapter.getPromptAttribValue(mobServPromptQ_PK, Util.schedule_pk, false);
            $q.all([promise1, promise2]).then(function(res){
                if(result[res[0].key] == "ph")
                {
                    res[1].def = res[1].def == 0 ? "-0.0":res[1].def;
                }
                row={
                    value:{
                        list : res[0].list,
                        def: res[0].def!=undefined?res[0].def:res[0].list[0]
                    },
                    adjust:{
                        list: res[1].list,
                        def: res[1].def!=undefined?res[1].def:res[1].list[0]
                    },
                    label: result[res[0].key],
                    key: res[0].key
                };
                list.push(row);
                $scope.model.list = list;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });                  
        }
            
    });
         
    $scope.onSave = function()
    {
        for(var i=0; i<$scope.model.list.length; i++)
        {
            var row = $scope.model.list[i];
            var mobServPromptQ_PK = row.key;
            var name = row.label;
            var querydata={};
            querydata.tbname = "data_service_prompts";
            var data={};
            data["Schedule_PK"]= Util.schedule_pk;
            data["MobServPrompt_PK"] = Util.mobServPrompt_PK;
            data["mobServPromptQ_PK"] =  mobServPromptQ_PK;
            data["Name"] =  name;
            data["Value"] = row.value.def;
            data["AdjustValue"] = row.adjust.def;
            querydata.data = data;
            querydata.cond =[{
                                name: 'Schedule_PK',
                                data: Util.schedule_pk
                            },
                            {
                                name:'MobServPromptQ_PK',
                                data:mobServPromptQ_PK
                            }];
            console.log(querydata);
            DBAdapter.insertData(querydata);        
        }
        $state.go("tab.edititem.commandlist");
    }
})

.controller('EDEditSiteProfileCtrl', function($scope, $state, $q, DBAdapter, Util){
    //Initialize
    var list = [];
    var attribNames =[];
    $scope.model = {
            list: []
        };
    DBAdapter.getProfileAttribsNames(Util.siteProfileType_FK).then(function(result){
        attribName = result;
        for(var key in result)
        {
            var row={};
            var profileVisitAtt_PK = key;
            var name = result[key];
            var promise1 = DBAdapter.getAttribValue(profileVisitAtt_PK, Util.schedule_pk, Util.siteProfile_PK, true);
            var promise2 = DBAdapter.getAttribValue(profileVisitAtt_PK, Util.schedule_pk, Util.siteProfile_PK, false);
            $q.all([promise1, promise2]).then(function(res){
                if(result[res[0].key] == "ph")
                {
                    res[1].def = res[1].def == 0 ? "-0.0":res[1].def;
                }
                row={
                    value:{
                        list : res[0].list,
                        def: res[0].def
                    },
                    adjust:{
                        list: res[1].list,
                        def: res[1].def
                    },           
                    label: result[res[0].key],
                    key : res[0].key
                };
                list.push(row);
                $scope.model.list = list;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });                       
        }

        
    });
    
    $scope.onSave = function()
    {
        for(var i=0; i<$scope.model.list.length; i++)
        {
            var row = $scope.model.list[i];
            var profileVisitAtt_PK = row.key;
            var name = row.label;
            var querydata={};
            querydata.tbname = "data_site_profile_visits";
            var data={};
            data["Schedule_PK"]= Util.schedule_pk;
            data["SiteProfile_PK"] = Util.siteProfile_PK;
            data["SiteProfileVisitAtt_PK"] =  profileVisitAtt_PK;
            data["Name"] =  name;
            data["Value"] = row.value.def;
            data["AdjustValue"] = row.adjust.def;
            querydata.data = data;
            querydata.cond =[{
                                name: 'Schedule_PK',
                                data: Util.schedule_pk
                            },
                            {
                                name:'SiteProfileVisitAtt_PK',
                                data:profileVisitAtt_PK
                            },
                            {
                                name:'SiteProfile_PK',
                                data:Util.siteProfile_PK
                            }];
            console.log(querydata);
            DBAdapter.insertData(querydata);        
        }
        $state.go("tab.edititem.commandlist");
    }
             
})


.controller('EDTakePictureCtrl', function($scope, $state, $cordovaCamera, PictureService, $ionicLoading, $ionicPopup, Util, DBAdapter){
    //var imgObj = document.getElementById("schimg");
    var pictureSource;
    var destinationType;
    var lastId = 1;
    $scope.view = {};
    //$scope.carouselPos = 0;
    //$scope.imagelist = ["asdf","asdf1","2324","sdfr","wer","yer"];
    //console.log($scope.imagelist.length);
    //$scope.carouselIndex = 0;
    $scope.listCaptionWidth = window.innerWidth - 200 + "px";
    $scope.scrollCaptionWidth = (window.innerWidth-10) * 0.9 + "px";
    $scope.scrollHeight = window.innerHeight - 64 - 49 - 200 + "px";
    $scope.contentHeight = window.innerHeight - 64 - 49 + "px";
    //DBAdapter.getImages(Util.schedule_pk).then(function(res){
        
    DBAdapter.getImages().then(function(res){
        $scope.imagelist = res;
        $scope.goPos = res.length-1;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });
    
    /*
    $scope.takePicture = function()
    {
        $cordovaCamera.getPicture(option).then(function(imageData){
            imgObj.src = imageData;
            PictureService.uploadPicture(imageData);            
        }, function(err){
            console.log(err);    
    });
    }*/
    $scope.onChooseImage = function() {
        /*
        for(i=0;i<5;i++)
        {
            PictureService.addQueue("img/ionic.png","img/ionic.png");
        }
        */
        ionic.Platform.ready(function() {
                             //console.log("ready get camera types");
            if (!navigator.camera)
            {
                $ionicPopup.alert({
                               title: 'Camera Error',
                               template: '<p style="text-align:center;">Please check your camera...</p>'
                               });
                detectError = true;
                return;
            }

            pictureSource=navigator.camera.PictureSourceType.PHOTOLIBRARY;
            onSubmitImage();
            });
    };  
    
    $scope.onTakePhoto = function() {
    ionic.Platform.ready(function() {
        //console.log("ready get camera types");
        if (!navigator.camera)
        {
            $ionicPopup.alert({
                           title: 'Camera Error',
                           template: '<p style="text-align:center;">Please check your camera...</p>'
                           });
            detectError = true;
            return;
        }

        pictureSource=navigator.camera.PictureSourceType.CAMERA;
        onSubmitImage();
        });
    };
    
    var onSubmitImage = function() {
        var detectError = false;
        
        console.log(pictureSource);
        if (detectError) return;
        
        var option = {
            quality: 75,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            sourceType: pictureSource,
        };
        navigator.camera.getPicture(
            function (imageURI) {
            //console.log("got camera success ", imageURI);
            //imgObj.src = imageURI;
            //$ionicLoading.show({template:"Photo Uploading..."});
            fileurl = imageURI;
            gImageURI = imageURI;
            if(device.platform=="Android")
                FileIO.updateCameraImages(imageURI, function(){
                    PictureService.addQueue(gImageURI,fileurl,function(){
                        DBAdapter.getImageIndex().then(function(res){
                            if(res[0])
                                lastId = res[0].image_id;

                            var tmpobj = {};
                            tmpobj.image_id = lastId;
                            tmpobj.imageURI = gImageURI;
                            tmpobj.fileURL = fileurl;
                            if($scope.imagelist)
                                $scope.imagelist.push(tmpobj);
                            else
                            {
                                $scope.imagelist = [];
                                $scope.imagelist.push(tmpobj);
                            }
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });
                        
                    }); 
                });

            window.plugins.toast.showShortBottom("Choosen Image will be uploaded later");
            },
            function (err) {
                $scope.imgTax = null;
                window.plugins.toast.showShortBottom("Not able to load image");
            },
            option);
    };
    
    $scope.onDelete = function(parent){
        var id = parseInt(document.getElementById("carouselindex").innerHTML);
        
        if(id == $scope.imagelist.length-1)
        {
            parent.carouselPos=id-1;
        }
        console.log(id);
        console.log($scope.imagelist);
        
        
        FileIO.removeDeletedImage($scope.imagelist[id].imageURI);
        DBAdapter.deleteImage($scope.imagelist[id].image_id);

        $scope.imagelist.splice(id,1);
        
        //console.log($("#carousel"));
    }
})

.controller('EDSelectServicePCtrl', function($scope, $state, DBAdapter, Util){
    //Initialize
    var list = [];
    var keys = [];
    DBAdapter.getServicePromptNames().then(function(res){
        var size = Object.keys(res).length;
        console.log(size);
        if (size ==1) {
            var selected_prompt;
            var mobServPrompt_PK;
            for(var key in res)
            {
                mobServPrompt_PK = key;
                selected_prompt = res[key];
            }
            Util.name = selected_prompt;
            Util.mobServPrompt_PK = mobServPrompt_PK;
            $state.go("tab.edititem.editserviceprompt");
        }else{
            console.log(res);
            for (var key in res)
            {

                    list.push(res[key]);
                    keys.push(key);

            }
            console.log(list);
            $scope.items = list;
            if(!$scope.$$phase) {
                scope.$apply();
            }
        }
        
    });
    
    $scope.onSelectService = function(idx)
    {
        var selected_prompt = list[idx];
        var mobServPrompt_PK = keys[idx];
        Util.name = selected_prompt;
        Util.mobServPrompt_PK = mobServPrompt_PK;
        $state.go("tab.edititem.editserviceprompt");
    }

})

.controller('EDSelectSitePCtrl', function($scope, $state, DBAdapter, Util, $rootScope){
    ///initialize
    var list=[];
    $rootScope.SPC = 0;
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if(fromState.name == "tab.edititem.editsiteprofile" && toState.name == "tab.edititem.selsiteprofile" && $rootScope.SPC==1)
        {
            $state.go('tab.edititem.commandlist');
        }
    });
    DBAdapter.getSiteProfileNames(Util.schedule_pk).then(function(result){
        if(result.length==1)
        {
            var row = result[0];
            DBAdapter.getSiteProfileDetails(Util.schedule_pk, row).then(function(res){
                var tmp = res.split(",");
                var siteProfile_PK = tmp[0];
                var siteProfileType_FK = tmp[1];
                Util.name = row;
                Util.siteProfile_PK = siteProfile_PK;
                Util.siteProfileType_FK = siteProfileType_FK;
                $rootScope.SPC = 1;
                $state.go('tab.edititem.editsiteprofile');
            });
        }else{
            list = result;
            $scope.items = list;
            if(!$scope.$$phase) {
                scope.$apply();
            }
        }
    });
    
    $scope.onSelectSite = function(idx)
    {
        DBAdapter.getSiteProfileDetails(Util.schedule_pk, list[idx]).then(function(res){

            var tmp = res.split(",");
            var siteProfile_PK = tmp[0];
            var siteProfileType_FK = tmp[1];
            Util.name = list[idx];
            Util.siteProfile_PK = siteProfile_PK;
            Util.siteProfileType_FK = siteProfileType_FK;
            $state.go('tab.edititem.editsiteprofile');

        });
        
    }
})

.controller('EDSetArriveCtrl', function($scope, $state, DBAdapter, Util, EditButtonList, $rootScope){
    $scope.model={
        password:'',
        name: '',
        time: ''
    };
    var taskdetail = Util.listview_task;
    var tmp = taskdetail.split(/\n/g);
    $scope.model.name = tmp[0];

    $scope.onScan = function()
    {
        cordova.plugins.barcodeScanner.scan(function(result){
            $scope.model.password = result.text;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, function(error){
            console.log(error);    
        });   
    }
    $scope.onArrive = function()
    {
        if ($scope.model.password=="") {
            window.plugins.toast.showShortBottom("Please insert password");
            return;
        }
        DBAdapter.getPassword(Util.schedule_pk).then(function(res){
            var pass = $scope.model.password;
            if (pass.toUpperCase()==res.toUpperCase()) {
                var time = getUTCDateForPunch(new Date());
                var querydata={};
                querydata.tbname = "data_sched";
                querydata.data = {
                    "Schedule_PK": Util.schedule_pk,
                    "ArrivalTime": time
                  };
                DBAdapter.insertData(querydata).then(function(ires){
                    console.log(ires);
                  if(ires<0)
                  {
                    querydata.tbname="data_sched";
                    querydata.columns=[{
                                        name:'DepartureTime',
                                        data:''}];
                    querydata.cond=[{name:'schedule_PK',
                                     data: Util.schedule_pk
                      }];
                    DBAdapter.updateData(querydata);
                    window.plugins.toast.showShortBottom("Re-Arrived at"+time);
                  }else{
                    window.plugins.toast.showShortBottom("Arrived at"+time);
                  }
                  //Reset button list status
                  EditButtonList.buttons[0].disabled = true;
                  for (var i=1; i<EditButtonList.buttons.length; i++ )
                    EditButtonList.buttons[i].disabled = false;
                  //Reset top button status
                  $rootScope.$broadcast('statuschange');
                  $state.go("tab.itemdetail.detailview");
                }); 

            }else{
                window.plugins.toast.showShortBottom("Password Incorrect!");    
            }   
        });
    }
})

.controller('EDImageQueueCtrl', function($scope, $state, DBAdapter, Util, EditButtonList, $rootScope){
    $scope.view = {};
    $scope.view.scroll = false;
    $scope.view.list = true;
    //$scope.imagelist = ["asdf","asdf1","2324","sdfr","wer","yer"];
    //console.log($scope.imagelist.length);
    //$scope.carouselIndex = 0;
    $scope.listCaptionWidth = window.innerWidth - 200 + "px";
    $scope.scrollCaptionWidth = window.innerWidth - 30 + "px";
    $scope.scrollSize = (window.innerWidth>window.innerHeight)?window.innerHeight+"px":window.innerWidth+"px";
    //DBAdapter.getImages(Util.schedule_pk).then(function(res){
        
    DBAdapter.getImages().then(function(res){
        console.log(res);
        $scope.imagelist = res;
        for(i=0;i<$scope.imagelist.length;i++)
        {
            $scope.imagelist[i].check = false;
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    })
    $scope.goScroll = function(){
        $scope.view.scroll = true;
        $scope.view.list = false;
    }
    $scope.goList = function(){
        $scope.view.scroll = false;
        $scope.view.list = true;   
    }
    $scope.onDelete = function(){
        if($scope.view.scroll)
        {
            var id = parseInt(document.getElementById("carouselindex").innerHTML);
            DBAdapter.deleteImage($scope.imagelist[id].image_id);
            $scope.imagelist.splice(id,1);
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        if($scope.view.list)
        {
            for(i=0;i<$scope.imagelist.length;i++)
            {
                if($scope.imagelist[i].check)
                {
                    DBAdapter.deleteImage($scope.imagelist[i].image_id);
                    $scope.imagelist.splice(i,1);
                }
            }
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    }
})
;