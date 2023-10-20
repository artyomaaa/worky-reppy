import { router } from 'utils'
import api from 'api';
import {message} from "antd";

const { resetPassword} = api;

export default {
  namespace: 'reset',

  state: {},

  effects: {

    *RESET({ payload }, { put, call }) {
      const data = yield call(resetPassword, payload);
      if (data.success) {
        message.success(data.message);
        router.push({
          pathname: '/login'
        });
      } else {
        message.error(data.message);
      }
    },
  },
}
