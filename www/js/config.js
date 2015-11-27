angular.module('starter.config', [])
    .constant('DB_CONFIG', {
        name: 'EvoMobile',
        tables: [
            {
                name: 'config',
                columns: [
                    {name: '_id', type: 'integer primary key'},
                    {name: 'CompanySN', type: 'text unique'},
                    {name: 'UserID', type: 'text'},
                    {name: 'Password', type: 'text'},
                    {name: 'PIN', type: 'text'},     
                    {name: 'ServiceUserID', type: 'text'},
                    {name: 'ServicePassword', type: 'text'},
                    {name: 'LastReceived', type: 'text'},
                    {name: 'WifiOnly',type:'text'}
                ]
            },      
            {       
                name: 'data_sched',       
                columns: [
                    {name: 'Schedule_PK', type: 'text unique'},
                    {name: 'TechNotes', type: 'text'},
                    {name: 'MobileNotes', type: 'text'},
                    {name: 'MobileNotesChanged', type: 'text'},
                    {name: 'MobileAdminNotes', type: 'text'},
                    {name: 'Status_PK', type: 'text'},
                    {name: 'SubStatus_PK', type: 'text'},
                    {name: 'IsWarranty', type: 'text'},
                    {name: 'ArrivalTime', type: 'text'},
                    {name: 'DepartureTime', type: 'text'},
                    {name: 'Sent', type: 'integer default 0'}
                ]
            },
            {
                name: 'data_order_items',
                columns: [
                    {name: 'Schedule_PK', type: 'text'},
                    {name: 'ItemCodeUPC', type: 'text'},
                    {name: 'Quantity', type: 'text'},
                    {name: 'Sent', type: 'integer default 0'}
                ]
            },
            {
                name: 'data_site_profile_visits',
                columns: [
                    {name: 'Schedule_PK', type: 'text'},
                    {name: 'SiteProfile_PK', type: 'text'},
                    {name: 'SiteProfileVisitAtt_PK', type: 'text'},
                    {name: 'Name', type: 'text'},
                    {name: 'Value', type: 'text'},
                    {name: 'AdjustValue', type: 'text'},
                    {name: 'Sent', type: 'integer default 0'}
                ]
            },
            {
                name: 'data_service_prompts',
                columns: [
                    {name: 'Schedule_PK', type: 'text'},
                    {name: 'MobServPrompt_PK', type: 'text'},
                    {name: 'MobServPromptQ_PK', type: 'text'},
                    {name: 'Name', type: 'text'},
                    {name: 'Value', type: 'text'},
                    {name: 'AdjustValue', type: 'text'},
                    {name: 'Sent', type: 'integer default 0'}
                ]
            },    
            {
                name: 'schedules',
                columns: [
                    {name: 'ServiceRequest_PK', type: 'text'},
                    {name: 'ID_Schedule_PK', type: 'text'},
                    {name: 'ID_Customer_PK', type: 'text'},
                    {name: 'ID_Store_PK', type: 'text'},
                    {name: 'ListView_SortMe', type: 'text'},
                    {name: 'ListView_Date', type: 'text'},
                    {name: 'ListView_TimeFrame', type: 'text'},
                    {name: 'ListView_Task', type: 'text'},
                    {name: 'ListView_LengthMinutes', type: 'text'},
                    {name: 'Reference_TaskTitle', type:'text'},
                    {name: 'Reference_CustomerName', type:'text'},
                    {name: 'Reference_Address', type: 'text'},
                    {name: 'Reference_City', type: 'text'},
                    {name: 'Reference_State', type: 'text'},
                    {name: 'Reference_PostCode', type: 'text'},
                    {name: 'Reference_MainPhone', type: 'text'},
                    {name: 'Reference_MainEmail', type:'text'},
                    {name: 'Reference_MobilePhone', type:'text'},
                    {name: 'Reference_PicturesOverWifiOnly', type:'text'},
                    {name: 'Reference_MobileNotes', type:'text'},                    
                    {name: 'TaskView_Menu_Label1', type: 'text'},
                    {name: 'TaskView_Menu_Data1', type: 'text'},
                    {name: 'TaskView_Menu_Label2', type: 'text'},
                    {name: 'TaskView_Menu_Data2', type: 'text'},
                    {name: 'TaskView_Menu_Label3', type: 'text'},
                    {name: 'TaskView_Menu_Data3', type: 'text'},
                    {name: 'TaskView_Menu_Label4', type: 'text'},
                    {name: 'TaskView_Menu_Data4', type: 'text'},
                    {name: 'TaskView_Menu_Label5', type: 'text'},
                    {name: 'TaskView_Menu_Data5', type: 'text'},
                    {name: 'TaskView_Menu_Label6', type: 'text'},
                    {name: 'TaskView_Menu_Data6', type: 'text'},
                    {name: 'TaskView_Menu_Label7', type: 'text'},
                    {name: 'TaskView_Menu_Data7', type: 'text'},
                    {name: 'Security_CanAddTechNotes', type: 'text'},
                    {name: 'Security_CanAddItems', type: 'text'},
                    {name: 'Security_CanAddSiteProfVisit', type: 'text'},
                    {name: 'Security_CanAddServPrompt', type: 'text'},
                    {name: 'Security_PasswordToAddData', type: 'text'},
                    {name: 'Security_CanEditMobileNotes', type:'text'},
                    {name: 'Security_CanTextCustomer', type:'text'},
                    {name: 'Security_CanEmailCustomer', type:'text'}
                ]
            },
            {
                name: 'sched_site_profiles',
                columns: [
                    {name: 'Schedule_PK', type: 'text'},
                    {name: 'SiteProfile_PK', type: 'text'},
                    {name: 'SiteProfileType_FK', type: 'text'},
                    {name: 'Name', type: 'text'}
                ]
            },
            {
                name: 'profile_attribs',
                columns: [
                    {name: 'SiteProfileVisitAtt_PK', type: 'text unique'},
                    {name: 'SiteProfileType_FK', type: 'text'},
                    {name: 'Name', type: 'text'},
                    {name: 'SortOrder', type: 'integer'}
                ]
            },
            {                  
                name: 'prompt_types',
                columns: [
                    {name: 'MobServPrompt_PK', type: 'text'},
                    {name: 'Name', type: 'text'}
                ]
            },
            {
                name: 'prompt_attribs',
                columns: [
                    {name: 'MobServPromptQ_PK', type: 'text'},
                    {name: 'MobServPrompt_FK', type: 'text'},
                    {name: 'SortOrder', type: 'integer'},
                    {name: 'Name', type: 'text'}
                ]
            },
            {
                name: 'prompt_attribs_default',  
                columns: [
                    {name: 'MobServPromptQA_PK', type: 'text'},
                    {name: 'MobServPromptQ_FK', type: 'text'},
                    {name: 'TypeCode_FK', type: 'text'},
                    {name: 'SortOrder', type: 'integer'},
                    {name: 'Name', type: 'text'},
                    {name: 'MyDefault', type: 'text'},
                ]
            },
            {
                name: 'attribs_defaults',
                columns: [
                    {name: 'SiteProfileVisitAtt_PK', type: 'text'},
                    {name: 'Name', type: 'text'},
                    {name: 'SortOrder', type: 'integer'},
                    {name: 'TypeCode_FK', type: 'text'},
                    {name: 'MyDefault', type: 'text'}
                ]
            },
            {
                name: 'narratives',
                columns: [
                    {name: 'NarrativeType_PK', type: 'text'},
                    {name: 'Type', type: 'text'},
                    {name: 'ShortDescription', type: 'text'},
                    {name: 'Narrative', type: 'text'}
                ]
            },
            {
                name: 'image_queue',
                columns: [
                    {name: 'image_id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT'},
                    {name: 'Schedule_PK', type: 'text'},
                    {name: 'imageURI', type: 'text'},
                    {name: 'fileURL', type: 'text'}
                ]
            }
            
        ]        
    })
    .constant('CONFIG', {
        loginName: 'evosus',
        password: 'evosus7414',
        webUrl: 'http://cloud1.evosus.com/'
    })
    
    .factory('EditButtonList',function(){
        this.buttons = [
                  {
                    label:'Arrive',
                    icon: 'ion-checkmark-circled',
                    disabled: true
                  }, 
                  {
                    label:'Edit Mobile Notes',
                    icon: 'ion-document-text',
                    disabled: false
                  },
                  {
                    label:'Notes & Status',
                    icon: 'ion-edit',
                    disabled: false
                  },
                  {
                    label:'Site Profile Maint. Prompts',
                    icon: 'ion-ios7-speedometer',
                    disabled: false
                  },
                  {
                    label:'Service Repair Prompts',
                    icon: 'ion-gear-a',
                    disabled: false
                  },
                  {
                    label:'Add Item to Order',
                    icon: 'ion-plus',
                    disabled: false
                  },
                  {
                    label:'Take Picture',
                    icon: 'ion-camera',
                    disabled: false
                  },
                  /*
                  {
                    label: 'Manage Queued Images',
                    icon: 'ion-images',
                    disabled:false
                  },
                  */
                  {
                    label:'Depart',
                    icon: 'ion-close-circled',
                    disabled: false
                  }
                  ];    
    
        return this;
    })
    .factory('ContextMenu', function(){
        this.items =[
                     {
                        title: 'Call Customer',
                        disabled: false
                     },
                     {
                        title: 'Navigate to...',
                        disabled: false
                     },
                     {
                        title: 'Open Item',
                        disabled: false
                     },
                     {
                        title: 'Arrive',
                        disabled: false
                     },
                     {
                        title: 'Mobile Notes',
                        disabled: true
                     },
                     {
                        title: 'Notes and Status',
                        disabled: true
                     },
                     {
                        title: 'Site Profile Maintenance Prompts',
                        disabled: true
                     },
                     {
                        title: 'Service Repair Prompts',
                        disabled: true
                     },
                     {
                        title: 'Add Item',
                        disabled: true
                     },
                     {
                        title: 'Depart',
                        disabled: true
                     }                     
                     ];
        return this;
    })
    .factory('DetailButtons',function(){
        this.buttons = [
                  {
                    icon: 'ion-document-text',
                    selected: true
                  },  
                  {
                    icon: 'ion-person',
                    selected: false
                  },
                  {
                    icon: 'ion-edit',
                    selected: false
                  },
                  {
                    icon: 'ion-calendar',
                    selected: false
                  },
                  {
                    icon: 'ion-wrench',
                    selected: false
                  },
                  {
                    icon: 'ion-information-circled',
                    selected: false
                  },
                  {
                    icon: 'ion-ios7-checkmark',
                    selected: false
                  }
                  ];
    
        return this;
    } )
    
    .factory('Util', function(){
        var data={};
        return data;
    });
    
