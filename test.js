const tyme = require('./index.js');

// Test projects
tyme
  .projects()
  .then(projects => {
    console.log('Projects: ', projects);
    return Promise.all(projects.map(p => tyme.projectById(p.id)));
  })
  .then(projects => {
    console.log('Projects by ID: ', projects);
  })
  .catch(console.log);

// Test tasks
tyme
  .tasks()
  .then(tasks => {
    console.log('Tasks: ', tasks);
    return Promise.all(tasks.map(t => tyme.taskById(t.id)));
  })
  .then(tasks => {
    console.log('Tasks by ID: ', tasks);
    return Promise.all(tasks.map(t => tyme.taskRecordsByTaskId(t.id, 2)));
  })
  .then(console.log)
  .catch(console.log);

// Test projectById
// tyme
//   .tasks()
//   .then(tasks =>
//     Promise.all(tasks.map(task => tyme.taskRecordsByTaskId(task.id, 10)))
//   )
//   .then(tasks => {
//     console.log(tasks);
//   })
//   .catch(console.log);

// Test default date logic.
(function (tyme) {
  let startDate, endDate = false;

  endDate = endDate ? endDate : tyme.nextDateByDow(new Date(new Date(Date.now()).setHours(23,59,59,999)), 6);
  startDate = startDate ? startDate : tyme.nextDateByDow(new Date(new Date(endDate).setHours(0,0,0,0) - 604800000), 0);

  console.log('Start:', startDate.toString());
  console.log('  End:', endDate.toString(), "\n");
}(tyme));

// Test getting filtered task records.
tyme
  .getTaskRecords(false, false, false, false, false, false, false, false, 10) // Limit to 10 items.
  .then(taskRecordIds => {
    console.log('Task Records: ', taskRecordIds);
    console.log('Task Record count: ', taskRecordIds.length);
  })
  .catch(console.log);
