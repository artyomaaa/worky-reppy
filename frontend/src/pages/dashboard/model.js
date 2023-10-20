import modelExtend from 'dva-model-extend'
import api from 'api'
import { pathMatchRegexp, fnReportsProjectsNormalize } from 'utils'
import { pageModel } from 'utils/model'
import moment from 'utils/moment';
import {checkDateTimeFormat} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';
import store from "store";

const {
  queryDashboardReportList,
  queryGetMostTracked,
  queryGetActivities,
  stopWork,
  start,
  addGoogleCalendarToken,
  getWeeklyActivity,
  getUserProjects,
} = api;

export default modelExtend(pageModel, {
  namespace: 'dashboard',
  state: {
    list: [],
    reportsGroupByProjects: [],
    teamMember: [],
    users: [],
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/dashboard', location.pathname)) {
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
    *query({ payload = {} }, { call, put }) {
      const user = store.get('user');
      const userTimeOffset = user.time_offset ?? 0;
      let mostTrackedWorks = [];
      let mostTracked = [];

      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().utcOffset(userTimeOffset).startOf('isoWeek').format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().utcOffset(userTimeOffset).endOf('isoWeek').format(END_DATE_TIME_FORMAT);
      }

      if (!payload.teamMember) {
        payload.users = user.id;
        mostTrackedWorks = yield call(queryGetMostTracked, {id: user.id});
        mostTracked = mostTrackedWorks.mostTracked;
      }

      const reportList = yield call(queryDashboardReportList, payload);
      const {reports, reportsForBarChart, totalDuration} = reportList;

      const activityList = yield call(queryGetActivities, {users: payload.users, teamMember: payload.teamMember});
      const {activities} = activityList;

      const data = yield call(getWeeklyActivity,  payload);
      const {weeklyActivities} = data;

      const userProjectsData = yield call(getUserProjects,  payload);
      const { userAttachedProjects } = userProjectsData;

      if (reports) {
        yield put({
          type: 'querySuccess',
          payload:{
            list: reports,
            reportsGroupByProjects: fnReportsProjectsNormalize(reports),
            reportsForBarChart: fnReportsProjectsNormalize(reportsForBarChart),
            user,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: reports.length,
            },
            totalDuration,
            mostTracked,
            activities,
            weeklyActivities,
            userAttachedProjects
          }
        });
      }

      if (payload?.code && payload?.scope) {
        yield put({
          type: 'addGoogleCalendarToken',
          payload:{
            code: payload.code,
            scope: payload.scope,
          }
        });
      }
    },

    *addGoogleCalendarToken({ payload }, { call, put }) {
      const user = store.get('user');
      const userId = store.get('gcuId') || user?.id;
      let gcTokenExists = store.get('gcte'); // google Calendar Token Exists
      const googleCalendarTokenExists = gcTokenExists && typeof gcTokenExists === 'object' && gcTokenExists.includes(userId.toString());
      if (googleCalendarTokenExists) return;

      const data = yield call(addGoogleCalendarToken, {id: userId, code: payload?.code, scope: payload?.scope});
      if (data.success) {
        if (gcTokenExists && typeof gcTokenExists === 'object') {
          store.set('gcte', [...gcTokenExists, userId.toString()]);
        } else {
          store.set('gcte', [userId.toString()]);
        }
        yield put({
          type: 'userFullCalendar/querySuccess',
          payload: {
            checkGoogleCalendar: {
              success: true,
              message: "Success",
              statusCode: 200,
              status: true,
              googleCalendarConnected: true,
              userId: userId
            }
          },
        });
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

    *stop({ payload }, { call, put }) {
      const data = yield call(stopWork, payload);
      if (data.success) {
        yield put({
          type: 'query',
          payload: {page: 1, resetList: true},
        });
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

    *startNewWork({ payload }, { call, put }) {
      const data = yield call(start, payload);
      if (data.success) {
        yield put({
          type: 'query',
          payload: {page: 1, resetList: true},
        });
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
            reportsGroupByProjects: [],
            user: {},
            totalDuration: null,
            mostTracked: [],
            activities: [],
            teamMember: [],
            users: []
          }
        });
    },
  },
})
