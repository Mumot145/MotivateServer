var Connection = require('./node_modules/tedious').Connection;
var Request = require('./node_modules/tedious').Request;
var azure = require('./node_modules/azure-sb'),
 logger = require('azure-mobile-apps/src/logger');
var logger = require('./node_modules/azure-common/lib/diagnostics/logger');
var connStr = 'Endpoint=sb://motivation.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=2WAINwVVtMfkJBYRzg1lY3NjMv8971aIqIYlPMKjw+E=';
var notificationHubService = azure.createNotificationHubService('MotivationalNotificationHub',connStr);
// Create connection to database
var config = {
  userName: 'patrick', // update me
  password: 'malwina145!', // update me
  server: 'motivationserver.database.windows.net', // update me
  options: {
      database: 'MotivationDB', //update me
      encrypt: true
  }
};
var connection = new Connection(config);
console.log('test');
// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err) {
    if (err) {
        console.log(err);
    }
    else{
        console.log('test');
        queryTodo();
    }
});
function queryTodo(){
    var time = getTime();
    
    var request = new Request(
        "SELECT td.text, td.GroupId, ug.UserId FROM TodoItem td LEFT JOIN UserChatGroups ug ON ug.ChatGroupId = td.GroupId LEFT JOIN Users u ON ug.UserId = u.Id WHERE td.sendTime ='"+time+"'",
        function(err, rowCount, rows) {
            
            console.log(rowCount + ' row(s) returned for time :'+time);
        }
    );
    console.log("SELECT td.text, td.GroupId, ug.UserId FROM TodoItem td LEFT JOIN UserChatGroups ug ON ug.ChatGroupId = td.GroupId LEFT JOIN Users u ON ug.UserId = u.Id WHERE td.sendTime ='"+time+"'");
    var user = null;
    var text;
    var group;
    var message = [];
    var i = 0;
    request.on('row', function(columns) {
        columns.forEach(function(column) {
                console.log(column.metadata.colName + " - colName and column.value - " + column.value);
               //checkSchedule(column.metadata.colName);
                if(column.metadata.colName == "text")
                    text = column.value;

                if(column.metadata.colName == "UserId")
                    user = column.value;
                    
                if(column.metadata.colName == "GroupId")
                    group = column.value;
        });
        message.push([text,user,group]);
        //console.log("this is info - %s\t%s", UserId, payload);
           // notificationHubService.gcm.send(null, payload, function (error) {
            //             if (error) { 
              //               console.log('failed');
               //          } else {
                 //            console.log('success');
               //          }
                //     });
      
        i++;
    });
    request.on('doneProc', function (rowCount, more, returnStatus, rows) {
        checkSchedule(message);
    });
    connection.execSql(request);
    
    //connection.OnFetchComplete(); 
   
}
function checkmessage(msg){
    if(msg!=null)
    {
        
        console.log(msg[0]);
    }
    else
        console.log('its null');
}
function checkSchedule(msg){    
    if(msg!=null)
    {        
        for (var i = 0, len = msg.length; i < len; i++) {
           querySchedule(msg[i]);
        }                     
    }
    
}
function querySchedule(groupId)
{
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] =  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var n = weekday[d.getDay()];
    var request1 = new Request(
            "SELECT "+n+" FROM Schedule WHERE Id ='"+groupId[2]+"'",
            function(err1, rowCount1, rows1) {           
                console.log(rowCount1 + '  =-== returned for group :'+groupId[2]);
            }
        );
        //console.log("='"+groupId[2]+"'");
        request1.on('row', function(columns) {
            columns.forEach(function(column) {
                    console.log(column.metadata.colName + " - colName and column.value - " + column.value);   
            });
        });
       connection.execSql(request1);
}
function getTime() {

    var date = new Date();
    var hour = date.getHours();   
    if(hour < 4)
        hour = hour + 20;  
    else
        hour = hour - 4; 
          
        
    var min  = (date.getMinutes()<10?'0':'') + date.getMinutes();
   
    return hour + ":" + min + ":00";

}

   

module.exports.queryTodo = queryTodo;
