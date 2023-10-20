import modelExtend from 'dva-model-extend';
import { pathMatchRegexp } from 'utils';
import api from 'api';
import { pageModel } from 'utils/model';
import moment from 'utils/moment';
import {checkDateTimeFormat, fnReportsProjectsNormalize, fnReportsWorksNormalize} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';

const {
  queryReportList,
  queryReportProjectList,
  queryReportTeamList,
  queryReportUserList,
  queryReportProjectWorkList,
  exportSummaryReportList,
} = api;

export default modelExtend(pageModel, {
  namespace: 'reportsSummary',

  state: {
    currentItem: {},
    list: [],
    reportsGroupByProjects: [],
    reportsByProjects: [],
    teams: [],
    projects: [],
    users: [],
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/summary', location.pathname)) {
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

      const reportList = yield call(queryReportList, payload);
      const {reports, reportsForBarChart, totalDuration } = reportList;
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
            list: [...reports],
            reportsGroupByProjects: fnReportsProjectsNormalize(reports),
            reportsForBarChart: fnReportsProjectsNormalize(reportsForBarChart),
            totalDuration,
            projects,
            teams,
            users,
          }
        });
      }
    },
    *projectWorkList({ payload = {} }, { call, put, select }) {

      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const { reportsGroupByProjects } = yield select(_ => _.reportsSummary);

      const workList = yield call(queryReportProjectWorkList, payload);
      const {works} = workList;
      const _reportsGroupByProjects = reportsGroupByProjects.map((item, i) => {
        if (item.project_id === payload.project_id) {
          item.children = fnReportsWorksNormalize(works);
        }
        return item;
      });

      if (works) {
        yield put({
          type: 'querySuccess',
          payload:{
            reportsGroupByProjects: _reportsGroupByProjects
          }
        });
      }
    },
    *resetState({ payload = {} }, { put }) {
      yield put({
        type: 'updateState',
        payload:{
          currentItem: {},
          list: [],
          reportsGroupByProjects: [],
          reportsByProjects:[],
          teams: [],
          projects: [],
          users: [],
        }
      });
    },
    *export({payload = {}}, {call, put}) {
      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const reportList = yield call(exportSummaryReportList, payload);
      const {reportProjects} = reportList;

      return reportProjects ? reportProjects : [];
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
