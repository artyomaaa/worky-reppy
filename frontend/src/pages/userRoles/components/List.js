import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { withI18n } from '@lingui/react';
import styles from '../../users/components/List.less';
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import globalStyles from 'themes/global.less';
import RoleColumns from '../columns/RoleColumns';

@withI18n()
class List extends PureComponent {
  render() {
    const { onDeleteItem, onEditItem, i18n, ...tableProps } = this.props,
           canDeleteUsers = checkLoggedUserPermission(PERMISSIONS.DELETE_USERS.name, PERMISSIONS.DELETE_USERS.guard_name),
           columns = RoleColumns(i18n, onDeleteItem, onEditItem);

    if (!canDeleteUsers) delete tableProps['rowSelection'];

    return (
      <Table
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          showQuickJumper: false,
          showSizeChanger: false,
        }}
        className={`${styles.table} ${globalStyles.tableResponsive}`}
        columns={columns}
        rowSelection = {null}
        simple
        rowKey={record => record.id}
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
