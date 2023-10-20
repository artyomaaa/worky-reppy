import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {Row, Col, Modal, Avatar, Dropdown, Menu, message} from 'antd';
import {Redirect} from "umi";
import {
  router,
  getResizedImage,
  getStatusTextColor,
  getUserFullName,
  checkLoggedUserPermission,
  getLocale,
} from 'utils';
import {Form} from '@ant-design/compatible';
import {PERMISSIONS} from 'utils/constant';
import {appUrl} from 'utils/config';
import {withI18n, Trans} from "@lingui/react";
import moment from 'utils/moment';
import Icons from 'icons/icon';
import ProjectModal from '../components/Modal';
import styles from './project.less';
import List from './components/List';
import Link from "umi/link";
import {stringify} from "qs";
import {UserOutlined} from "@ant-design/icons";


@connect(({ projectDetail, loading }) => ({ projectDetail, loading }))
@withI18n()
@Form.create()
class ProjectDetail extends Component {

  state = {
    showForm: false,
    modeRadio: 'active',
    userTablePageSize: 10,
    showAddProjectUSerModal: false,
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
  };

  get listProps() {
    const {projectDetail : {data}} = this.props;
    const {project} = data;
    const {attached_users} = project;

    return {
      columns: [
        {
          title: <Trans>User Name</Trans>,
          dataIndex: 'userName',
          key: 'userName',
          width: 200,
          ellipsis: true,
        },
        {
          title: <Trans>Role</Trans>,
          dataIndex: 'role',
          key: 'role',
          width: 200,
        },
        {
          title: <Trans>Created Date</Trans>,
          dataIndex: 'createdDate',
          key: 'createdDate',
          width: 200,
        },
        {
          title: <Trans>Working Hours</Trans>,
          dataIndex: 'workingHours',
          key: 'workingHours',
          width: 200,
          render: (text) => {
            return (
              <div className={styles['participant__working-hours']}>
                <span className={styles['participant__working-hours_value']}>{text}</span>
              </div>
            )
          }
        },
      ],
      dataSource: attached_users.map((user, index) => {
        const {i18n} = this.props;
        return {
          key: `${user.id}${index}`,
          userName: (
            <div className={styles['projects-participants__username']}>
              <Link to={`/users/${user.id}`}>
                {user.avatar ? <Avatar
                  className={styles['projects-participants__avatar']}
                  src={user.avatar ? `${appUrl}/storage/images/avatars${getResizedImage(user.avatar, 'avatar')}`: ''}
                  icon={!user.avatar ? <UserOutlined/> : ''}
                  alt={user.name} /> : <span className={styles['projects-participants__emptyAvatar']}> </span> }
                <h3 className={styles['projects-participants__name']}>{getUserFullName(user)}</h3>
              </Link>
            </div>
          ),
          role: <h4 className={styles['projects-participants__role']}>{user.userRole}</h4>,
          createdDate: (
            <span className={styles['projects-participants__createdDate']}>{moment(user.startDate).format('DD.MM.YYYY')}</span>
          ),
          workingHours: `${user.totalDuration }${i18n.t`h`}`
        }
      })
    }
  }

  get modalProps() {
    const {dispatch, projectDetail, loading, i18n} = this.props;
    const {
      currentItem,
      modalVisible,
      modalType,
      users,
      userProjectRoles
      // displayColorPicker,
      // itemColor,
      // users,
      // errorMessages,
      // userProjectRoles,
      // technologies
    } = projectDetail;


    return {
      dispatch,
      item: modalType === 'create' ? {} : currentItem?.project,
      visible: modalVisible,
      users,
      userProjectRoles,
      destroyOnClose: true,
      centered: true,
      maskClosable: false,
      title: `${
        modalType === 'create' ? i18n.t`Add a project` : i18n.t`Update project`
      }`,

      onOk: data => {
        dispatch({
          type: `projectDetail/resetErrorMessages`
        });
        return dispatch({
          type: `projectDetail/update`,
          payload: data,
        }).then((res) => {
          this.handleRefresh()
        }).catch(err => {
          throw err;
        })
      },
      onCancel() {
        dispatch({
          type: `projectDetail/hideModal`,
        })
      },
    }
  }

