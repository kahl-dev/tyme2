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
