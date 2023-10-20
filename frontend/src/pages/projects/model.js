import modelExtend from 'dva-model-extend';
import { pathMatchRegexp, checkDateTimeFormat } from 'utils';
import api from 'api';
import { pageModel } from 'utils/model';
import {DEFAULT_PROJECT_COLOR, START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';
import moment from 'utils/moment';

const {
  queryProjectMemberHistory,
  updateProjectMemberHistory,
  removeProjectMemberHistory,
  unassignedMemberFromProject,
  queryProjectMembers,
  queryProjectList,
  createProject,
  removeProject,
  updateProject,
  removeProjectList,
  queryProjectUsers,
  exportProjectsList,
  queryProjectUserRoles,
  queryProjectTechnologies
} = api;

export default modelExtend(pageModel, {
  namespace: 'projects',

  state: {
    currentItem: {},
    modalVisible: false,
    modalType: 'create',
    selectedRowKeys: [],
    errorMessages: {},
    displayColorPicker: false,
    itemColor: DEFAULT_PROJECT_COLOR.HEX,
    filterStatus: '1',
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/projects', location.pathname)) {
          const payload = location.query && Object.keys(location.query).length === 0 ? {page: 1, pageSize: 12, status: '1'} : location.query;
          dispatch({
            type: 'query',
            payload,
          })
        }
      })
    },
  },

  effects: {
    *query({ payload = {} }, { call, put }) {
      const projectList = yield call(queryProjectList, payload);
      const projectUsers = yield call(queryProjectUsers, payload);
      const projectUserRoles = yield call(queryProjectUserRoles, payload);
      const projectTechnologies = yield call(queryProjectTechnologies, payload);
      const {projects} = projectList;
      const {users} = projectUsers;
      const {userProjectRoles} = projectUserRoles;
      const {technologies} = projectTechnologies;

      if (projects) {
        yield put({
          type: 'querySuccess',
          payload:{
            list: projects.data,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 12,
              total: projects.total,
            },
            users: users ? users : [],
            userProjectRoles: userProjectRoles ? userProjectRoles : [],
            technologies: technologies ? technologies : [],
            filterStatus: payload.status,
          }
        });
      }
    },

    *delete({ payload }, { call, put, select }) {
      const data = yield call(removeProject, { id: payload });
      const { selectedRowKeys } = yield select(_ => _.projects);
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

    *multiDelete({ payload }, { call, put }) {
      const data = yield call(removeProjectList, payload);
      if (data.success) {
        yield put({ type: 'updateState', payload: { selectedRowKeys: [] } })
      } else {
        throw data
      }
    },

    *create({ payload }, { call, put }) {
      if (payload.deadline) {
        payload.deadline = moment(payload.deadline).format('YYYY-MM-DD');
      }
      const sendErrors = (data) => {
        let errorMessages = '';
        for (let key in data.message) {
          for (let i = 0; i < data.message[key].length; i++) {
            errorMessages += (data.message[key][i]);
          }
        }
        return errorMessages
      }
      try {
        const data = yield call(createProject, payload);
        if (data.success) {
          yield put({ type: 'hideModal' });
          return data.message;
        } else {
          if (data.success) {
            yield put({type: 'hideModal'});
            return data.message;
          } else {
            if (data.message) {
              yield put({type: 'setErrorMessages', payload:{messages: data.message}});
              throw (sendErrors(data));
            } else {
              throw data;
            }
          }
        }
      }catch (err) {
        throw (sendErrors(err));
      }
    },

    *update({ payload }, { select, call, put }) {
      if (payload.deadline) {
        payload.deadline = moment(payload.deadline).format('YYYY-MM-DD');
      }
      const id = yield select(({ projects }) => projects.currentItem.id);
      const newProject = { ...payload, id };
      const data = yield call(updateProject, newProject);
      if (data.success) {
        yield put({ type: 'hideModal' });
        return data.message;
      } else {
        if (data.message) {
          yield put({type: 'setErrorMessages', payload:{messages: data.message}});
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

    *resetState({ payload = {} }, { put }) {
      yield put({
        type: 'updateState',
        payload:{
          list: [],
          currentItem: {},
          modalVisible: false,
          modalType: 'create',
          selectedRowKeys: [],
          displayColorPicker: false,
          errorMessages: {},
          itemColor: DEFAULT_PROJECT_COLOR.HEX,
        }
      });
    },
    *resetErrorMessages({ payload = {} }, { put }) {
      yield put({
        type: 'updateState',
        payload:{
          errorMessages: {}
        }
      });
    },
    *export({payload = {}}, {call, put}) {
      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const projectsList = yield call(exportProjectsList, payload);
      const {data} = projectsList;

      return data ? data : [];
    },
    *projectMemberHistory({payload = {}}, {call, put}) {
      const data = yield call(queryProjectMemberHistory, payload);
      const {projectMemberHistory} = data;

      return projectMemberHistory ? projectMemberHistory : [];
    },
    *projectMembers({payload = {}}, {call, put}) {
      const data = yield call(queryProjectMembers, payload);
      const {projectMembers} = data;

      return projectMembers ? projectMembers : [];
    },
    *updateProjectMemberHistory({payload = {}}, {call, put}) {
      const data = yield call(updateProjectMemberHistory, payload);
      if (data.success) {
        return true;
      } else {
        if (data.message) {
          yield put({type: 'setErrorMessages', payload:{messages: data.message}});
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
    *removeProjectMemberHistory({payload = {}}, {call, put}) {
      const data = yield call(removeProjectMemberHistory, payload);
      if (data.success) {
        return true;
      } else {
        if (data.message) {
          yield put({type: 'setErrorMessages', payload:{messages: data.message}});
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

    *unassignedMemberFromProject({payload = {}}, {call, put}) {
      const data = yield call(unassignedMemberFromProject, payload);
      if (data.success) {
        return true;
      } else {
        if (data.message) {
          yield put({type: 'setErrorMessages', payload:{messages: data.message}});
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
  },

  reducers: {
    showModal(state, { payload }) {
      return { ...state, ...payload, modalVisible: true }
    },

    hideModal(state) {
      return { ...state, modalVisible: false }
    },
    showHideColors(state) {
      return { ...state, displayColorPicker: !state.displayColorPicker }
    },

    changeItemColor(state, {payload}) {
      return { ...state, itemColor: payload.itemColor }
    },

    setErrorMessages(state, {payload}) {
      return {...state, errorMessages: payload.messages}
    },
  },
})