  handleEdit = (item) => {
    const {dispatch} = this.props;
    let members;
    if (item.id !== undefined) {
      if (item.members && item.members.length > 0) {
        members = item.projects.attached_users.map(member => {
          return {
            id: member.id,
            key: `${member.id}${member.name}`,
            name: member.name,
            // status: member.pivot.status,
            // statusText: getTeamMemberStatusText(member.pivot.status).text,
            userRole: member.userRole
          }
        });
      }
    } else {
      members = [];
    }

    dispatch({
      type: 'projectDetail/showModal',
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
    dispatch({
      type: 'projectDetail/DELETE_PROJECTS',
      payload: {id},
    })
    confirm({
      title: i18n.t`Are you sure to delete this project?`,
      okText: i18n.t`OK`,
      onOk() {
        dispatch({
          type: 'projectDetail/delete',
          payload: id,
        })
      },
    })
  }

  render() {
    const { projectDetail, i18n} = this.props;
    const { data } = projectDetail;
    if (data.status === false) {
      const canViewProjects = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECTS.name, PERMISSIONS.VIEW_PROJECTS.guard_name) ||
        checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_PROJECTS.name, PERMISSIONS.VIEW_SELF_PROJECTS.guard_name);
      message.error(data.message);
      if (canViewProjects) {
        return <Redirect to={`/${getLocale()}/projects`}/>;
      }

      return <Redirect to={`/${getLocale()}/dashboard`}/>;
    }
    const canViewProjectRate = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECT_RATE.name, PERMISSIONS.VIEW_PROJECT_RATE.guard_name);
    const canEditProjects = checkLoggedUserPermission(PERMISSIONS.EDIT_PROJECTS.name, PERMISSIONS.EDIT_PROJECTS.guard_name);
    const canDeleteProjects = checkLoggedUserPermission(PERMISSIONS.DELETE_PROJECTS.name, PERMISSIONS.DELETE_PROJECTS.guard_name);

    const convertDuration = (durArr, item) => {

      const filteredDurArr = durArr.filter(dur => dur.user_id === item.id);
      const filteredDurArrDurations = filteredDurArr.map((dur) => dur.duration);

      if(filteredDurArrDurations.length === 1) {
        return filteredDurArrDurations[0];
      }

      return filteredDurArrDurations.reduce((accumlator, currentValue) => {
        return accumlator + currentValue;
      }, 0);
    }

