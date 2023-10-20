import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table} from 'antd';
import {Trans, withI18n} from '@lingui/react';
import {fnDurationToHoursMinutesSecondsText, getPercent} from 'utils';
import styles from './List.less';
import globalStyles from "themes/global.less";
import Icons from "../../../../icons/icon";
import {getStatusTextColor} from "../../../../utils";


@withI18n()
class List extends PureComponent {
  handleOpenOrCloseRow = (expanded, record) => {
    const {onOpenProjectRow} = this.props;
    if (expanded) {
      onOpenProjectRow(record.project_id);
    }
  };

  expandedRowRender = (record) => {
    const {i18n} = this.props;
    let data = [];
    record.childRowData && record.childRowData.map(item => {
      item && data.push({name: item.project, duration: item.duration});
    })
    let uniqueData = {};
    for (var i = 0, len = data.length; i < len; i++) {
      uniqueData[data[i]['name']] = data[i];
    }
    data = new Array();
    for (var key in uniqueData) {
      data.push(uniqueData[key]);
    }

    const columns = [
      {
        title: <Trans>Project name</Trans>,
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => {
          return (
            <span>
          {record.name ?
            <span>{i18n._(name)}</span> : i18n._('No Project')}
        </span>
          )
        },
      },
      {
        title: <Trans>Time</Trans>,
        dataIndex: 'duration',
        key: 'duration',
        render: (seconds, duration) => {
          return seconds ? fnDurationToHoursMinutesSecondsText(seconds, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`) : '';
        }
      },
      {
        title: <Trans>Percent</Trans>,
        dataIndex: 'duration',
        key: 'pecrent',
        render: (userWorkedHoursForCurrentProject) => {
          return getPercent(userWorkedHoursForCurrentProject, record.totalDuration)
        }
      }

    ];

    return <Table columns={columns} dataSource={data} pagination={false} className={`${globalStyles.nestedTable} ${globalStyles.table} ${styles.secondTable}`} />;
  }

  render() {
    const {i18n, onChange, dataSource} = this.props;
    const columns = [
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Member Name`}
        </span>,
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => {
          return (
            <span style={{color: record.color}}>
              {name ? <span>{name}</span> : i18n.t`Member Name`}
            </span>
          )
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Project`}
        </span>,
        dataIndex: 'project_count',
        key: 'project_count',
        render: (projectCount, record) => {
          return projectCount ?? 0;
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Time`}
        </span>,
        dataIndex: 'totalDuration',
        key: 'totalDuration',
        render: (workedHours, record) => {
          return workedHours ? fnDurationToHoursMinutesSecondsText(workedHours, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`) : '';
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Status`}
        </span>,
        dataIndex: 'status',
        key: 'status',
        render: status => {
          let Active = getStatusTextColor(status).text;
          return (
            <span className={status ? 'status-user-active' : 'status-user-inactive'}>{i18n._(Active)}</span>
          )
        },
      },

    ];

    return (
      <Table
        dataSource={dataSource}
        className={`${styles.projectTable} ${globalStyles.table}`}
        bordered
        columns={columns}
        simple
        expandedRowRender={this.expandedRowRender}
        onChange={onChange}
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
