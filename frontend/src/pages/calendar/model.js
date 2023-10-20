import {pathMatchRegexp} from 'utils';
import api from 'api';
import store from 'store';
import moment from 'utils/moment';

const {
  checkGoogleCalendarConnection,
  queryGoogleAuthUrl,
  queryFullCalendar,
  removeGoogleCalendarToken,
  startWorkFromFullCalendar,
  stopWorkFromFullCalendar,
  addEventForFullCalendar,
  updateEventForFullCalendar,
} = api;

export default {
  namespace: 'userFullCalendar',

  state: {
    checkGoogleCalendar: {},
    calendarData: [],
    calendarUser: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/calendar', location.pathname);
        const userId = location?.query?.userId ? parseInt(location?.query?.userId) : store?.get('user')?.id;
        if (match && userId) {
          dispatch({ type: 'query', payload: { id: userId, ...location.query } });
        }
      })
    },
  },

  effects: {
    * query({payload}, {put, select}) {
      let {calendarUser} = yield select(_ => _.userFullCalendar);
      if (!payload.userId && calendarUser.id && payload.id !== calendarUser.id) { // different users situation
        yield put({
          type: 'queryFullCalendar',
          payload: {
            userId: payload?.id,
            start_date_time: moment().clone().startOf('month').format('YYYY-MM-DD'),
            end_date_time: moment().clone().endOf('month').format('YYYY-MM-DD'),
            view_items: ['google', 'tasks', 'todos'],
          },
        });
      }

      yield put({
        type: 'checkGoogleCalendarConnection',
        payload: {
          userId: payload?.id
        },
      });
    },
    * checkGoogleCalendarConnection({payload}, {call, put}) {
      const gcTokenExists = store.get('gcte');
      const googleCalendarTokenExists = gcTokenExists && typeof gcTokenExists === 'object' && gcTokenExists.includes(payload.userId.toString());
      if (googleCalendarTokenExists) { // maybe need to check
        yield put({
          type: 'querySuccess',
          payload: {
            checkGoogleCalendar: {
              success: true,
              message: "Success",
              statusCode: 200,
              status: true,
              googleCalendarConnected: true,
              userId: payload.userId
            }
          },
        })
        return;
      }
      const data = yield call(checkGoogleCalendarConnection, {id: payload.userId});
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            checkGoogleCalendar: data
          },
        });
        if (data.googleCalendarConnected){
          if (gcTokenExists && typeof gcTokenExists === 'object') {
            store.set('gcte', [...gcTokenExists, payload.userId.toString()]);
          }else{
            store.set('gcte', [payload.userId.toString()]);
          }
        }
      } else {
        throw data;
      }
    },
    * getGoogleAuthUrl({payload}, {call, put}) {
      store.remove('gcuId'); // removing previous google calendar user id
      const data = yield call(queryGoogleAuthUrl, {id: payload.userId});
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            googleCalendarAuthData: data
          },
        });
        store.set('gcuId', payload.userId); // google calendar user id
      } else {
        throw data;
      }
      return data;
    },
    * queryFullCalendar({payload}, {call, put}){
      const data = yield call(queryFullCalendar, payload);
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            calendarData: data.events,
            calendarUser: data.user,
          },
        });
      } else {
        throw data;
      }
      return data;
    },
    * disconnectGoogleCalendar({payload}, {call, put}){
      const data = yield call(removeGoogleCalendarToken, {id: payload?.userId});
      if (data.success) {
        const gcTokenExists = store.get('gcte');
        if (gcTokenExists) {
          const index = gcTokenExists.indexOf(payload?.userId?.toString());
          if (index > -1) {
            gcTokenExists.splice(index, 1); // removing item from store
            store.set('gcte', gcTokenExists);
          }
        }
        yield put({
          type: 'querySuccess',
          payload: {
            checkGoogleCalendar: {
              success: true,
              message: "Success",
              statusCode: 200,
              status: true,
              googleCalendarConnected: false,
              userId: payload?.userId
            }
          },
        });
      } else {
        throw data;
      }
      return data;
    },
    * startWork({payload}, {call}){
      const data = yield call(startWorkFromFullCalendar, payload);
      if (!data.success) {
        throw data;
      }
      return data;
    },
    * stopWork({payload}, {call}){
      const data = yield call(stopWorkFromFullCalendar, payload);
      if (!data.success) {
        throw data;
      }
      return data;
    },
    * addEvent({payload}, {call}){
      const data = yield call(addEventForFullCalendar, payload);
      if (!data.success) {
        throw data;
      }
      return data;
    },
    * updateEvent({payload}, {call}){
      const data = yield call(updateEventForFullCalendar, payload);
      if (!data.success && data.statusCode !== 200) {
        throw data;
      }
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
