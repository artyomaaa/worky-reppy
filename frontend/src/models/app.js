/* global window */

import { router, getLoggedUserPermissions } from 'utils';
import { ROUTE_LIST } from 'utils/constant';
import { stringify } from 'qs';
import store from 'store';
// import { ROLE_TYPE } from 'utils/constant';
import { queryLayout, pathMatchRegexp } from 'utils';
import { CANCEL_REQUEST_MESSAGE } from 'utils/constant';
import api from 'api';
import config from 'config';
import {Trans, withI18n} from "@lingui/react";

const { queryRouteList, logoutUser, queryUserInfo } = api;

const goDashboard = () => {
  if (pathMatchRegexp(['/', '/login'], window.location.pathname)) {
    router.push({
      pathname: '/dashboard',
    })
  }
};

export default {
  namespace: 'app',
  state: {
    routeList: [
      {
        id: '1',
        icon: 'laptop',
        name: 'Dashboard',
        zhName: '仪表盘',
        router: '/dashboard',
      },
    ],
    locationPathname: '',
    locationQuery: {},
    theme: store.get('theme') || 'light',
    collapsed: store.get('collapsed') || false,
    notifications: [
      {
        title: <Trans>New User is registered.</Trans>,
        date: new Date(Date.now() - 10000000),
      },
      {
        title: <Trans>Application has been approved.</Trans>,
        date: new Date(Date.now() - 50000000),
      },
    ],
  },
  subscriptions: {
    setup({ dispatch }) {
      if (queryLayout(config.layouts, window.location.pathname) !== 'public'){
        dispatch({ type: 'query' });
      }
    },
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: location.query,
          },
        })
      })
    },

    setupRequestCancel({ history }) {
      history.listen(() => {
        const { cancelRequest = new Map() } = window;

        cancelRequest.forEach((value, key) => {
          if (value.pathname !== window.location.pathname) {
            value.cancel(CANCEL_REQUEST_MESSAGE);
            cancelRequest.delete(key)
          }
        })
      })
    },
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const appVersion = store.get('appVersion');
      // store isInit to prevent query trigger by refresh
      const isInit = store.get('isInit');
      if (isInit && appVersion === config.appVersion) {
        goDashboard();
        return
      }
      const { locationPathname } = yield select(_ => _.app);
      let success = false;
      let user = {};
      if (payload?.fromModel || appVersion !== config.appVersion) {
        if (payload?.fromModel) delete payload.fromModel;

        const userInfo = yield call(queryUserInfo, payload);
        success = userInfo.success;
        user = userInfo.user;
      }
      if (success && user) {
        // const { permissions, roles } = user;
        // const { list } = yield call(queryRouteList);
        // let routeList = list;
        // if (
        //   permissions.role === ROLE_TYPE.ADMIN ||
        //   permissions.role === ROLE_TYPE.DEVELOPER
        // ) {
        //   permissions.visit = list.map(item => item.id)
        // } else {
        //   routeList = list.filter(item => {
        //     const cases = [
        //       permissions.visit.includes(item.id),
        //       item.mpid
        //         ? permissions.visit.includes(item.mpid) || item.mpid === '-1'
        //         : true,
        //       item.bpid ? permissions.visit.includes(item.bpid) : true,
        //     ];
        //     return cases.every(_ => _)
        //   })
        // }

        store.set('routeList', ROUTE_LIST);
        store.set('user', user);
        store.set('permissions', {
          visit: ["1","2","21", "10", "3","31","32","4","41","5","51","6","61","62","63","64","65","66","67","68","100"], // todo for test
          actions: getLoggedUserPermissions(user)
        });
        store.set('isInit', true);
        store.set('appVersion', config.appVersion);

        goDashboard();
      } else if (queryLayout(config.layouts, locationPathname) !== 'public') {
        router.push({
          pathname: '/'
        })
      }
    },

    *signOut({ payload }, { call, select }) {
      const data = yield call(logoutUser);
      if (data.success) {
        const { locationPathname } = yield select(_ => _.app);
        store.clearAll();
        router.push({
          pathname: '/',
          search: stringify({
            from: locationPathname,
          }),
        });

      } else {
        throw data
      }
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },

    handleThemeChange(state, { payload }) {
      store.set('theme', payload);
      state.theme = payload
    },

    handleCollapseChange(state, { payload }) {
      store.set('collapsed', payload);
      state.collapsed = payload
    },

    allNotificationsRead(state) {
      state.notifications = []
    },
  },
}
