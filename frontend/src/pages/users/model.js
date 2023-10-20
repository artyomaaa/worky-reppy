import modelExtend from 'dva-model-extend';
import { pathMatchRegexp } from 'utils';
import api from 'api';
import { pageModel } from 'utils/model';
import moment from 'utils/moment';

const {
  queryUserList,
  queryRoles,
  queryUserSkills,
  queryUserPositions,
  queryUserSoftSkills,
  createUser,
  removeUser,
  updateUser,
  removeUserList,
  queryAllUsersList,
} = api;

export default modelExtend(pageModel, {
  namespace: 'user',

  state: {
    currentItem: {},
    modalVisible: false,
    modalType: 'create',
    selectedRowKeys: [],
    filterStatus: '1',
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/users', location.pathname)) {
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
    *query({ payload = {} }, { call, put, select }) {
      payload.showAllRoles = true;
      const userList = yield call(queryUserList, payload);
      const {users} = userList;
      let _payload = {};
      if (users) {
        _payload = {
          list: users.data,
          pagination: {
            current: Number(payload.page) || 1,
            pageSize: Number(payload.pageSize) || 10,
            total: users.total,
          },
          filterStatus: payload.status,
        };
      }
      const { roles } = yield select(_ => _.user);
      if (!roles) {
        const userRoles = yield call(queryRoles, {showAllRoles: true});
        _payload.roles = userRoles.success ? userRoles.roles : [];
      }

      yield put({
        type: 'querySuccess',
        payload: _payload,
      });
    },

    *delete({ payload }, { call, put, select }) {
      const data = yield call(removeUser, { id: payload });
      const { selectedRowKeys } = yield select(_ => _.user);
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
      const data = yield call(removeUserList, payload);
      if (data.success) {
        yield put({ type: 'updateState', payload: { selectedRowKeys: [] } })
      } else {
        throw data
      }
    },

    *create({ payload }, { call, put }) {
      if (payload.formValues.birthday) {
        payload.formValues.birthday = moment(payload.formValues.birthday).format('YYYY-MM-DD');
      }
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload.formValues));
      formData.append('documents[agreement]', payload.documents.agreement);
      formData.append('documents[passport]', payload.documents.passport);

      for (let i = 0; i < payload.otherDocuments.length; i++) {
        formData.append('documents['+payload.otherDocuments[i].type+']', payload.otherDocuments[i].file)
      }

      const data = yield call(createUser, formData);
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
      const id = yield select(({ user }) => user.currentItem.id);
      if (payload.formValues.birthday) {
        payload.formValues.birthday = moment(payload.formValues.birthday).format('YYYY-MM-DD');
      }

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload.formValues));
      formData.append('documents[agreement]', payload.documents.agreement);
      formData.append('documents[passport]', payload.documents.passport);
      formData.append('id', id);

      for (let i = 0; i < payload.otherDocuments.length; i++) {
        formData.append('documents['+payload.otherDocuments[i].type+']', payload.otherDocuments[i].file)
      }

      const data = yield call(updateUser, formData);
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
        }
      });
    },
    * export({payload = {}}, {call, put}) {
      const userListFprExport = yield call(queryAllUsersList, payload);
      const {users} = userListFprExport;
      const userRoles = yield call(queryRoles, {showAllRoles: true});
      let _payload = {};
      if (users) {
        _payload = {
          list: users.data,
        };
      }
      _payload.roles = userRoles.success ? userRoles.roles : [];
      return userListFprExport;
    },
    * showModal({payload = {}}, {call, put, select}) {
      const { skills, positions, softSkills } = yield select(_ => _.user);
      const _payload = {...payload};
      if (!skills) {
        const userSkills = yield call(queryUserSkills, {});
        _payload.skills = userSkills.success ? userSkills.skills : [];
      }

      if (!softSkills) {
        const userSoftSkills = yield call(queryUserSoftSkills, {});
        _payload.softSkills = userSoftSkills.success ? userSoftSkills.softSkills : [];
      }

      if (!positions) {
        const userPositions = yield call(queryUserPositions, {});
        _payload.positions = userPositions.success ? userPositions.positions : [];
      }

      yield put({
        type: 'updateState',
        payload:{
          modalVisible: true,
          ..._payload
        }
      });
    },
  },

  reducers: {
    hideModal(state) {
      return { ...state, modalVisible: false }
    },
  },
})
