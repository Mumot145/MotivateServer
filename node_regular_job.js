var sql = require('./sql_connect');
var minutes = 1, the_interval = minutes * 60 * 1000;


 console.log('in reg job');

setInterval(function() {
  console.log("I am doing my minute check");
  sql.queryTodo();
}, the_interval);

