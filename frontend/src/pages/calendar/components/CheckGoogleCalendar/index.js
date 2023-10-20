import React, {PureComponent} from 'react';
import {withI18n} from '@lingui/react';
import {message, Modal} from 'antd';
import {connect} from 'dva';
import store from 'store';
import Icons from 'icons/icon'
import styles from './style.less';

const { confirm } = Modal;

@connect(({ userFullCalendar, loading }) => ({ userFullCalendar, loading }))
@withI18n()
class CheckGoogleCalendar extends PureComponent {
  state = {
    loading: false,
  };

  handleConnectGoogleCalendar() {
    const {dispatch, i18n, userFullCalendar} = this.props;
    dispatch({
      type: `userFullCalendar/getGoogleAuthUrl`,
      payload: {userId: userFullCalendar?.checkGoogleCalendar?.userId},
    }).then(response => {
      if (response.success) {
        !response.googleAuthUrl ? message.error(i18n.t`Something went wrong`) : window.location.href = response.googleAuthUrl;
      } else {
        message.error(i18n.t`Something went wrong`);
      }
    });
  }

  handleDisconnectGoogleCalendar() {
    const {dispatch, i18n, userFullCalendar} = this.props;
    confirm({
      title: i18n.t`Are you sure to disconnect google calendar?`,
      okText:i18n.t`OK`,
      onOk() {
        dispatch({
          type: `userFullCalendar/disconnectGoogleCalendar`,
          payload: {userId: userFullCalendar?.checkGoogleCalendar?.userId},
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
    const {i18n, userFullCalendar} = this.props;
    const {checkGoogleCalendar} = userFullCalendar;

    if (!checkGoogleCalendar) return '';

    let gcTokenExists = store.get('gcte');
    const googleCalendarTokenExists = gcTokenExists && typeof gcTokenExists === 'object' && gcTokenExists.includes(checkGoogleCalendar.userId);
    const googleCalendarConnected = googleCalendarTokenExists === true || !!checkGoogleCalendar.googleCalendarConnected;
    if (checkGoogleCalendar.googleCalendarConnected === undefined) return '';

    return (
      <h3 className={styles['check-google-calendar']}>
        <label className={styles['google-link-label']}>{i18n.t`google_calendar`}</label>
        {googleCalendarConnected === true
          ? <span className={styles['google-link-icon']} onClick={(e) => this.handleDisconnectGoogleCalendar(e)}>
              <Icons name="linkBroken" fill="#FF331F"/>
            </span>
          : <span className={styles['google-link-icon']} onClick={(e) => this.handleConnectGoogleCalendar(e)}>
              <Icons name="link" fill="#2EB13B"/>
            </span>
        }
      </h3>
    )
  }
}

export default CheckGoogleCalendar;
