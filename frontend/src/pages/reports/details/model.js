import modelExtend from 'dva-model-extend';
import { pathMatchRegexp } from 'utils';
import api from 'api';
import { pageModel } from 'utils/model';
import moment from 'utils/moment';
import {checkDateTimeFormat, fnReportsGroupByProjects} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';

const {
  queryReportDetailsList,
  queryReportProjectList,
  queryReportTeamList,
  queryReportUserList,
  exportDetailsReportList,
} = api;

export default modelExtend(pageModel, {
  namespace: 'reportsDetails',

  state: {
    currentItem: {},
    list: [],
    teams: [],
    projects: [],
    users: [],
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/details', location.pathname)) {
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

      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const reportList = yield call(queryReportDetailsList, payload);
      const {reports} = reportList;
      const {totalDuration, teamUsersData, projectsTotalDuration} = reportList;

      const projectList = yield call(queryReportProjectList, {});
      const {projects} = projectList;

      const teamList = yield call(queryReportTeamList, {});
      const {teams} = teamList;

      const userList = yield call(queryReportUserList, {});
      const {users} = userList;

      if (reports) {
        yield put({
          type: 'querySuccess',
          payload:{
            list: reports.data,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: reports.total,
            },
            projects,
            teams,
            users,
            totalDuration,
            teamUsersData,
            projectsTotalDuration,
          }
        });
      }
    },
    *export({payload = {}}, {call, put}) {
      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const reportList = yield call(exportDetailsReportList, payload);
      const {reportProjects} = reportList;

      return reportProjects ? reportProjects : [];
    },
    *resetState({ payload = {} }, { put }) {
      yield put({
        type: 'updateState',
        payload:{
          currentItem: {},
          list: [],
          teams: [],
          projects: [],
          users: [],
          totalDuration: null,
        }
      });
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