function getNearestDate(dates, today) {
    var index = 0;

        for (var i = 0; i < dates.length; ++i)
        {
            var date1 = new Date(dates[i]);
            var date2 = new Date(dates[index]);

            if (Math.abs(date1.getTime() - today) < Math.abs(date2.getTime() - today))
            {
                index = i;
            }
        }
        return dates[index];          
}

function isBlank(str)
{
    if (str==null || str=="" || typeof(str) == undefined) {
        return true;
    }else{
        str = str.replace(/ /g, "");
        if (str=="") { 
            return true;
        }else{
            return false;
        }
    }    
}
///Get formatted Time and date String.
function formatDate(date){
    
    var y = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString();
    var dd = date.getDate().toString();
    
    return y+"/" + (mm[1]?mm:'0'+mm[0]) + "/" + (dd[1]?dd: '0'+dd[0]);
    
}

function formatDateDash(date) {
    
    var y = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString();
    var dd = date.getDate().toString();
    
    return y+"-" + (mm[1]?mm:'0'+mm[0]) + "-" + (dd[1]?dd: '0'+dd[0]);
}

function simpleFormatDate(date) {
    var mm = (date.getMonth()+1).toString();
    var dd = date.getDate().toString();
    
    return (mm[1]?mm:'0'+mm[0]) + "/" + (dd[1]?dd: '0'+dd[0]);
}

function getUTCDateForPunch(date)
{
    return date.toISOString();
}

function getDateForPunch(date)
{
    var y = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString();
    var dd = date.getDate().toString();
    var HH = date.getHours().toString();
    var MM = date.getMinutes().toString();
    var SS = date.getSeconds().toString();
    return y+"-" + (mm[1]?mm:'0'+mm[0]) + "-" + (dd[1]?dd: '0'+dd[0]) + " " + (HH[1]?HH:'0'+HH[0]) + ":" + (MM[1]?MM: '0'+MM[0]) + ":" + (SS[1]?SS: '0'+SS[0]);
}
function formatTime(date)
{
    var HH = date.getHours().toString();
    var MM = date.getMinutes().toString();
    
    return (HH[1]?HH:'0'+HH[0]) + ":" + (MM[1]?MM: '0'+MM[0]);
}
