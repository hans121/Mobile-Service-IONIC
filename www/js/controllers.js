angular.module('starter.controllers', [])

.controller('LoadingCtrl', function($scope, $state, $ionicLoading, DB) {
    $scope.$on('$ionicView.enter', function() {
        console.log("enter loading.... ");
        checkSql();
    });
    var timeout;
    $ionicLoading.show();

    function checkSql() {
        if (DB.db != null) {
            $ionicLoading.hide();
            console.log("goto home");
            $state.go('tab.home');
        } else {
            timeout = setTimeout(checkSql, 500);
        }
    }
    $scope.$on('$ionicView.leave', function() {
        clearTimeout(timeout);
    });
})

.controller('TimeCardCtrl', function($scope, $state, DataSyncService, TimeCardService, Util, $ionicLoading) {
    //initialize $scope variable
    var buttons = {
        start: true,
        stop: true
    };
    var dayofWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    $scope.buttons = {};
    $scope.model = {
        times: [],
        status: '',
        dateday: '',
        datenum: '',
        icon: '',
        totalhour: ''
    };
    /////
    //when click home button.
    $scope.goHome = function() {
        $state.go('tab.home');
    }

    var today = new Date();
    $scope.model.dateday = dayofWeek[today.getDay()];
    $scope.model.datenum = simpleFormatDate(today);
    //Getting time card punches for initial button setting.
    $scope.$on('$ionicView.enter', function() {

      // Make sure we have a ticket
      DataSyncService.getTicket().then(function(ticket) {

        $ionicLoading.show({
            template: '<i class="icon ion-loading-b"></i><br/>Getting Status...'
        });
        today = new Date();
        today = formatDateDash(today);
        var requestdata = {
            "CompanySN": Util.user.sn,
            args: {
                Username: Util.user.userid,
                Password: Util.user.password,
                InPunchDate: today,
                Client: 'mobile'
            }
        };
        console.log(requestdata);
        TimeCardService.timecardPunches(requestdata).then(function(res) {
            console.log(res);
            getTimePunches(res.response.rows);
        }, function(err) {
            console.log();
            console.log("Timecard get status receive err message:" + JSON.stringify(err));
            $ionicLoading.hide();
        });
      
      });
    });


    $scope.onStart = function() {

      // Make sure we have a ticket
      DataSyncService.getTicket().then(function(ticket) {

        var now = new Date();

        buttons.start = true;
        buttons.stop = false;
        $scope.model.status = "Working..."
        $scope.model.icon = 'fa-clock-o';
        $scope.buttons = buttons;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        requestdata = {
            "CompanySN": Util.user.sn,
            args: {
                Status: "PunchIn",
                Username: Util.user.userid,
                Password: Util.user.password,
                InPunchDate: getDateForPunch(now),
                Client: 'mobile'
            }
        }
        console.log(getDateForPunch(now));
        $ionicLoading.show({
            template: '<i class="icon ion-loading-b"></i><br/>Getting Status...'
        });
        TimeCardService.punch(requestdata).then(function(res) {
            console.log("punch in success!!!!!");
            console.log(res);
            if (res !== undefined && res.message !== "Punch success") {
                $ionicLoading.hide();
                res.message = res.message.replace("\\r\\n","\n");
                res.message = res.message.replace("\\r\\n","\n");
                window.plugins.toast.showShortBottom(res.message);
            }
            getTimePunches(res.response.rows);
        }, function(err) {
            console.log(err);
            console.log("Timecard get status receive err message:" + JSON.stringify(err));
            $ionicLoading.hide();
        });

      });

    }

    //
    $scope.onStop = function() {

      // Make sure we have a ticket
      DataSyncService.getTicket().then(function(ticket) {

        var now = new Date();

        buttons.start = false;
        buttons.stop = true
        $scope.model.status = "Not Working";
        $scope.model.icon = 'fa-pause';
        $scope.buttons = buttons;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        requestdata = {
            "CompanySN": Util.user.sn,
            args: {
                Status: 'PunchOut',
                Username: Util.user.userid,
                Password: Util.user.password,
                InPunchDate: getDateForPunch(now),
                Client: 'mobile'
            }
        }
        $ionicLoading.show({
            template: '<i class="icon ion-loading-b"></i><br/>Getting Status...'
        });
        TimeCardService.punch(requestdata).then(function(res) {
            console.log("punch out success!!!!!");
            console.log(res);
            if (res !== undefined && res.message !== "Punch success") {
                $ionicLoading.hide();
                res.message = res.message.replace("\\r\\n","\n");
                res.message = res.message.replace("\\r\\n","\n");
                window.plugins.toast.showShortBottom(res.message);
            }
            getTimePunches(res.response.rows);
        }, function(err) {
            console.log();
            console.log("Timecard get status receive err message:" + JSON.stringify(err));
            $ionicLoading.hide();
        });

      });

    }

    function getTimePunches(response) {

/*
        today = formatDateDash(today);
        var requestdata ={
            "CompanySN": Util.user.sn,
            args:{
                Username: Util.user.userid,
                Password: Util.user.password,
                InPunchDate: today
            }
        };
*/
        if (response != undefined)
            res = response;
        else
            res = {};

        $ionicLoading.hide();
        today = new Date();
        if (res.length == 0) {
            buttons.start = false;
            buttons.stop = true
            $scope.model.status = "Not Started";
            $scope.model.icon = 'fa-ban';
        } else if (res.length % 2 == 0 && res.length > 0) {
            buttons.start = false;
            buttons.stop = true
            $scope.model.status = "Not Working";
            $scope.model.icon = 'fa-pause';

        } else {
            buttons.start = true;
            buttons.stop = false;
            $scope.model.status = "Working..."
            $scope.model.icon = 'fa-clock-o';
        }

        $scope.buttons = buttons;
        $scope.model.times = [];
        var startTime, endTime;
        var totalhour = 0;
        for (var i = 0; i < res.length - 1; i += 2) {
            var row1 = res[i];
            var row2 = res[i + 1];
            var timeP = {};
            startTime = new Date(row1[1]);
            endTime = new Date(row2[1]);
            totalhour += ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
            var tmp = (row1[1].toString()).split(" ");
            timeP.intime = tmp[1];
            tmp = (row2[1].toString()).split(" ");
            timeP.outtime = tmp[1];
            $scope.model.times.push(timeP);
        }
        if (i == res.length - 1) {
            var timePP = {};
            var tmp = (res[i][1].toString()).split(" ");
            timePP.intime = tmp[1];
            timePP.outtime = "???";
            $scope.model.times.push(timePP);
        }
        totalhour = Math.round(totalhour * 100) / 100;
        $scope.model.totalhour = totalhour;
        if (!$scope.$$phase) {
            $scope.$apply();
        }

    }

})

