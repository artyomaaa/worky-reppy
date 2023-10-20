import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {Col, Avatar} from 'antd';
import {withI18n} from "@lingui/react";
import { UserOutlined } from '@ant-design/icons';
import {appUrl} from 'utils/config';
import {fnDurationToHoursMinutesSecondsForReports, getResizedImage, getUserFullName} from 'utils';
import styles from './userDetail.less';

@withI18n()
class UserDetail extends PureComponent {
  get totalClockedTime() {
    const {reportsGroupByProjects} = this.props;
    if(reportsGroupByProjects){
      const sum = reportsGroupByProjects.reduce((total, obj) => obj.duration + total, 0);
      return fnDurationToHoursMinutesSecondsForReports(sum);
    }
  }
  render() {
    const { i18n, user, totalDuration } = this.props;

    return (
      <Col span={24}>
        <div className={styles.info_container}>
          <Avatar shape="square" size={238} src={user ? user.avatar ? `${appUrl}storage/images/avatars${getResizedImage(user.avatar, 'md')}` : '' : ''} icon={user ? !user.avatar ? <UserOutlined /> : '' : ''} />
          <p>{i18n._('Username')}: {user && getUserFullName(user)}</p>
          <p>{i18n._('Total hours')}: {totalDuration ? fnDurationToHoursMinutesSecondsForReports(totalDuration) : 0}</p>
        </div>
      </Col>
    );
  }
}

UserDetail.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object,
};

export default UserDetail;
