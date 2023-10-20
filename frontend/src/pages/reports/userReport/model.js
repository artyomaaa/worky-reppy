import modelExtend from 'dva-model-extend';
import api from 'api';
import {pageModel} from 'utils/model';
import moment from 'utils/moment';
import {END_DATE_TIME_FORMAT, START_DATE_TIME_FORMAT} from 'utils/constant';
import {checkDateTimeFormat, pathMatchRegexp} from 'utils';

const {
  queryUserReportList,
  queryReportProjectList,
  queryReportUserList
} = api;

export default modelExtend(pageModel, {
  namespace: 'UserReport',
  state: {
    currentItem: {},
    list: [],
    reportsGroupByUsers: [],
    reportsByProjects: [],
    projects: [],
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/userReport', location.pathname)) {
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

      const reportList = yield call(queryUserReportList, payload);
      const {reports, groupedProjects, totalCountofProject} = reportList;
      const projectList = yield call(queryReportProjectList, {});
      const {projects} = projectList;

      const userList = yield call(queryReportUserList, {});
      const {users} = userList;
      if (reports) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: reports,
            totalCountofProject: totalCountofProject,
            groupedProjects: groupedProjects,
            projects,
            users,
          }
        });
      }
    },
    * resetState({payload = {}}, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          currentItem: {},
          list: [],
          reportsGroupByUsers: [],
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
