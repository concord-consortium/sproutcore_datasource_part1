// ==========================================================================
// Project:   Md.Ds
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Md recordType */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
sc_require('models/person');
sc_require('models/project');

Md.PEOPLE_QUERY             = SC.Query.local(Md.Person, {
    orderBy: 'lastName, firstName'
});

Md.Ds = SC.DataSource.extend(
/** @scope Md.Ds.prototype */ {
  
  _getFromUri: function(uri, options) {
    console.group('Md.Ds._getFromUri()');
    
    var notifyMethod;
    if (options.isQuery) {
      notifyMethod = this._didGetQuery;
    } else {
      notifyMethod = this._didRetrieveRecords;
    }
      
    var request = SC.Request.getUrl(uri).header({
        'Accept': 'application/json'
      }).json().notify(this, notifyMethod, options);

    console.log('request.address: %s', request.address);
    console.log('request: ', request);
    request.send();
    console.groupEnd();
    
    console.groupEnd();
    return YES;
  },
  
  fetch: function(store, query) {
      var options = {
        store:    store,
        query:    query,
        isQuery:  YES
      };
      console.log("Fetch");
      if (query === Md.PEOPLE_QUERY) {
        console.log("people query");
        var recordType = Md.Person;
        options['type'] = recordType;
        options['modelName'] = recordType.modelName;
        options['modelsName'] = recordType.modelsName;
        
        return this._getFromUri('/' + options['modelsName'], options);
      }
    return NO;
  },
  
  _didGetQuery: function(response, params) {
      var store     = params.store,
          query     = params.query, 
          type      = params.type,
          deffered  = params.deffered;
      
      var storeKeys;
      if (SC.ok(response)) {
        // notify store that we handled the fetch
        if (query.get('isLocal')) {
            console.log("fetch local");
            storeKeys = store.loadRecords(type, response.get('body'));
            store.dataSourceDidFetchQuery(query);
        } else if (deffered) {
          console.log("fetch remote deffered");
          storeKeys = response.get('body').map(function(id) {
            return Md.Person.storeKeyFor(id);
          }, this);
          store.loadQueryResults(query, storeKeys);
        } else {
          console.log("fetch remote");
          storeKeys = store.loadRecords(type, response.get('body'));
          store.loadQueryResults(query, storeKeys);
        }
      // handle error case
      } else store.dataSourceDidErrorQuery(query, response);
  },
  
  retrieveRecord: function(store, storeKey) {
    this._getFromUri(store.idFor(storeKey), {
      storeKey:       storeKey,
      store:          store,
      type:           store.recordTypeFor(storeKey)
      
    });
    return YES;
  },
  
  _didRetrieveRecords: function(response, params) {
    var store = params.store,
        type = params.type,
        data;
    if (SC.ok(response)) {
      data = response.get('body');
      console.log(data, type);
      store.loadRecords(type, data.isEnumerable ? data : [data]);
    } else store.dataSourceDidError(storeKey, response.get('body'));
  },
  
  createRecord: function(store, storeKey) {
    var recordType = store.recordTypeFor(storeKey);
    var modelName = recordType.modelName;
    var modelHash = {};

    console.group('Raclette.RailsDataSource.createRecord()');
    SC.Request.postUrl('/' + recordType.modelsName).header({
                    'Accept': 'application/json'
                }).json()

          .notify(this, this.didCreateRecord, store, storeKey)
          .send(store.readDataHash(storeKey));
    console.groupEnd();
    return YES;
  },
  
  didCreateRecord: function(response, store, storeKey) {
    if (SC.ok(response)) {
      // Adapted from parseUri 1.2.2
      // (c) Steven Levithan <stevenlevithan.com>
      // MIT License
      var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
      var url = parser.exec(response.header('Location'))[8];
      store.dataSourceDidComplete(storeKey, null, url); // update url

    } else store.dataSourceDidError(storeKey, response);
  },

  updateRecord: function(store, storeKey) {
    console.log("updateRecord");
    
    SC.Request.putUrl(store.idFor(storeKey)).json()
      .notify(this, this._didUpdateRecord, store, storeKey)
      .send(store.readDataHash(storeKey));
    return YES;
    
  },
  
  _didUpdateRecord: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var data = response.get('body');
      // if (data) data = data.content; // if hash is returned; use it.
      store.dataSourceDidComplete(storeKey) ;
    } else store.dataSourceDidError(storeKey); 
  },
  
  destroyRecord: function(store, storeKey) {
        console.log("destroyRecord");
    // TODO: Add handlers to destroy records on the data source.
    // call store.dataSourceDidDestroy(storeKey) when done
    
    return NO ; // return YES if you handled the storeKey
  }
  
}) ;


// SC.ManyArray.prototype.retrieveIfNeeded = function() {
//   var ids = this.get('readOnlyStoreIds'),
//       type = this.get('recordType'),
//       store = this.get('store');
//       
//   ids = ids.filter(function(id) {
//     var storeKey = store.storeKeyFor(type, id);
//     return store.readStatus(storeKey) & SC.Record.EMPTY;
//   }, this);
//   
//   store.retrieveRecords(type, ids);
// };