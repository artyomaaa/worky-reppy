import React, {Component} from 'react';
import { withI18n } from '@lingui/react';
import { Col, Comment as Card, Avatar } from 'antd';
import styles from './activity.less';
import {fnDurationToHoursMinutesSecondsText, getResizedImage} from 'utils';
import PropTypes from "prop-types";
import {appUrl} from 'utils/config';
import {UserOutlined} from "@ant-design/icons";
import moment from 'utils/moment';

@withI18n()
class Activity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { i18n, activities } = this.props;

    if(!!activities){
      let data = activities && Object.keys(activities).map(function(item) {
        return activities[item];
      });

      return (
        <Col span={24}>
          <span>{i18n._('Activity')}</span>
          {data.map((value, index) => {
            return <Card
              key={index}
              author={<a>{value.work_user_name}</a>}
              avatar={
                <Avatar
                  src={value.work_user_avatar ? `${appUrl}storage/images/avatars${getResizedImage(value.work_user_avatar, 'avatar')}` : ''}
                  icon={!value.work_user_avatar ? <UserOutlined /> : ''}
                  alt={value.work_user_name}
                />
              }
              content={
                <div className={styles.texts_container}>
                  <span>
                    {value.work_name}
                  </span>
                  <span>
                    {value.duration === 0 ? fnDurationToHoursMinutesSecondsText(moment.duration(moment().diff(moment(value.start_date_time))).asSeconds(), i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`) : fnDurationToHoursMinutesSecondsText(value.duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)}
                  </span>
                  <span>
                    {value.end_date_time ? i18n._('Paused') : i18n._('Running')}
                  </span>
                </div>
              }
            />
          })}
        </Col>
      )
    } else {
      return(
        <Col span={24}>
          <span>{i18n._('Activity')}</span>
        </Col>
      )
    }
  }
}

Activity.propTypes = {
  activities: PropTypes.array,
};

export default Activity
