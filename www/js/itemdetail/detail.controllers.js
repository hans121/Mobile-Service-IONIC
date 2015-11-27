angular.module('starter.detail.controller',[])

.controller('ITInitDetailViewCtrl', function($scope, DBAdapter, $q, Util, $state, $rootScope, $ionicLoading, DetailButtons, PictureService){
    console.log("detail menu controller");
    //get task detail promises
    var promise1 = DBAdapter.getTaskLabel(Util.schedule_pk);
    var promise2 = DBAdapter.getTaskData(Util.schedule_pk);
    // scope variable
    var task_btn;
    var task_desc;
    $scope.model = {
        name:'',
        task:'',
        legend:'',
        detail:''
    }
    $scope.buttons={
        arrive: true,
        edit: true,
        depart: true
    };
    setContent();
    for (var i = 0; i< DetailButtons.buttons.length; i++)
    {
        DetailButtons.buttons[i].selected = false;    
    }
    DetailButtons.buttons[0].selected = true;    
    $scope.buttons = DetailButtons.buttons;
    var detaildiv = document.getElementById("detaildiv");
    var taskdetail = Util.listview_task;
    var tmp = taskdetail.split(/\n/g);
    $scope.model.name = tmp[0];
    tmp.splice(0,1);
    tmp.splice(tmp.length-1, 1);
    $scope.model.task = tmp.join(' ');

    $ionicLoading.show();
    $q.all([promise1, promise2]).then(function(res){
        $ionicLoading.hide();
        task_btn = res[0];    
        task_desc = res[1];
        $scope.model.legend = task_btn[0];
        //change HTML format
        var detailText = task_desc[0].toString();
        detailText = detailText.replace(/\n/g, "<br/>");
        detailText = detailText.replace(/''/g, "\"");
        detaildiv.innerHTML = detailText;
        $scope.model.detail = task_desc[0];
    }, function(err){
        $ionicLoading.hide();   
    });
    $scope.showDetail = function(idx){
        $scope.model.legend = task_btn[idx];
        
        //button state change to selected
        for (var i = 0; i< DetailButtons.buttons.length; i++)
        {
            DetailButtons.buttons[i].selected = false;    
        }
        DetailButtons.buttons[idx].selected = true;
        $scope.buttons = DetailButtons.buttons;
        
        //quit from double quotes
        var detailText = task_desc[idx].toString();
        detailText = detailText.replace(/\n/g, "<br/>");
        detailText = detailText.replace(/''/g, "\"");
        
        //set detail text to div
        detaildiv.innerHTML = detailText; 
        $scope.model.detail = task_desc[idx];
        
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    
    $scope.goHome = function()
    {
        $state.go("tab.home");
    }
    
    function setContent(){
      DBAdapter.isTaskClockedIn(Util.schedule_pk).then(function(res){
        if(!res)
        {
          $scope.buttons.arrive = false;
          $scope.buttons.edit = true;
          $scope.buttons.depart = true;
        }else{
          $scope.buttons.arrive = true;
          $scope.buttons.edit = false;
          $scope.buttons.depart = false;
        }
        DBAdapter.getCustomerFK(Util.schedule_pk).then(function(res1){
          if(parseInt(Util.schedule_pk)<=0 || res1<=0)
          {
            $scope.buttons.arrive = true;
            $scope.buttons.edit = true;
            $scope.buttons.depart = true;   
          }

          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });     
      });
      console.log("top button controller");
    }
  
  
    $scope.onArrive=function(){
      DBAdapter.isAnyTaskIncomplete().then(function(result){
        if(result)
        {
          window.plugins.toast.showShortBottom("Please end the Task before start another!");
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
                                      data:''}];
                  querydata.cond=[{name:'schedule_PK',
                                   data: Util.schedule_pk
                    }];
                  DBAdapter.updateData(querydata);
                  window.plugins.toast.showShortBottom("Re-Arrived at"+time);
                }else{
                  window.plugins.toast.showShortBottom("Arrived at"+time);
                }
                $scope.buttons.arrive = true;
                $scope.buttons.edit = false;
                $scope.buttons.depart = false;
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
    };
    
    $scope.onEdit=function(){
      $state.go('tab.edititem.commandlist');
    };
  
    $scope.onDepart=function(){
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

      Util.uploadCount = 0;
      //$ionicLoading.show({template:"Photo Uploading..."});

      PictureService.uploadPicture(function(){
        $rootScope.$broadcast('statuschange');
        $state.go("tab.itemdetail");
      });
      
    }

    $scope.$on('statuschange', function(){
      setContent();
    });
    $scope.$on('$ionicView.enter', function(){
      setContent();  
    });

})
;
