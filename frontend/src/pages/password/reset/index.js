import React, { PureComponent }from "react";
import PropTypes from 'prop-types';
import {Input} from 'antd';
import {Form} from '@ant-design/compatible';
import {withI18n} from '@lingui/react';
import Brand from 'shared/UIElements/Brand'
import {connect} from "dva";
const FormItem = Form.Item;

@withI18n()
@connect(({ loading }) => ({ loading }))
@Form.create()
class Reset extends PureComponent {

  resetPass = () => {
    const {dispatch, form} = this.props;
    const {validateFieldsAndScroll} = form;
    validateFieldsAndScroll((errors, values) => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const token = urlParams.get('token');
      const email = urlParams.get('email');
      if (token) {
        const data = {
          token,
          password: values.newPassword,
          password_confirmation: values.confirmPassword,
          email
        }
        dispatch({type: 'reset/RESET', payload: data})
      }
    })
  };

  render() {
    const {form, i18n} = this.props;
    const {getFieldDecorator} = form;

    return (
      <>
        <div className="user-layout new-password">
          <div className="card">
            <div className="logo">
              <Brand width="70px"
                     height="70px"
              />
            </div>
            <div className="content">
              <h1>{i18n.t`create_new_password`}</h1>
              <p>{i18n.t`your_new_password`}</p>
              <Form>
                <FormItem
                  className='form-input'
                  label={i18n.t`new_password`}
                >
                  {getFieldDecorator('newPassword', {
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Password is required`

                      },
                    ],
                  })(
                    <Input
                      type="password"
                    />
                  )}
                </FormItem>
                <FormItem
                  className='form-input'
                  label={i18n.t`confirm_password`}
                >
                  {getFieldDecorator('confirmPassword', {
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Confirm Password is required`
                      },
                    ],
                  })(
                    <Input
                      type="password"
                    />
                  )}
                </FormItem>
                <div>
                  <button
                    className="app-btn primary-btn w-100"
                    onClick={this.resetPass}
                  >
                    {i18n.t`change_password`}
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

Reset.propTypes = {
  form: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default Reset;
