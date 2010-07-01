// ==========================================================================
// you can run these tests directly here:
//
// http://localhost:4020/md/en/current/tests/data_sources/sinatra/fetch.html
//
// ==========================================================================
/*globals Md module test ok equals same stop start statusEquals statusNotify statusQueue testAfterPropertyChange 
doesThisGetCalled*/ // make jsLint happy


module("Md.Ds_fetch", { 
  setup: function() {
    this.store = SC.Store.create().from('Md.Ds');
    Md.set('store', this.store); 
  }
});

test("The Ms.Ds dataSource should exist and is fetch method should be called when when we run a query", function() {
  // setup a spy
  var fetchCalled = false;
  var dataSource = this.store._getDataSource();
  // reassign fetch prop to new function
  dataSource.fetch = function() {
    fetchCalled = true;
  };
  var people = Md.store.find(Md.PEOPLE_QUERY);
  ok(people instanceof SC.RecordArray, 'passing a PEOPLE_QUERY to store.find returns an SC.RecordArray of people');
  ok(fetchCalled, 'and the fetch method was called which means our dataSource is being called');
});

test("fetching an SC.RecordArray of people", function() {
  var people = Md.store.find(Md.PEOPLE_QUERY);
  ok(people.get('length') === 0  , "initially the length of people should be 0");
  
  testAfterPropertyChange(people, 'status', function () {        
    statusEquals(people, SC.Record.READY_CLEAN, "when people's status is READY_CLEAN");
    ok(people.get('length') > 1  , "people should now include more than one person");

    var firstPerson = people.objectAt(0);
    ok(firstPerson !== null, "there should be a first person");

    var firstName = firstPerson.get('firstName');
    ok(firstName !== null, "and he or she should have a first name");
  });
});
