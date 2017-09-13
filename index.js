const runJxa = require('run-jxa');
const tyme = module.exports;

tyme.projects = ({ completed = false } = {}) => {
  return runJxa(
    arg => {
      const tyme = Application('Tyme2');
      const tymeProjects = tyme.projects.whose(arg)().map(p => p.properties());

      return tymeProjects;
    },
    [{ completed }]
  );
};

tyme.projectById = id => {
  return runJxa(
    id => {
      const tyme = Application('Tyme2');
      const project = tyme.projects.byId(id);

      return project.properties();
    },
    [id]
  );
};

tyme.tasks = ({ completed = false } = {}) => {
  return runJxa(
    arg => {
      const tyme = Application('Tyme2');
      const tasks = tyme.projects.tasks.whose(arg)().reduce((arr, project) => {
        if (project.length) {
          arr.push(
            ...project.map(task => {
              const object = task.properties();
              object['lastUpdate'] = (taskRecord = task
                .taskrecords()
                .slice(-1)
                .pop())
                ? taskRecord.timestart()
                : undefined;
              return object;
            })
          );
        }
        return arr;
      }, []);

      return tasks;
    },
    [{ completed }]
  );
};

tyme.taskById = id => {
  return runJxa(
    id => {
      const tyme = Application('Tyme2');

      return tyme.projects.tasks.whose({
        id,
      })().reduce((arr, project) => {
        if (project.length)
          arr.push(
            ...project.map(task => {
              const object = task.properties();
              object['lastUpdate'] = (taskRecord = task
                .taskrecords()
                .slice(-1)
                .pop())
                ? taskRecord.timestart()
                : undefined;
              return object;
            })
          );
        return arr;
      }, [])[0];
    },
    [id]
  );
};

tyme.taskRecordsByTaskId = (id, limit = false) => {
  return runJxa(
    (id, limit) => {
      const tyme = Application('Tyme2');
      const task = tyme.projects.tasks.whose({ id })().filter(
        project => project.length
      )[0][0];

      let taskRecords = task.taskrecords();
      if (limit) taskRecords = taskRecords.slice(-Math.abs(limit));

      const returnValue = {
        successful: true,
        task: task.properties(),
        taskRecords:
          taskRecords.map(taskRecord => taskRecord.properties()) || [],
      };

      return returnValue;
    },
    [id, limit]
  );
};

tyme.taskRecordById = id => {
  return runJxa(
    id => {
      const tyme = Application('Tyme2');
      const action = tyme.getrecordwithid(id);
      const returnValue = {
        successful: action,
      };

      if (action) {
        const taskRecord = tyme.lastfetchedtaskrecord;
        returnValue.taskRecord = taskRecord.properties();
      }

      return returnValue;
    },
    [id]
  );
};

tyme.startTrackerForTaskId = (id, note) => {
  return runJxa(
    (id, note) => {
      const tyme = Application('Tyme2');
      const returnValue = {
        successful: false,
      };

      if (id) {
        if (tyme.starttrackerfortaskid(id)) {
          const task = tyme.projects.tasks
            .whose({ id })[0]
            .get(0)
            .filter(task => task)[0];
          returnValue.task = task.properties();
          returnValue.successful = true;
        }
      } else {
        returnValue.task = null;
      }

      if (note) {
        const taskRecord = tyme.projects.tasks
          .whose({ id })
          .taskrecords()
          .filter(project => project.length)[0][0]
          .slice(-1)
          .pop();
        if (taskRecord.note.set(note)) returnValue.taskRecord = taskRecord;
      }

      return returnValue;
    },
    [id, note]
  );
};

tyme.stopTrackerFortTaskId = () => {
  return runJxa(() => {
    const tyme = Application('Tyme2');
    const id = tyme.trackedtaskids.get(0)[0];
    const returnValue = {
      successful: false,
    };

    if (id) {
      const action = tyme.stoptrackerfortaskid(id);
      if (action) {
        const task = tyme.projects.tasks
          .whose({ id })[0]
          .get(0)
          .filter(task => task)[0];

        returnValue.task = task.properties();
      }

      returnValue.successful = action;
    } else {
      returnValue.task = null;
    }

    return returnValue;
  });
};
