angular.module('starter.dbmanage',[]) 

////////////DB Wraper////////
.factory('DB', function($q, DB_CONFIG, $ionicPlatform) {
  var self = this;
  self.db = null;
  
  /////Open db and create table//////
  $ionicPlatform.ready(function() {
  self.init = function() {
  // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production

    if(window.cordova) 
      self.db = window.sqlitePlugin.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
    else
      self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
    
    angular.forEach(DB_CONFIG.tables, function(table) {
      var columns = [];
 
      angular.forEach(table.columns, function(column) {
        columns.push(column.name + ' ' + column.type);
      });
 
      var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
      //console.log(query);
      self.query(query);
      //console.log('Table ' + table.name + ' initialized');
    });
         return;
    
  };});
  
 ///////execute query///////
  self.query = function(query, bindings) {
    
    bindings = typeof bindings !== 'undefined' ? bindings : [];
    var deferred = $q.defer();
 
    self.db.transaction(function(transaction) {
      
      transaction.executeSql(query, bindings, function(transaction, result) {
        
        deferred.resolve(result);
      }, function(transaction, error) {
        
        console.log(error);
        console.log(query);
        deferred.reject(error);
        
      });
    });
 
    return deferred.promise;
  };
 
  self.fetchAll = function(result) {
    var output = [];
 
    for (var i = 0; i < result.rows.length; i++) {
      output.push(result.rows.item(i));
      }
      return output;
    };
 
  self.fetch = function(result) {
    return result.rows.item(0);
  };     
 
  return self;
})
// Resource service example
.factory('DBAdapter', function(DB) {
  var self = this;
  ///Insert data into table
  self.insertData = function(idata){
    
    var colname=[];
    var coldata=[];
    var condc=[];
    //cond = typeof cond !== 'undefined' ? cond : [];
    angular.forEach(idata.cond, function(c){
        if (isNaN(c.data)) {
          condc.push(c.name + "=\"" + c.data+"\"");
        }else{
          condc.push(c.name + "=" + c.data);
        }
    })
    var updatedata=[];
    angular.forEach(Object.keys(idata.data), function(column) {
        colname.push(column);
        var str = idata.data[column].toString();
        str = str.replace(/"/g, "''");
        coldata.push(str);
        updatedata.push(column + "=\"" + idata.data[column] + "\"");
      });
    //if(!Array.isArray(coldata))
       //coldata = coldata.replace(/(\r\n|\n|\r)/gm," ");
    var insertquery = 'insert into ' + idata.tbname + '(' + colname.join(',') + ") values (\"" + coldata.join("\" , \"") + "\");";
    var updatequery;
    
    console.log(insertquery);
    try{
      
      if(condc.join(' AND ')==''){
        return DB.query(insertquery).then(function(result){
          console.log( idata.tbname+ " insert a row");
          return 1;
        }, function(error){
          console.log(error);
          console.log(insertquery);
          return -1;
        });
      
      }else{
        updatequery = 'update '+ idata.tbname + " set " + updatedata.join(',') + ' where ' + condc.join(' AND ') + ';';
        return DB.query(updatequery).then(function(result){
          if (!result.rowsAffected) {
            DB.query(insertquery).then(function(res){
              console.log("insert a row");
              return 1;
            }, function(error){
              console.log(error);
              return -1;  
            });
          }            
        });
        
      }  
    }catch(e){
      console.log("error occured!!");
      return -1;
    }
   
  }
  self.insertDataBatch = function(idata)
  {
    var coldata=[];
    var updatedata=[];
    console.log(idata);
    for(var i= 0; i<idata.data.length; i++)
    {
      coldata=[];
      var item = idata.data[i];
      var rowstr ="";
      for (var j=0; j< item.length; j++)
      {
        var str = item[j].toString();
        str = str.replace(/"/g, "''");
        item[j] = str;        
      }
      rowstr = "\"" + item.join("\" , \"") + "\"";
      rowstr = rowstr.replace(/(\r\n|\n|\r)/gm," ");
      coldata.push(rowstr);
    
      //if(!Array.isArray(coldata))
        //coldata = coldata.replace(/(\r\n|\n|\r)/gm," ");
      var insertquery = 'insert into ' + idata.tbname + '(' + idata.columns.join(',') + ") values (" + coldata.join(") ,(") + ");";
      //console.log(insertquery);    
      try{
          DB.query(insertquery).then(function(result){
            console.log( idata.tbname+ " insert multiple rows");
            return 1;
          }, function(error){
            console.log(error);
            return -1;
          });
          
      }catch(e){
        console.log("error occured!!");
        return -1;
      }
    }
    return 1;
  }
  //Updata data in table
  self.updateData = function(data){
    
    var cond=[];
    var updatedata=[];
    angular.forEach(data.columns, function(column){
        updatedata.push(column.name + "='" + column.data +"'");
      });
    angular.forEach(data.cond, function(c){
        if (isNaN(c.data)) {
          cond.push(c.name + "=\"" + c.data+"\"");
        }else{
          cond.push(c.name + "=" + c.data);
        }
    });
    var query= "update "+ data.tbname + " set " + updatedata.join(',') + " where "+cond.join(' AND ')+";";
    try{
      
      DB.query(query);
      
    }catch(e){
      console.log('DB error' + e);
    }
  }
  
  self.updateDataAsSent = function(){
    try
    {
      DB.query("UPDATE data_sched SET Sent=1");
      DB.query("UPDATE data_order_items SET Sent=1");
      DB.query("UPDATE data_site_profile_visits SET Sent=1");
      DB.query("UPDATE data_service_prompts SET Sent=1");
                          
    }catch(e){
         console.log("error"+e);
    }
    
  }
  
  self.emptyDataTables = function(){
    try{
      
      DB.query("delete from data_sched");
      DB.query("delete from data_order_items");
      DB.query("delete from data_site_profile_visits");
      DB.query("delete from data_service_prompts");
          
    }catch(e){
      
    }                  
    
  }
  self.deleteTableData = function(tbname){
         
    var querystr = "delete from " + tbname;
         
    try{
      DB.query(querystr);
    }catch(e){}
  }
  self.deleteProfileData = function(){
    this.deleteTableData('profile_attribs');
    this.deleteTableData('attribs_defaults');
  }
  
  self.deletePromptData = function(){
    this.deleteTableData('prompt_types');
    this.deleteTableData('prompt_attribs');
    this.deleteTableData('prompt_attribs_default');
  }
  self.deleteImage = function(img_id){
    DB.query("delete from image_queue where image_id="+img_id);
  }       

  // Get data list from table
  self.getDataList = function(data, order, group){
    var datalist = [];
    var cond=[];
    var columns=[];
    angular.forEach(data.cond, function(c){
      if (isNaN(c.data)) {
        cond.push(c.name + "='" + c.data +"'");
      }else{
        cond.push(c.name + "=" + c.data);
      }
        
      });
    angular.forEach(data.columns, function(c){
        columns.push(c);    
      })
    var query;
  
    if (cond.join(' AND ')!="") {
      query = "select " + columns.join(',') + " from " + data.tbname + " where " + cond.join(' AND ');
    }else{
      query = "select " + columns.join(',') + " from " + data.tbname
    }
    
    if (order!='' && order!=undefined) {
      query +=" order by "+ order;
    }

    if (group!='' && group!=undefined) {
      query +=" group by "+ group;
    }
    
    return DB.query(query).then(function(result){
        return DB.fetchAll(result);
    });
                 
  }   
  
  self.updateLastReceived = function (lastreceived){
    
    var querystr = "Update config set LastReceived = '" + lastreceived +"'";
    DB.query(querystr);
  }
     
  self.getSchedDates = function(){
    var list =[];
    var querydata ={};
    
    querydata.tbname = "schedules";
    
    querydata.columns =['ListView_Date'];
    
    return self.getDataList(querydata, "", "ListView_Date").then(function(res){
      angular.forEach(res, function(row){
        var text = row['ListView_Date'];
        var d = new Date();
        var fmdate = formatDate(d);
        if (fmdate == text) {
          text = "Today";
        }else{
          d = new Date(text);
          text = simpleFormatDate(d);
        }
        list.push(text);
      });
      return list;
    }, function(err){
      console.log(err);  
    });
  }
  
  self.getSchedDefaultDates = function(){
    var list =[];
    var querydata ={};
    
    querydata.tbname = "schedules";               
    
    querydata.columns =['ListView_Date'];
    
    return self.getDataList(querydata, "", "ListView_Date").then(function(res){
    
      angular.forEach(res, function(row){
      
        text = row['ListView_Date'];
        list.push(text);
      });
      return list;
    }); 
  }
    
  self.getDates = function(){
    var datalist={};
    var list =[];
    var querydata ={};
    
    querydata.tbname = "schedules";
    
    querydata.columns =['ListView_Date'];
               
    var text, d, fmdate;
    
    return self.getDataList(querydata,"", "ListView_Date").then(function(res){
      
      angular.forEach(res, function(row){
        
        text = row['ListView_Date'];
        d = new Date(text);
        fmdate = formatDate(d);
        
        list.push(fmdate);
      });
      return list;      
    }); 
  
  }
   
  self.getSchedStatus = function(id){
                  
    var res='';
    var querydata={};
    querydata.tbname = 'data_sched';
    querydata.columns=["ArrivalTime", "DepartureTime"];
    querydata.cond = [{name: 'Schedule_PK', data: id}];
    
    return self.getDataList(querydata).then(function(datalist){
      if (datalist.length>0) {
        var row = datalist[0];
        var arrival = row["ArrivalTime"];
        var departure = row["DepartureTime"];
        
        if (!isBlank(arrival) && !isBlank(departure)) {
          
          res ="(complete)";
        }else if (!isBlank(arrival) && isBlank(departure)) {
          res = "(in progress)";
        }
      }else{
        res = "(not started)";
      }
          
      return res;  
    });
  }
  
  self.getTaskLabel = function(schedule_pk){
    
    var projection = [];
    var result = [];
         
    for(var i=0; i<7; ++i)
    {
      projection.push("TaskView_Menu_Label"+(i+1));
    }
    
    var querydata ={};
    querydata.tbname = "schedules";
    querydata.columns = projection;
    querydata.cond = [{
                        name:'ID_Schedule_PK',
                        data: schedule_pk
                      }];
    return self.getDataList(querydata).then(function(res){
      var row, desc;
      for (var i = 0 ; i<res.length; i++){
        row = res[i];
        for (var j = 0; j< Object.keys(row).length; j++){
          desc = row[projection[j]];
          if(!isBlank(desc))  
          {
            result.push(desc);
          }
        }
      }
      return result;
    });

  }
  
  self.getTaskData  = function(schedule_pk){
    
    var projection = [];
    var result = [];
    
    for (var i = 0; i<7; ++i)
    {
      projection.push("TaskView_Menu_Data"+(i+1));
    }
    
    var querydata = {};
    
    querydata.tbname = "schedules";
    querydata.columns = projection;
    querydata.cond = [{
                        name : 'ID_Schedule_PK',
                        data: schedule_pk
                      }];
    
    return self.getDataList(querydata).then(function(res){
      
      var row, desc;
      for (var i = 0 ; i<res.length; i++){
        row = res[i];
        for (var j = 0; j< Object.keys(row).length; j++){
          desc = row[projection[j]];
          if(!isBlank(desc))
          {
            result.push(desc);
          }
        }
      }
      return result;
    });
    
  }
  //Table Narratives Functions//
  self.getNarrativesType = function()
  {
    var querydata={};
    querydata.tbname = "narratives";
    querydata.columns = ["Type"];
    var result=[];
      
    return self.getDataList(querydata,"","Type").then(function(res){
      
      angular.forEach(res, function(row){
        result.push(row["Type"]);  
      });
      return result;
    });
  }
  
  self.getNarrativesShortDesc = function(type)
  {
    var querydata={};
    querydata.tbname = "narratives";
    querydata.columns = ["ShortDescription"];
    querydata.cond = [{
                       name:'Type',
                       data: type
                      }];
    var resultdata={
        data:[],
        key:''
      };
      
    return self.getDataList(querydata).then(function(res){
      
      angular.forEach(res, function(row){
        resultdata.data.push(row["ShortDescription"]);  
      });
      resultdata.type = type;
      return resultdata;
    }); 
  }

  self.isNarrativeType = function(type)
  {
    var querydata={};
    querydata.tbname = "narratives";
    querydata.columns =["NarrativeType_PK"];
    querydata.cond =[{
                      name:'Type',
                      data:type
                      }];
    var result=[];
      
    return self.getDataList(querydata).then(function(res){
      
      if (res.length>0) {
        return true;
      }else{
        return false;
      }
    });      
  }
  
  self.getLongNarratives = function(shortDesc, narrType)
  {
    var narrative = "";
    var querydata={};
    querydata.tbname = "narratives";
    querydata.columns =["Narrative"];
    querydata.cond =[{
                        name:'ShortDescription',
                        data: shortDesc
                      },
                      {
                        name:'Type',            
                        data: narrType
                      }];
    return self.getDataList(querydata).then(function(res){

      if (res.length>0) {
        var row = res[0];
        narrative = row['Narrative'];
      }
      return narrative;
    }); 
  }
  
  self.isStatusEmpty = function(schedule_PK)
  {
    var isempty = false;
    var querydata={};
    querydata.tbname = "data_sched";
    querydata.columns =["Status_PK"];
    querydata.cond =[{
                      name:'Schedule_PK',
                      data:schedule_PK
                      }];
      
    return self.getDataList(querydata).then(function(res){
      
      var row = res[0];
      if (isBlank(row["Status_PK"])) {
        return true;
      }else{
        return false;      
      }
    });  
  }
  self.getOrderItems = function(schedule_PK)
  {
    var querydata={};
    querydata.tbname = "data_order_items";
    querydata.columns =["Schedule_PK","ItemCodeUPC","Quantity"];
    querydata.cond =[{
                        name:'Schedule_PK',
                        data: schedule_PK
                      }];
    return self.getDataList(querydata).then(function(res){
      return res;
    }); 
  }
  self.getImages = function(schedule_PK){
    var querydata={};
    querydata.tbname = "image_queue";
    querydata.columns =["image_id","Schedule_PK","imageURI","fileURL"];
    //querydata.columns =["image_id","Schedule_PK","fileURL"];
    //querydata.columns =["fileURL"];
    if(schedule_PK)
    {
      querydata.cond =[{
                          name:'Schedule_PK',
                          data: schedule_PK
                        }];
    }

    return self.getDataList(querydata).then(function(res){
      return res;
    }); 
  }
  self.getImageIndex = function(){
      
    var query = "select * from image_queue where 1 order by image_id DESC limit 1";
    return DB.query(query).then(function(result){
        return DB.fetchAll(result);
    });
                 
  }

  self.getMobNotes = function(schedule_PK)
  {
    var querydata={};
    querydata.tbname = "data_sched";
    querydata.columns =["Status_PK","MobileNotes","MobileNotesChanged"];
    querydata.cond =[{
                        name:'Schedule_PK',
                        data: schedule_PK
                      }];
    return self.getDataList(querydata).then(function(res){
      return res;
    }); 
  }
  self.getDataSched = function(schedule_PK)
  {
    var querydata={};
    querydata.tbname = "data_sched";
    querydata.columns =["TechNotes","MobileAdminNotes", "Status_PK", "SubStatus_PK", "IsWarranty"];
    querydata.cond =[{
                        name:'Schedule_PK',
                        data: schedule_PK
                      }];
    return self.getDataList(querydata).then(function(res){
      return res;
    }); 
    
  }
  
  self.updateDataSchedules = function(data, schedule_PK)
  {
    var querydata={};
    querydata.tbname = "data_sched";
    querydata.columns = data;
    querydata.cond=[{
                      name:'Schedule_PK',
                      data: schedule_PK
                    }];
    self.updateData(querydata);
  }
  
  self.getSiteProfileNames = function(schedule_PK)
  {
    var querydata = {};
    var result=[];
    querydata.tbname = "sched_site_profiles";
    querydata.columns=["Name"];
    querydata.cond=[{
                      name: 'Schedule_PK',
                      data: schedule_PK
                    }];
    return self.getDataList(querydata).then(function(res){

      angular.forEach(res, function(row){
        result.push(row["Name"]);  
      });
      return result;
    });
    
  }
  
  self.getSiteProfileDetails = function(schedule_PK, name)
  {
    var querydata = {};
    var result=[];
    querydata.tbname = "sched_site_profiles";
    querydata.columns=["SiteProfile_PK", "SiteProfileType_FK"];
    querydata.cond=[{
                      name: 'Schedule_PK',
                      data: schedule_PK
                    },
                    {
                      name: 'Name',
                      data: name
                    }];
    
    return self.getDataList(querydata).then(function(res){
      var result;
      if (res.length>0) {
        var row = res[0];
        result = row['SiteProfile_PK'] +","+row['SiteProfileType_FK'];
      }
      return result;
    });a
  }
     
  self.getProfileAttribsNames = function(siteProfileType_FK)
  {
    var querydata={};
    var result={};
    querydata.tbname = "profile_attribs";
    querydata.columns = ["SiteProfileVisitAtt_PK", "Name"];
    querydata.cond = [{
                        name: 'SiteProfileType_FK',
                        data: siteProfileType_FK
                      }];
    return self.getDataList(querydata, 'SortOrder').then(function(res){
      angular.forEach(res, function(row){
        result[row['SiteProfileVisitAtt_PK']] = row['Name'];
      });
      return result;
    });
  }
  
  self.getServicePromptNames = function()
  {
    var result={};
    var querydata={};
    querydata.tbname = "prompt_types";
    querydata.columns=["MobServPrompt_PK","Name"];
    return self.getDataList(querydata, "MobServPrompt_PK").then(function(res){
      angular.forEach(res, function(row){
        result[row['MobServPrompt_PK']] = row['Name'];
      });
      return result;
    });
  }
  
  self.getAttribValue = function(profileVisitAtt_PK, schedule_PK, siteProfile_PK, forValue)  
  {
    var list = [];
    var result ={};
    var querydata ={};
    querydata.tbname = "attribs_defaults";
    querydata.columns = ["Name","MyDefault"];
    if (forValue) {
      querydata.cond =[{
                          name: 'SiteProfileVisitAtt_PK',
                          data: profileVisitAtt_PK
                        },
                        {
                          name: 'TypeCode_FK',
                          data: '1007'
                        }];
    }else{
      querydata.cond =[{
                          name: 'SiteProfileVisitAtt_PK',
                          data: profileVisitAtt_PK
                        },
                        {
                          name: 'TypeCode_FK',
                          data: '1008'
                        }];      
    }
    
    return self.getDataList(querydata, 'SortOrder').then(function(res){
      var def;
      angular.forEach(res, function(row){
        var s = row['Name'];
        var curDef = row['MyDefault'];
        
        if (s.indexOf('*NUMBER')==0) {
          list = getNumberList(s);
        }else{
          if (curDef == "1") {
            def = s;}
            list.push(s);
        }
      
      });
      try
      {
        if (!isNaN(list[0])) {
          def = list[list.length-1];
          list.splice(list.length-1, 1);
        }  
      }catch(e){}      
      result.def = def;
      result.list = list;
      result.key = profileVisitAtt_PK;
      return result;
    });
  }
  
  self.isDataSiteEmpty = function()
  {
    
    var querydata={};
    querydata.tbname = "data_site_profile_visits";
    querydata.columns =['Schedule_PK'];
    return self.getDataList(querydata).then(function(res){
      if(res.length>0)
        return false;
      else
        return true;
    });
    
  }
  
  self.getPromptAttribsNames = function(mobServPrompt_FK)
  {
    //Log.d("EV-PromptAttribs", "mobServPrompt_FK: "+mobServPrompt_FK);
    
    var result = {};
    var querydata={};
    querydata.tbname = "prompt_attribs";
    querydata.columns = ["MobServPromptQ_PK", "Name"];
    querydata.cond =[{
                      name: 'MobServPrompt_FK',
                      data: mobServPrompt_FK
                    }];
    return self.getDataList(querydata, 'SortOrder').then(function(res){
      angular.forEach(res, function(row){
        result[row['MobServPromptQ_PK']] = row['Name'];
      });
      return result;
    });

  }
  
  self.getPromptAttribValue = function(mobServPromptQ_PK, schedule_PK, forValue)
  {
    var list = [];
    var result ={};
    var querydata ={};
    querydata.tbname = "prompt_attribs_default";
    querydata.columns = ["Name","MyDefault"];
    if (forValue) {
      querydata.cond =[{
                          name: 'MobServPromptQ_FK',
                          data: mobServPromptQ_PK
                        },
                        {
                          name: 'TypeCode_FK',
                          data: '1007'
                        }];
    }else{
      querydata.cond =[{
                          name: 'MobServPromptQ_FK',
                          data: mobServPromptQ_PK
                        },
                        {
                          name: 'TypeCode_FK',
                          data: '1008'
                        }];      
    }
    
    return self.getDataList(querydata, 'SortOrder').then(function(res){
      var def;
      angular.forEach(res, function(row){

        var s = row['Name'];
        var curDef = row['MyDefault'];
        
        if (s.indexOf('*NUMBER')==0) {
          list = getNumberList(s);
        }else{
          if (curDef == "1") {
            def = s;}
            list.push(s);
        }
      
      });
      
      try
      {
        if (!isNaN(list[0])) {
          def = list[list.length-1];
          list.splice(list.length-1, 1);
        }
      }catch(e){}
      result.def = def;
      result.list = list;
      result.key = mobServPromptQ_PK;
      return result;
    });    
  }
  
  self.isDataServEmpty = function()
  {
    var querydata = {};
    querydata.tbname = "data_service_prompts";
    querydata.columns = ['Schedule_PK'];
    return self.getDataList(querydata).then(function(res){
      if(res.length>0)
        return false;
      else
        return true;
    });
  }
  
  self.isConfigEmpty = function()
  {
    var querydata = {};
    querydata.tbname = "config";
    querydata.columns = ["CompanySN"];
    return self.getDataList(querydata).then(function(result){
      if(result.length>0)
        return false;
      else
        return true;
    });
    
  }
  
  self.isTaskClockedIn = function(schedule_PK)
  {
    var querydata={};
    querydata.tbname = "data_sched";
    querydata.columns = ["ArrivalTime", "DepartureTime"];
    querydata.cond=[{
                      name:'Schedule_PK',
                      data: schedule_PK
                    }];
    return self.getDataList(querydata).then(function(result){
      if (result.length>0) {
        var row = result[0];
        if (!isBlank(row["ArrivalTime"]) && isBlank(row["DepartureTime"])) {
          console.log("return true");
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    });
    
  }
  
  self.getCustomerFK = function(schedule_PK)
  {
    var querydata = {};
    querydata.tbname = "schedules";
    querydata.columns = ["ID_Customer_PK"];
    querydata.cond = [{
                      name: 'ID_Schedule_PK',
                      data: schedule_PK
                    }];
    return self.getDataList(querydata).then(function(result){
      var customerFK = 0;
      if (result.length>0) {
        var row = result[0];
        customerFK = parseInt(row["ID_Customer_PK"]);
      }
      return customerFK;
    });
  }
  
  self.isAnyTaskIncomplete = function()
  {
    var querydata={};
    querydata.tbname = "data_sched";
    querydata.columns = ["ArrivalTime", "DepartureTime"];
    var res = false;
    return self.getDataList(querydata).then(function(result){
      for(var i=0; i<result.length;i++)
      {
        var row = result[i];
        if (!isBlank(row["ArrivalTime"]) && !isBlank(row["DepartureTime"])) {
          res = false;
        }else if (!isBlank(row["ArrivalTime"]) && isBlank(row["DepartureTime"])) {
          res = true;
          break;
        }
      }
      return res;
    });
  }
  
  self.isPasswordBlank = function(schedule_PK)
  {
    var querydata={};
    querydata.tbname = "schedules";
    querydata.columns=["Security_PasswordToAddData"];
    querydata.cond=[{
                      name:'ID_Schedule_PK',
                      data: schedule_PK
                    }];
    return self.getDataList(querydata).then(function(result){
      var res = true;
      if (result.length>0) {
        var row = result[0];
        if (!isBlank(row["Security_PasswordToAddData"])) {
          res = false;
        }
      }
      return res;
    });
  }
   
  self.getIncompleteTask = function()
  {
    var querydata ={};
    querydata.tbname = "data_sched";
    querydata.colulmns =["ArrivalTime", "DepartureTime", "Schedule_PK"];
    
    return self.getDataList(querydata).then(function(res){
      var result="";
      for (var i=0;i<res.length; i++)
      {
        var row = res[i];
        if (!isBlank(row["ArrivalTime"]) && isBlank(row["DepartureTime"])) {
          result = "Task ID:"+ row["Schedule_PK"];
          break;
        }
      }
      return result;
    });
  }
  
  self.getPassword = function(schedule_PK)
  {
    var querydata = {};
    querydata.tbname = "schedules";
    querydata.columns = ["Security_PasswordToAddData"];
    querydata.cond = [{
                        name:'ID_Schedule_PK',
                        data: schedule_PK
                    }];
    return self.getDataList(querydata).then(function(res){
      if (res.length>0)
      {
        var row = res[0];
        return row["Security_PasswordToAddData"];
      }else{
        return null;
      }
    });
  }
  

  self.getJSONText = function(idx)
  {
    var json = null;
    var response = null;
    var column_order = [];  
    var rows = [];  
    var projection = [];
    var TABLE = "";
    var empty = false;
    switch(idx)
    {
            case 1:
                    
                    TABLE = "data_sched";
                    
                    projection = ["Schedule_PK", "TechNotes", "Status_PK", "SubStatus_PK", "IsWarranty", "ArrivalTime", "DepartureTime", "MobileNotes", "MobileNotesChanged"]; 
                    
                    break;
                    
            case 2:
                    
                    TABLE = "data_order_items";
                    
                    projection = ["Schedule_PK", "ItemCodeUPC", "Quantity"]; 
                    
                    break;
                    
            case 3:
                    
                    TABLE = "data_site_profile_visits";
                    
                    projection = ["Schedule_PK", "SiteProfile_PK", "SiteProfileVisitAtt_PK", "Name", "Value", "AdjustValue"]; 
                    
                    break;
                    
            case 4:
                    
                    TABLE = "data_service_prompts";
                    
                    projection = ["Schedule_PK", "MobServPrompt_PK", "MobServPromptQ_PK", "Name", "Value", "AdjustValue"]; 
                    
                    break;
            
    }
    
    var querydata ={
        tbname: TABLE,
        columns: projection,
        cond:[
          {
            name: "Sent",
            data: 0
          }
        ]
      };

    return self.getDataList(querydata).then(function(res){
      
      var length = projection.length;
      for(var i=0;i< length;i++)
      {
        column_order.push(projection[i]);
      }
      if (res.length == 0) {
        empty = true;
      }
      for (var i=0;i<res.length;i++) {
        var row = res[i];
        var tmp = [];
        for(var j=0;j<length; j++)
        {
          var str = row[projection[j]];
          if (!isBlank(str)) {
            str = str.toString();
            str = str.replace(/%/g, "%25").replace(/&/g, "%26").replace(/"/g, "%5C%22").replace(/\?/g, "%3F");
          }
          tmp.push(str);
        }
        rows.push(tmp);
      }
      try{
        var result ={
          "column_order": column_order,
          "rows": rows
        }
        var response ={
          "action": "ADDROW",
          "result": result 
        }
        json ={
          "response": response
        }
      }catch(e)
      {
        console.log(e);
      }
      if (empty) {
        return "empty";
      }else{
        return JSON.stringify(json);  
      }
      
    });
  }
  
  function getNumberList(str)
  {
    var list = [];
    if (str.indexOf('*')>=0) {
      str = str.replace(/\*/g ,'');
    }
    str = str.replace(/\|/g , ",");
    var items = str.split(",");
    for(var i=0; i<items.length; i++)
    {
      if (items[i].indexOf("-")==0 && items[i].charAt(1)=='.') {
        items[i] = items[i].replace('-.', '-0.');
      }else{
        items[i] = "0"+items[i];
      }
    }
    try{
      var low = parseFloat(items[1]);
      var max = parseFloat(items[2]);
      var deflt = parseFloat(items[3]);
      var incr = parseFloat(items[4]);
      for(var i=low; i<=max; i+=incr)
      {
        if (Math.ceil(incr)==incr) {
          list.push(i.toString());
        }else{
          list.push(i.toFixed(1).toString());  
        }                  
      }
      list.push(deflt.toString());
      
    }catch(e)
    {
      console.log(e);
    }
    
    return list;
  }
  return self;

});