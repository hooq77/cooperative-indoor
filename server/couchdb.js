/**
 * @fileOverview 处理couchdb数据的访问
 * @exports CouchDB
 * @author Hu Qiang
 */

var db_host = process.env.DB_PORT_5984_TCP_ADDR || 'localhost';

var nano = require('nano')('http://'+db_host+':5984');
var Q = require('q');

/**
 * Helper function to include all properties of an object into another one
 * @param  {Object} obj1 main object which will get the new properties
 * @param  {Object} obj2 secondary object which provides potential new properties
 */

function extendObject(obj1, obj2) {
  for (var i in obj2) {
    obj1[i] = obj2[i];
  }
}


/**
 * 存在数据库，返回，不存在，创建之后再返回
 * @param {String} name   database name
 * @param {Function} callback
 */

function getOrCreateDb(name, callback) {
  nano.db.get(name, function(err, body) {
    if (err && err.statusCode === 404) {
      nano.db.create(name, function() {
        callback(nano.use(name));
      });
    } else {
      callback(nano.use(name));
    }

  });
}

/**
 * 获取文档的所有修订版本
 * Get all revisions of one document.
 * Results in multiple GETs as there is no method to get all at one.
 * @param {Object} db database object
 * @param {String} docId the document id
 * @param {Array} revs String array with the revision ids
 * @param {Function} cb callback
 */

function fetchAllRevDocs(db, docId, revs, cb) {
  var deferredList = [];

  if (revs) {
    revs.forEach(function(rev, i) {
      var deferred = Q.defer();
      deferredList.push(deferred.promise);

      db.get(docId, {
        rev: rev.rev
      }, function(err, res) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(res);
        }

      });
    });

    Q.all(deferredList)
      .then(function(res) {
        cb(undefined, res);
      })
      .fail(function(err) {
        cb(err);
      });
  }
}

/**
 * 如果文档已经删除，则无可用修订，文档能够被恢复通过查询特定版本的文档
 * 对于已经删除的文档，查询的结果出了_id和_rev以外，只包含_deleted，并没有恢复出来
 * If the document has been deleted, there are no revs available.
 * Document can be retrieved by querying all documents and get doc with
 * specific rev
 * @param {Object} db database object
 * @param {String} docId document id
 * @param {Function} cb callback
 */

function getDeletedDocument(db, docId, cb) {
  db.list({
    keys: [docId]
  }, function(err, res) {
    if (err) cb(err);
    else if (res && res.rows.length > 0) {
      db.get(docId, {
        rev: res.rows[0].value.rev
      }, function(error, result) {
        cb(error, [result]);
      });
    }
  });
}

/**
 * Get all revision Ids of a document
 * @param {Object} db database object
 * @param {String} docId document id
 * @param {Function} cb callbak
 */

function getRevisionsIds(db, docId, cb) {

  db.get(docId, {
    revs_info: true,
  }, function(err, res) {
    //special treatment for deleted documents
    if (err && err.reason && err.reason === 'deleted') {
      getDeletedDocument(db, docId, cb);
    } else if (res && res._revs_info) {
      fetchAllRevDocs(db, docId, res._revs_info, cb);
    } else {
      cb(err);
    }
  });
}

/**
 * 获得一个文档的最新版本
 * Retrieves one document from the database
 * @param {String} mapId the map id = name of the database
 * @param {String} docId document id
 * @param {Function} cb  callback
 */
module.exports.getDocument = function(mapId, docId, cb) {
  var db = nano.db.use(mapId);
  db.get(docId, {
    include_docs: true
  }, cb);
};

/**
 * 获得一个文档的所有版本
 * Get all revisions of a single document
 * @param {String} mapId map id
 * @param {String} docId document id
 * @param {Function} cb callback
 */
module.exports.getDocumentRevisions = function(mapId, docId, cb) {
  var db = nano.db.use(mapId);
  getRevisionsIds(db, docId, function(err, res) {
    cb(err, res);
  });
};

/**
 * Get all features of a database
 * @param {String} dbId database name
 * @param {Function} callback
 */
