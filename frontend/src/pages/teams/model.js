import modelExtend from 'dva-model-extend';
import { pathMatchRegexp } from 'utils';
import api from 'api';
import { pageModel } from 'utils/model';

const {
  queryTeamList,
  queryTeamUsers,
  queryProjects,
  createTeam,
  removeTeam,
  updateTeam,
  removeTeamList,
  queryMemberRoles,
  exportTeamsList,
} = api;

export default modelExtend(pageModel, {
  namespace: 'teams',

  state: {
    currentItem: {},
    modalVisible: false,
    modalType: 'create',
    selectedRowKeys: [],
    selectedUserList: [],
    dataSourceMembers: [],
    selectedUser: null,
    roleIdNameList: [],
    memberStatus: '',
    filterStatus: '1',
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/teams', location.pathname)) {
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
      const teamList = yield call(queryTeamList, payload);
      const {teams} = teamList;

      const userList = yield call(queryTeamUsers, {});
      const {users} = userList;
      const projectsList = yield call(queryProjects, {});
      const {projects} = projectsList;
      const {roleIdNameList} = yield call(queryMemberRoles, {});
      if (teams) {
        yield put({
          type: 'querySuccess',
          payload:{
            list: teams.data,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 12,
              total: teams.total,
            },
            users: users,
            projects: projects,
            roleIdNameList: roleIdNameList,
            filterStatus: payload.status,
          }
        });
      }
    },

    *delete({ payload }, { call, put, select }) {
      const data = yield call(removeTeam, { id: payload });
      const { selectedRowKeys } = yield select(_ => _.teams);
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
      const data = yield call(removeTeamList, payload);
      if (data.success) {
        yield put({ type: 'updateState', payload: { selectedRowKeys: [] } })
      } else {
        throw data
      }
    },

    *create({ payload }, { call, put }) {
      const data = yield call(createTeam, payload);
      if (data.success) {
        yield put({ type: 'hideModal' })
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

    *update({ payload }, { select, call, put }) {
      const id = yield select(({ teams }) => teams.currentItem.id);

      const newTeam = { ...payload, id };
      const data = yield call(updateTeam, newTeam);
      if (data.success) {
        yield put({ type: 'hideModal' })
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

    *resetState({ payload = {} }, { put }) {
      yield put({
        type: 'updateState',
        payload:{
          list: [],
          currentItem: {},
          modalVisible: false,
          modalType: 'create',
          selectedRowKeys: [],
          selectedUserList: [],
          dataSourceMembers: [],
          selectedUser: null,
          memberStatus: 0,
          users: [],
        }
      });
    },
    *export({payload = {}}, {call}) {
      const teamsList = yield call(exportTeamsList, payload);
      const {data} = teamsList;
      return data ? data : [];
    },
  },

  reducers: {
    showModal(state, { payload }) {
      return { ...state, ...payload, modalVisible: true }
    },

    hideModal(state) {
      return { ...state, modalVisible: false }
    },
  },
})
