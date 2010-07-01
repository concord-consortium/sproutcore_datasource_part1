// ==========================================================================
// Project:   Md.Task
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Md */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Md.Task = SC.Record.extend(
/** @scope Md.Task.prototype */ {

  // TODO: Add your own code here.
  project:  SC.Record.toOne("Md.Project", { 
    inverse: "tasks", isMaster: YES 
  }),
  
}) ;

// these class variables, and help the datastores create 'conventional' urls.
Md.Task.modelName = "task";
Md.Task.modelsName = "tasks";
