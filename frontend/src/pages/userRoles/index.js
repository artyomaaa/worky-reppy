import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { checkLoggedUserPermission, router } from 'utils';
import {PERMISSIONS} from 'utils/constant';
import { connect } from 'dva';
import { withI18n } from '@lingui/react';
import { Page } from 'components';
import { stringify } from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import stylesUser from "../users/index.less";

@withI18n()
@connect(({ userRoles, loading }) => ({ userRoles, loading }))
class UserRoles extends PureComponent {

  handleRefresh = newQuery => {
    const { location } = this.props;
    const { query, pathname } = location;
    query.page = 1;
    router.push({
      pathname,
      search: stringify(
        {
          ...query,
          ...newQuery,
        },
        { arrayFormat: 'repeat' }
      ),
    })
  };

  get listProps() {
    const { dispatch, userRoles, location} = this.props;
    const { list, pagination } = userRoles;
    const { query } = location;
    const roleType = query.roleType || 'company';

    return {
      dataSource: list,
      pagination,
      onChange: (page, filters, sorter) => {
        const orderNames = {
          descend: 'desc',
          ascend: 'asc'
        };
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
          sortBy: sorter?.order ? sorter?.field : undefined,
          order: sorter?.order ? orderNames[sorter?.order] : undefined,
        })
      },
      onDeleteItem: id => {
        dispatch({
          type: 'userRoles/delete',
          payload: {id: id, roleType: roleType},
        }).then(() => {
          this.handleRefresh({
            page:
              list.length === 1 && pagination.current > 1
                ? pagination.current - 1
                : pagination.current,
          })
        })
      },
      onEditItem(item) {
        router.push({
          pathname: `/userRoles/${item.id}`,
          search: stringify({
            roleType: roleType,
          }),
        });
      },
    }
  }

  get filterProps() {
    const { location, dispatch, userRoles } = this.props;
    const { query } = location;
    const {roles = [], roleType} = userRoles;

    return {
      dispatch,
      filter: {
        ...query,
      },
      onFilterChange: value => {
        this.handleRefresh({
          ...value,
        })
      },
      onAdd() {
        router.push({
          pathname: `/userRoles/add`,
          search: stringify({
            roleType: roleType,
          }),
        });
      },
      roles: roles,
    }
  }

  get permissions() {
    return {
      canViewRolesPermissions: checkLoggedUserPermission(PERMISSIONS.VIEW_ROLES_PERMISSIONS.name, PERMISSIONS.VIEW_ROLES_PERMISSIONS.guard_name)
    }
  }

  render() {
    const {i18n} = this.props;
    const {canViewRolesPermissions} = this.permissions;
    if (!canViewRolesPermissions) {
      return <>
        <h1>{i18n.t`Access Denied`}</h1>
      </>
    }
    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <div className={`${stylesUser['user-table']}`}>
          <List {...this.listProps} />
        </div>
      </Page>
    )
  }
}

UserRoles.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default UserRoles