.controller('SyncCtrl', function($scope, DataSyncService, DBAdapter, $ionicLoading, $state, Util, $rootScope, $q) {
    var sessionTicket = "";
    $scope.onSync = function() {
        var promise1 = DBAdapter.getJSONText(1);
        var promise2 = DBAdapter.getJSONText(2);
        var promise3 = DBAdapter.getJSONText(3);
        var promise4 = DBAdapter.getJSONText(4);
        $ionicLoading.show({
            template: '<i class="icon ion-loading-b"></i><br/>Get Data...'
        });
        $q.all([promise1, promise2, promise3, promise4]).then(function(jsonres) {
            $ionicLoading.hide();
            console.log(jsonres);
            var data = {
                CompanySN: Util.user.sn,
                Status: 'Pending',
                UserID: Util.user.userid,
                Password: Util.user.password,
                PIN: Util.user.pin
            };


            $ionicLoading.show({
                template: '<i class="icon ion-loading-b"></i><br/>Get Ticket...'
            });
            DataSyncService.getTicket().then(function(ticket) {
                $ionicLoading.hide();
                var data = {
                    CompanySN: Util.user.sn,
                    Status: 'Pending',
                    UserID: Util.user.userid,
                    Password: Util.user.password,
                    PIN: Util.user.pin

                };
                if (jsonres[0].toString() != "empty") {
                    data["DataSchedules"] = jsonres[0].toString();
                }
                if (jsonres[1].toString() != "empty") {
                    data["DataOrderItems"] = jsonres[1].toString();
                }
                if (jsonres[2].toString() != "empty") {
                    data["DataSiteProfileVisits"] = jsonres[2].toString();
                }
                if (jsonres[3].toString() != "empty") {
                    data["DataServicePrompts"] = jsonres[3].toString();
                }
                sessionTicket = ticket;
                $ionicLoading.show({
                    template: '<i class="icon ion-loading-b"></i><br/>Add Row...'
                });
                DataSyncService.addRow(data, ticket).then(function(res) {
                    //Time Delay for Code Walkthru 
                    setTimeout(function() {
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: '<i class="icon ion-loading-b"></i><br/>Checking Response...'
                        })
                        DataSyncService.checkResponse(sessionTicket);
                        setTimeout(function() {
                            $ionicLoading.hide();
                            $rootScope.$broadcast("scheduledatachange");
                            $state.go("tab.home");
                        }, 3000);
                    }, 18000);

                }, function(err) {
                    window.plugins.toast.showShortBottom("Error occured when add rows");
                });

            }, function(err) {
                window.plugins.toast.showShortBottom("Error occured when getting Ticket");
            });
        }, function(err) {
            $ionicLoading.hide();
            window.plugins.toast.showShortBottom("Error occured when getting data");
        });


    }

    $scope.goHome = function() {
        $state.go('tab.home');
    }
})

