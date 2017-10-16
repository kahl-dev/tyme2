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

/**
 * Gets task records filtered by the given arguments.
 *
 * @param {string|Date} startDate
 *   Retreive records that begin on this date.
 * @param {string|Date} endDate
 *   Get records that started before this date.
 * @param {string} categoryID
 *   Only fetch task records for a given category.
 * @param {string} projectID
 *   Only fetch task records for a given project.
 * @param {string} taskID
 *   Only fetch task records for a given task.
 * @param {string} type
 *   Only fetch task records for a given type (timed, mileage or fixed).
 * @param {bool} onlyBillable
 *  Only fetch billable task records.
 * @param {int} offset
 *   The Start position of task records results (used for paging).
 * @param {int} limit
 *   The max number of task records results (used for paging).
 *
 * @return {array|null}
 *   An array of task record properties.
 */
tyme.getTaskRecords = (startDate = false, endDate = false, categoryID = false, projectID = false, taskID = false, type = false, onlyBillable = false, offset = false, limit = false) => {
  // Set the default dates to Sun - Sat this week.
  endDate = endDate ? endDate : tyme.nextDateByDow(new Date(new Date(Date.now()).setHours(23,59,59,999)), 6);
  startDate = startDate ? startDate : tyme.nextDateByDow(new Date(new Date(endDate).setHours(0,0,0,0) - 604800000), 0);

  return runJxa(
    (startdate, enddate, categoryid, projectid, taskid, type, onlybillable, offset, limit) => {
      const tymeApp = Application('Tyme2');
      // Result buffer.
      let taskRecords = [];

      // Run the query based on params.
      let success = tymeApp.gettaskrecordids({
        "startdate": new Date(startdate),
        "enddate": new Date(enddate),
        "categoryid": categoryid,
        "projectid": projectid,
        "taskid": taskid,
        "type": type,
        "onlybillable": onlybillable
      });
      // Make sure the test succeded.
      if (success) {
        // Get an array of task records.
        let taskRecordIds = tymeApp.fetchedtaskrecordids.get();
        // Limit results if paging args are present.
        if (offset || limit) {
          //Convert the limit to an end value.
          taskRecordIds = taskRecordIds.slice(
            Math.abs(offset ? offset : 0),
            (limit ? Math.abs(offset) + Math.abs(limit) : undefined)
          );
        };
        // Convert the task record ids to task record objects.
        taskRecordIds.forEach(function (id) {
          tymeApp.getrecordwithid(id);
          taskRecords.push(tymeApp.lastfetchedtaskrecord.properties());
        });
      }

      return taskRecords;
    },
    [startDate, endDate, categoryID, projectID, taskID, type, onlyBillable, offset, limit]
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

/**
 * [Helper] Gets a date for a day of the week (DoW) given a date and the DoW (0-6).
 *
 * @param {Date} date
 *   The starting point for locating the next DoW.
 * @param {Date} dayOfWeek
 *   Day of the week by number. i.e. 0=Sunday...6=Saturday.
 *
 * @returns {Date}
 *   A date for the next DoW.
 */
tyme.nextDateByDow = (date, dayOfWeek) => {
  var resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  return resultDate;

}