module.exports.list = function(dbId, options, callback) {
  getOrCreateDb(dbId, function(db) {
    var params = {
      "include_docs": true
    };
    extendObject(params, options);
    db.list(params, function(err, body) {
      if (!err) {
        callback(undefined, body);
      } else {
        callback(err);
      }
    });
  });
};

/**
 * Get all features of a database.
 * Pipes the results into a stream instead of using a callback function
 * @param  {String} dbId         [description]
 * @param  {Object} options      [description]
 * @param  {Object} resultStream writableStream (probably res of express)
 */
module.exports.listStream = function(dbId, options, resultStream) {
  getOrCreateDb(dbId, function(db) {
    var params = {
      "include_docs": true
    };
    extendObject(params, options);
    db.list(params).pipe(resultStream);
  });
};

/**
 * 获取数据库的所有变更
 * Gets the changes made to the database
 * @param {String} dbId database name
 * @param {Function} callbak
 */
module.exports.getChanges = function(dbId, callback) {
  getOrCreateDb(dbId, function(db) {
    db.changes(function(err, body) {
      if (!err) {
        callback(undefined, body);
      } else {
        callback(err);
      }
    });
  });
};

/**
 * Updates a document in the database.
 * Has to retrieve the document in order to get the latest revision id.
 * Otherwise a version conflict could occur.
 * @param {Object} db database object
 * @param {Object} obj the object which should be update
 * @param {String} key document id
 * @param {Function} callback
 */

function update(db, obj, key, callback) {
  db.get(key, function(error, existing) {
    if (!error) obj._rev = existing._rev;
    db.insert(obj, key, callback);
  });
}

/**
 * Inserts a document into the database.
 * If a version conflict occurs, update the feature.
 * @param {String} dbId database name
 * @param {Object} data the document which should be inserted
 * @param {String} primary id/key of the document
 * @param {Function} callback
 */
module.exports.insert = function(dbId, data, primary, callback) {
  getOrCreateDb(dbId, function(db) {
    db.insert(data, primary, function(err, res) {
      if (err) {
        if (err.statusCode && err.statusCode === 409) {
          update(db, data, primary, function(err2, res2) {
            if (err2) {
              callback(err2);
            } else {
              callback(undefined, res2);
            }
          });
        } else {
          callback(err);
        }
      } else {
        callback(undefined, res);
      }
    });
  });
};

/**
 * Delete a document from the database. Has to get the latest version first, to prevent a conflict.
 * @param {String} dbId database name
 * @param {Object} obj document which should be deleted
 * @param {String} key id of the document
 * @param {Function} callback
 */
module.exports.delete = function(dbId, obj, key, callback) {
  getOrCreateDb(dbId, function(db) {
    db.get(key, function(error, existing) {
      if (!error) {
        obj._rev = existing._rev;

        existing._deleted = true;

        db.insert(existing, key, callback);
      } else {
        callback(error);
      }
    });

  });
};

/**
 * Get the latest revision of a document
 * @param {Object} db database object
 * @param {String} key document id
 * @param {Function} cb callback
 */

function getLatestRevision(db, key, cb) {
  db.get(key, {
    revs_info: true
  }, function(err, res) {
    if (err) cb(err);
    else cb(undefined, res._revs_info[0].rev);

  });
}

/**
 * Reverts a document in the database.
 * This function retrieves the document with a given revision and
 * creates a new revision with the previous content.
 * => update with a previous revision as document
 * @param {String} dbId database name
 * @param {String} key document id
 * @param {String} toRev revision to which the document will be reverted
 * @param {Function} cb callback
 */
module.exports.revertFeature = function(dbId, key, toRev, cb) {
  var db = nano.use(dbId);
  getLatestRevision(db, key, function(err, currentRev) {
    cb(err);
    db.get(key, {
      rev: toRev
    }, function(err, res) {
      if (!err) {
        res._rev = currentRev;
        db.insert(res, key, function(iErr, iRes) {
          cb(iErr, iRes, res);
        });
      } else {
        cb(err);
      }
    });
  });
};