    return (
      <div style={{
        background: 'linear-gradient(107.69deg, #F6F6F6 12.59%, #E3EAF8 100.53%',
        boxShadow: 'box-shadow: 0px 0px 15px rgb(0 0 0 / 10%)',
        borderRadius: '10px'
      }}>
        {data.project && data.members &&
          <>
            <Row justify='start' className={styles['project-info']}>
              <Col span={24} className={styles['project-info__main']}>
                <div className={styles['project-info__general']}>
                  <span
                    className={styles['project-info__general_color']}
                    style={{
                      backgroundColor: `#${data.project.color && data.project.color?.charAt(0) === '#' ?
                        data.project.color.substring(1) :
                        data.project.color}` || '#ebb424'
                    }}
                  >
                  </span>
                  <h3 className={styles['project-info__general_name']}>{data.project.name}</h3>
                </div>
                <span
                  style={{backgroundColor: getStatusTextColor(data.project.status).color}}
                  className={styles['project-info__general_status']}
                  key={data.project.status}
                >
                    {data.project.status ? 'Active' : 'Inactive'}
                </span>
                {(canEditProjects || canDeleteProjects) &&
                  <div className={styles['project-info__general_actions_dots']}>
                    <Dropdown trigger={['click']} placement="bottomLeft" className={styles['dots']} overlay={
                      <Menu className="dots-dropdown">
                        <Menu.Item onClick={() => this.handleEdit(projectDetail?.data)}>{i18n._('Edit')}</Menu.Item>
                        <Menu.Item onClick={() => this.handleDelete(projectDetail?.data?.project?.id)}>{i18n._('Delete')}</Menu.Item>
                      </Menu>}>
                      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                        <Icons name="dots"/>
                      </a>
                    </Dropdown>
                  </div>
                }
                {(canEditProjects || canDeleteProjects) &&
                  <div className={styles['project-info__general_actions']}>
                    {canEditProjects &&
                      <button
                        className={styles['icon-with-bg']}
                        onClick={() => this.handleEdit(projectDetail?.data)}>
                        <Icons name="edit"/>
                      </button>
                    }
                    {canDeleteProjects &&
                      <button
                        className={styles['icon-with-bg']}
                        onClick={() => this.handleDelete(projectDetail?.data?.project?.id)}>
                        <Icons name="delete"/>
                      </button>
                    }
                  </div>
                }
              </Col>
              {canViewProjectRate && <Col className={styles['project-info__rate']} span={24}>
                <Col>
                <span className={styles['project-info__rate_label']}>
                  {i18n._('Rate')}:
                </span>
                <span className={styles['project-info__rate_value']}>
                  {data.project.price && data.project.price}
                </span>
                  </Col>
                <Col className={styles['type-info__container']} span={24}>
                  <Col span={15}>
                <span className={styles['project-info__type_label']}>
                  {i18n._('Type')}:
                </span>
                <span className={styles['project-info__type_value']}>
                  {data.project.type && i18n._(data.project.type) || i18n._('Is not set')}
                </span>
                  </Col>
                  <Col span={9}>
                  <span
                    style={{backgroundColor: getStatusTextColor(data.project.status).color}}
                    className={styles['project-info__general_status-mobile']}
                    key={data.project.status}
                  >
                    {data.project.status ? 'Active' : 'Inactive'}
                </span>
                </Col>
                </Col>
              </Col>}
              <Col className={styles['project-info__description']} span={24}>
                <p className={styles['project-info__description_value']}>
                  {data.project.description && data.project.description || i18n._('No description')}
                </p>
              </Col>
              <Col className={styles['project-info__countdowns']} span={24}>
                <div className={`${styles['project-info__countdowns_date']} ${styles['projects-info__countdowns_item']}`}>
                  <div className={`${styles['date__icon-container']} ${styles['item__icon-container']}`}>
                    <Icons name="calendar" />
                  </div>
                  <div className={`${styles['date__texts']} ${styles['item__texts']}`}>
                    <span className={`${styles['date__texts_value']} ${styles['item__texts_value']}`}>
                      {data.project.created_at ? moment(data.project.created_at).format('DD MMM, YYYY') : i18n._('Is not set')}
                    </span>
                    <span className={`${styles['date__texts_label']} ${styles['item__texts_label']}`}>
                      {i18n._('Created Date')}
                    </span>
                  </div>
                </div>
                <div className={`${styles['project-info__countdowns_hours']} ${styles['projects-info__countdowns_item']}`}>
                  <div className={`${styles['hours__icon-container']} ${styles['item__icon-container']}`}>
                      <Icons name="clock" fill="FA3B4B" />
                  </div>
                  <div className={`${styles['hours__texts']} ${styles['item__texts']}`}>
                    <span className={`${styles['hours__texts_value']} ${styles['item__texts_value']}`}>
                      {data.totalDuration ? data.totalDuration : 0}
                      <span>
                        {i18n.t`h`}
                      </span>
                    </span>
                    <span className={`${styles['hours__texts_label']} ${styles['item__texts_label']}`}>
                      {i18n._('Working Hours')}
                    </span>
                  </div>
                </div>
                <div className={`${styles['project-info__countdowns_tasks']} ${styles['projects-info__countdowns_item']}`}>
                  <div className={`${styles['tasks__icon-container']} ${styles['item__icon-container']}`}>
                    <Icons name="list" />
                  </div>
                  <div className={`${styles['tasks__texts']} ${styles['item__texts']}`}>
                    <span className={`${styles['tasks__texts_value']} ${styles['item__texts_value']}`}>
                      {data.totalCount ? data.totalCount : 0}
                    </span>
                    <span className={`${styles['tasks__texts_label']} ${styles['item__texts_label']}`}>
                      {i18n._('Tasks Created')}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
            <Row justify='start' className={styles['project-participants']} >
              <Col span={24} className={styles['project-participants__top']}>
                <h4 className={styles['project-participants__top_heading']}>
                  {i18n._('Members')}
                </h4>
              </Col>
              <Col span={24}>
                <List {...this.listProps} />
              </Col>
            </Row>
          </>
        }
        <ProjectModal {...this.modalProps} />
      </div>
    );
  }
}

ProjectDetail.propTypes = {
  projectDetail: PropTypes.object,
};

export default ProjectDetail;
