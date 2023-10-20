import api from 'api';
import { router } from 'utils'
import {message} from "antd";
import modelExtend from "dva-model-extend";
import {pageModel} from 'utils/model';

const { userRegistration } = api;

export default modelExtend(pageModel, {
  namespace: 'registration',

  state: {
    current: 0
  },

  effects: {
    * NEXTPAGE({payload}, {call, put, select}) {
      try {
        yield put({type: 'querySuccess', payload: {current: payload.current}});
      } catch (e) {}
    },
    * REGISTRATION({payload}, {put, call}) {
      try {
        const data = yield call(userRegistration, payload.formData);
        if (data.status) {
          message.success(data.message);
          router.push({
            pathname: '/login'
          });
        } else {
          message.error(data.message);
        }
      } catch (e) {
        message.error(e.message.email[0]);
        yield put({
          type: 'querySuccess',
          payload: {
            current: 0
          },
        })
      }
    },
    * PREVPAGE({payload}, {call, put, select}) {
      try {
        yield put({type: 'querySuccess', payload: {current: payload.current}});
      } catch (e) {}
    },

    * TOSELECTEDPAGE({payload}, {call, put, select}) {
      try {
        yield put({type: 'querySuccess', payload: {current: payload.current}});
      } catch (e) {}
    },

    * getFormData ({payload = {}}, {call, put, select}) {

    },
  },
})
