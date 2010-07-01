// ==========================================================================
// you can run these tests directly here:
//
// http://localhost:4020/md/en/current/tests/data_sources/sinatra/create.html
//
// ==========================================================================
/*globals Md module test ok equals same stop start statusEquals statusNotify statusQueue testAfterPropertyChange 
doesThisGetCalled getIndexSync*/ // make jsLint happy

module("Md.Ds_fetch", { 
  setup: function() {
    this.store = SC.Store.create({
      commitRecordsAutomatically: YES
    }).from('Md.Ds');
    Md.set('store', this.store); 
  }
});

test("createRecord is called when a person is created", function() {
  // setup a spy
   var createRecordCalled = false;
   var dataSource = this.store._getDataSource();
   // reassign fetch prop to new function
   dataSource.createRecord = function() {
     createRecordCalled = true;
   };
  
  SC.run(function() {
    var person = Md.store.createRecord(Md.Person, {
      firstName: "Charlie",
      lastName: "Chaplin",
      project: "/projects/1"      
    });
  });
  
  ok(createRecordCalled, "createRecord was called after a person is created");
});

test("Creating a new person adds one to the remote data source", function() {
  var numPeople = getIndexSync('people').get('length');
  
  var newPerson;
  SC.run(function () {
    newPerson = Md.store.createRecord(Md.Person, {
      firstName: "Charlie",
      lastName: "Chaplin",
      project: "/projects/1"      
    });
  });
  
  testAfterPropertyChange(newPerson, 'status', function () {
    statusEquals(newPerson, SC.Record.READY_CLEAN, 'newPerson should transition to READY_CLEAN');

    var newNumPeople  = getIndexSync('people').get('length');

    equals(newNumPeople, numPeople+1, 
      'Number of people should be previous number of people (' + numPeople + ') + 1');      
  });
});
