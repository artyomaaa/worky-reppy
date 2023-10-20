import React, {Component} from 'react';
import { withI18n } from '@lingui/react';
import {Button, Col, Comment as Card} from 'antd';
import PropTypes from "prop-types";
import {fnDurationToHoursMinutesSecondsText} from 'utils';
import moment from 'utils/moment';
import styles from "./mostTracked.less";

@withI18n()
class MostTracked extends Component {
  constructor(props) {
    super(props);

    this.handleStartOrPause = this.handleStartOrPause.bind(this);
  }
  handleStartOrPause = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const { onStartOrPause } = this.props;
    onStartOrPause(item);
  };

  render() {
    const { i18n, mostTracked } = this.props;

    if(!!mostTracked){
      let data = Object.keys(mostTracked).map(function(item) {
        return mostTracked[item];
      });
      return (
        <Col span={24}>
          <span>{i18n._('Most tracked')}</span>
          {data.map((value, index) => {
            return <Card
              key={index}
              content={
                <div className={styles.texts_container}>
                  <div className={styles.project_info}>
                    <span>
                      {value.work_name}
                    </span>
                    {value.project_name ? <span style={{color: value.project_color}}>{value.project_name}</span> : <span>{i18n._('No Project')}</span>}
                  </div>
                  <div className={styles.project_info_duration}>
                    <span>
                      {value.duration === 0 ? fnDurationToHoursMinutesSecondsText(moment.duration(moment().diff(moment(value.start_date_time))).asSeconds(), i18n._('shortHour'), i18n._('shortMinute'), i18n._('shortSecond')) : fnDurationToHoursMinutesSecondsText(value.total_duration, i18n._('shortHour'), i18n._('shortMinute'), i18n._('shortSecond'))}
                    </span>
                    <Button
                      htmlType="submit"
                      icon={value.end_date_time ? 'play-circle' : 'pause-circle'}
                      shape="circle"
                      size={'small'}
                      style={{ fontSize: '24px', color: value.end_date_time ? 'green' : 'red' }}
                      onClick={(e) => this.handleStartOrPause(e, value)}
                    />
                  </div>
                </div>
              }
            />
          })}
        </Col>
      )
    } else {
      return(
        <Col span={24}>
          <span>{i18n._('Most tracked')}</span>
        </Col>
      )
    }
  }
}

MostTracked.propTypes = {
  mostTracked: PropTypes.array,
};

export default MostTracked
