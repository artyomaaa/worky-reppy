import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {Col, Input, Row, Table, Modal, Avatar, Button, Dropdown, Menu} from 'antd';
import {Trans, withI18n} from "@lingui/react";
import {Form} from '@ant-design/compatible';
import {Redirect} from "umi";
import {stringify} from "qs";
import stylesUser from "./index.less";
import stylesTeam from "./team.less"
import TeamModal from '../components/Modal';
import Icons from 'icons/icon';
import moment from 'utils/moment';
import {router, getResizedImage, getUserFullName, checkLoggedUserPermission, getLocale} from 'utils';
import {appUrl} from 'utils/config';
import {
  PERMISSIONS,
  STATUSES,
  dateFormats
} from 'utils/constant';
import Link from "umi/link";
import {UserOutlined} from "@ant-design/icons";
import store from "store";

const {Search} = Input;

@connect(({teamsDetail, loading}) => ({teamsDetail, loading}))
@withI18n()
@Form.create()
class TeamsDetail extends PureComponent {

  state = {
    showForm: false,
    modeRadio: 'active',
    userTablePageSize: 10,
    isDeactivationModalVisible: false,
    showAll: false,
    width: 0
  };
  // Declaring scope variables
  #dateFormat = 'YYYY/MM/DD';

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
    const {location} = this.props;
    const {query, pathname} = location;
    router.push({
      pathname,
      search: stringify(
        {
          ...query,
          ...newQuery,
        },
        {arrayFormat: 'repeat'}
      ),
    });
    this.setState({
      showForm: true,
    });
  };

  handleModeChange = e => {
    const modeRadio = e.target.value;
    this.setState({modeRadio});
  };

  startToSearch = (value) => {
    const {form} = this.props;
    const {getFieldsValue} = form;

    let fields = getFieldsValue();

    this.handleRefresh({
      page: 1,
      ...fields,
    })
  };

  handleEdit = item => {
    const {dispatch} = this.props;
    let members;
    if (item.id !== undefined) {
      if (item.members && item.members.length > 0) {
        members = item.members.map(member => {
          return {
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            status: member.pivot.status,
            team_member_role_id: member.team_member_role_id,
            role_name: member.role_name,
          }
        });
      }
    } else {
      members = [];
    }

    dispatch({
      type: 'teamsDetail/showModal',
      payload: {
        modalType: 'update',
        currentItem: item,
        itemColor: item.color,
        selectedUserList: members,
      },
    })
  }

  handleDelete = id => {
    const {confirm} = Modal;
    const {i18n, dispatch} = this.props;
    confirm({
      title: i18n.t`Are you sure delete this team?`,
      okText: i18n.t`OK`,
      onOk() {
        dispatch({
          type: 'teamsDetail/delete',
          payload: id,
        })
      },
    })
  }

  showDeactivationModal() {
    this.setState(prevState => ({
      isDeactivationModalVisible: !prevState.isDeactivationModalVisible
    }));
  }

  handleChangeStatus = (id, status) => {
    const {dispatch, i18n} = this.props;
    const {confirm} = Modal;

    status = parseInt(status) === 1 ? 0 : 1

    dispatch({
      type: 'teamsDetail/changeStatus',
      payload: {id, status},
    })
    this.setState({
      isDeactivationModalVisible:false
    })
  };

  get modalProps() {
    const {dispatch, teamsDetail, loading, i18n} = this.props;
    const {currentItem, modalVisible, modalType, dataSourceMembers, selectedUserList, selectedUser, memberStatus, users, projects, roleIdNameList} = teamsDetail;
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
      title: `${i18n.t`Update team`}`,
      centered: true,
      dataSourceMembers: dataSourceMembers,
      selectedUserList: selectedUserList,
      selectedUser: selectedUser,
      memberStatus: memberStatus,
      users: users,
      projects: projects,
      roleIdNameList: roleIdNameList,
      onSetDataSourceMembers: (data) => {
        dispatch({
          type: 'teamsDetail/updateState',
          payload: {
            dataSourceMembers: data,
          },
        })
      },
      onSetSelectedUser: (user) => {
        dispatch({
          type: 'teamsDetail/updateState',
          payload: {
            selectedUser: user,
          },
        })
      },
      onSetSelectedUserList: (list) => {
        dispatch({
          type: 'teamsDetail/updateState',
          payload: {
            selectedUserList: list,
          },
        })
      },
      onSetMemberStatus: (status) => {
        dispatch({
          type: 'teamsDetail/updateState',
          payload: {
            memberStatus: status,
          },
        })
      },
      onOk: data => {
        dispatch({
          type: `teamsDetail/${modalType}`,
          payload: data,
        }).then(() => {
          this.handleRefresh()
        }).then(() => {
          dispatch({
            type: 'teamsDetail/updateState',
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
          type: 'teamsDetail/hideModal',
        })
      },
    }
  }

  get filterProps() {
    const {location, dispatch} = this.props;
    const {query} = location;

    return {
      filter: {
        ...query,
      },
    }
  }

  handleFields = fields => {
    const { created_at } = fields;
    if (created_at && created_at.length) {
      fields.created_at = [
        moment(created_at[0]).format('YYYY-MM-DD'),
        moment(created_at[1]).format('YYYY-MM-DD'),
      ]
    }
    return fields;
  };

  handleChangeRoles = (key, values) => {
    const { form} = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    if (key === 'statuses') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields[key] = (values instanceof Object) ? values.target.value : values;
    } else fields[key] = values;
    //
    fields = this.handleFields(fields);
  };

  toggleProjects() {
    this.setState(prevState => ({
      showAll: !prevState.showAll
    }))
  }

  render() {
    const {i18n, teamsDetail, form} = this.props;
    const {data, roleIdNameList} = teamsDetail;
    const {members, projects} = data;
    const {filter} = this.filterProps;
    const {name} = filter;
    const {getFieldDecorator} = form;
    const {width, showAll, userTablePageSize, isDeactivationModalVisible } = this.state;

    const canEditTeams = checkLoggedUserPermission(PERMISSIONS.EDIT_TEAMS.name, PERMISSIONS.EDIT_TEAMS.guard_name);
    const canDeleteTeams = checkLoggedUserPermission(PERMISSIONS.DELETE_TEAMS.name, PERMISSIONS.DELETE_TEAMS.guard_name);

    const loggedUser = store.get('user');

    const columns = [
      {
        title: <>
          <Trans>UserName</Trans>
        </>,
        dataIndex: 'name',
        key: 'name',
        render: (text, it) => (
          <div className={stylesTeam['projects-participants__username']}>
            <Link to={`/users/${it.id}`}>
              {it.avatar ? <Avatar
                className={stylesTeam['projects-participants__avatar']}
                src={it.avatar ? `${appUrl}/storage/images/avatars${getResizedImage(it.avatar, 'avatar')}` : ''}
                icon={!it.avatar ? <UserOutlined/> : ''}
                alt={it.name}/> : <span className={stylesTeam['projects-participants__emptyAvatar']}> </span>}
              <h3 className={stylesTeam['projects-participants__name']}>{getUserFullName(it)}</h3>
            </Link>
          </div>),
      },
      {
        title: <>
          <Trans>Role</Trans>
        </>,
        dataIndex: 'pivot',
        key: 'pivot',
        render: (text, it) => (
          <span className="role-badge">{ it.role_name ? i18n._(it.role_name) : i18n._('Unknown')}</span>),
      },
      {
        title: <>
          <Trans>CREATED DATE</Trans>
        </>,
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (text, it) => (
          <span>{moment(it.updated_at).format('L').replace(new RegExp('/', 'gi'), '.')}</span>),
      },
    ];
    let seeMoreNumber = width > 580 ? 2 : 1;

    const locale = getLocale();

    if(data.data === null) {
      return <Redirect to={`/${locale}/teams`} />;
    }

    return (
      <div className={stylesTeam['team__container']}>
        {teamsDetail?.data?.id && (
          <div className={stylesTeam['team__about']}>
            <div className={stylesTeam['team__about_top']}>
              <div className={stylesTeam['team__title']}>
                <h2 className={stylesTeam['team__title_heading']}>
                  {teamsDetail?.data?.name}
                </h2>
                <span
                  className={stylesTeam['team__title_status']}
                  style={{backgroundColor: parseInt(teamsDetail?.data?.status) === 1 ? '#29CD39' : '#DB4D4D'}}
                >
                    {parseInt(teamsDetail?.data?.status) === 1 ? STATUSES.ACTIVE.text : STATUSES.INACTIVE.text}
                  </span>
              </div>
              {(canEditTeams || canDeleteTeams) &&
              <div className={stylesTeam['team-info__general_actions_dots']}>
                <Dropdown trigger={['click']} placement="bottomLeft" overlay={
                  <Menu className="dots-dropdown">
                    { canEditTeams && <Menu.Item onClick={(e) => this.handleEdit(teamsDetail?.data)}>{i18n._('Edit')}</Menu.Item> }
                    { canDeleteTeams && <Menu.Item onClick={(e) => this.handleDelete(teamsDetail?.data?.id)}>{i18n._('Delete')}</Menu.Item> }
                    <Menu.Item onClick={(e) => this.showDeactivationModal(teamsDetail?.data?.id, teamsDetail?.data?.status)}>{i18n._('Status')}</Menu.Item>
                  </Menu>
                  }>
                  <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    <Icons name="dots"/>
                  </a>
                </Dropdown>
              </div>
              }
              {(canEditTeams || canDeleteTeams) &&
                <div className={stylesTeam['team__actions']}>
                  {canEditTeams &&
                    <button className={stylesTeam['icon-with-bg']}
                            onClick={e => this.handleEdit(teamsDetail?.data)}>
                      <Icons name="edit"/>
                    </button>
                  }
                  {canDeleteTeams &&
                    <button className={stylesTeam['icon-with-bg']}
                            onClick={e => this.handleDelete(teamsDetail?.data?.id)}>
                      <Icons name="delete"/>
                    </button>
                  }
                  <button className={stylesTeam['icon-with-bg']}
                          onClick={e => this.showDeactivationModal(teamsDetail?.data?.id, teamsDetail?.data?.status)}>
                    <Icons name="deactivate"/>
                  </button>
                </div>
              }
            </div>
            <div className={stylesTeam['team__projects']}>
              <span className={stylesTeam['team__projects_label']}>
                {i18n._('Projects')}:
              </span>
              <div className={stylesTeam['team__projects_list_container']}>
                  {showAll ?
                    <div className={stylesTeam['team__projects_list']}>
                        {projects ? projects.map((project) =>
                            <div key={project.id} className={stylesTeam['team__projects_list_item']}>
                              <span>{project.name}</span>
                            </div>)
                          : <div className={stylesTeam['team__projects_list_item']}>
                            {i18n.t`No Projects`}
                        </div>}
                      <p className={stylesTeam['team__projects-showLess']}
                         onClick={() => this.toggleProjects()}>LESS</p>
                    </div>
                    :
                    <div className={stylesTeam['team__projects_list']}>
                        {projects ? projects.map((project, index) =>
                            index < seeMoreNumber ?
                              <div key={project.id} className={stylesTeam['team__projects_list_item']}>
                                <span>{project.name}</span>
                              </div> : null)
                          : <div className={stylesTeam['team__projects_list_item']}>
                            {i18n.t`No Projects`}
                        </div>}
                    </div>}
                    <p className={stylesTeam['team__projects-showMore']}
                       onClick={() => this.toggleProjects()}>
                        {!showAll && projects.length > 2 ? `SEE MORE` : ''}
                    </p>
              </div>
            </div>
            <div className={stylesTeam['team__date']}>
              <span className={stylesTeam['team__date_label']}>
                {i18n._('Created Date')}:
              </span>
              <span className={stylesTeam['team__date_value']}>
                  {moment(teamsDetail?.data?.created_at).format(dateFormats.userDetailsPageDateFormat)}
                </span>
            </div>
            <div className={stylesTeam['team__description']}>
              <p className={stylesTeam['team__description_value']}>
                {teamsDetail?.data?.description ? teamsDetail?.data?.description : ''}
              </p>
            </div>
          </div>
        )}
        {members && (
          <>
              <Row
                className={`${stylesUser['parent-row__head']}`}
                type="flex"
                justify="space-between"
                align="middle"
              >
           <Col span={24} className={stylesTeam['team-table-title-column']}>
             <h4>Members</h4>
           </Col>
              </Row>
            <div className={`${stylesUser['table-align-left']} ${stylesUser['user-table']}`}>
              <Table pagination={{pageSize: userTablePageSize, hideOnSinglePage: true}}
                     scroll={{x:750}}
                     dataSource={members} columns={columns} rowKey={(record) => `mk_${record.id}`}/>
            </div>
            <TeamModal {...this.modalProps} />
          </>
        )}
        <Modal
          centered
          width={400}
          footer={null}
          title={teamsDetail?.data?.status ? i18n.t`DEACTIVATE TEAM`: 'ACTIVATE TEAM'}
          visible={isDeactivationModalVisible}
          closeIcon={
            <span onClick={() => this.showDeactivationModal()}
                  className="close-icon">
                <Icons name="close"/>
              </span>
          }
          className={stylesTeam['deactivation-modal']}
        >
          <div>
            <div className={stylesTeam['deactivation-modal-content']}>
              {`Are you sure you want to ${teamsDetail?.data?.status ? 'deactivate': 'activate'} this team?`}
            </div>
            <div className="modal-footer-actions">
              <Button
                className="app-btn primary-btn-outline md"
                shape="round"
                onClick={() => this.showDeactivationModal()}
              >
                <Trans>No</Trans>
              </Button>
              <Button
                tabIndex={"0"}
                className="app-btn primary-btn md"
                shape="round"
                onClick={e => this.handleChangeStatus(teamsDetail?.data?.id, teamsDetail?.data?.status)}
              >
                <Trans>Yes</Trans>
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

TeamsDetail.propTypes = {
  teamsDetail: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default TeamsDetail;
