import React from "react";
import styles from "../../style.less";
import {Button, ConfigProvider, Input, Form, Col, Select, Row} from "antd";
import PhoneInput from "react-phone-input-2";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {withI18n} from "@lingui/react";
import {CONTACT_TYPES} from 'utils/constant'
import {connect} from "dva";

const FormItem = Form.Item;
const mapStateToProps = ({userDetail}) => ({userDetail});

@withI18n()
@Form.create()
@connect(mapStateToProps)
class WorkNumberAndEmailForm extends React.Component {
  state = {
    matches: window.matchMedia("(min-width: 768px)").matches,
  };

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  getContactsUser = (contacts) => {
    const contactsUser = {};

    for (let i = 0; i < contacts.length; i++) {
      contactsUser[contacts[i]['name']] = contacts[i]['value'];
    }

    return contactsUser;
  }

  onSubmit = (event) => {
    event.preventDefault();
    const {form, onSubmit} = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        if (values.meta) {
          const _numberThreshold = Number(parseFloat(values.meta.threshold).toFixed(0)).toString();
          if (_numberThreshold !== "") {
            values.meta.threshold = _numberThreshold
          }
        }

        values.actionName = "timeAndEmail"
        values.workedEmailType = CONTACT_TYPES.email.workedEmail.type;
        values.workedEmailName = CONTACT_TYPES.email.workedEmail.name;
        values.workedNumberType = CONTACT_TYPES.phone.workedNumber.type;
        values.workedNumberName = CONTACT_TYPES.phone.workedNumber.name;
        values.personalNumberType = CONTACT_TYPES.phone.personalNumber.type;
        values.personalNumberName = CONTACT_TYPES.phone.personalNumber.name;
        values.otherPhoneNumberType = CONTACT_TYPES.phone.otherPhoneNumber.type;
        values.otherPhoneNumberName = CONTACT_TYPES.phone.otherPhoneNumber.name;
        values.homeNumberType = CONTACT_TYPES.phone.homeNumber.type;
        values.homeNumberName = CONTACT_TYPES.phone.homeNumber.name;
        values.extraNumberType = CONTACT_TYPES.phone.extraNumber.type;
        values.extraNumberName = CONTACT_TYPES.phone.extraNumber.name;
        values.personalEmailType = CONTACT_TYPES.email.personalEmail.type;
        values.personalEmailName = CONTACT_TYPES.email.personalEmail.name;
        values.extraNameType = CONTACT_TYPES.extraName.type;
        values.extraNameName = CONTACT_TYPES.extraName.name;
        onSubmit(values)
        form.resetFields();
      }
    });
  }
    render() {
    const {userDetail} = this.props;
    const {
        i18n,
        form,
        permissions: {
          viewContactAccess,
          editContactAccess,
        },
        userDetail: {contact_info}
      } = this.props,
      userContacts = (contact_info && contact_info?.contacts) ? this.getContactsUser(contact_info.contacts) : [],
      // {workEmail, workedNumber} = data,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM;

    return (
      <>
      {viewContactAccess &&
      <Form hideRequiredMark onSubmit={this.onSubmit} noValidate={true}>
        { !this.state.matches &&
        <div className={styles['form-title']}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.9591 7.66723C11.8124 7.66723 11.6591 7.62056 11.5124 7.58723C11.2154 7.52178 10.9235 7.43489 10.6391 7.32723C10.3298 7.21472 9.98986 7.22056 9.68463 7.34363C9.3794 7.46671 9.13048 7.69832 8.98576 7.9939L8.83909 8.2939C8.18976 7.93268 7.59308 7.48405 7.06576 6.96056C6.54227 6.43324 6.09364 5.83656 5.73242 5.18723L6.01242 5.00056C6.308 4.85584 6.53961 4.60692 6.66269 4.30169C6.78576 3.99646 6.7916 3.6565 6.67909 3.34723C6.57324 3.06218 6.48638 2.77043 6.41909 2.4739C6.38576 2.32723 6.35909 2.1739 6.33909 2.02056C6.25813 1.55098 6.01217 1.12572 5.6455 0.821389C5.27884 0.517054 4.81555 0.353636 4.33909 0.360563H2.33909C2.05178 0.357865 1.76726 0.417105 1.5049 0.53425C1.24254 0.651395 1.0085 0.823694 0.818711 1.03942C0.628924 1.25514 0.487847 1.50923 0.405083 1.78437C0.322318 2.05952 0.29981 2.34927 0.339091 2.6339C0.694249 5.42682 1.96978 8.02181 3.96419 10.009C5.95861 11.9962 8.55823 13.2622 11.3524 13.6072H11.6058C12.0974 13.608 12.572 13.4276 12.9391 13.1006C13.15 12.9119 13.3185 12.6807 13.4334 12.4221C13.5483 12.1635 13.6071 11.8835 13.6058 11.6006V9.60056C13.5976 9.13749 13.429 8.6916 13.1286 8.33901C12.8283 7.98642 12.415 7.74898 11.9591 7.66723ZM12.2924 11.6672C12.2923 11.7619 12.272 11.8554 12.2329 11.9416C12.1939 12.0279 12.1369 12.1048 12.0658 12.1672C11.9913 12.2315 11.9042 12.2796 11.81 12.3083C11.7159 12.337 11.6168 12.3457 11.5191 12.3339C9.02236 12.0138 6.70325 10.8716 4.92757 9.08742C3.15189 7.30329 2.0207 4.97879 1.71242 2.48056C1.70181 2.38291 1.71111 2.28412 1.73976 2.19016C1.7684 2.0962 1.8158 2.00902 1.87909 1.9339C1.94156 1.86278 2.01846 1.80579 2.10468 1.76671C2.19089 1.72763 2.28443 1.70735 2.37909 1.70723H4.37909C4.53412 1.70378 4.68551 1.75448 4.80719 1.85061C4.92887 1.94674 5.01323 2.08228 5.04576 2.2339C5.07242 2.41612 5.10576 2.59612 5.14576 2.7739C5.22277 3.12533 5.32526 3.47068 5.45242 3.80723L4.51909 4.24056C4.43929 4.27718 4.36751 4.32919 4.30786 4.39363C4.24822 4.45806 4.20189 4.53364 4.17154 4.61603C4.14118 4.69841 4.1274 4.78598 4.13099 4.87371C4.13457 4.96144 4.15545 5.04759 4.19242 5.12723C5.15189 7.1824 6.80392 8.83443 8.85909 9.7939C9.0214 9.86057 9.20345 9.86057 9.36576 9.7939C9.4489 9.76416 9.5253 9.7182 9.59054 9.65869C9.65577 9.59918 9.70853 9.5273 9.74576 9.44723L10.1591 8.5139C10.5037 8.63715 10.8555 8.73955 11.2124 8.82056C11.3902 8.86056 11.5702 8.8939 11.7524 8.92056C11.904 8.95309 12.0396 9.03745 12.1357 9.15913C12.2318 9.28081 12.2825 9.4322 12.2791 9.58723L12.2924 11.6672Z" fill="#4A54FF"/>
          </svg>
          <h3>Contact Information</h3>
        </div>
        }
        <h3 className={styles['content-title']}>{i18n.t`Phone`}</h3>
        <Row type="flex" justify="space-between" gutter={16}>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Personal Phone Number`}*</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber no-icons-form-filed ">
                {getFieldDecorator('personalNumber', {
                  valuePropName: 'defaultValue',
                  initialValue: userContacts.personalNumber ? userContacts.personalNumber : "",
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Phone Number is required!`
                    },
                  ]
                })(<PhoneInput
                  value={userContacts.personalNumber ? userContacts.personalNumber : ""}
                  disabled={!editContactAccess}
                  inputStyle={{width: "100%"}}
                  masks={{am: '(..) ..-..-..'}}
                  specialLabel={null}
                  country={'am'}
                  inputClass=" input-global-md color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Other Phone Number`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber no-icons-form-filed ">
                {getFieldDecorator('otherPhoneNumber', {
                  valuePropName: 'defaultValue',
                  initialValue: userContacts.otherPhoneNumber ? userContacts.otherPhoneNumber : "",
                })(<PhoneInput
                  value={userContacts.otherPhoneNumber ? userContacts.otherPhoneNumber : ""}
                  disabled={!editContactAccess}
                  inputStyle={{width: "100%"}}
                  masks={{am: '(..) ..-..-..'}}
                  specialLabel={null}
                  country={'am'}
                  inputClass=" input-global-md color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <Row type="flex" justify="space-between" gutter={16}>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Work Number`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber no-icons-form-filed">
                {getFieldDecorator(`workNumber`, {
                  valuePropName: 'defaultValue',
                  initialValue: userContacts.workedNumber ? userContacts.workedNumber : "",
                })(<PhoneInput
                  value={userContacts.workedNumber ? userContacts.workedNumber : ""}
                  disabled={!editContactAccess}
                  inputStyle={{width: "100%"}}
                  masks={{am: '(..) ..-..-..'}}
                  specialLabel={null}
                  country={'am'}
                  inputClass="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Home Number`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber no-icons-form-filed">
                {getFieldDecorator('homeNumber', {
                  valuePropName: 'defaultValue',
                  initialValue: userContacts.homeNumber ? userContacts.homeNumber : " ",
                })(<PhoneInput
                  value={userContacts.homeNumber ? userContacts.homeNumber : " "}
                  disabled={!editContactAccess}
                  inputStyle={{width: "100%"}}
                  masks={{am: '(..) ..-..-..'}}
                  specialLabel={null}
                  country={'am'}
                  inputClass="input-global-md color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <Row type="flex" justify="space-between" gutter={16}>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Extra Phone Number`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber no-icons-form-filed">
                {getFieldDecorator('extraNumber', {
                  valuePropName: 'defaultValue',
                  initialValue: userContacts.extraNumber ? userContacts.extraNumber : " ",
                })(<PhoneInput
                  value={userContacts.extraNumber ? userContacts.extraNumber : " "}
                  disabled={!editContactAccess}
                  inputStyle={{width: "100%"}}
                  masks={{am: '(..) ..-..-..'}}
                  specialLabel={null}
                  country={'am'}
                  inputClass="input-global-md color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Full Name (Relation)`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator('extraName', {
                  initialValue: userContacts.extraName ? userContacts.extraName : "",
                })(<Input
                  disabled={!editContactAccess}
                  placeholder={i18n.t`Ex: John Adams (Brother)`}
                  className="input-global-md color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>

        </Row>
        <hr/>
        <h3 className={styles['content-title']}>{i18n.t`Email`}</h3>
        <Row type="flex" justify="space-between" gutter={16}>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Work Email`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(`workEmail`, {
                  initialValue: userContacts.workEmail ? userContacts.workEmail : userDetail.headerData.email,
                  rules: [
                    { transform: (value) => value.trim() },
                    {
                      type: 'email',
                      message: i18n.t`The input is not valid E-mail!`,
                    }
                  ]
                })(<Input
                  disabled={!editContactAccess}
                  className="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={12} className={styles['col-max-width']}>
            <span className="label-txt">{i18n.t`Other Email`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator('personalEmail', {
                  initialValue: userContacts.personalEmail ? userContacts.personalEmail : "",
                  rules: [
                    { transform: (value) => value.trim() },
                    {
                      type: 'email',
                      message: i18n.t`The input is not valid E-mail!`,
                    },
                  ]
                })(<Input
                  disabled={!editContactAccess}
                  className="input-global-md color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <hr/>
        {editContactAccess &&
          <div className={styles['form-actions']}>
            <Button
              className="app-btn primary-btn"
              size={'large'}
              htmlType="submit"
            >
              {i18n.t`Save`}
            </Button>
          </div>
        }
      </Form>
        }
      </>
    )
  }
}

export default WorkNumberAndEmailForm
