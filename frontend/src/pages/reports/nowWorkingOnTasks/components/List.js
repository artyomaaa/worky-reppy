import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table, Avatar} from 'antd';
import {withI18n} from '@lingui/react';
import styles from './List.less';
import globalStyles from 'themes/global.less';
import {getResizedImage, getUserFullName} from 'utils';
import {UserOutlined} from "@ant-design/icons";
import {appUrl} from 'utils/config';
import Link from 'umi/link';
import store from 'store';
import moment from 'utils/moment';
import Tag from 'components/Tag';

@withI18n()
class List extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userTimeOffset: store.get('user')?.time_offset || '+00:00'
    }
  }
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
          {i18n.t`User Name`}
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
                <Link to={`/users/${record.work_user_id}`} className={styles.userName}>{record && getUserFullName({name: record.work_user_name, surname: record.work_user_surname})}</Link>
              </div>
            </div>
          )
        },
      },
      {
        title: <span>
          {i18n.t`Project`}
        </span>,
        dataIndex: 'project_name',
        key: 'project_name',
        render: (it, record) => {
          return (
            <>
              <span style={{color: record.project_color}}>
                {it ? it : i18n.t`No Project`}
              </span>
              <span>
                {record.tags && record.tags.length ?
                  <Tag activeTagsArray={record.tags} />
                  : null}
              </span>
            </>

          )
        },
      },
      {
        title: <span>
          {i18n.t`Task`}
        </span>,
        dataIndex: 'work_name',
        key: 'work_name',
        render: (it, record) => {
          return it;
        }
      },
      {
        title: <span>
          {i18n.t`Start time`}
        </span>,
        dataIndex: 'start_date_time',
        key: 'start_date_time',
        render: (it, record) => {
          return it ? moment.parseZone(it).utcOffset(this.state.userTimeOffset).format('HH:mm') : '';
        }
      },
      {
        title: <span>
          {i18n.t`Duration`}
        </span>,
        dataIndex: 'duration',
        key: 'duration',
        render: (it, record) => {
          return it;
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
          return `w_${record.work_user_id}_${record.work_id}_${record.work_time_id}`;
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
