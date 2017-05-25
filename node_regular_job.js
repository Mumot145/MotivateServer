var sql = require('./sql_connect');
var minutes = 1, the_interval = minutes * 60 * 1000;


 console.log('in reg job');

setInterval(function() {
  //console.log("I am doing my minute check");

var passed = sql.getInfo();
 // sql.fetchGameList();
 //if(passed != null)
  console.log("handled-"+passed);
  //
}, the_interval);

