const Pg = require("./postgre");
var olddb = new Pg('indoor_new');
olddb.getConnection();
olddb.select('sys_user', [], [], (err, res)=>{
  console.log(err, res);
})
