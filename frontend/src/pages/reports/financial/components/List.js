import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table} from 'antd';
import {Trans, withI18n} from '@lingui/react';
import {fnDurationToHoursMinutesSecondsText, getPercent} from 'utils';
import Icons from "../../../../icons/icon";
import globalStyles from "themes/global.less";
import styles from "../components/List.less"


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
    const columns = [
      {
        title: <Trans>Members Name</Trans>,
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: <Trans>Worked Hours</Trans>,
        dataIndex: 'userWorkedSecondsForCurrentProject',
        key: 'userWorkedSecondsForCurrentProject',
        render: (userWorkedSecondsForCurrentProject, rec) => {
          return userWorkedSecondsForCurrentProject
          ? fnDurationToHoursMinutesSecondsText(userWorkedSecondsForCurrentProject, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)
            + '/' + getPercent(userWorkedSecondsForCurrentProject, record.workedHours)
          : 0;
        },
      },
      {
        title: <Trans>Profit per Member</Trans>,
        dataIndex: 'userSalaryForCurrentProject',
        key: 'userSalaryForCurrentProject',
        render: (userSalaryForCurrentProject, rec) => {
          return userSalaryForCurrentProject
            ? userSalaryForCurrentProject
            + '$/' + getPercent(userSalaryForCurrentProject, record.spent)
            : 0 + '$';
        }
      }
    ];

    if (record?.attached_users) {
      data = record?.attached_users;
    }

    return <Table columns={columns} dataSource={data} pagination={false} className={`${globalStyles.nestedTable} ${globalStyles.table}`}/>;
  }

  render() {
    const {i18n, onChange, dataSource, pagination} = this.props;

    const columns = [
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Project Name`}
        </span>,
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (name, record) => {
          return (
            <span style={{color: record.color}}>
                 {record.works_count ?
                   <span className="project-work-children-count">{record.works_count}</span> : ''} {i18n._(name)}
             </span>
          )
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Members`}
        </span>,
        dataIndex: 'membersCount',
        key: 'membersCount',
        sortDirections: ['descend', 'ascend'],
        render: (members, record) => {
          return members ?? 0;
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Worked Hours`}
        </span>,
        dataIndex: 'workedHours',
        key: 'workedHours',
        sortDirections: ['descend', 'ascend'],
        render: (workedHours, record) => {
          return workedHours ? fnDurationToHoursMinutesSecondsText(workedHours, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`) : 0;
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Revenue`}
        </span>,
        dataIndex: 'rate',
        key: 'rate',
        sortDirections: ['descend', 'ascend'],
        render: (budget, record) => {
          return budget ? budget + '$' : 0 + '$';
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Cost`}
        </span>,
        dataIndex: 'spent',
        key: 'spent',
        sortDirections: ['descend', 'ascend'],
        render: (spent, record) => {
          return spent ? spent + '$' : 0 + '$';
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Total Profit`}
        </span>,
        dataIndex: 'profit',
        key: 'profit',
        sortDirections: ['descend', 'ascend'],
        render: profit => {
          return profit + '$' ?? 0 + '$';
        },

      }
    ];

    return (
      <Table
        dataSource={dataSource}
        pagination={{
          ...pagination,
          showTotal: total => i18n.t`Total ${total} Items`,
        }}
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
