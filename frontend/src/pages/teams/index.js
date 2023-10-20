import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { router, checkLoggedUserPermission, getLocale } from 'utils';
import { PERMISSIONS } from "utils/constant";
import { connect } from 'dva';
import { Pagination } from 'antd';
import { withI18n } from '@lingui/react';
import { Redirect } from "umi";
import { Page } from 'components';
import { stringify } from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import Modal from './components/Modal';
import stylesProject from "../projects/index.less";

@withI18n()
@connect(({ teams, loading }) => ({ teams, loading }))
class Teams extends Component {

  state = {
    width: 0
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateScreenSize);
    this.updateScreenSize();
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreenSize);
  }

  updateScreenSize = () => {
    this.setState({
      width: window.innerWidth
    });
  };

  handleRefresh = newQuery => {
    const { location, teams } = this.props;
    const { filterStatus } = teams;
    const { query, pathname } = location;
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

  handleDeleteItems = () => {
    const { dispatch, teams } = this.props;
    const { list, pagination, selectedRowKeys } = teams;

    dispatch({
      type: 'teams/multiDelete',
      payload: {
        ids: selectedRowKeys,
      },
    }).then(() => {
      this.handleRefresh({
        page:
          list.length === selectedRowKeys.length && pagination.current > 1
            ? pagination.current - 1
            : pagination.current,
      })
    })
  };

  get modalProps() {
    const { dispatch, teams, loading, i18n } = this.props;

    const {currentItem, modalVisible, modalType, dataSourceMembers, selectedUserList, selectedUser, memberStatus, users, projects, roleIdNameList} = teams;
    for (let selectedUser in selectedUserList) {
      for (let selectedData in dataSourceMembers) {
        if (selectedUserList[selectedUser]['id'] === dataSourceMembers[selectedData].user['id']) {
          dataSourceMembers.splice(selectedData, 1)
        }
      }
    }
    return {
      item: modalType === 'create' ? {} : currentItem,
      visible: modalVisible,
      destroyOnClose: true,
      maskClosable: false,
      confirmLoading: loading.effects[`teams/${modalType}`],
      title: `${
        modalType === 'create' ? i18n.t`Add a team` : i18n.t`Update team`
      }`,
      centered: true,
      dataSourceMembers: dataSourceMembers,
      selectedUserList: selectedUserList,
      selectedUser: selectedUser,
      roleIdNameList: roleIdNameList,
      memberStatus: memberStatus,
      users: users,
      projects: projects,
      onSetDataMembersStatus: (data) =>{
        dispatch({
          type: 'teams/updateState',
          payload: {
            membersStatusList: data,
          },
        })
      },
      onSetDataSourceMembers: (data) =>{
        dispatch({
          type: 'teams/updateState',
          payload: {
            dataSourceMembers: data,
          },
        })
      },
      onSetSelectedUser: (user) =>{
        dispatch({
          type: 'teams/updateState',
          payload: {
            selectedUser: user,
          },
        })
      },
      onSetSelectedUserList: (list) =>{
        dispatch({
          type: 'teams/updateState',
          payload: {
            selectedUserList: list,
          },
        })
      },
      onSetMemberStatus: (status) =>{
        dispatch({
          type: 'teams/updateState',
          payload: {
            memberStatus: status,
          },
        })
      },
      onOk: data => {
        dispatch({
          type: `teams/${modalType}`,
          payload: data,
        }).then(() => {
          this.handleRefresh();
        }).then(() => {
          dispatch({
            type: 'teams/updateState',
            payload: {
              memberStatus: 0,
              dataSourceMembers: [],
              selectedUserList: [],
              selectedUser: null,
            },
          });
        });
      },
      onCancel() {
        dispatch({
          type: 'teams/hideModal',
        })
      },
    }
  }

  get listProps() {
    const { dispatch, teams, loading } = this.props;
    const { list, pagination, selectedRowKeys } = teams;

    return {
      dataSource: list,
      loading: loading.effects['teams/query'],
      pagination,
      onChange: (page, pageSize) => {
        this.handleRefresh({
          page,
          pageSize
        });
      },
      onDeleteItem: (e,id) => {
        dispatch({
          type: 'teams/delete',
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
      onEditItem(e,item) {
        let members;
        if (item.id !== undefined) {
          if (item.members && item.members.length > 0) {
            members = item.members.map(member => {
              return {
                id: member.id,
                name: member.name,
                avatar: member.avatar,
                role_name: member.role_name,
                team_member_role_id: member.team_member_role_id,
                roles: member.roles,
                role_id: member.roles.length < 2 ? member.roles[0].id : member.roles.map((el) => el.id)
              }
            });
          }
        } else {
          members = [];
        }

        dispatch({
          type: 'teams/showModal',
          payload: {
            modalType: 'update',
            currentItem: item,
            itemColor: item.color,
            selectedUserList: members,
          },
        })
      },
      rowSelection: {
        selectedRowKeys,
        onChange: keys => {
          dispatch({
            type: 'teams/updateState',
            payload: {
              selectedRowKeys: keys,
            },
          })
        },
      },
    }
  }

  get filterProps() {
    const { location, dispatch } = this.props;
    const { query } = location;
    const {width} = this.state;

    return {
      filter: {
        ...query,
      },
      width,
      onFilterChange: value => {
        this.handleRefresh({
          page: 1,
          ...value,
        })
      },
      onAdd() {
        dispatch({
          type: 'teams/showModal',
          payload: {
            modalType: 'create',
            selectedUserList: [],
          },
        })
      }
    }
  }

  render() {
    const { teams } = this.props;
    const { pagination } = teams;

    const canViewTeams = checkLoggedUserPermission(PERMISSIONS.VIEW_TEAMS.name, PERMISSIONS.VIEW_TEAMS.guard_name) ||
      checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_TEAMS.name, PERMISSIONS.VIEW_SELF_TEAMS.guard_name);

    if(!canViewTeams) {
      return <Redirect to={`/${getLocale()}/dashboard`} />;
    }

    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <div className={`${stylesProject['card-wrapper']}`}>
          {teams.list &&
            <List {...this.listProps} />
          }
          {pagination.total > 12 && <Pagination
            onChange={(page, pageSize) => this.listProps.onChange(page, pageSize)}
            defaultCurrent={1}
            current={pagination?.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            defaultPageSize={12}
          />}
        </div>
        <Modal {...this.modalProps} />
      </Page>
    )
  }
}

Teams.propTypes = {
  teams: PropTypes.object,
  project: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default Teams
