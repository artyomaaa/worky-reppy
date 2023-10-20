import { router, pathMatchRegexp } from 'utils'
import api from 'api';
import store from 'store';

const { loginUser } = api;

export default {
  namespace: 'login',

  state: {},

  effects: {
    *login({ payload }, { put, call, select }) {
      const data = yield call(loginUser, payload);
      const { locationQuery } = yield select(_ => _.app);
      if (data.success) {
        store.set('access_data', data.data);
        const { from } = locationQuery;
        const getUserInfo = yield put({ type: 'app/query', payload: {fromModel: true} });
        getUserInfo.then(() => {
          if (from !== undefined && !pathMatchRegexp('/login', from)) {
            if (['', '/'].includes(from)) router.push('/dashboard');
            else router.push(from)
          } else {
            router.push('/dashboard')
          }
        });
      } else {
        throw data;
      }
    },
  },
}
