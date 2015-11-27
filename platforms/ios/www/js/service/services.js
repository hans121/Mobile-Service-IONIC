angular.module('starter.services', [])

.factory('ItemDetailMenuItem', function() {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var data = [{
        icon: 'ion-ios7-home',
        title: 'Job Location',
        url: '#/tab/itemdetail/joblocation/'
    }, {
        icon: 'ion-ios7-home',
        title: 'Task Details',
        url: '#/tab/itemdetail/taskdetail/'

    }, {
        icon: 'ion-ios7-chartboxes',
        title: 'Last 5 service Call',
        url: '#/tab/itemdetail/lastfivecall/'
    }, {
        icon: 'ion-ios7-videocam',
        title: 'Equipment History',
        url: '#/tab/itemdetail/equipment/'
    }, {
        icon: 'ion-ios7-videocam',
        title: 'Interviews',
        url: '#/tab/itemdetail/interview/'
    }, {
        icon: 'ion-ios7-photos',
        title: 'Site Profile',
        url: '#/tab/itemdetail/siteprofile/'
    }, {
        icon: 'ion-ios7-location',
        title: 'Existing Order Item',
        url: '#/tab/itemdetail/existorderitem/'
    }];

    return {
        all: function() {
            return data;
        },
        remove: function(item) {
            data.splice(data.indexOf(item), 1);
        },
        get: function(itemId) {
            return data[i];
        }
    }
})

/////Data SyncService////////

