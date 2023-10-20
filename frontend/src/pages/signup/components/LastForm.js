import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Button, Checkbox, Input} from 'antd';
import Icons from 'icons/icon';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { withI18n, Trans } from '@lingui/react';
import Navlink from 'umi/navlink';
import {addLangPrefix} from 'utils';
import styles from '../index.less';

const FormItem = Form.Item;


@withI18n()
@connect(({ loading }) => ({ loading }))
@Form.create()
class LastForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      validate: '',
      checked: false,
      checkboxErrorMessage:false
    };
    this.handleChange = this.handleChange.bind(this);
    this.formData = {}
  }
  handleChange(event) {
    this.setState({checked: !this.state.checked});
  }
  sendFormData = (data) => {
    this.props.getFormData(data);
  };

  compareToFirstPassword = (rule, value, callback) => {
    const {form, i18n} = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(i18n.t`Passwords inconsistent`);
    }
    callback();
  };

  validateToNextPassword = (rule, value, callback) => {
    const {form,i18n} = this.props;
    if (value && value.length < 8) {
      callback(i18n.t`Password length`);
    }
    callback();
  };

  checkboxErrorMessage = (rule, value, callback) => {
    const {i18n} = this.props;
    if (value !== true) {
      callback(i18n.t`Confirm checkbox`);
    }
    callback();
  };

  onSubmit = (event) => {
    event.preventDefault();
    const {sendData, form} = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        this.sendFormData(values)
        form.resetFields();
        sendData();
      }
    });
  }

  backToSecondForm = () => {
    const {dispatch} = this.props;
    dispatch({
      type: `registration/PREVPAGE`,
      payload: {current: 1}
    });
  };

  render() {
    const { form, i18n,userPassword } = this.props;
    const { validate } = this.state;
    const { getFieldDecorator } = form;
    return (
      <>
        <div className={styles['go-back']}>
          <a href="#">
            <Icons name="arrowLeft"/>
            <span onClick={this.backToSecondForm}>{i18n.t`Back`}</span>
          </a>
        </div>
        <Form onSubmit={this.onSubmit} noValidate={true}>
          <FormItem
            className={`form-input ${validate}`}
            label={i18n.t`Password`}
          >
            {getFieldDecorator('password', {
              initialValue: userPassword.password ? userPassword.password : '',
              rules: [
                {
                  required: true,
                  message: i18n.t`Password is required`
                },
                {
                  validator: this.validateToNextPassword,
                },
              ],
            })(
              <Input.Password
               suffix={!validate ? '' : (validate === 'error' ?
                  <Icons name="error"/> : <Icons name="success"/>)}
              />
            )}
          </FormItem>
          <FormItem
            className={`form-input ${validate}`}
            label={i18n.t`Confirm Password`}
          >
            {getFieldDecorator('passwordConfirm', {
              initialValue: userPassword.passwordConfirm ? userPassword.passwordConfirm : '',
              rules: [
                {
                  required: true,
                  message: i18n.t`Confirm Password is required`
                },
                {
                  validator: this.compareToFirstPassword,
                },
              ],
            })(
              <Input.Password
                suffix={!validate ? '' : (validate === 'error' ?
                  <Icons name="error"/> : <Icons name="success"/>)}
              />
            )}
          </FormItem>
          <FormItem
            className={`form-input ${validate}`}
          >
            {getFieldDecorator('confirmCheckbox', {
              initialValue: this.state.checked,
              rules: [
                {
                  required: true,
                  message: i18n.t`Confirm checkbox`
                },
                {
                  validator: this.checkboxErrorMessage,
                },
              ],
            })(
              <Checkbox
                checked={this.state.checked}
                onChange={this.handleChange}
                className="form-checkbox"
              >
                {i18n.t`I confirm that i have read and agree to the outreach`}{" "}
                <Navlink tabIndex="-1" className="underline" to={addLangPrefix('/privacypolicy')} >
                    <Trans>terms & conditions</Trans>
                </Navlink>
                {" "}{i18n.t`and privacy policy`}
              </Checkbox>
            )}
          </FormItem>
          <button
            type="submit"
            className="app-btn primary-btn w-100"
          >
            {i18n.t`next`}
          </button>
        </Form>
      </>
    )
  }
}

export default LastForm;
