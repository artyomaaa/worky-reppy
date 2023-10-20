import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table, Avatar} from 'antd';
import {withI18n} from '@lingui/react';
import styles from './List.less';
import globalStyles from 'themes/global.less';
import Icons from 'icons/icon';
import {fnDurationToHoursMinutesSecondsForReports, getResizedImage, getUserFullName} from 'utils';
import {UserOutlined} from "@ant-design/icons";
import {appUrl} from 'utils/config';
import Link from 'umi/link';

@withI18n()
class List extends PureComponent {
  handleOpenOrCloseRow = (expanded, record) => {
    const {onOpenProjectRow} = this.props;
    if (expanded) {
      onOpenProjectRow(record.project_id);
    }
  };

  render() {
    const {i18n, onChange, dataSource, pagination} = this.props;
    const columns = [
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Member Name`}
        </span>,
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => {
          return (
            <div className={styles.userInform}>
              <div className={styles.avatarSect}>
                <Avatar src={record.work_user_avatar ? `${appUrl}storage/images/avatars${getResizedImage(record.work_user_avatar, 'avatar')}` : ''} icon={!record.work_user_avatar ? <UserOutlined /> : ''} />
              </div>
              <div>
                <Link to={`/users/${record.work_user_id}`} className={styles.userName}>{record && getUserFullName({name: record.user_name, surname: record.user_surname})}</Link>
              </div>
            </div>
          )
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Project`}
        </span>,
        dataIndex: 'project_name',
        key: 'project_name',
        render: (it, record) => {
          return (
            <span style={{color: record.project_color}}>
              {it ? it : i18n.t`No Project`}
            </span>
          )
        },
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Worked time`}
        </span>,
        dataIndex: 'worked_time',
        key: 'worked_time',
        render: (it, record) => {
          return it ? fnDurationToHoursMinutesSecondsForReports(it) : '';
        }
      },
      {
        title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
          {i18n.t`Reported time`}
        </span>,
        dataIndex: 'reported_time',
        key: 'reported_time',
        render: (it, record) => {
          return it ? fnDurationToHoursMinutesSecondsForReports(it) : '';
        }
      },
    ];

    return (
      <Table
        dataSource={dataSource}
        className={`${styles.projectTable} ${globalStyles.table}`}
        bordered
        columns={columns}
        simple
        onChange={onChange}
        rowKey={record => {
          let rowKey = `ptr_${record.work_user_id}`;
          if (record.project_id) rowKey += `_${record.project_id}`;
          if (record.reported_time) rowKey += `_${record.reported_time}`;
          if (record.worked_time) rowKey += `_${record.worked_time}`;
          // if (record.work_user_avatar) rowKey += `_${record.work_user_avatar}`;
          return rowKey;
        }}
        pagination={pagination}
      />
    )
  }
}

List.propTypes = {
  location: PropTypes.object,
};

export default List
