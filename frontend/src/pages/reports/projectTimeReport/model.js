import modelExtend from 'dva-model-extend';
import api from 'api';
import {pageModel} from 'utils/model';
import moment from 'utils/moment';
import {END_DATE_TIME_FORMAT, START_DATE_TIME_FORMAT} from 'utils/constant';
import {checkDateTimeFormat, pathMatchRegexp} from 'utils';

const {
  queryReportProjectTimeList,
  queryReportProjectTimeExportData,
  queryReportProjectList,
  queryReportUserList
} = api;

export default modelExtend(pageModel, {
  namespace: 'projectTimeReport',
  state: {
    currentItem: {},
    list: [],
    projects: []
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/projectTimeReport', location.pathname)) {
          const payload = location.query || {page: 1, pageSize: 3};

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

      const reportList = yield call(queryReportProjectTimeList, payload);
      const {reports, status} = reportList;
      const _payload = {
        list: reports,
      }
      if (status) {
        const projectList = yield call(queryReportProjectList, {});
        const {projects} = projectList;
        _payload.projects = projects;

        const userList = yield call(queryReportUserList, {});
        const {users} = userList;
        _payload.users = users;
      }

      if (reports) {
        yield put({
          type: 'querySuccess',
          payload: _payload
        });
      }
    },
    * resetState({payload = {}}, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          currentItem: {},
          list: [],
          projects: []
        }
      });
    },
    * getExportData({payload = {}}, {call, select}) {
      const thisState = yield select(_ => _);
      const {routing} = thisState;
      const query = routing?.location?.query ?? {};
      const data = yield call(queryReportProjectTimeExportData, {
        ...payload,
        ...query
      });

      if (data.success) {
        return data;
      } else {
        throw data;
      }
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
