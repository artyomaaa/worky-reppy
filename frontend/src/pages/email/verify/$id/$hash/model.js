import { pathMatchRegexp } from 'utils';
import modelExtend from "dva-model-extend";
import { pageModel } from 'utils/model';
import api from 'api';
import store from 'store';

const { queryEmailVerify } = api;

export default modelExtend(pageModel, {
  namespace: 'emailVerify',
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(( {pathname, query} ) => {
        const match = pathMatchRegexp('/email/verify/:id/:hash', pathname);
        if (match) {
          dispatch({
            type: 'query',
            payload: {
              id: match[1],
              hash: match[2],
              expires: query?.expires || 0,
              signature: query?.signature || '',
            }
          });
        }
      })
    },
  },

  effects: {
    *query({ payload = {} }, { call, put }) {
      const data = yield call(queryEmailVerify, payload);
      if (data?.status) {
        const user = store.get('user');
        window.location.href = `/users/${user.id}`;
      } else {
        throw data
      }
    },
  },
  reducers: {

  },
})
