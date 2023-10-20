import modelExtend from 'dva-model-extend';
import api from 'api';
import {pageModel} from 'utils/model';
import {pathMatchRegexp, checkDateTimeFormat} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';
import moment from 'utils/moment';

const {
  queryReportEfforts,
  queryReportTeamList,
  queryReportProjectList,
  queryReportUserList
} = api;

export default modelExtend(pageModel, {
  namespace: 'reportsEfforts',
  state: {
    list: [],
    teams: [],
    projects: [],
    users: [],
    firstLoad: true,
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/efforts', location.pathname)) {
          const payload  = location.query && Object.keys(location.query).length === 0 ? {page: 1, pageSize: 12, status: '1'} : location.query;
          dispatch({
            type: 'query',
            payload,
          })
        }
      })
    },
  },
  effects: {
    * query({payload = {}}, {call, put, select}) {
      if (!payload.start_date_time || (payload.start_date_time && !checkDateTimeFormat(payload.start_date_time, START_DATE_TIME_FORMAT))) {
        payload.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      }

      if (!payload.end_date_time || (payload.end_date_time && !checkDateTimeFormat(payload.end_date_time, END_DATE_TIME_FORMAT))) {
        payload.end_date_time = moment().format(END_DATE_TIME_FORMAT);
      }

      const resp = yield call(queryReportEfforts, payload);
      const {reports, status} = resp;
      const _payload = {
        list: reports,
        firstLoad: false,
      };
      if (status) {
        const {firstLoad} = yield select(_ => _.reportsEfforts);
        if (firstLoad) {
          const teamList = yield call(queryReportTeamList, {});
          _payload.teams = teamList.teams;
          const projectList = yield call(queryReportProjectList, {});
          _payload.projects = projectList.projects;
          const userList = yield call(queryReportUserList, {});
          _payload.users = userList.users;
        }
      }

      if (reports) {
        yield put({
          type: 'querySuccess',
          payload: _payload
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
      payload.isExport = 1; // important

      const reportList = yield call(queryReportEfforts, payload);
      const {reports} = reportList;

      return reports ? reports : [];
    },
    * resetState({payload = {}}, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          list: [],
          teams: [],
          projects: [],
          users: [],
        }
      });
    },
  },
  reducers: {

  },
})
