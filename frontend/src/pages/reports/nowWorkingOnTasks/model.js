import modelExtend from 'dva-model-extend';
import api from 'api';
import {pageModel} from 'utils/model';
import {pathMatchRegexp} from 'utils';

const {
  queryReportNowWorkingOnTasks,
  queryReportTeamList,
  queryReportProjectList,
  queryReportUserList
} = api;

export default modelExtend(pageModel, {
  namespace: 'reportsNowWorkingOnTasks',
  state: {
    list: [],
    teams: [],
    projects: [],
    users: [],
    workTimeTags: [],
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/reports/nowWorkingOnTasks', location.pathname)) {
          const payload = location.query || {page: 1, pageSize: 12};

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
      const resp = yield call(queryReportNowWorkingOnTasks, payload);
      const {reports, workTimeTags, status} = resp;
      let _payload = {
        list: reports,
        workTimeTags,
      };
      if (status) {
        const teamList = yield call(queryReportTeamList, {});
        const {teams} = teamList;
        _payload.teams = teams;

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
          list: [],
          teams: [],
          projects: [],
          users: [],
          workTimeTags: [],
        }
      });
    },
  },
  reducers: {

  },
})
