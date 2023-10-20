import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import store from 'store';
import { connect } from 'dva';
import {Button, Input, message, Checkbox} from 'antd';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Trans, withI18n } from '@lingui/react';
import { setLocale } from 'utils';
import {addLangPrefix} from 'utils';
import config from 'utils/config';
import Brand from 'shared/UIElements/Brand';
import Navlink from "umi/navlink";
const FormItem = Form.Item;

@withI18n()
@connect(({ loading }) => ({ loading }))
@Form.create()
class Login extends PureComponent {

  handleOk = () => {
    const { dispatch, form } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      dispatch({ type: 'login/login', payload: values })
    })
  };


  render() {
    const { form, i18n } = this.props;
    const { getFieldDecorator } = form;

    let footerLinks = [];
    let forbidden =  store.get('forbidden');

    if (forbidden) {
      message.error(i18n.t`Your account is inactive`);
      store.remove('forbidden');
    }

    if (config.i18n) {
      footerLinks = footerLinks.concat(
        config.i18n.languages.map(item => ({
          key: item.key,
          title: (
            <span onClick={setLocale.bind(null, item.key)}>{item.title}</span>
          ),
        }))
      )
    }

    return (
      <>
        <div className="user-layout">
          <div className="card">
            <div className="logo">
              <Brand width="54px"
                     height="54px"
              />
              <span className="logo-title">Worky-Reppy</span>
            </div>
            <div className="content">
              <h2>Welcome to</h2>
              <h1>{config.siteName}</h1>
              <Form>
                <FormItem
                  className={`form-input`}
                  label={i18n.t`Email Address`}
                >
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Email is required`
                      },
                      {
                        type: 'email',
                        message: i18n.t`Email is not valid`

                      }
                    ],
                  })(
                    <Input
                      onPressEnter={this.handleOk}
                    />
                  )}
                </FormItem>
                <FormItem
                  className={`form-input`}
                  label={i18n.t`Password`}
                >
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Password is required`

                      },
                    ],
                  })(
                    <Input
                      type="password"
                      onPressEnter={this.handleOk}
                    />
                  )}
                </FormItem>
                <div className="actions mb-0">
                  <Checkbox className="form-checkbox">Remember Me</Checkbox>
                  <span className="forgot-pass">
                    <Navlink tabIndex="-1" to={addLangPrefix('/password/forgot')}>{i18n.t`forgot_password`}</Navlink>
                  </span>
                </div>
                <div>
                  <button
                    className="app-btn primary-btn w-100"
                    onClick={this.handleOk}
                  >
                    <Trans>Login</Trans>
                  </button>
                </div>
              </Form>
              <div className="link-button">
                <span>or</span>
                <Navlink tabIndex="-1" to={addLangPrefix('/signup')}>SIGN UP</Navlink>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

Login.propTypes = {
  form: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default Login;
