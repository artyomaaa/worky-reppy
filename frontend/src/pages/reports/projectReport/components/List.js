import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import {  Table } from 'antd';
import styles from './List.less';
import {fnDurationToHoursMinutesSecondsText, fnDurationPercent, checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import store from "store";
import Icons from "../../../../icons/icon";
import globalStyles from "themes/global.less";
import {getStatusTextColor, getUserFullName} from "utils";

@withI18n()
class List extends PureComponent {
   render() {
    const {i18n, dataSource, members,projectsOfUsers} = this.props;
    const canViewSelfProjectMemberList = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_PROJECT_MEMBER_LIST.name, PERMISSIONS.VIEW_SELF_PROJECT_MEMBER_LIST.guard_name);
    const canViewTeamProjectMemberList = checkLoggedUserPermission(PERMISSIONS.VIEW_TEAM_PROJECT_MEMBER_LIST.name, PERMISSIONS.VIEW_TEAM_PROJECT_MEMBER_LIST.guard_name);
    const canViewProjectMemberList = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECT_MEMBER_LIST.name, PERMISSIONS.VIEW_PROJECT_MEMBER_LIST.guard_name);
    const canViewProjectList = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECTS_LIST.name, PERMISSIONS.VIEW_PROJECTS_LIST.guard_name);

    const loggedUser = store.get('user');
    const projectsData = [];
    for (let i = 0; i < dataSource.length; i++) {
      parseInt(dataSource[i].project_id) && projectsData.push({
        key: i+dataSource[i].project_name+dataSource[i].project_id,
        title: dataSource[i].project_name,
        project_id: dataSource[i].project_id,
        members_count: dataSource[i].members_count,
        duration: fnDurationToHoursMinutesSecondsText(dataSource[i].duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
        project_status: dataSource[i].project_status
      })
    }

     const expandedRowRender = (record) => {
       let data = []
       projectsOfUsers && projectsOfUsers.map(item => {
         item.key = item.id+item.name;
         if (item.project_id === parseInt(record.project_id)) {
           if (canViewProjectMemberList && canViewProjectList) {
             return data.push(item);
           } else if (canViewSelfProjectMemberList && item.id == loggedUser.id) {// for staff
             return data.push(item)
           } else if (canViewTeamProjectMemberList && item.id == loggedUser.id) {//for Manager
             return data.push(item)
           }
         }
       })

       data = data.filter((thing, index, self) =>
         index === self.findIndex((t) => (
           t.id === thing.id && t.name === thing.name
         ))
       )
      const columns = [
        {
          title: <Trans>Name</Trans>,
          dataIndex: 'name',
          key: 'name',
          render: (title, record) => {
            return (
              <span>{getUserFullName(record)}</span>)
          }
        },
        {
          title: <Trans>Time</Trans>,
          dataIndex: 'duration',
          key: 'duration',
          render: (title, record) => {
            return fnDurationToHoursMinutesSecondsText(record.total_duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
          },
        },
        {
          title: <Trans>Percent</Trans>,
          dataIndex: 'percent',
          key: 'percent',
          render: (title, record) => {
            let totalDurationViaProject = 0;
            for (let i = 0; i < dataSource.length; i++) {
              if (parseInt(dataSource[i]['project_id']) === record.project_id) {
                totalDurationViaProject = dataSource[i]['total_duration'];
              }
            }
            return fnDurationPercent(record.total_duration, totalDurationViaProject) + '%';
          },
        },
      ];
      return <Table columns={columns} dataSource={data} pagination={false}  className={`${globalStyles.nestedTable} ${globalStyles.table}`}/>;
    };

    const columns = [
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Project name`}
        </span>,
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Members`}
        </span>,
        dataIndex: 'members_count',
        key: 'members_count',
        ellipsis: true,
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Time`}
        </span>,
        dataIndex: 'duration',
        key: 'duration',
        width: '25%',
        ellipsis: true,
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Status`}
        </span>,
        dataIndex: 'project_status',
        key: 'project_status',
        width: '25%',
        ellipsis: true,
        render: status => {
          return (
            <span className={status ? 'status-user-active' : 'status-user-inactive'}>{getStatusTextColor(status).text}</span>
          )
        },
      }
    ];


    return (
      <Table
        dataSource={projectsData}
        className={`${styles.projectTable} ${globalStyles.table}`}
        bordered
        columns={columns}
        simple
        expandedRowRender={expandedRowRender}
      />
    );
  }
}

List.propTypes = {
  location: PropTypes.object,
};

export default List
