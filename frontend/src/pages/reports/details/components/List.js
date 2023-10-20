import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {Icon, Table} from 'antd';
import { Trans, withI18n } from '@lingui/react';

import styles from './List.less';
import {fnDurationToHoursMinutesSecondsText, fnEndTimeText, calculateUserRate} from 'utils';
import moment from 'utils/moment';
import globalStyles from 'themes/global.less';

const timeFormat = 'HH:mm';
const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
const dateFormat = 'YYYY-MM-DD';

@withI18n()
class List extends PureComponent {
  userTimeOffset = JSON.parse(localStorage.getItem('user')).time_offset;

  render() {
    const calculateUserRateByType = (salary, type) => {
      return type === 2 ? salary : calculateUserRate(salary, type);
    };
    const { onDeleteItem, onEditItem, i18n, dataSource, ...tableProps } = this.props;

    const columns = [
      {
        title: <Trans>Work name</Trans>,
        dataIndex: 'work_name',
        key: 'work_name',
        render: (text, record) => {
          return (
            <div>
              <span className="textElement">{text}</span>
              { record.project_name ? <span style={{color: record.project_color}}><Icon type="project" size={'small'} style={{fontSize: '10px'}} /> {record.project_name}</span> : <span>{i18n.t`No Project`}</span> }
            </div>
          )
        },
      },
      {
        title: <Trans>Username</Trans>,
        dataIndex: 'work_user_name',
        key: 'work_user_name',
        render: text => <span>{text}</span>,
      },
      {
        title: <Trans>Duration</Trans>,
        dataIndex: 'duration',
        key: 'duration',
        render: (duration, record) => {
          duration = duration === 0 ? moment.duration(moment.utc(moment()).utcOffset(this.userTimeOffset).diff(moment.utc(record.start_date_time).utcOffset(this.userTimeOffset))).asSeconds() : duration;
          return fnDurationToHoursMinutesSecondsText(duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
        },
        ellipsis: true,
      },
      {
        title: <Trans>Time</Trans>,
        dataIndex: 'name',
        key: 'name',
        render: (title, record) => {
          let endDateTime = record.end_date_time ? moment.parseZone(record.end_date_time).utcOffset(this.userTimeOffset).format(dbDateTimeFormat) : null;
          let endTimeText = fnEndTimeText(moment.parseZone(record.start_date_time).utcOffset(this.userTimeOffset).format(dbDateTimeFormat), endDateTime, i18n.t`in process`);
          return (
            <div>
              <span style={{color: '#000'}}>{
                moment.parseZone(record.start_date_time).utcOffset(this.userTimeOffset).format(timeFormat) + ' - ' + endTimeText
              }</span>
              <p>{moment.parseZone(record.start_date_time).utcOffset(this.userTimeOffset).format(dateFormat)}</p>
            </div>
          )
        },
      },
      {
        title: <Trans>Project's hourly salary</Trans>,
        dataIndex: 'project_rate',
        key: 'project_rate',
        render: (duration, record) => {
          return (
            <div>
              <span style={{color: '#000'}}>
                {
                  record.project_rate && record.end_date_time ?
                    moment(record.end_date_time).diff(moment(record.start_date_time), 'hours') * (record.project_rate ?? 0) :
                    moment(Date()).diff(moment(record.start_date_time), 'hours') * (record.project_rate ?? 0)
                }
              </span>
            </div>
          )
        },
      },
      {
        title: <Trans>User's hourly salary</Trans>,
        dataIndex: 'user_rate',
        key: 'user_rate',
        render: (duration, record) => {
          return (
            <div>
              <span style={{color: '#000'}}>
                {
                  record.user_salary && record.end_date_time ?
                    moment(record.end_date_time).diff(moment(record.start_date_time), 'hours') * calculateUserRateByType(record.user_salary, record.work_user_type) :
                    moment(Date()).diff(moment(record.start_date_time), 'hours') * calculateUserRateByType(record.user_salary, record.work_user_type)
                }
              </span>
            </div>
          )
        },
      },
    ];
    return (
      <Table
        {...tableProps}
        dataSource={dataSource}
        pagination={{
          ...tableProps.pagination,
          showTotal: total => i18n.t`Total ${total} Items`,
        }}
        className={`${styles.table} ${globalStyles.table}`}
        bordered
        columns={columns}
        simple
        rowKey={record => record.work_time_id}
      />
    )
  }
}

List.propTypes = {
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  location: PropTypes.object,
};

export default List
