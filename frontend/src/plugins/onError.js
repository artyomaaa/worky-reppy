import { message } from 'antd';

export default {
  onError(e, a) {
    e.preventDefault();
    if (e.message) {
      if(typeof e.message === 'object') {
        for (const errKey in e.message) {
          message.error(e.message[errKey])
        }
        return
      }
      message.error(e.message)
    } else {
      /* eslint-disable */
      console.error(e)
    }
  },
}
