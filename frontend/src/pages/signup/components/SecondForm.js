import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Button, Input} from 'antd';
import Icons from 'icons/icon';
import { Form } from '@ant-design/compatible';
import PhoneInput from 'react-phone-input-2'
import '@ant-design/compatible/assets/index.css';
import { withI18n, Trans } from '@lingui/react';
import Navlink from "umi/navlink";
import styles from '../index.less';
const FormItem = Form.Item;


@withI18n()
@connect(({ loading }) => ({ loading }))
@Form.create()
class SecondForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      validate: '',
      phone: '',
      country: 'am',
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.country !== this.state.country) {
      this.setState({
        phoneNumber: null,
      })
    }
  }

  handleChangePhone = (value, country) => {
    this.setState({
      phone: value,
      country: country.countryCode,
    });
  }

  backToFirstForm = () => {
    const {dispatch,form} = this.props;
    form.validateFields((error, values) => {
      console.log('values',values)
    });
    dispatch({
      type: `registration/PREVPAGE`,
      payload: { current: 0 }
    });
  };

  render() {
    const { form, i18n, userData } = this.props;
    const { validate } = this.state;
    const { getFieldDecorator } = form;

    return (
      <>
        <div className={styles['go-back']}>
          <a href="#">
            <Icons name="arrowLeft"/>
            <span onClick={this.backToFirstForm}>{i18n.t`Back`}</span>
          </a>
        </div>
        <Form onSubmit={this.onSubmit} noValidate={true}>
          <FormItem
            className={`form-input ${validate}`}
            label={i18n.t`First Name`}>
            {getFieldDecorator('name', {
              initialValue: userData.name ? userData.name : '',
              rules: [
                {
                  required: true,
                  message: i18n.t`First Name is required`,

                },
                {
                  pattern: /^[^0-9\s-*\/=;'":,`!@#$%^&()\[\]\{\}\\\|<>+_՞»«՜։]*$/,
                  message: <span style={{display:"inline-block"}}>{i18n.t`First Name must contain only letters`}</span>,
                },
                {
                  max: 70,
                  message: <span style={{display:"inline-block"}}>{i18n.t`First Name cannot be longer than 70 characters.`}</span>,
                },
              ],
            })(<Input
              suffix={!validate ? <span/> : (validate === 'error' ? <Icons name="error"/> : <Icons name="success"/>)}/>)}
          </FormItem>
          <FormItem
            className={`form-input ${validate}`}
            label={i18n.t`Last Name`}>
            {getFieldDecorator('surname', {
              initialValue: userData.surname ? userData.surname : '',
              rules: [
                {
                  required: true,
                  message: i18n.t`Last Name is required`,

                },
                {
                  pattern: /^[^0-9\s-*\/=;'":,`!@#$%^&()\[\]\{\}\\\|<>+_՞»«՜։]*$/,
                  message: <span style={{display:"inline-block"}}>{i18n.t`Last Name must contain only letters`}</span>,
                },
                {
                  max: 70,
                  message: <span style={{display:"inline-block"}}>{i18n.t`Last Name cannot be longer than 70 characters.`}</span>,
                },
              ],
            })(<Input
              suffix={!validate ? <span/> : (validate === 'error' ? <Icons name="error"/> : <Icons name="success"/>)}/>)}
          </FormItem>
          <FormItem
            className={`form-input ${validate}`}
            label={i18n.t`Phone Number`}>
            {getFieldDecorator('phoneNumber', {
              initialValue: userData.phoneNumber ? userData.phoneNumber : '',
              rules: [
                {
                  required: true,
                  message: i18n.t`Phone Number is required`
                },
                {
                  pattern: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
                  message: i18n.t`Phone number length`,
                },
              ],
            })
            (
              <PhoneInput
                onChange={this.handleChangePhone}
                inputStyle={{width: '100%', paddingLeft: '55px'}}
                masks={{am: '(..) ..-..-..'}}
                specialLabel={null}
                country={this.state.country}
                inputClass="input-global-md color-black font-medium form-control"
              />)}
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

export default SecondForm;
