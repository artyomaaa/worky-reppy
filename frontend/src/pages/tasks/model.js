import modelExtend from 'dva-model-extend';
import {checkCanSubmitDayReport, checkDateTimeFormat, pathMatchRegexp} from 'utils';
import api from 'api';
import {pageModel} from 'utils/model';
import {FULL_DATE_TIME_FORMAT, START_DATE_TIME_FORMAT, STATUSES} from 'utils/constant';
import moment from 'utils/moment';
import store from 'store';

const {
  queryActiveProjectList,
  queryActiveTagsList,
  queryWorkList,
  createWork,
  start,
  removeWork,
  updateWork,
  removeWorkList,
  stopWork,
  removeWorkTime,
  submitOrResetDayReports,
  getWorks,
  searchInWorks,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getComments,
  storeComment,
  editComment,
  deleteComment,
  searchTask,
  updateActiveTask,
  todosList,
  addTodo,
  updateTodo,
  deleteTodo,
  startWorkFromTodo,
  totalTodos,
} = api;

const getTodayDate = () => {
  const user = store.get('user');
  return user ? moment().utcOffset(user.time_offset).format(START_DATE_TIME_FORMAT) : moment().utcOffset(0).format(START_DATE_TIME_FORMAT);
}

export default modelExtend(pageModel, {
  namespace: 'works',
  state: {
    workedToday: null,
    currentItem: {},
    items: [],
    loadingItems: false,
    canLoadNextItems: false,
    loadedPages: [],
    page: 1,
    startValue: null,
    endValue: null,
    disableEndDateTime: false,
    endOpen: false,
    formSubmitBtnIcon: 'play-circle',
    formSubmitBtnColor: 'green',
    projects: [],
    toSubmitWorks: [],
    allTags: [],
    tags: [],
    showTodoModal: false,
    toDoList: null,
    todoPage: 1,
    todoPageSize: 10,
    showTodoMore: false,
    totalToDo: null,
    todoLoading: false,
    selectedDate: null,
    isAnySubmittedItem: false,
    todayBusyTimes: [],
    latestTask: {},
  },

  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/tasks', location.pathname)) {
          dispatch({
            type: 'resetState',
            payload: {},
          }).then(() => {
            const payload = location.query || {page: 1, pageSize: 10};
            //wrote user_action so that you can find out that the user clicked on the menu tasks, but not on the download button in more detail
            payload.user_action = "GET_LIST_TASKS"
            const userTimeOffset = store.get('user')?.time_offset || '+00:00';
            payload.selectedDate = moment().utcOffset(userTimeOffset).format(START_DATE_TIME_FORMAT);
            payload.firstLoad = true;
            dispatch({
              type: 'query',
              payload,
            });
          }).catch(console.error);
        }
      })
    },
  },

  effects: {
    * query({payload = {}}, {call, put, select}) {
      const todayDate = getTodayDate();
      const _works = yield select(({works}) => works);
      const totalToDo = _works.totalToDo;
      let _selectedDate = _works.selectedDate;
      if (payload.selectedDate){
        _selectedDate = payload.selectedDate;
      } else if(!payload.selectedDate && _selectedDate === null) {
        _selectedDate = todayDate;
      }

      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = _selectedDate || todayDate;
      }
      payload.todayDate = todayDate;
      yield put({
        type: 'querySuccess',
        payload: {
          isAnySubmittedItem: false,
          loadingItems: true,
          selectedDate: _selectedDate,
        },
      });
      const workList = yield call(queryWorkList, payload);
      let _totalToDo;
      if (!payload.firstLoad) {
        _totalToDo = totalToDo;
      } else {
        const todoData = yield call(totalTodos, {});
        _totalToDo = todoData.totalTodos;
      }
      yield put({
        type: 'querySuccess',
        payload: {
          loadingItems: false,
          totalToDo: _totalToDo
        },
      });
      const {works, allWorks, stoppedTotalDuration, workTimeTags, todayBusyTimes, isAnySubmittedItem, latestTask} = workList;
      if (works) {
        let page, _items = payload?.displayByGroup ? {} : [], _loadedPages = [];

        if (!payload.resetList) {
          const loadedPages = yield select(({works}) => works.loadedPages);

          let _loadedPages = [...loadedPages];
          if (payload.page && !loadedPages.includes(payload.page)) {
            _loadedPages.push(payload.page);
          }

          if (payload?.displayByGroup) {
            _items = {...works.data};
          } else {
            _items = payload.user_action && payload.user_action === "GET_LIST_TASKS" ? [...works.data] : [...works.data];
          }
        } else {
          _loadedPages.push(payload.page);
          _items = works.data;
        }
        if (works.next_page_url === null) {
          page = 0;
        } else {
          page = payload.page !== undefined ? Number(payload.page) : 1;
        }
        yield put({
          type: 'querySuccess',
          payload: {
            list: works.data,
            totalDuration: stoppedTotalDuration,
            workTimeTags: workTimeTags,
            pagination: {
              current: page,
              pageSize: Number(payload.pageSize) || 10,
              total: works.total,
            },
            items: _items,
            loadedPages: _loadedPages,
            page: page,
            canLoadNextItems: Boolean(page),
            workedToday: checkCanSubmitDayReport(_items),
            todayBusyTimes: todayBusyTimes,
            workCount: works.total,
            isAnySubmittedItem: isAnySubmittedItem,
            latestTask: latestTask ?? {},
          }
        });
      }
    },

    * queryTask({payload = {}}, {call, put, select}) {
      yield call(start, payload);
      const workList = yield call(queryWorkList, payload);
      const {works, latestTask} = workList;

      if (workList.success) {
        let _workList = payload?.displayByGroup ? {} : [];
        if (payload?.displayByGroup) {
          _workList = {...workList.works.data};
        } else {
          _workList = [...workList.works.data];
        }
        const _payload = {
          items: _workList,
          workTimeTags: workList?.workTimeTags,
          workCount: works.total,
          latestTask: latestTask,
        };
        if (payload.selectedDate) {
          _payload.selectedDate = payload.start_date_time;
        }
        yield put({
          type: 'querySuccess',
          payload: _payload
        });
      } else {
        throw workList;
      }
    },

    * openModalToDoList({payload = {}}, {call, put, select}) {
      const {toDoList, todoPage, todoPageSize, toDoTotal} = yield select(_ => _.works);
      let list = toDoList
      let total = toDoTotal;
      if (!toDoList) {
        const data = yield call(todosList, {page: todoPage, pageSize: todoPageSize});
        list = data.success ? data?.todos?.data : [];
        total = data.success ? data?.todos?.total : [];
      }
      yield put({
        type: 'querySuccess',
        payload: {
          showTodoMore: payload.showTodoMore,
          showTodoModal: payload.showTodoModal,
          toDoList: list,
          toDoTotal: total,
            todoLoading:true,
        }
      })
    },

    * addTodoFromCalendar({payload}, {put, call, select}) {
      const {toDoList} = yield select(_ => _.works);
      const toDoData = yield call(totalTodos, {});
      yield put({
        type: 'querySuccess',
        payload: {
          toDoList: [
            payload?.todo,
            ...toDoList
          ],
          totalToDo: toDoData.totalTodos
        }
      });
    },

    * addTodo({payload = {}}, {call, put, select}) {
      const {toDoTotal} = yield select(_ => _.works);
      let res = null;
      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment(getTodayDate()).utc().format(FULL_DATE_TIME_FORMAT);
      }
      const data = yield call(addTodo, {
        name: payload.name,
        start_date_time: payload.start_date_time,
      });
      const toDoData = yield call(totalTodos, {});
      if (data.success && data.statusCode === 200) {
        res = data.success ? data?.todo : [];
        yield put({
          type: 'querySuccess',
          payload: {
            addResponse: res,
            toDoTotal: toDoTotal + 1,
            totalToDo: toDoData.totalTodos
          }
        });
      }
      return data;
    },

    * updateTodo({payload = {}}, {call}) {
      const id = payload.id;
      const newTodo = {...payload, id};
      return yield call(updateTodo, newTodo);
    },

    * deleteTodo({payload = {}}, {call, put, select}) {
      const data = yield call(deleteTodo, {id: payload.id});
      const toDoData = yield call(totalTodos, {});
      if (data.success && data.statusCode === 200) {
        yield put({type: 'query', payload: {todoLoading: true}});
        if (data.success && data.statusCode === 200) {
          const {toDoTotal} = yield select(_ => _.works);
          yield put({
            type: 'querySuccess', payload: {
              toDoTotal: toDoTotal - 1,
              totalToDo: toDoData.totalTodos,
              todoLoading: true
            }
          });
        }
      }
      return data;
    },

    * fetchMoreTodos({payload = {}}, {call, put, select}) {
      const data = yield call(todosList, {page: payload.page, pageSize: payload.pageSize});
      const {toDoList} = yield select(_ => _.works);
      let list = toDoList;
      let showTodoMoreBtn = payload.showTodoMore;
      if (data?.todos?.last_page - data?.todos?.current_page <= 1) {
        list = data.success ? data?.todos?.data : [];
      } else {
        showTodoMoreBtn = false;
      }
      yield put({
        type: 'querySuccess',
        payload: {
          toDoList: list,
          pageSize: payload.pageSize,
          showTodoMore: showTodoMoreBtn,
        }
      })
    },

    * startWorkFromTodo({payload = {}}, {call, put, select}) {
      const userTimeOffset = store.get('user')?.time_offset || '+00:00';
      const data = yield call(startWorkFromTodo, payload);
      const toDoData = yield call(totalTodos, {});
      if (data.success && data.statusCode === 200) {
        yield put({type: 'query', payload: {page: 1, pageSize: 10, user_action: "GET_LIST_TASKS", todoLoading: true}}); // important to refresh works table
        if (data.success && data.statusCode === 200) {
          const {toDoTotal} = yield select(_ => _.works);
          yield put({
            type: 'querySuccess', payload: {
              toDoTotal: toDoTotal - 1,
              totalToDo: toDoData.totalTodos,
              showTodoModal: false,
              todoLoading: false,
              selectedDate: moment().utcOffset(userTimeOffset).format(START_DATE_TIME_FORMAT)
            }
          });
        }
      }
      return data;
    },

    * projectsAndTags({payload = {}}, {call, put}) {
      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }
      const projectList = yield call(queryActiveProjectList, {status: STATUSES.ACTIVE.value});
      const tagsList = yield call(queryActiveTagsList);
      const {projects} = projectList;
      const allTags = tagsList.success && Object.values(tagsList.tags);
      yield put({
        type: 'querySuccess',
        payload: {
          projects: projects,
          allTags,
        }
      });
    },
    * delete({payload}, {call, put, select}) {
      const data = yield call(removeWork, {id: payload});
      const {selectedRowKeys} = yield select(_ => _.works);
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            selectedRowKeys: selectedRowKeys.filter(_ => _ !== payload),
          },
        })
      } else {
        throw data
      }
    },

    * multiDelete({payload}, {call, put}) {
      const data = yield call(removeWorkList, payload);
      if (data.success) {
        yield put({type: 'updateState', payload: {selectedRowKeys: []}})
      } else {
        throw data
      }
    },

    * create({payload}, {call, put}) {
      const data = yield call(createWork, payload);
      if (data.success) {
        const _payload = {page: 1, resetList: true, displayByGroup: payload.displayByGroup};
        if (payload.selectedDate) {
          _payload.selectedDate = payload.selectedDate;
        }
        yield put({
          type: 'query',
          payload: _payload,
        });
        yield put({type: 'hideModal'})
      } else {
        if (data.message) {
          let errorMessages = '';
          for (let key in data.message) {
            for (let i = 0; i < data.message[key].length; i++) {
              errorMessages += (data.message[key][i]);
            }
          }
          throw (errorMessages);
        } else {
          throw data;
        }
      }
    },

    * update({payload}, {select, call, put}) {
      const id = yield select(({works}) => payload.work_id);
      const newWork = {...payload, id};
      const data = yield call(updateWork, newWork);
      if (data.success) {
        yield put({type: 'hideModal'})
        yield put({
          type: 'query',
          payload: {
            displayByGroup: payload.displayByGroup,
            resetList: true
          },
        });
      } else {
        if (data.message) {
          let errorMessages = '';
          for (let key in data.message) {
            for (let i = 0; i < data.message[key].length; i++) {
              errorMessages += (data.message[key][i]);
            }
          }
          throw (errorMessages);
        } else {
          throw data;
        }
      }
    },

    * stop({payload}, {call, put, select}) {
      const {dates, queryData} = payload;
      const {totalDuration} = yield select(_ => _.works);

      const _payload = {
        totalDuration: +totalDuration + queryData.duration
      };
      if (payload.selectedDate) {
        _payload.selectedDate = payload.selectedDate;
      }
      // Immediately update total hours
      yield put({
        type: 'querySuccess',
        payload: _payload
      });

      const data = yield call(stopWork, queryData);
      if (data.success) {
        yield put({
          type: 'query',
          payload: {
            page: 1,
            resetList: true,
            start_date_time: dates.start_date_time,
            displayByGroup: payload.displayByGroup
          },
        });
      } else {
        if (data.message) {
          let errorMessages = '';
          for (let key in data.message) {
            for (let i = 0; i < data.message[key].length; i++) {
              errorMessages += (data.message[key][i]);
            }
          }
          throw (errorMessages);
        } else {
          throw data;
        }
      }
    },

    * start({payload}, {put, call}) {
      yield put({
        type: 'queryTask',
        payload: {
          ...payload,
          page: 1,
          resetList: true,
          start_date_time: payload.start_date_time,
          displayByGroup: payload.displayByGroup
        },
      });
      const workList = yield call(queryWorkList, payload);
      if (workList.success) {
        const {stoppedTotalDuration} = workList;
        yield put({
          type: 'querySuccess',
          payload: {
            totalDuration: stoppedTotalDuration,
          }
        });
      } else {
        throw workList;
      }
    },

    * removeWorkTime({payload}, {call, put, select}) {
      const {items, totalDuration} = yield select(_ => _.works);

      const tasksList = payload.displayByGroup ? [...Object.values(items).flat()] : [...items];
      // Update total time immediately
      const deleteItem = tasksList.find(_ => (_.work_time_id === payload.work_time_id));
      yield put({
        type: 'querySuccess',
        payload: {
          totalDuration: totalDuration - deleteItem.duration
        }
      });

      // Delete task immediately
      let _items;
      let newItems = {};
      if (items instanceof Object) {
        if (items instanceof Array) {
          _items = items.filter(_ => (_.work_time_id !== payload.work_time_id));
        } else if (!(items instanceof Array)) {
          for (let [workName, workArray] of Object.entries(items)) {
            if (workArray instanceof Array) {
              let _workArray = [];
              _workArray = workArray.filter(_ => (_.work_time_id !== payload.work_time_id));
              if (_workArray.length > 0) {
                newItems[workName] = workArray.filter(_ => (_.work_time_id !== payload.work_time_id));
              }
            }
          }
          _items = newItems;
        }
      }
      yield put({
        type: 'updateState',
        payload: {
          items: _items,
          workedToday: checkCanSubmitDayReport(_items)
        },
      });

      const data = yield call(removeWorkTime, payload);
      if (!data.success) {
        if (data.message) {
          let errorMessages = '';
          for (let key in data.message) {
            for (let i = 0; i < data.message[key].length; i++) {
              errorMessages += (data.message[key][i]);
            }
          }
          throw (errorMessages);
        } else {
          throw data;
        }
      }
    },

    * addEditWorkTime({payload}, {call, put}) {
      const data = !payload.id ? yield call(createWork, payload) : yield call(updateWork, payload);
      if (data.success) {
        yield put({
          type: 'resetList',
          payload: {
            displayByGroup: payload.displayByGroup
          },
        });
      } else {
        throw data
      }
    },

    * submitOrResetDayReports({payload}, {call, put}) {
      const data = yield call(submitOrResetDayReports, payload);
      if (data.success) {
        yield put({
          type: 'query',
          payload: {displayByGroup: payload.displayByGroup, start_date_time: payload.date, resetList: true},
        });
      } else {
        throw data
      }
    },

    * getWorks({payload}, {call, put}) {
      const data = yield call(getWorks, payload);
      const {works} = data;
      yield put({
        type: 'querySuccess',
        payload: {
          toSubmitWorks: works,
        }
      });
    },

    * search({payload}, {call, put, select}) {
      const data = yield call(searchInWorks, payload);
      const {results} = data;

      if (results) {

        let page, _items = payload?.displayByGroup ? {} : [], _loadedPages = [];

        if (payload.resetList) {
          const items = yield select(({works}) => works.items);
          const loadedPages = yield select(({works}) => works.loadedPages);

          let _loadedPages = [...loadedPages];
          if (payload.page && !loadedPages.includes(payload.page)) {
            _loadedPages.push(payload.page);
          }
          if (payload?.displayByGroup) {
            _items = {...items, ...results.data};
          } else {
            _items = [...items, ...results.data];
          }
        } else {
          _loadedPages.push(payload.page);
          _items = results.data;
        }

        if (results.next_page_url === null) {
          page = 0;
        } else {
          page = payload.page !== undefined ? Number(payload.page) : 1;
        }

        const _payload = {
          items: _items,
          loadedPages: _loadedPages,
          page: page,
          canLoadNextItems: Boolean(page),
        };

        if (payload.selectedDate) {
          _payload.selectedDate = payload.selectedDate;
        }

        yield put({
          type: 'querySuccess',
          payload: _payload
        });
      }
    },

    * getTags({}, {call, put}) {
      const data = yield call(getTags);
      const {tags} = data;
      yield put({
        type: 'querySuccess',
        payload: {
          tags
        }
      });
    },

    * createTag({payload}, {call, put, select}) {
      const data = yield call(createTag, payload);
      const {tag} = data;
      if (tag && tag.id) {
        let _items = [];
        const items = yield select(({works}) => works.allTags);
        _items = [tag, ...items];
        yield put({
          type: 'querySuccess',
          payload: {
            allTags: _items
          }
        });
      }
    },
    * UPDATE_ACTIVE_TASK({payload}, {call, put, select}) {
      yield call(updateActiveTask, {...payload});
      yield put({
        type: 'query',
        payload: {resetList: true},
      });
    },
    * updateTag({payload}, {call, put, select}) {
      const id = payload.id;
      const data = yield call(updateTag, {...payload, id});
      const {tag} = data;
      if (tag) {
        const allTags = yield select(({works}) => works.allTags);
        const workTimeTags = yield select(({works}) => works.workTimeTags);

        const updatedWorkTimeTags = workTimeTags.map(item => {
          if (item.tag_id === tag.id) {
            item.name = tag.name;
            item.color = tag.color;
          }
          return item;
        });

        const foundUpdatedIndexInAllTags = allTags.findIndex(item => item.id === tag.id);
        allTags[foundUpdatedIndexInAllTags] = tag;

        yield put({
          type: 'querySuccess',
          payload: {
            allTags: allTags,
            workTimeTags: updatedWorkTimeTags,
          }
        });
      }
    },

    * deleteTag({payload}, {call, put, select}) {
      const data = yield call(deleteTag, {id: payload});
      if (data) {
        const items = yield select(({works}) => works.allTags);
        const workTimeTags = yield select(({works}) => works.workTimeTags);
        let _items = [];

        _items = items.filter(item => item.id !== payload);
        const updatedWorkTimeTags = workTimeTags.filter(item => item.tag_id !== payload);
        yield put({
          type: 'querySuccess',
          payload: {
            allTags: _items,
            workTimeTags: updatedWorkTimeTags,
          }
        });
      }
    },

    * resetState({payload}, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          items: [],
          list: [],
          currentItem: {},
          loadingItems: false,
          canLoadNextItems: false,
          loadedPages: [],
          page: 1,
          startValue: null,
          endValue: null,
          disableEndDateTime: false,
          endOpen: false,
          formSubmitBtnIcon: 'play-circle',
          formSubmitBtnColor: 'green',
          workedToday: null,
          toSubmitWorks: [],
          tags: [],
          isAnySubmittedItem: false,
        },
      });
    },

    * resetList({payload}, {put}) {
      yield put({
        type: 'resetState',
        payload: {},
      });
      yield put({
        type: 'query',
        payload: {page: 1, resetList: true, displayByGroup: payload?.displayByGroup},
      });
    },
    * getComments({payload}, {call, put}) {
      const comments = yield call(getComments, payload);
      yield put({
        type: 'querySuccess',
        payload: {comments: comments.comments},
      });
    },
    * storeComment({payload}, {call, put}) {
      const store = yield call(storeComment, payload)
      yield put({
        type: 'querySuccess',
        payload: {commentStoreResponse: store},
      });
    },
    * editComment({payload}, {call, put}) {
      const edit = yield call(editComment, payload)
      if (edit.status) {
        yield put({
          type: 'querySuccess',
          payload: {
            commentSuccessEdited: true,
            comments: edit.comments
          },
        });
      }
    },
    * deleteComment({payload}, {call, put}) {
      const remove = yield call(deleteComment, payload)
      if (remove.status) {
        yield put({
          type: 'querySuccess',
          payload: {
            commentSuccessDeleted: true,
            comments: remove.comments
          },
        });
      }
    },
    * searchTask({payload}, {call, put}) {
      const tasks = yield call(searchTask, payload);
      const {foundTasks, foundTasksTags} = tasks;
      return {
        foundTasks,
        foundTasksTags
      }
    },
  },
  reducers: {
    showModal(state, {payload}) {
      return {...state, ...payload, modalVisible: true}
    },

    hideModal(state) {
      return {...state, modalVisible: false}
    },
  },
})
