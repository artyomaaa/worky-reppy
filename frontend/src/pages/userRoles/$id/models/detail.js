import {pathMatchRegexp} from 'utils';
import api from 'api';
import {ROLE_TYPES} from 'utils/constant';

const {
  queryUserRoles,
  queryShowUserRole,
  createUserRole,
  updateUserRole,
  deleteUserRole,
  addPermissionToRole,
  removePermissionFromRole,
  addDefaultPermissionsToRole,
  queryAllUserList,
  assignUsersToRole,
} = api;

export default {
  namespace: 'userRoleDetail',

  state: {
    saveMode: '',
    currentItem: {},
    isSubmittedLoading: false,
    roleType: ROLE_TYPES[0],
    allUserList: [],
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/userRoles/:id', location.pathname);
        if (match) {
          const id = !isNaN(match[1]) ? match[1] : null;
          dispatch({ type: 'query', payload: { id: id, ...location.query } })
        }
      })
    },
  },

  effects: {
    * query({payload}, {call, put}) {
      let {roleType, id} = payload;
      if (!roleType || !ROLE_TYPES.includes(roleType)) {
        payload.roleType = roleType = ROLE_TYPES[0]; // default
      }
      if (id) {
        const data = yield call(queryShowUserRole, {id: id, role_type: roleType});
        if (data.success) {
          yield put({
            type: 'querySuccess',
            payload: {
              currentItem: data.role,
              roleType: roleType,
              saveMode: 'edit',
            },
          });
        } else {
          throw data;
        }
      } else {
        yield put({
          type: 'querySuccess',
          payload: {
            currentItem: {},
            roleType: roleType,
            saveMode: 'add',
          },
        });
      }
    },

    *create({ payload }, { select, call, put }) {
      const thisState = yield select(({ userRoleDetail }) => userRoleDetail);
      const data = yield call(createUserRole, {...payload, role_type: thisState.roleType});
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            currentItem: {
              ...data.role
            },
          },
        });
      } else {
        if (data.message) {
          let errorMessages = '';
          for (let key in data.message) {
            if (data.message.hasOwnProperty(key)) {
              for (let i = 0; i < data.message[key].length; i++) {
                errorMessages += (data.message[key][i]);
              }
            }
          }
          throw (errorMessages);
        } else {
          throw data;
        }
      }
      return data;
    },

    *update({ payload }, { select, call, put }) {
      const thisState = yield select(({ userRoleDetail }) => userRoleDetail);
      const data = yield call(updateUserRole, {...payload, role_type: thisState.roleType});
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            currentItem: {
              ...thisState.currentItem,
              name: payload.name,
              description: payload.description,
            },
          },
        });
      } else {
        if (data.message) {
          let errorMessages = '';
          for (let key in data.message) {
            if (data.message.hasOwnProperty(key)) {
              for (let i = 0; i < data.message[key].length; i++) {
                errorMessages += (data.message[key][i]);
              }
            }
          }
          throw (errorMessages);
        } else {
          throw data;
        }
      }
      return data;
    },
    *delete({ payload = {} }, { call, put, select }) {
      const data = yield call(deleteUserRole, { id: payload.id, role_type: payload.roleType });
      if (!data.success) {
        throw data;
      }
      return data;
    },
    *assignPermission({ payload = {} }, { call, put, select }) {
      const data = yield call(addPermissionToRole, payload);
      if (!data.success) {
        throw data;
      }
      const thisState = yield select(({ userRoleDetail }) => userRoleDetail);
      yield put({
        type: 'querySuccess',
        payload: {
          currentItem: {
            ...thisState.currentItem,
            permissionList: data?.role?.permissionList || [],
          },
        },
      });
      return data;
    },
    *removePermission({ payload = {} }, { call, put, select}) {
      const data = yield call(removePermissionFromRole, payload);
      if (!data.success) {
        throw data;
      }
      const thisState = yield select(({ userRoleDetail }) => userRoleDetail);
      yield put({
        type: 'querySuccess',
        payload: {
          currentItem: {
            ...thisState.currentItem,
            permissionList: data?.role?.permissionList || [],
          },
        },
      });
      return data;
    },
    *assignDefaultPermissions({ payload = {} }, { call, put, select }) {
      const data = yield call(addDefaultPermissionsToRole, payload);
      if (!data.success) {
        throw data;
      }
      const thisState = yield select(({ userRoleDetail }) => userRoleDetail);
      yield put({
        type: 'querySuccess',
        payload: {
          currentItem: {
            ...thisState.currentItem,
            permissionList: data?.role?.permissionList || [],
          },
        },
      });
      return data;
    },
    *getAllUserList({ payload = {} }, { call, put, select }) {
      const data = yield call(queryAllUserList, payload);
      if (!data.success) {
        throw data;
      }
      yield put({
        type: 'querySuccess',
        payload: {
          allUserList: data?.userList || [],
        },
      });
      return data;
    },
    *assignUsersToRole({ payload = {} }, { call, put, select }) {
      const data = yield call(assignUsersToRole, payload);
      if (!data.success) {
        throw data;
      }
      const thisState = yield select(({ userRoleDetail }) => userRoleDetail);
      yield put({
        type: 'query',
        payload: {
          id: thisState?.currentItem?.id,
          roleType: thisState?.roleType,
        },
      });
      return data;
    },
  },

  reducers: {
    querySuccess(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
  },
}