.factory('DataSyncService', function(DBAdapter, CONFIG, $http, $q, Util, $ionicLoading, $timeout) {
    //public variable
    var json_response = [];
    var self = this;
    var MAX_TIME = 210000;
    var START_TIME;
    /////Get ticket//////////
    this.getTicket = function() {

        var deferred = $q.defer();
        // Re-use ticket if not undefined and current time less than expire date/time in msec
        if (Util.tiket != undefined && Util.ticketExpires > Date.now()) {
            deferred.resolve(Util.ticket);
        } else {

        var req = {
            method: 'post',
            url: CONFIG.webUrl + 'Login/GetTicket',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join('&');
            },
            data: {
                'LOGIN_ID': CONFIG.loginName,
                'PASSWORD': CONFIG.password
            }
        };

        $http(req).success(function(data, status, headers, config) {

            var ticket;
            // Extract the ticket from the text response (typical)
            /*
            #4/23/2015 10:33:38 PM
            WARNING=
            TICKET=a4ee6bdd-0c58-4fb6-92a3-4607a87d1de2
            RESULT=TRUE
            */
            ticket = data.substring(data.indexOf("TICKET=") + 7, data.indexOf("RESULT") - 1);

            // The ticket is good for 7 days from the date returned in the ticket reponse
            // Get the expire date of the ticket
            var dt = data.replace("#", "");
            dt = dt.split(" ");
            dt = dt[0].split("/");
            // Create ISO 8601 date format without the time portion
            var dt1 = Date.parse("YY-MM-DD".replace("YY", dt[2]).replace("MM", dt[0]).replace("DD", dt[1]));
            // Add 5 days in msec
            dt1 = dt1 + 432000000;
            // Stuff the ticket away so we can use it during this session for other API calls (Data Sync, Picture and Timecard)
            Util.ticket = ticket;
            // ticketExpires in msec
            Util.ticketExpires = dt1;
            deferred.resolve(ticket);

        }).error(function(data, status, headers, config) {
            deferred.reject(status);
        });
          
        }
        return deferred.promise;
    }

    //////addrow api call/////////////
    this.addRow = function(pdata, ticket) {
        console.log("called addRow");
        var req = {
            method: 'post',
            url: CONFIG.webUrl + 'Mobile/',
            params: {
                'ticket': ticket,
                EVO_API_VERSION: '2.0',
                EVO_ACTION: 'ADDROW'
            },
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join('&');
            },
            'data': pdata,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': "application/json"
            }

        }
        var deferred = $q.defer();
        console.log(pdata);
        $http(req).success(function(data, status, headers, config) {
            console.log(data);
            var row = data.response.result.rows[0];
            Util.ServiceRequest_PK = row[0] + "";

            START_TIME = Date.now();

            deferred.resolve(true);
        }).error(function(data, status, headers, config) {
            console.log('error:' + data);
            deferred.reject(status);
        });
        return deferred.promise;
    }

    /////export api call///////////
    this.exportTo = function(pdata, ticket) {
        console.log("called export to");
        var req = {
            method: 'post',
            url: CONFIG.webUrl + 'Mobile/',
            params: {
                'ticket': ticket,
                EVO_API_VERSION: '2.0',
                EVO_ACTION: 'EXPORT'
            },
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join('&');
            },
            'data': pdata,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': "application/json",
            }
        }

        var deferred = $q.defer();
        $http(req).success(function(data, status, headers, config) {
            console.log(data);
            deferred.resolve(parseResponse(data));

        }).error(function(data, status, headers, config) {

            console.log('error:' + data);
            deferred.reject(status);

        });

        return deferred.promise;
    }

    /////////update Status api call/////////
    this.updateStatus = function(pdata, ticket) {
        console.log("called update state");
        var req = {
            method: 'post',
            url: CONFIG.webUrl + 'Mobile/',
            params: {
                'ticket': ticket,
                EVO_API_VERSION: "2.0",
                EVO_ACTION: 'UPDATE'
            },
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join('&');
            },
            'data': pdata,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': "application/json"
            }
        }
        $http(req).success(function(data, status, headers, config) {
            console.log('update state-----success:' + JSON.stringify(data));
        }).error(function(data, status, headers, config) {
            console.log('update state-----error:' + data);
        });

    }

    this.checkResponse = function(ticket) {
        console.log("called checkResponse");
        var data = {
            EVO_CRITERIA: "Status=NotPending AND ServiceRequest_PK=" + Util.ServiceRequest_PK
        };
        self.exportTo(data, ticket).then(function(result) {
            console.log("got data from exportTo");
            if (result == "filled") {
                //Log.d("EV-CHECK-RESPONSE", "FOUND");
                // Mark the data sent in the Sync request as 'Sent'
                DBAdapter.updateDataAsSent();
                parseData();
                return true;
            } else if (result == "declined") {
                //Log.d("EV-CHECK-RESPONSE", "DECLINED");
                return false;
            } else if (result == "processing") {
                if ((Date.now() - START_TIME) >= MAX_TIME) {
                    //Log.d("EV-CHECK-RESPONSE", "TIMEOUT");
                    var params = {
                        Status: 'Cancelled',
                        ResponseError: 'Request Timeout.',
                        EVO_CRITERIA: '(ServiceRequest_PK' + Util.ServiceRequest_PK + ')'
                    };

                    self.updateStatus(params, ticket);
                    return false;

                } else {
                    setTimeout(self.checkResponse, 3000);
                }

            } else if (result == "processingAdded") {
                // Mark the data sent in the Sync request as 'Sent'
                DBAdapter.updateDataAsSent();
                if ((Date.now() - START_TIME) >= MAX_TIME) {
                    //Log.d("EV-CHECK-RESPONSE", "TIMEOUT");
                    var params = {
                        Status: 'Cancelled',
                        ResponseError: 'Request Timeout.',
                        EVO_CRITERIA: '(ServiceRequest_PK' + Util.ServiceRequest_PK + ')'
                    };

                    self.updateStatus(params, ticket);
                    return false;

                } else {
                    setTimeout(self.checkResponse, 3000);
                }

            } else if (result == "empty") {
                //Log.d("EV-EMPTY", "Empty");
                var params = {
                    Status: 'Cancelled',
                    ResponseError: 'No response from corporate server.',
                    EVO_CRITERIA: '(ServiceRequest_PK' + Util.ServiceRequest_PK + ')'
                };

                self.updateStatus(params, ticket);
                return false;
            }

        });
    }
    //////    
    function parseResponse(json) {

        var base_row = [];
        base_row = json.response.result.rows;
        var len = base_row.length;
        if (len > 0) {
            var row = base_row[0];
            var status = row[5];
            if (status == "Declined") {

                var error_text = row[10];
                return "declined";

            } else if (status == "Filled") {

                json_response = json;
                return "filled";
            } else if (status == "Processing-Added") {

                json_response = json;
                return "processingAdded";
            }

            return "processing";
        } else {
            return "empty";
        }

    }

    //////////////////////
    function parseData() {
        try {
            var base_row = [];
            base_row = json_response.response.result.rows[0];
            var querydata = {};
            var responseSchedules = unzipText(base_row[6]);
            if (responseSchedules.indexOf("response") > -1) {

                var row_resp = JSON.parse(responseSchedules);

                var schedule = row_resp.response.schedules;

                var sched_column = schedule.column_order;

                var sched_row = schedule.rows;
                var sched_value = [];
                if (sched_column != null) {

                    DBAdapter.emptyDataTables();
                    DBAdapter.deleteTableData('schedules');
                    DBAdapter.deleteTableData('sched_site_profiles');

                    for (var j = 0; j < sched_row.length; ++j) {
                        var inputdata = [];
                        var single_row = sched_row[j];
                        inputdata.push(Util.ServiceRequest_PK);
                        for (var k = 0; k < sched_column.length; ++k) {

                            inputdata.push(single_row[k]);
                        }
                        sched_value.push(inputdata);
                    }
                    sched_column.splice(0, 0, 'ServiceRequest_PK');
                    querydata.tbname = "schedules";
                    querydata.columns = sched_column;
                    querydata.data = sched_value;
                    DBAdapter.insertDataBatch(querydata);
                }
                var siteprofiles = row_resp.response.siteprofiles;
                var prof_column = siteprofiles.column_order;
                var prof_row = siteprofiles.rows;
                querydata = {};
                var prof_values = [];

                for (var j = 0; j < prof_row.length; ++j) {
                    var inputdata = [];
                    var single_row = prof_row[j];
                    for (var k = 0; k < prof_column.length; ++k) {
                        //Log.d("EV-PROF", "Column: "+prof_column.getString(k)+", Row: "+prof_row.getJSONArray(j).getString(k) );
                        inputdata.push(single_row[k]);
                    }
                    prof_values.push(inputdata);
                }
                querydata.tbname = 'sched_site_profiles';
                querydata.data = prof_values;
                querydata.columns = prof_column;
                DBAdapter.insertDataBatch(querydata);
            }

            //ResponseSiteProfile
            //String responseSiteProfile = unzipText(URLDecoder.decode(base_row.getString(7)));
            var responseSiteProfile = unzipText(base_row[7]);
            if (responseSiteProfile != '') {
                DBAdapter.deleteProfileData();

                var row_resp = JSON.parse(responseSiteProfile);

                var profile = row_resp.response.profileattribs.response;
                var profile_column = profile["column_order"];
                var profile_row = profile.rows;
                querydata = {};
                var profile_values = [];
                for (var j = 0; j < profile_row.length; ++j) {
                    var inputdata = [];
                    var single_row = profile_row[j];
                    for (var k = 0; k < profile_column.length; ++k) {
                        //Log.d("EV-profile_values", "Column: "+profile_column.getString(k)+", Row: "+profile_row.getJSONArray(j).getString(k));
                        inputdata.push(single_row[k]);
                    }
                    profile_values.push(inputdata);
                    //Log.d("EV-profile_values", profile_values.toString());
                }

                querydata.tbname = 'profile_attribs';
                querydata.columns = profile_column;
                querydata.data = profile_values;
                DBAdapter.insertDataBatch(querydata);
                //attrib defaults
                var attrib = row_resp.response.attribdefaults.response;
                var attrib_column = attrib.column_order;
                var attrib_row = attrib.rows;
                querydata = {};
                var attrib_values = [];
                for (var j = 0; j < attrib_row.length; ++j) {
                    var inputdata = [];
                    var single_row = attrib_row[j];
                    for (var k = 0; k < attrib_column.length; ++k) {
                        //Log.d("EV-attrib_values", "Column: "+attrib_column.getString(k)+", Row: "+attrib_row.getJSONArray(j).getString(k));

                        inputdata.push(single_row[k]);
                    }
                    attrib_values.push(inputdata);
                    //Log.d("EV-attrib_values", attrib_values.toString());
                }
                querydata.columns = attrib_column;
                querydata.tbname = 'attribs_defaults';
                querydata.data = attrib_values;
                DBAdapter.insertDataBatch(querydata);
            }

            var responseServicePrompts = unzipText(base_row[8]);

            if (responseServicePrompts != "") {

                DBAdapter.deletePromptData();

                var row_resp2 = JSON.parse(responseServicePrompts);

                var prompt_type = row_resp2.response.prompttypes.response;
                var prompt_column = prompt_type.column_order;
                var prompt_row = prompt_type.rows;
                querydata = {};
                var prompt_values = [];

                for (var j = 0; j < prompt_row.length; ++j) {
                    var inputdata = [];
                    var single_row = prompt_row[j];
                    for (var k = 0; k < prompt_column.length; ++k) {
                        //Log.d("EV-prompt_values", "Column: "+prompt_column.getString(k)+", Row: "+prompt_row.getJSONArray(j).getString(k) );
                        inputdata.push(single_row[k]);
                    }
                    prompt_values.push(inputdata);
                    //Log.d("EV-prompt_values", prompt_values.toString());
                }

                querydata.tbname = 'prompt_types';
                querydata.data = prompt_values;
                querydata.columns = prompt_column;
                DBAdapter.insertDataBatch(querydata);

                var prompt_attribs = row_resp2.response.promptattribs.response;
                var prompt_attribs_column = prompt_attribs.column_order;
                var prompt_attribs_row = prompt_attribs.rows;
                querydata = {};
                var prompt_attribs_values = [];

                for (var j = 0; j < prompt_attribs_row.length; ++j) {
                    var inputdata = [];
                    var single_row = prompt_attribs_row[j];
                    for (var k = 0; k < prompt_attribs_column.length; ++k) {
                        //Log.d("EV-prompt_attribs_values", "Column: "+prompt_attribs_column.getString(k)+", Rows: "+prompt_attribs_row.getJSONArray(j).getString(k));
                        inputdata.push(single_row[k]);
                    }
                    prompt_attribs_values.push(inputdata);
                    //Log.d("EV-prompt_attribs_values", prompt_attribs_values.toString());
                }
                querydata.tbname = 'prompt_attribs';
                querydata.data = prompt_attribs_values;
                querydata.columns = prompt_attribs_column;
                DBAdapter.insertDataBatch(querydata);

                var prompt_attribs_default = row_resp2.response.attribdefaults.response;
                var prompt_attribs_default_column = prompt_attribs_default.column_order;
                var prompt_attribs_default_row = prompt_attribs_default.rows;
                querydata = {};
                var prompt_attribs_default_values = [];

                for (var j = 0; j < prompt_attribs_default_row.length; ++j) {
                    var inputdata = [];
                    var single_row = prompt_attribs_default_row[j];
                    for (var k = 0; k < prompt_attribs_default_column.length; ++k) {
                        //Log.d("EV-prompt_attribs_default_values", "Column: "+prompt_attribs_default_column.getString(k)+", Row: "+prompt_attribs_default_row.getJSONArray(j).getString(k));
                        inputdata.push(single_row[k]);
                    }
                    prompt_attribs_default_values.push(inputdata);
                }
                querydata.tbname = 'prompt_attribs_default';
                querydata.data = prompt_attribs_default_values;
                querydata.columns = prompt_attribs_default_column;
                DBAdapter.insertDataBatch(querydata);
            }

            //Response Narratives
            //String responseNarratives = unzipText(URLDecoder.decode(base_row.getString(9)));
            var responseNarratives = unzipText(base_row[9]);

            if (responseNarratives != "") {

                DBAdapter.deleteTableData('narratives');

                var row_resp3 = JSON.parse(responseNarratives);

                var narratives = row_resp3.response.result; //.getJSONObject("response");           
                var narratives_column = narratives.column_order;
                var narratives_row = narratives.rows;
                querydata = {};
                var narratives_values = [];

                for (var j = 0; j < narratives_row.length; ++j) {
                    var inputdata = [];
                    var single_row = narratives_row[j];
                    for (var k = 0; k < narratives_column.length; ++k) {
                        //Log.d("EV-narratives_values", "Column: "+narratives_column.getString(k)+", Rows: "+narratives_row.getJSONArray(j).getString(k));
                        inputdata.push(single_row[k]);
                    }
                    narratives_values.push(inputdata);
                }
                querydata.tbname = 'narratives';
                querydata.data = narratives_values;
                querydata.columns = narratives_column;
                DBAdapter.insertDataBatch(querydata);
            }

            // LastModified - The latest date on which site profile prompts, service prompts, or narratives where modified (on the corporate db) 
            var lastModified = base_row[18];
            if (lastModified == "" || lastModified == "null") {
                lastModified = "2014-05-01T00:00:00Z";
            }
            DBAdapter.updateLastReceived(lastModified);

        } catch (e) {
            console.log("error:" + e);
        }
    }

    //decompress zlib text with zlib.js
    function unzipText(text) {
        if (text == 'null') return "";

        var data_byte = atob(text);

        data_byte = data_byte.split('').map(function(e) {

            return e.charCodeAt(0);

        });

        var inflate = new Zlib.Inflate(data_byte);

        var output = inflate.decompress();
        var u16 = new Uint16Array(output);
        console.log(u16.length);
        var strdata = "";
        for (var i = 0; i < u16.length; i++)
            strdata += String.fromCharCode(u16[i]);

        return strdata;
    }


    return this;
})

