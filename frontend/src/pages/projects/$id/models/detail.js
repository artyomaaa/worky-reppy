import { pathMatchRegexp } from 'utils';
import api from 'api';
import moment from 'utils/moment';
import { pageModel } from 'utils/model';
import {DEFAULT_PROJECT_COLOR, START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';

const {
  queryProject,
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

export default {
  namespace: 'projectDetail',

  state: {
    data: {},
    users: []
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        const match = pathMatchRegexp('/projects/:id', pathname);
        if (match) {
          dispatch({ type: 'query', payload: { id: match[1] } })
        }
      })
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const data = yield call(queryProject, payload);
      const { status, statusCode, ...other } = data;
      const projectUsers = yield call(queryProjectUsers, payload);
      const projectUserRoles = yield call(queryProjectUserRoles, payload);
      const projectTechnologies = yield call(queryProjectTechnologies, payload);
      const {users} = projectUsers;
      const {userProjectRoles} = projectUserRoles;
      const {technologies} = projectTechnologies;
      if (statusCode === 200) {
        yield put({
          type: 'querySuccess',
          payload: {
            data: data,
            users: users ? users : [],
            userProjectRoles: userProjectRoles ? userProjectRoles : [],
            technologies: technologies ? technologies : []
          },
        })
      } else {
        throw data
      }
    },

    *update({ payload }, { select, call, put }) {
      if (payload.deadline) {
        payload.deadline = moment(payload.deadline).format('YYYY-MM-DD');
      }
      const id = yield select(({ projectDetail }) => projectDetail?.data?.project?.id);
      const newProject = { ...payload, id };
      const data = yield call(updateProject, newProject);
      if (data.success) {
        yield put({ type: 'hideModal' })
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

    *delete({ payload }, { call, put, select }) {
      const data = yield call(removeProject, {id: payload});
      if (data.success) {
        yield put({
          type: 'updateState',
          payload
        })
        window.location.href = '/projects';
      } else {
        throw data
      }
    }
  },



  reducers: {
    querySuccess(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    showModal(state, { payload }) {
      return { ...state, ...payload, modalVisible: true }
    },
    hideModal(state) {
      return { ...state, modalVisible: false }
    },
  },
}
