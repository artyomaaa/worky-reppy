import React, { PureComponent } from 'react';
import {Button, Input} from 'antd';
import Icons from 'icons/icon';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { withI18n } from '@lingui/react';
const FormItem = Form.Item;


@withI18n()
@Form.create()
class FirstForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      validate: ''
    };
  }
  sendFormData = (data) => {
    this.props.getFormData(data);
  };

  onSubmit = (event) => {
    event.preventDefault();
    const {form} = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        this.sendFormData(values)
        form.resetFields();
      }
    });
  }

  render() {
    const { form, i18n, emailData} = this.props;
    const { validate} = this.state;
    const { getFieldDecorator } = form;

    return (
      <>
        <Form  onSubmit={this.onSubmit} noValidate={true}>
          <FormItem
            className={`form-input ${validate}`}
            label={i18n.t`Email Address`}
          >
            {getFieldDecorator('email', {
              initialValue: emailData ? emailData : '',
              rules: [
                {
                  required: true,
                  message: i18n.t`Email Address is required`
                },
                {
                  type: 'email',
                  pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g,
                  message: i18n.t`Email Address is not valid`

                },
              ],
            })(
              <Input
                suffix={!validate ? <span/> : (validate === 'error' ? <Icons name="error"/> : <Icons name="success"/>)}
              />
            )}
          </FormItem>
          <button
            type="submit"
            className="app-btn primary-btn w-100 btn-next"
            >
            {i18n.t`next`}
          </button>
        </Form>
      </>
    )
  }
}

export default FirstForm;
