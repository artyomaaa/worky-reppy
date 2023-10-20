import React from 'react';
import {Avatar, Popconfirm} from 'antd';
import Icons from 'icons/icon';
import moment from 'utils/moment';
import styles from "../../users/components/List.less";
import stylesUserRoles from "../components/List.less";
import Link from "umi/link";

function RoleColumns(i18n, onDeleteItem, onEditItem){
  const editItemBtn = (item) => {
    return (
      <span
        style={{cursor: 'pointer', marginRight: '10px'}}
        onClick={() => onEditItem(item)}
      >
        <Icons name="edit" />
      </span>);
  };

  const removeItemBtn = (item) => {
    return (<Popconfirm
      title={i18n.t`Are you sure delete this item?`}
      okText="Yes"
      placement="topRight"
      onConfirm={() => onDeleteItem(item.id)}
    >
      <span style={{cursor: 'pointer'}}>
       <Icons name="delete" />
      </span>
    </Popconfirm>)
  };

  return [
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`Role Name`}
        </span>,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (text, record) =>
        <div className={styles['userInform']}>
             {record.name}
          {/*<div>*/}
          {/*  <Link to={`users/${record.id}`} className={styles['userName']}>{record && getUserFullName(record)}</Link>*/}
          {/*</div>*/}
        </div>,
    },
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`Users`}</span>,
      dataIndex: 'users_count',
      key: 'users_count',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (roles) =>
        <div className={styles['userInform']}>{roles}</div>,
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
        <div className={styles['posSect']}>{moment(it.created_at).format('L').replace(new RegExp('/', 'gi'), '.')}</div>),
    },
    {
      title: <span>
          <Icons name="sortarrow" style={{marginRight: '10px', marginTop: '-2px'}}/>
        {i18n.t`Permissions`}</span>,
      dataIndex: 'permissions_count',
      key: 'permissions_count',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (text, record) =>
        <div className={styles['permissionCount']}>
          {record.permissions_count}
        </div>,
    },
    {
      title: ' ',
      dataIndex: 'actions',
      key: 'actions',
      sorter: false,
      render: (text, it) => {
        return (
          <div className={stylesUserRoles["action-icons"]}>
            {editItemBtn(it)}
            {removeItemBtn(it)}
          </div>
        )
      }
    },
  ]
}

export default RoleColumns;
