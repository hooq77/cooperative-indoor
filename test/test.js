var couchdb = require('../server/couchdb.js');
var nano = require('nano')('http://localhost:5984')

function getOrCreateDb(name, callback) {
  nano.db.get(name, function(err, body) {
    console.log(err)
    if (err && err.statusCode === 404) {
      nano.db.create(name, function(err, body) {
        callback(nano.use(name));
      });
    } else {
      callback(nano.use(name));
    }
  });
}
getOrCreateDb('hubei', (db) => {
  // console.log(db)
  // db.list({
  //   "include_docs": true
  // }, (err, body) => {
  //   console.log(err);
  //   console.log(body)
  // })
})
