import React, { PureComponent } from 'react';
import { withI18n } from '@lingui/react';
import {Input, Checkbox} from 'antd';
import style from './DemoForm.less';
import {Form} from "@ant-design/compatible";

const FormItem = Form.Item;



@withI18n()
@Form.create()
class DemoForm extends PureComponent {


  render() {
    const { form, i18n } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={style['demo-form']}>
        <Form>
          <FormItem
            label="First Name">
            {getFieldDecorator('firstName', {
              rules: [
                {
                  required: true,
                  message: i18n.t`Name is required`,

                },
                {
                  pattern: /^[^0-9\s-*\/=;'":,`!@#$%^&()\[\]\{\}\\\|<>+_՞»«՜։]*$/,
                  message: i18n.t`Name must contain only letters`,
                },
                {
                  max: 70,
                },
              ],
            })(<Input
              className={style['demo-form-input']} />)}
          </FormItem>
          <FormItem
            label="Last Name">
            {getFieldDecorator('lastName', {
              rules: [
                {
                  required: true,
                  message: i18n.t`Last name is required`,

                },
                {
                  max: 70,
                },
              ],
            })(<Input
              className={style['demo-form-input']} />)}
          </FormItem>
          <FormItem
            label="Company Name">
            {getFieldDecorator('companyName', {
              rules: [
                {
                  required: true,
                  message: i18n.t`Company name is required`,

                },
                {
                  max: 70,
                },
              ],
            })(<Input
              className={style['demo-form-input']} />)}
          </FormItem>
          <FormItem
            label="Work Name"
          >
            {getFieldDecorator('email', {
              rules: [
                {
                  required: true,
                  message: i18n.t`E-mail is required!`,
                },
                {
                  type: 'email',
                  message: i18n.t`The E-mail is not valid!`,
                },
              ],
            })(<Input className={style['demo-form-input']} />)}
          </FormItem>
          <FormItem
            label="Phone">
            {getFieldDecorator('phone', {
              rules: [
                {
                  required: true,
                  message: i18n.t`Phone number is required!`,
                },
                {
                  pattern: /^\d+$/,
                  message: `Phone number must be only numbers`,
                },
                {
                  min: 9,
                  max: 20,
                },
              ],
            })(<Input
              className={style['demo-form-input']} />)}
          </FormItem>
          <FormItem
            label="Country">
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: i18n.t`Country name is required`,

                },
                {
                  max: 70,
                },
              ],
            })(<Input
              className={style['demo-form-input']} />)}
          </FormItem>
          <Checkbox>I confirm that i have read and agree to the outreach terms & conditions and privacy policy </Checkbox>
          <div className={style['action-block']}>
            <button
              className="app-btn primary-btn"
            >
              Get A Demo
            </button>
          </div>
        </Form>
      </div>
    )
  }
}

export default DemoForm;
