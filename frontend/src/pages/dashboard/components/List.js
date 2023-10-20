import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {Table} from 'antd';
import { Trans, withI18n } from '@lingui/react';

import {fnDurationToHoursMinutesSecondsText} from 'utils';
import moment from 'utils/moment';

@withI18n()
class List extends PureComponent {
  render() {
    const { onDeleteItem, onEditItem, i18n, dataSource, ...tableProps } = this.props;

    const columns = [
      {
        title: <Trans>Project name</Trans>,
        dataIndex: 'project_name',
        key: 'project_name',
        render: (text, record) => {
          return (
            <div>
              { record.project_name ? <span style={{color: record.project_color}}>{record.project_name}</span> : <span>{i18n.t`No Project`}</span> }
            </div>
          )
        },
      },
      {
        title: <Trans>Duration</Trans>,
        dataIndex: 'duration',
        key: 'duration',
        render: (duration, record) => {
          duration = duration === 0 ? moment.duration(moment().diff(moment(record.start_date_time))).asSeconds() : duration;
          return fnDurationToHoursMinutesSecondsText(duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
        },
        width: '25%',
        ellipsis: true,
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