.factory("TimeCardService", function(DBAdapter, CONFIG, $http, $q, Util, $ionicLoading, $timeout) {
    this.punch = function(udata) {
        var req = {
            method: 'post',
            url: "http://cloud3.evosus.com/api/method/TimecardPunch",
            params: {
                CompanySN: udata["CompanySN"],
                ticket: Util.ticket
            },
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join('&');
            },
            'data': {
                "args": JSON.stringify(udata.args)
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': "application/json"
            }
        }
        var deferred = $q.defer();
        $http(req).success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
            deferred.reject(data);
        });
        return deferred.promise;
    }

    this.timecardPunches = function(udata) {
        var req = {
            method: 'post',
            url: "http://cloud3.evosus.com/api/method/TimecardPunches",
            params: {
                CompanySN: udata["CompanySN"],
                ticket: Util.ticket
            },
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join('&');
            },
            'data': {
                "args": JSON.stringify(udata.args)
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': "application/json"
            }
        }
        console.log(JSON.stringify(udata.args));
        var deferred = $q.defer();
        $http(req).success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
            deferred.reject(data);
        });
        return deferred.promise;
    }
    return this;
})

.factory("PictureService", function(DBAdapter, CONFIG, $http, $q, Util, $ionicLoading, $timeout, $ionicPopup) {
  
    var fails = [];
    var imageURLS = [];
    this.uploadPicture = function(callback) {
        fails = [];
        Util.uploadCount = 0;
        DBAdapter.getImages(Util.schedule_pk).then(function(res){
            console.log(res);
            console.log(res.length);
            imageURLS = res;
            if(res.length > 0)
            {
                //$ionicLoading.show({template:"Photo Uploading..."});
                window.plugins.toast.showLongBottom("Uploading Image");
                fileupload(callback);                
            }
            else
            {
                window.plugins.toast.showShortBottom("No Images to Upload");
                return callback();
            }
        });  
    }
    this.addQueue = function(uri,url,callback){
        var querydata={};
        querydata.tbname = "image_queue";
        querydata.data = {
            "Schedule_PK": Util.schedule_pk,
            "imageURI": uri,
            "fileURL": url
        };
        DBAdapter.insertData(querydata).then(function(ires){
            console.log(ires);
            if(callback)
                return callback();
        });
    }
    function fileupload(callback)
    {
        data = imageURLS[Util.uploadCount].fileURL;
        var ft = new FileTransfer();
        var options = new FileUploadOptions();
        console.log(data);
        options.fileKey = "picture";

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var j = 0; j < 15; j++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        options.params = {  
            CompanySN: Util.user.sn,
            Schedule_PK: Util.schedule_pk,
            Client: "mobile",
            ticket: Util.ticket
        }
        options.headers = {
            "Accept": "application/json"
        };
        options.fileName = text + ".jpg";
        console.log(data);
        console.log(options);
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;

        var url = "http://cloud3.evosus.com/api/files";
        ft.upload(data, url, function(e) {
            FileIO.removeDeletedImage(imageURLS[Util.uploadCount].imageURI);
            console.log("success");
            console.log(e);
            Util.uploadCount++;
            if(Util.uploadCount<imageURLS.length)
                fileupload(callback);
            else
            {
                DBAdapter.deleteTableData('image_queue');
                
                for(j=0; j<fails.length; j++)
                {
                    var querydata={};
                    querydata.tbname = "image_queue";
                    querydata.data = {
                        "Schedule_PK": Util.schedule_pk,
                        "imageURI": fails[j].imageURI,
                        "fileURL": fails[j].fileURL
                    };
                    DBAdapter.insertData(querydata).then(function(ires){
                        console.log(ires);
                    });
                }
                $ionicLoading.hide();
                if(fails.length == 0)
                {
                    $ionicPopup.alert({
                    title: 'Success',
                    template: '<p style="text-align:center;">All Photos are uploaded Successfully...</p>'});
                }
                else
                {
                    $ionicPopup.alert({
                    title: 'Failure',
                    template: '<p style="text-align:center;">Succeed on uploading '+(imageURLS.length - fails.length) +' images and Fialed on uploading '+ fails.length + ' images. Scheduled Later </p>'});   
                }
                return callback();
            }
        }, function(e) {
            fails.push(imageURLS[Util.uploadCount]);
            console.log("fail");
            console.log(e);
            Util.uploadCount++;
            if(Util.uploadCount<imageURLS.length)
                fileupload(callback);
            else
            {
                DBAdapter.deleteTableData('image_queue');
                
                for(j=0; j<fails.length; j++)
                {
                    var querydata={};
                    querydata.tbname = "image_queue";
                    querydata.data = {
                        "Schedule_PK": Util.schedule_pk,
                        "fileURL": fails[j].fileURL
                    };
                    DBAdapter.insertData(querydata).then(function(ires){
                        console.log(ires);
                    });
                }
                $ionicLoading.hide();
                $ionicPopup.alert({
                title: 'Failure',
                template: '<p style="text-align:center;">Succeed on uploading '+(imageURLS.length - fails.length) +' images and Fialed on uploading '+ fails.length + ' images. Scheduled Later </p>'});                
                return callback();
            }
        }, options, true);
    }
    return this;
});