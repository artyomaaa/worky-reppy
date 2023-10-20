import axios from 'axios';
import store from 'store';
import { cloneDeep } from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { message } from 'antd';
import { CANCEL_REQUEST_MESSAGE, UNAUTHORIZED_REQUEST_MESSAGE } from 'utils/constant';

const { CancelToken } = axios;
window.cancelRequest = new Map();

export const getLanguage = () => {
  let _lang = store.get('lang');
  if (!_lang) _lang = 'en';
  return _lang;
};

export const setAuthHeader = (access_data) => {
  axios.defaults.headers.common['X-Lang'] = getLanguage();
  if (access_data) {
    try {
      const {access_token, refresh_token, expires_in, token_type} = access_data;
      if (access_token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }
    }catch (e) {
      console.log('e.message', e.message);
    }
  }
};

const redirectToLogin = () => {
  store.clearAll();
  window.location.href = '/login';
}

export default function request(options) {
  let { data, url, config, method = 'GET' } = options;
  const cloneData = cloneDeep(data);
  const urlMatch = url.match(/[a-zA-z]+:\/\/[^/]*/);
  let domain = '';
  if (urlMatch) {
    [domain] = urlMatch;
    url = url.slice(domain.length)
  }

  try {
    const match = pathToRegexp.parse(url);
    url = pathToRegexp.compile(url)(data);

    for (const item of match) {
      if (item instanceof Object && item.name in cloneData) {
        delete cloneData[item.name]
      }
    }
    url = domain + url
  } catch (e) {
    message.error(e.message)
  }
  const access_data = store.get('access_data');

  if(Object.keys(config).length > 0) {
    for (const key in config) {
      options[key] = config[key];
    }
  }

  if(method === "GET") {
    options.params = cloneData;
  }
  options.url = url;
  options.cancelToken = new CancelToken(cancel => {
    window.cancelRequest.set(Symbol(Date.now()), {
      pathname: window.location.pathname,
      cancel,
    })
  });

  // Set the initial header from storage or something (should surround with try catch in actual app)
  setAuthHeader(access_data);

  return axios(options)
    .then(response => {
      if (!response) redirectToLogin();
      const { statusText, status, data } = response;

      if (data?.forbidden) {
        const logOutUrl = domain + '/api/auth/logout';
        axios({
          method: 'get',
          url: logOutUrl
        }).then(response => {
          if (response?.data?.status) {
            store.clearAll();
            store.set('forbidden', true);
            location.href = '/login';
          } else {
            throw response?.data
          }
        });
      }

      let result = {};
      if (typeof data === 'object') {
        result = data;
        if (Array.isArray(data)) {
          result.list = data
        }
      } else {
        result.data = data
      }

      return Promise.resolve({
        success: data.status !== undefined ? data.status : true,
        message: statusText,
        statusCode: status,
        ...result,
      })
    })
    .catch(error => {
      const { response, message } = error;
      if (!response && String(message) !== CANCEL_REQUEST_MESSAGE) redirectToLogin();
      if (String(message) === CANCEL_REQUEST_MESSAGE
        || (response.status === 401 && (!response.statusText || response.statusText === UNAUTHORIZED_REQUEST_MESSAGE))) {

        if (String(message) !== CANCEL_REQUEST_MESSAGE && !response?.config?.url?.endsWith('/api/user')) setTimeout(() =>  redirectToLogin(), 1000);

        return {
          success: false,
          message: UNAUTHORIZED_REQUEST_MESSAGE,
        }
      }

      let msg;
      let statusCode;

      if (response && response instanceof Object) {
        const { data, statusText } = response;
        statusCode = response.status;
        msg = data.message || statusText;
      } else {
        statusCode = 600;
        msg = error.message || 'Network Error'
      }

      /* eslint-disable */
      return Promise.reject({
        success: false,
        statusCode,
        message: msg,
      })
    })
}
