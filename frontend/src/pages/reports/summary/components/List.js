import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Table} from 'antd';
import { Trans, withI18n } from '@lingui/react';

import styles from './List.less';
import {fnDurationToHoursMinutesSecondsText} from 'utils';

@withI18n()
class List extends PureComponent {
  handleOpenOrCloseRow = (expanded, record) => {
    const { onOpenProjectRow } = this.props;
    if (expanded) {
      onOpenProjectRow(record.project_id);
    }
  };
  render() {
    const { onDeleteItem, onEditItem, i18n, dataSource, ...tableProps } = this.props;

    const columns = [
      {
        title: <Trans>Title</Trans>,
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => {
          return (
            <span style={{color: record.color}}>
                 {record.works_count ? <span className="project-work-children-count">{record.works_count}</span>: ''} {i18n._(title)}
             </span>
          )
        },
        ellipsis: true,
      },
      {
        title: <Trans>Duration</Trans>,
        dataIndex: 'duration',
        key: 'duration',
        render: duration => {
          return fnDurationToHoursMinutesSecondsText(duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
        },
        width: '25%',
        ellipsis: true,
      }
    ];
    return (
      <Table
        {...tableProps}
        pagination={false}
        dataSource={dataSource}
        className={styles.table}
        bordered
        columns={columns}
        simple
        onExpand={this.handleOpenOrCloseRow}
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
