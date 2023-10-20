import { pathMatchRegexp } from 'utils';
import api from 'api';
import modelExtend from "dva-model-extend";
import { pageModel } from 'utils/model';

const {
  queryTeams,
  queryAllTeamUsersList,
  queryTeamUsers,
  queryProjects,
  updateTeam,
  changeTeamStatus,
  removeTeam,
  queryMemberRoles,
  queryRoles,
} = api;

export default modelExtend(pageModel, {
  namespace: 'teamsDetail',

  state: {
    data: {},
    modalVisible: false,
    modalType: 'update',
    currentItem: {},
    selectedRowKeys: [],
    selectedUserList: [],
    dataSourceMembers: [],
    selectedUser: null,
    memberStatus: 0, // 0 = Developer, 1 = Project Manager, 2 = Team Lead
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        const match = pathMatchRegexp('/teams/:id', pathname);
        if (match) {
          dispatch({ type: 'query', payload: { id: match[1] } })
        }
      })
    },
  },

  effects: {
    * query({payload}, {call, put}) {
      const data = yield call(queryTeams, payload);
      const userList = yield call(queryTeamUsers, {});
      const {users} = userList;
      const projectsList = yield call(queryProjects, {});
      const {projects} = projectsList;
      const {roleIdNameList} = yield call(queryMemberRoles, {});
      if (data.statusCode === 200) {
        yield put({
          type: 'querySuccess',
          payload: {
            data: data,
            users: users,
            projects: projects,
            roleIdNameList: roleIdNameList,
          },
        })
      } else {
        throw data
      }
    },
    *update({ payload }, { select, call, put }) {
      const id = yield select(({ teamsDetail }) => teamsDetail.currentItem.id);
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
    *delete({ payload }, { call, put, select }) {
      const data = yield call(removeTeam, { id: payload });

      if (data.success) {
        window.location.href = '/teams';
      } else {
        throw data
      }
    },
    *changeStatus({ payload }, { call, put, select }) {
      const data = yield call(changeTeamStatus, payload);
      if (data.success) {
        yield put({type: 'query', payload: {id: data.data.id}})
      } else {
        throw data
      }
    },
    * export({payload = {}}, {call, put}) { // todo the backend api doesn't ready yet
      const teamUserListFprExport = yield call(queryAllTeamUsersList, payload);
      const {users} = teamUserListFprExport;
      const userRoles = yield call(queryRoles, {});
      let _payload = {};
      if (users) {
        _payload = {
          list: users.data,
        };
      }
      _payload.roles = userRoles.success ? userRoles.roles : [];
      return teamUserListFprExport;
    },
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
})
