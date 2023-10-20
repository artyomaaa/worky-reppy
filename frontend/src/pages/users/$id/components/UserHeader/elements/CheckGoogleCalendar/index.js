import React, {PureComponent} from 'react';
import {withI18n} from '@lingui/react';
import {message, Modal} from 'antd';
import {PlusOutlined, DisconnectOutlined} from '@ant-design/icons';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import store from 'store';
import styles from './style.less';

const { confirm } = Modal;

@connect(({ userDetail, loading }) => ({ userDetail, loading }))
@withI18n()
class CheckGoogleCalendar extends PureComponent {
  state = {
    loading: false,
  };

  handleConnectGoogleCalendar() {
    const {dispatch, i18n, userDetail} = this.props;
    dispatch({
      type: `userDetail/getGoogleAuthUrl`,
      payload: {userId: userDetail?.checkGoogleCalendar?.userId},
    }).then(response => {
      if (response.success) {
        !response.googleAuthUrl ? message.error(i18n.t`Something went wrong`) : window.location.href = response.googleAuthUrl;
      } else {
        message.error(i18n.t`Something went wrong`);
      }
    });
  }

  handleDisconnectGoogleCalendar() {
    const {dispatch, i18n, userDetail} = this.props;
    confirm({
      title: i18n.t`Are you sure to disconnect google calendar?`,
      okText:i18n.t`OK`,
      onOk() {
        dispatch({
          type: `userDetail/disconnectGoogleCalendar`,
          payload: {userId: userDetail?.checkGoogleCalendar?.userId},
        }).then(response => {
          if (response.success) {
            message.success(i18n.t`Disconnected successfully.`);
          } else {
            message.error(i18n.t`Something went wrong`);
          }
        });
      },
    })
  }

  render () {
    const {i18n, userDetail} = this.props;
    const {checkGoogleCalendar} = userDetail;

    if (!checkGoogleCalendar) return '';

    let gcTokenExists = store.get('gcte');
    const googleCalendarTokenExists = gcTokenExists && typeof gcTokenExists === 'object' && gcTokenExists.includes(checkGoogleCalendar.userId);
    const googleCalendarConnected = googleCalendarTokenExists === true || !!checkGoogleCalendar.googleCalendarConnected;
    if (checkGoogleCalendar.googleCalendarConnected === undefined) return '';

    return (
      <div className={'check-google-calendar'}>
        <h3><label>{i18n.t`Google Calendar:`}</label> {googleCalendarConnected === true
          ? <DisconnectOutlined title={i18n.t`Disconnect`} style={{color: 'red'}} onClick={(e) => this.handleDisconnectGoogleCalendar(e)} />
          : <PlusOutlined style={{color: 'blue'}} onClick={(e) => this.handleConnectGoogleCalendar(e)} />
        }</h3>
      </div>
    )
  }
}

CheckGoogleCalendar.propTypes = {
  checkGoogleCalendar: PropTypes.object,
};

export default CheckGoogleCalendar;