.controller('HomeCtrl', function($scope, DBAdapter, $q, $state, Util, ContextMenu, $ionicHistory, $ionicLoading, $ionicModal, DB, EditButtonList, PictureService) {
        //Clear nav-stack
        var dates_short_format;
        var dates_default_format;
        var dateList;
        var status_list = {};
        $ionicHistory.clearHistory();

        $ionicModal.fromTemplateUrl('templates/contextmenu.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.conMenuModal = modal;
        });
        //Initialize
        setUserData();
        getScheduleData();
        //event handlers
        $scope.$on('userdatachange', function() {
            setUserData();
        });
        $scope.$on('scheduledatachange', function() {
            getScheduleData();
        });

        //$scope var initialize.
        $scope.model = {
            days: [],
            items: []
        }

        $scope.modal = {
            name: '',
            items: []
        };
        //set User data
        function setUserData() {

            $ionicLoading.show();
            DBAdapter.isConfigEmpty().then(function(result) {
                $ionicLoading.hide();
                if (!result) {
                    var querydata = {};
                    querydata.tbname = "config";
                    querydata.columns = ["CompanySN", "UserID", "Password", "PIN", "LastReceived"];
                    $ionicLoading.show();
                    DBAdapter.getDataList(querydata).then(function(result) {
                        $ionicLoading.hide();
                        if (result.length > 0) {
                            var row = result[0];
                            Util.user = {
                                sn: row["CompanySN"],
                                userid: row["UserID"],
                                password: row["Password"],
                                pin: row["PIN"],
                                lastreceived: row["LastReceived"]
                            }
                        }
                    });

                } else {
                    $state.go("tab.setup");
                }
            });
        } //end of setuserdata

        //when click the list item
        $scope.goDetail = function(schedule_pk, listview_task) {
            Util.schedule_pk = schedule_pk;
            Util.listview_task = listview_task;
            $state.go('tab.itemdetail.detailview');
        }

        //context menu
        $scope.onHold = function(schedule_pk, listview_task) {
            console.log($scope.model.items);
            var tmp = listview_task.split(/\n/g);
            $scope.modal.name = tmp[0];
            if (!$scope.$$phase) {
                $scope.$apply();
            }
            Util.schedule_pk = schedule_pk;
            if (status_list[schedule_pk] == "(in progress)") {
                ContextMenu.items[3].disabled = true;
                ContextMenu.items[4].disabled = false;
                ContextMenu.items[5].disabled = false;
                ContextMenu.items[6].disabled = false;
                ContextMenu.items[7].disabled = false;
                ContextMenu.items[8].disabled = false;
            } else {
                ContextMenu.items[3].disabled = false;
                ContextMenu.items[4].disabled = true;
                ContextMenu.items[5].disabled = true;
                ContextMenu.items[6].disabled = true;
                ContextMenu.items[7].disabled = true;
                ContextMenu.items[8].disabled = true;
            }
            $scope.modal.items = ContextMenu.items;
            Util.listview_task = listview_task;
            $scope.conMenuModal.show();
        }

        $scope.gotoPage = function(idx) {
            var listview_task = Util.listview_task
            var tmp = listview_task.split(/\n/g);
            var tel = tmp[3];
            var address = tmp[1] + "," + tmp[2];
            $scope.conMenuModal.hide();
            switch (idx) {
                case 0:
                    //open dialect
                    window.open("tel:" + tel, '_system');
                    break;
                case 1:
                    //open navigation

                    launchnavigator.navigateByPlaceName(
                        address,
                        function() {
                            console.log("success");
                        },
                        function(err) {
                            console.log(err);
                        }
                    );

                    break;
                case 2:
                    $state.go('tab.itemdetail.detailview');
                    break;
                case 3:
                    DBAdapter.isAnyTaskIncomplete().then(function(result) {
                        if (result) {
                            window.plugins.toast.showShortBottom("Please end the Task before start another!");
                        } else {
                            DBAdapter.isPasswordBlank(Util.schedule_pk).then(function(res) {
                                if (res) {
                                    var time = getUTCDateForPunch(new Date());
                                    var querydata = {};
                                    querydata.tbname = "data_sched";
                                    querydata.data = {
                                        "Schedule_PK": Util.schedule_pk,
                                        "ArrivalTime": time
                                    };
                                    DBAdapter.insertData(querydata).then(function(ires) {
                                        if (ires < 0) {
                                            querydata.tbname = "data_sched";
                                            querydata.columns = [{
                                                name: 'DepartureTime',
                                                data: ''
                                            }];
                                            querydata.cond = [{
                                                name: 'schedule_PK',
                                                data: Util.schedule_pk
                                            }];
                                            DBAdapter.updateData(querydata);
                                            window.plugins.toast.showShortBottom("Re-Arrived at" + time);
                                        } else {
                                            window.plugins.toast.showShortBottom("Arrived at" + time);
                                        }
                                        $scope.buttons.arrive = true;
                                        $scope.buttons.edit = false;
                                        $scope.buttons.depart = false;
                                        EditButtonList.buttons[0].disabled = true;
                                        for (var i = 1; i < EditButtonList.buttons.length; i++)
                                            EditButtonList.buttons[i].disabled = false;
                                        $rootScope.$broadcast('statuschange');
                                    });
                                } else {
                                    $state.go("tab.edititem.arrive");
                                }
                            });
                        }
                    });
                    break;
                case 4:
                    $state.go('tab.edititem.editmobilenote');
                    break;
                case 5:
                    $state.go('tab.edititem.notestatus');
                    break;
                case 6:
                    $state.go('tab.edititem.selsiteprofile');
                    break;
                case 7:
                    $state.go('tab.edititem.selserviceprompt');
                    break;
                case 8:
                    $state.go('tab.edititem.additem');
                    break;
                case 9:
                    var time = getUTCDateForPunch(new Date());
                    var querydata = {};
                    querydata.tbname = "data_sched";
                    querydata.columns = [{
                        name: 'DepartureTime',
                        data: time
                    }];
                    querydata.cond = [{
                        name: 'schedule_PK',
                        data: Util.schedule_pk
                    }];
                    DBAdapter.updateData(querydata);
                    window.plugins.toast.showShortBottom("Departed at " + time);
                    EditButtonList.buttons[0].disabled = false;
                    for (var i = 1; i < EditButtonList.buttons.length; i++)
                        EditButtonList.buttons[i].disabled = true;

                    Util.uploadCount = 0;
                    //$ionicLoading.show({template:"Photo Uploading..."});
                    $rootScope.$broadcast('statuschange');
                    $state.go("tab.itemdetail");
                    PictureService.uploadPicture(function(){
                        
                    });
                    
                    break;
            }
        }
        //when click the date
        $scope.getDateSchedule = function(idx) {
            var date = dates_default_format[idx];
            Util.selected_date = idx;
            populateList(date);
        }
        //initialize
        function getScheduleData() {

            var promise1 = DBAdapter.getSchedDates();
            var promise2 = DBAdapter.getSchedDefaultDates();
            var promise3 = DBAdapter.getDates();
            var nearestDateShort;
            ///after getting date data//////////

            $q.all([promise1, promise2, promise3]).then(function(res) {
                dates_short_format = res[0];
                dates_default_format = res[1];
                dateList = res[2];
                $scope.model.days = [];
                if (dateList.length > 0) {
                    var nearestdate = getNearestDate(dateList, Date.now());
                    console.log(nearestdate);
                    var tdate;
                    tdate = new Date(nearestdate);
                    nearestDateShort = simpleFormatDate(tdate);
                }
                var CURRENT_SELECTED = -1;
                for (var i = 0; i < dates_short_format.length; i++) {
                    var item = {};
                    shortDate = dates_short_format[i];
                    item.day = shortDate;
                    if (shortDate == "Today") {
                        CURRENT_SELECTED = i;
                        Util.selected_date = i;
                        date = dates_default_format[i];
                        item.selected = true;
                    } else {
                        item.selected = false;
                    }
                    $scope.model.days.push(item);
                }
                console.log($scope.model.days);
                if (CURRENT_SELECTED < 0) {
                    if (Util.selected_date !== null && Util.selected_date !== undefined) {
                        date = dates_default_format[Util.selected_date];
                        $scope.model.days[Util.selected_date].selected = true;
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    } else {
                        date = dates_default_format[0];
                        if ($scope.model.days[0])
                            $scope.model.days[0].selected = true;
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                }
                populateList(date);
            }, function(err) {
                console.log(err);
            });
        }
        //populate schedule list
        function populateList(date) {
            var querydata = {};
            querydata.tbname = "schedules";
            querydata.columns = ["ID_Schedule_PK", "ListView_TimeFrame", "ListView_Task"];
            querydata.cond = [{
                name: 'ListView_Date',
                data: date
            }];
            var sched_list = [];
            DBAdapter.getDataList(querydata, 'ListView_SortMe').then(function(result) {
                angular.forEach(result, function(row) {
                    var sched_item = {};
                    sched_item.schedule_PK = row['ID_Schedule_PK'];
                    DBAdapter.getSchedStatus(row["ID_Schedule_PK"]).then(function(res) {
                        status_list[row["ID_Schedule_PK"]] = res;
                        $scope.model.status_list = status_list;
                    });
                    sched_item.status = "--";
                    sched_item.timeframe = row['ListView_TimeFrame'] != '' ? row['ListView_TimeFrame'] : '--';
                    var tmp = row['ListView_Task'];
                    var tmparry = tmp.split(/\n/g);
                    sched_item.name = tmparry[0];
                    tmparry.splice(0, 1);
                    sched_item.task = tmparry;
                    sched_item.listview_task = tmp;
                    sched_list.push(sched_item);
                });
                $scope.model.items = sched_list;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        }
    })

.controller('MapCtrl', function($scope, DBAdapter, $state) {

    var markerlist = [];
    $scope.$on('$ionicView.enter', function() {
        initialize();
    });

    function initialize() {
        var myLatlng = new google.maps.LatLng(37.775, -122.41833);

        var mapOptions = {
            center: myLatlng,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.map = map;
        var querydata = {};
        querydata.tbname = "schedules";
        querydata.columns = ["ID_Schedule_PK", "ListView_Task", "Reference_Address", "Reference_City", "Reference_State", "Reference_PostCode", "ListView_Date", "ListView_TimeFrame"];
        //Get scheduled address
        DBAdapter.getDataList(querydata, 'ListView_SortMe').then(function(result) {
            angular.forEach(result, function(row) {

                var task = row['ListView_Task'];
                if (task.indexOf("\n") >= 0) {
                    task = task.split("\n")[0];
                }

                var address = row["Reference_Address"] + "\n" + row["Reference_City"] + "\n" + row["Reference_State"] + " " + row["Reference_PostCode"];
                var address2 = row["Reference_Address"] + ", " + row["Reference_City"] + ", " + row["Reference_State"] + " " + row["Reference_PostCode"];
                var task_date = row["ListView_Date"];
                var time = row["ListView_TimeFrame"];
                var p;
                var marker;
                //
                if (row["Reference_Address"] != "" && row["Reference_City"] != "" && row["Reference_State"] != "" && row["Reference_PostCode"] != "") {
                    var geocoder = new google.maps.Geocoder(); //get Geocoder.
                    geocoder.geocode({
                        'address': address2
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            p = results[0].geometry.location;
                            if (p != null) {
                                console.log("make marker");
                                marker = new google.maps.Marker({ //make marker
                                    map: $scope.map,
                                    position: p,
                                    title: address2
                                });
                                $scope.map.setCenter(p);
                                markerlist.push(marker);
                            }
                        } else {
                            console.log("Geocode was not successful for the following reason:" + status);
                        }

                    });
                }

            });
        });
    }

    $scope.goHome = function() {
        $state.go('tab.home');
    }

})

.controller('SetupCtrl', function($scope, DBAdapter, Util, $state, $rootScope) {
    //initialize//
    $scope.model = {
        sn: '20091102165026*177',
        userid: 'cbeltran',
        password: 'Mcps1234',
        pin: '1234',
        isWifi : true
    }

    DBAdapter.isConfigEmpty().then(function(result) {
        if (!result) {
            var querydata = {};
            querydata.tbname = "config";
            querydata.columns = ["CompanySN", "UserID", "Password", "PIN", "WifiOnly"];
            DBAdapter.getDataList(querydata).then(function(result) {
                if (result.length > 0) {
                    var row = result[0];
                    console.log(row);
                    $scope.model.sn = row["CompanySN"];
                    $scope.model.userid = row["UserID"];
                    $scope.model.password = row["Password"];
                    $scope.model.pin = row["PIN"];
                    $scope.model.isWifi = false;
                    if(row["WifiOnly"] == "true")
                        $scope.model.isWifi = true;     
                }
            });

        }
    });

    $scope.onSave = function() {
        if (isBlank($scope.model.sn)) {
            window.plugins.toast.showShortBottom("Company sn is empty!");
            return;
        }
        if (isBlank($scope.model.userid)) {
            window.plugins.toast.showShortBottom("UserID is empty!");
            return;
        }
        if (isBlank($scope.model.password)) {
            window.plugins.toast.showShortBottom("Password is empty!");
            return;
        }
        if (isBlank($scope.model.pin)) {
            window.plugins.toast.showShortBottom("Pin is empty!");
            return;
        }

        var data = {};
        data["_id"] = 1;
        data["CompanySN"] = $scope.model.sn;
        data["UserID"] = $scope.model.userid;
        data["Password"] = $scope.model.password;
        data["WifiOnly"] = $scope.model.isWifi;
        data["PIN"] = $scope.model.pin;
        data["ServiceUserID"] = "evosus";
        data["ServicePassword"] = "evosus7414";
        data["LastReceived"] = "2014-05-01T00:00:00Z";

        var querydata = {};
        querydata.tbname = "config";
        querydata.data = data;
        DBAdapter.insertData(querydata).then(function(res) {
            if (res < 0) {
                querydata.columns = [{
                    name: 'CompanySN',
                    data: $scope.model.sn
                }, {
                    name: 'UserID',
                    data: $scope.model.userid
                }, {
                    name: 'Password',
                    data: $scope.model.password
                }, {
                    name: 'PIN',
                    data: $scope.model.pin
                }, {
                    name: 'WifiOnly',
                    data: $scope.model.isWifi
                },{
                    name: 'ServiceUserID',
                    data: "evosus"
                }, {
                    name: 'ServicePassword',
                    data: "evosus7414"
                }, {
                    name: 'LastReceived',
                    data: "2014-05-01T00:00:00Z"
                }];
                querydata.cond = [{
                    name: '_id',
                    data: 1
                }];
                DBAdapter.updateData(querydata);
                window.plugins.toast.showShortBottom("Data Updated!");
            } else {
                window.plugins.toast.showShortBottom("Data Saved!");
            }
            Util.user = {
                sn: $scope.model.sn,
                userid: $scope.model.userid,
                password: $scope.model.password,
                pin: $scope.model.pin
            }
            $state.go('tab.home');
            $rootScope.$broadcast('userdatachange');
        });
    }

    $scope.goHome = function() {
        $state.go('tab.home');
    }
})

;