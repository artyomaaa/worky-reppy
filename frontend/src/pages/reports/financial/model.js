import modelExtend from 'dva-model-extend';
import {checkDateTimeFormat, pathMatchRegexp} from 'utils';
import api from 'api';
import {pageModel} from 'utils/model';
import moment from 'utils/moment';
import {END_DATE_TIME_FORMAT, START_DATE_TIME_FORMAT} from 'utils/constant';

const {
  queryReportFinancialList,
  queryReportProjectList,
  exportFinancialReportList
} = api;

export default modelExtend(pageModel, {
  namespace: 'reportsFinancial',
  state: {
    currentItem: {},
    list: [],
    reportsGroupByProjects: [],
    reportsByProjects: [],
    projects: [],
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/financial', location.pathname)) {
          const payload = location.query || {page: 1, pageSize: 10};

          dispatch({
            type: 'query',
            payload,
          })
        }
      })
    },
  },
  effects: {
    * query({payload = {}}, {call, put}) {

      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const reportList = yield call(queryReportFinancialList, payload);
      const {reportProjects} = reportList;

      const projectList = yield call(queryReportProjectList, {});
      const {projects} = projectList;

      if (reportProjects) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: reportProjects.data,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: reportProjects.total,
            },
            projects
          }
        });
      }
    },
    * export({payload = {}}, {call, put}) {
      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const reportList = yield call(exportFinancialReportList, payload);
      const {reportProjects} = reportList;

      return reportProjects ? reportProjects : [];
    },
    * resetState({payload = {}}, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          currentItem: {},
          list: [],
          reportsGroupByProjects: [],
          reportsByProjects: [],
          projects: []
        }
      });
    },
  },
  reducers: {
    showModal(state, {payload}) {
      return {...state, ...payload, modalVisible: true}
    },

    hideModal(state) {
      return {...state, modalVisible: false}
    },
  },
})
