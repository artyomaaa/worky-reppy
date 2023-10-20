import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {Input} from 'antd';
import { Form } from '@ant-design/compatible';
import { Trans, withI18n } from '@lingui/react';
import {addLangPrefix} from 'utils';
import Icons from 'icons/icon';
import Brand from 'shared/UIElements/Brand';
import Navlink from "umi/navlink";
const FormItem = Form.Item;

@withI18n()
@connect(({ loading }) => ({ loading }))
@Form.create()
class Forgot extends PureComponent {

  sendOk = () => {
    const {dispatch, form} = this.props;
    const {validateFieldsAndScroll} = form;
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      dispatch({type: 'forgot/FORGOT', payload: {email: values.sendEmail}})
    })
  };


  render() {
    const { form, i18n } = this.props;
    const { getFieldDecorator } = form;


    return (
      <>
        <div className="user-layout forgot-password">
          <div className="card">
            <div className="go-back">
              <Navlink tabIndex="-1" to={addLangPrefix('/login')}>
                <Icons name="arrowLeft"/>
                <span>{i18n.t`back_to_home`}</span>
              </Navlink>
            </div>
            <div className="logo">
              <Brand width="70px"
                     height="70px"
              />
            </div>
            <div className="content">
              <h1>{i18n.t`forgot_password`}</h1>
              <p>{i18n.t`enter_your_registered_email`}</p>
              <Form>
                <FormItem
                  className="form-input"
                  label={i18n.t`Email Address`}
                >
                  {getFieldDecorator('sendEmail', {
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
                    />
                  )}
                </FormItem>
                <div>
                  <button
                    type="button"
                    className="app-btn primary-btn w-100"
                    onClick={this.sendOk}
                  >
                    <Trans>Send</Trans>
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </>
    )
  }
}

Forgot.propTypes = {
  form: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default Forgot;
