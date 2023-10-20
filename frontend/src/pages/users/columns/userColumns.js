import React from "react";
import styles from "../components/List.less";
import {Avatar, Popconfirm} from "antd";
import Link from "umi/link";
import {appUrl} from 'utils/config';
import Icons from '../../../icons/icon';
import {UserOutlined} from "@ant-design/icons";
import {getStatusTextColor, getResizedImage, getUserFullName} from 'utils';
import moment from 'utils/moment';
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import store from "store";

export default function (i18n, onDeleteItem) {

  const
    loggedUser = store.get('user'),
    canRemoveUser = checkLoggedUserPermission(PERMISSIONS.DELETE_USERS.name, PERMISSIONS.DELETE_USERS.guard_name),
    canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name),
    canViewUserSelfDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name);

  const RemoveItemBtn = (item, cb, i18n) => {
    return (<Popconfirm
      title={i18n.t`Are you sure you want to delete this user?`}
      okText={i18n.t`Yes`}
      cancelText={i18n.t`No`}
      placement="bottom"
      onConfirm={() => cb(item)}
    >
    <span className="icon-with-bg">
      <Icons name="delete"/>
    </span>
    </Popconfirm>)
  };

  return [
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`User Name`}
        </span>,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (text, record) => {
        const isOwnerPage = loggedUser?.id === record.id;
        return (
          <div className={styles['userInform']}>
            <div className={styles['avatarSect']}>
              <Avatar
                src={record.avatar ? `${appUrl}storage/images/avatars${getResizedImage(record.avatar, 'avatar')}` : ''}
                icon={!record.avatar ? <UserOutlined/> : ''}/>
            </div>
            <div className={styles['userNameBlock']}>
              {(canViewUserDetails || (isOwnerPage && canViewUserSelfDetails)) ?
                <Link to={`users/${record.id}`}
                      className={styles['userName']}>{record && getUserFullName(record)}</Link> :
                <span className={styles['userName']}>{record && getUserFullName(record)}</span>
              }
            </div>
          </div>
        )
      }
    },
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`Date`}
        </span>,
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (text, it) => (
        <span>{moment(it.created_at).format('L').replace(new RegExp('/', 'gi'), '.')}</span>),
    },
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`position`}</span>,
      dataIndex: 'position',
      key: 'position',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (roles) =>
        <div className={styles['posSect']}>{roles}</div>,
    },
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`Role`}</span>,
      dataIndex: 'user_role',
      key: 'user_role',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: user_role => (
        <span className={styles["role-badge"]}>
            {user_role.hasOwnProperty('name')
              ?
              <>{i18n._(user_role.name)}</>
              : ''
            }
          </span>
      ),
    },
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`StatusForList`}</span>,
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: status => {
        return (
          <span
            className={status ? 'status-user-active' : 'status-user-inactive'}>{getStatusTextColor(status).text}</span>
        )
      },
    },
    {
      dataIndex: 'remove',
      key: 'remove',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (text, record) =>
        canRemoveUser &&
        <div className={styles["action-icons"]}>
          {RemoveItemBtn(record.id, onDeleteItem, i18n)}
        </div>
    }
  ]
}
