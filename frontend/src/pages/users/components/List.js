import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { withI18n } from '@lingui/react';
import styles from './List.less';
import {checkLoggedUserPermission} from '../../../utils';
import {PERMISSIONS} from '../../../utils/constant';
import globalStyles from "themes/global.less";
import UserColumns from "../columns/userColumns"
import {connect} from "dva";
import store from "store";

@withI18n()
@connect(({user}) => ({user}))
class List extends PureComponent {
  render() {
    const {onDeleteItem, onEditItem, i18n, ...tableProps} = this.props,
      canDeleteUsers = checkLoggedUserPermission(PERMISSIONS.DELETE_USERS.name, PERMISSIONS.DELETE_USERS.guard_name),
      columns = ((UserColumns instanceof Function) ? UserColumns(i18n, onDeleteItem) : UserColumns),
      canViewUsers = checkLoggedUserPermission(PERMISSIONS.VIEW_USERS.name, PERMISSIONS.VIEW_USERS.guard_name);

    if (!canDeleteUsers) delete tableProps['rowSelection'];

    return (
      <>
        {canViewUsers &&
          <Table
            {...tableProps}
            pagination={{
              ...tableProps.pagination,
              showQuickJumper: false,
              showSizeChanger: false,
              showLessItems: true,
            }}
            className={`${styles.table} ${globalStyles.tableResponsive}`}
            columns={columns}
            rowSelection={null}
            simple
            rowKey={record => record.id}
          />
        }
      </>
    )
  }
}

List.propTypes = {
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  location: PropTypes.object,
};

export default List
