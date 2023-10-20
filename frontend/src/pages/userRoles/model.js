import modelExtend from 'dva-model-extend';
import { pathMatchRegexp } from 'utils';
import api from 'api';
import { pageModel } from 'utils/model';
import {ROLE_TYPES} from 'utils/constant';

const {
  queryUserRoles,
  deleteUserRole,
} = api;

export default modelExtend(pageModel, {
  namespace: 'userRoles',

  state: {
    list: [],
    roleType: ROLE_TYPES[0],
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/userRoles', location.pathname)) {
          const payload = location.query || { page: 1, pageSize: 10 };
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
      if(!payload.roleType || !ROLE_TYPES.includes(payload.roleType)){
        payload.roleType = ROLE_TYPES[0]; // default
      }
      const reqData = {...payload, role_type: payload.roleType};
      delete reqData.roleType;

      const roleList = yield call(queryUserRoles, reqData);
      const {roles} = roleList;
      let _payload = {};
      _payload = {
        roleType: payload.roleType,
      }
      if (roles) {
        _payload = {
          ..._payload,
          list: roles.data,
          pagination: {
            current: roles.current_page || 1,
            pageSize: Number(roles.per_page) || 10,
            total: roles.total,
          }
        };
      }

      yield put({
        type: 'querySuccess',
        payload: _payload,
      });
    },

    *delete({ payload = {} }, { call, put, select }) {
      const data = yield call(deleteUserRole, { id: payload.id, role_type: payload.roleType });
      const { list } = yield select(_ => _.userRoles);
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            list: list.filter(_ => _.id !== payload.id)
          },
        });
      } else {
        throw data
      }
      return data;
    },

    *resetState({ payload = {} }, { put }) {
      yield put({
        type: 'updateState',
        payload:{
          list: [],
          roles: []
        }
      });
    },
  },

  reducers: {

  },
})
