import api from 'api';
import { router } from 'utils'
import {message} from "antd";

const { forgotPassword } = api;

export default {
  namespace: 'forgot',

  state: {},

  effects: {
    *FORGOT({ payload }, { call }) {
      const data = yield call(forgotPassword, payload);
      if (data.status) {
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
