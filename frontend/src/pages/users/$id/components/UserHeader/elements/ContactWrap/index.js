import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styles from './style.less';
import {withI18n} from "@lingui/react";
import moment from 'utils/moment';
import {fnCalculateYearsAndMonths} from 'utils';
import Icons from 'icons/icon'
import {CheckCircleOutlined, StopOutlined} from '@ant-design/icons'
import {Input, message} from "antd";
import {Form} from "@ant-design/compatible";
import {Button, ConfigProvider, Popconfirm, Row, Col} from "antd";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {connect} from "dva";


const FormItem = Form.Item;
const mapStateToProps = ({userDetail}) => ({userDetail});

@withI18n()
@connect(mapStateToProps)
@Form.create()
class UserContact extends PureComponent {
  constructor() {
    super();
    this.state = {
      isEditEmail: false,
      isError: false
    };

  }

  editEmail = () => {
    this.setState( state =>({
      isEditEmail: !state.isEditEmail
    }));
  }

  emailResend = () => {
    const {dispatch, i18n, data} = this.props;
    if (data.id !== data.loggedUserId) return; // important do not send verify email for other users

    dispatch({
      type: `userDetail/updateEmailVerifyResend`,
      payload: {},
    }).then(() => {
      message.success(i18n._('Email verification resend successfully'));
    }).catch(() => {
      message.error(i18n._('Email verification resend error'));
    });
  }

  editIcon = () => {
    this.setState( state =>({
      isError: true
    }));
  }

  onCancel = (e) => {
    e.preventDefault();
    this.setState( state =>({
      isEditEmail: false,
    }));
  }

  onSubmit = (e) => {
    e.preventDefault();
    const {form, data, dispatch, i18n} = this.props;
    const {email} = data;

    form.validateFields((error, values) => {
      if (!error && email !== values.email) {
        process.nextTick(() => {
           dispatch({
            type: `userDetail/updateUserEmail`,
            payload: {
              ...values,
              userId: data.id
            },
          }).then((res) => {
             message.success(i18n._('Email update successful'));
               this.editEmail();
          }).catch(() => {
             message.error(i18n._('Email not updated'));
           });
        });
      }
    });
  }

  render() {
    const {i18n, permissionsUser, userDetail: {data: {email: updatedEmail = ''}}} = this.props;
    const {canEditUser} = permissionsUser;
    const {id, email, phone, birthday, workExperience, email_verified_at} = this.props.data;
    const {years, months} = fnCalculateYearsAndMonths(workExperience?.work_contract);
    const userWorkExperience = years + ` ${years > 1 ? i18n.t`years` : i18n.t`year`} ` + months + ` ${months > 1 ? i18n.t`months` : i18n.t`month`} `;

    const getBirthDay = birthday ? moment(birthday).format('DD.MM.YYYY') : null;

    const {form} = this.props;
    const {getFieldDecorator} = form;
    const lang = i18n.language === 'en' ? en_GB : hy_AM;

    return (
      <div className={styles['contact-information-wrapper']}>
        {getBirthDay ? <div className={styles['contact-information-wrapper_sub']}>
          <span className={styles['sub_title']}>{i18n.t`Date of Birth`}</span>
          <b className={styles['sub_val']}>{getBirthDay}</b>
          <h4 className={styles['contact-information-user-id']}>ID:{id}</h4>
        </div> : ''}
        {phone ? <div className={styles['contact-information-wrapper_sub']}>
          <span className={styles['sub_title']}>{i18n.t`Primary Phone Number`}</span>
          <b className={styles['sub_val']}>+{phone.value}</b>
        </div> : ''}
        {email ? <div className={styles['contact-information-wrapper_sub']}>
          <span className={styles['sub_title']}>{i18n.t`Primary Email`}</span>

          {!this.state['isEditEmail'] ?
            <>
              <b className={styles['sub_val']} title={updatedEmail || email}>
                {(updatedEmail.length >= 50 ? updatedEmail.slice(0, 50) + '...' : updatedEmail) || (email.length >= 50 ? email.slice(0, 50) + '...' : email)}
              </b>
              {canEditUser &&
              <div className={styles['dFlex']}>
                <span className={`${email_verified_at ? styles['ml156'] : styles['danger-svg']} `}>
                  {
                    email_verified_at ? <CheckCircleOutlined/> : <StopOutlined onClick={this.emailResend} />
                  }
                  <div className={styles['hover-container']}>
                    <div
                      className={`${email_verified_at ? styles['hover-valid'] : styles['hover-invalid']} `}> {email_verified_at ? 'Verified Email' : 'Unverified Email'}</div>
                  </div>
                </span>

                <span className={styles['ml156']} onClick={this.editEmail}>
                  <Icons tabIndex={"0"} name="edit"/>
                </span>
              </div>
              }
            </>
            :
            <Form onSubmit={(e) => this.onSubmit(e)} noValidate={true} className='header-form'>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`email`, {
                    initialValue: email ? email : null,
                    rules: [
                      {
                        type: 'email',
                        message: i18n.t`The input is not valid E-mail!`,
                      }
                    ]
                  })(<Input

                    className="input-global-md w_100 color-black font-medium header-input-width"/>)}
                </FormItem>
              </ConfigProvider>
              <div className={styles['social-actions-text-box']}>
                <Button onClick={(e) => {this.onSubmit(e); this.editIcon(e)}}
                  className={styles['social-actions-text']}
                  htmlType="submit"
                >
                  {i18n.t`Save`}
                </Button>
                <Button onClick={(e) => this.onCancel(e)}
                        className={styles['social-actions-text']}
                >
                  {i18n.t`Cancel`}
                </Button>
              </div>
            </Form>
          }

        </div> : ''}
        <div className={styles['contact-information-wrapper_sub']}>
          <span className={styles['sub_title']}>{i18n.t`Work Experience`}</span>
          <b className={styles['sub_val']}>{userWorkExperience}</b>
        </div>
      </div>
    )
  }
}

UserContact.defaultProps = {
  data: {
    email: '',
    address: '',
    phone: [],
  },
};

UserContact.propTypes = {
  data: PropTypes.object,
};

export default UserContact;
