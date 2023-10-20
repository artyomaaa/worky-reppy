import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { router, checkLoggedUserPermission, getLocale } from 'utils';
import { PERMISSIONS } from 'utils/constant';
import { connect } from 'dva';
import { withI18n } from '@lingui/react';
import { Page } from 'components';
import { stringify } from 'qs';
import {Redirect} from "umi";
import List from './components/List';
import Filter from './components/Filter';
import Modal from './components/Modal';
import stylesUser from "./index.less";

@withI18n()
@connect(({ user, loading }) => ({ user, loading }))
class User extends PureComponent {

  handleRefresh = newQuery => {
    const { location, user } = this.props;
    const { filterStatus } = user;
    const { query, pathname } = location;
    query.page = 1;
    let searchObj = { ...query, ...newQuery };
    if (newQuery && !("status" in newQuery) && filterStatus !== undefined) {
      searchObj = { ...searchObj, status: filterStatus };
    }
    router.push({
      pathname,
      search: stringify(
        searchObj,
        { arrayFormat: 'repeat' }
      ),
    })
  };


  get modalProps() {
    const { dispatch, user, loading, i18n } = this.props;
    const { currentItem, modalVisible, modalType, roles, skills, positions } = user;

    return {
      item: modalType === 'create' ? {} : currentItem,
      visible: modalVisible,
      destroyOnClose: true,
      maskClosable: false,
      confirmLoading: loading.effects[`user/${modalType}`],
      title: `${
        modalType === 'create' ? i18n.t`ADD A USER` : i18n.t`Update User`
      }`,
      centered: true,
      roles: roles,
      skills: skills,
      positions: positions,
      onOk: data => {
        dispatch({
          type: `user/${modalType}`,
          payload: data,
        }).then(() => {
          this.handleRefresh()
        })
      },
      onCancel() {
        dispatch({
          type: 'user/hideModal',
        })
      },
    }
  }

  get listProps() {
    const { dispatch, user, loading } = this.props;
    const { list, pagination, selectedRowKeys, roles = [] } = user;

    return {
      dataSource: list,
      loading: loading.effects['user/query'],
      roles,
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
          type: 'user/delete',
          payload: id,
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
        dispatch({
          type: 'user/showModal',
          payload: {
            modalType: 'update',
            currentItem: item,
          },
        })
      },
      rowSelection: {
        selectedRowKeys,
        onChange: keys => {
          dispatch({
            type: 'user/updateState',
            payload: {
              selectedRowKeys: keys,
            },
          })
        },
      },
    }
  }

  get filterProps() {
    const { location, dispatch, user } = this.props;
    const {roles = []} = user;
    const { query } = location;

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
        dispatch({
          type: 'user/showModal',
          payload: {
            modalType: 'create',
          },
        })
      },
      roles: roles,
    }
  }

  render() {
    const canViewUsers = checkLoggedUserPermission(PERMISSIONS.VIEW_USERS.name, PERMISSIONS.VIEW_USERS.guard_name);

    if(!canViewUsers) {
      return <Redirect to={`/${getLocale()}/dashboard`} />;
    }

    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <div className={`${stylesUser['table-align-left']} ${stylesUser['user-table']}`}>
          <List {...this.listProps} />
        </div>
        <Modal {...this.modalProps} />
      </Page>
    )
  }
}

User.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default User
