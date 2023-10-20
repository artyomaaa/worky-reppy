import modelExtend from 'dva-model-extend';
import {pathMatchRegexp} from 'utils';
import api from 'api';
import {pageModel} from 'utils/model';
import moment from 'utils/moment';
import {checkDateTimeFormat, fnReportsProjectsNormalize} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';

const {
  queryReportProjectsList,
  queryReportProjectList,
  queryReportUserList,
  queryReportProjectMemberList,
} = api;

export default modelExtend(pageModel, {
  namespace: 'projectReport',
  state: {
    list: [],
    reportsGroupByProjects: [],
    reportsByProjects: [],
    projects: [],
    users: [],
  },

  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/projectReport', location.pathname)) {
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
      const reportList = yield call(queryReportProjectsList, payload);
      const {reports, reportsForBarChart} = reportList;
      const projectList = yield call(queryReportProjectList, {});
      const {projects} = projectList;

      const userList = yield call(queryReportUserList, {});
      const {users} = userList;
      const memberList = yield call(queryReportProjectMemberList, payload);
      const {members, projectsOfUsers} = memberList;
      if (reports) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: [...reports],
            reportsGroupByProjects: fnReportsProjectsNormalize(reports),
            reportsForBarChart: fnReportsProjectsNormalize(reportsForBarChart),
            projects,
            users,
            members,
            projectsOfUsers
          }
        });
      }
    },
    * resetState({payload = {}}, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          list: [],
          reportsGroupByProjects: [],
          reportsByProjects: [],
          projects: [],
          users: [],
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
