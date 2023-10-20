import React, {PureComponent} from 'react';
import {message} from 'antd';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import RoleItem from './components/RoleItem';
import Permissions from './components/Permissions';
import {checkLoggedUserPermission, router} from 'utils';
import {withI18n} from "@lingui/react";
import {Form} from '@ant-design/compatible';
import {stringify} from "qs";
import {PERMISSIONS} from 'utils/constant';
import styles from "./index.less";

@connect(({userRoleDetail, loading}) => ({userRoleDetail, loading}))
@withI18n()
@Form.create()
class UserRoleDetail extends PureComponent {
  state = {
    loading: false
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

  get permissions() {
    return {
      canViewRolesPermissions: checkLoggedUserPermission(PERMISSIONS.VIEW_ROLES_PERMISSIONS.name, PERMISSIONS.VIEW_ROLES_PERMISSIONS.guard_name)
    }
  }

  get roleDetailsProps() {
    const {dispatch, userRoleDetail, i18n} = this.props;

    return {
      role: userRoleDetail.currentItem,
      saveMode: userRoleDetail.saveMode,
      roleType: userRoleDetail.roleType,
      allUserList: userRoleDetail.allUserList,
      onAddItem(role) {
        return dispatch({
          type: 'userRoleDetail/create',
          payload: role,
        })
          .then(res => {
            if (res.success) {
              message.success(i18n._(res.message));
              router.push({
                pathname: `/userRoles/${res.role.id}`,
                search: stringify({
                  roleType: userRoleDetail?.roleType,
                }),
              });
            }
          })
          .catch((err) => {
            return err.response;
          });
      },
      onEditItem(role) {
        return dispatch({
          type: 'userRoleDetail/update',
          payload: role,
        })
          .then(res => {
            if (res.success) {
              message.success(i18n._(res.message));
            }
            return res;
          })
          .catch((err) => {
            return err.response;
          });
      },
      onDeleteItem(id) {
        dispatch({
          type: 'userRoleDetail/delete',
          payload: {id: id, roleType: userRoleDetail?.roleType},
        })
          .then(res => {
            if (res.success) {
              message.success(i18n._(res.message));
            }
            router.push({
              pathname: `/userRoles`,
              search: stringify({
                roleType: userRoleDetail?.roleType,
              }),
            });
          })
          .catch(console.error);
      },
      onSave(updateData) {
        dispatch({
          type: `userRoleDetail/update`,
          payload: {
            ...updateData
          },
        }).then(res => {
          if (res.success) {
            message.success(i18n._(res.message));
          }
        })
      },
      onCancel() {
        router.push({
          pathname: `/userRoles`,
          search: stringify({
            roleType: userRoleDetail.roleType,
          }),
        });
      },
      getAllUserList() {
        return dispatch({
          type: `userRoleDetail/getAllUserList`,
          payload: {
            role_type: userRoleDetail?.roleType,
            role_id: userRoleDetail?.currentItem?.id,
          },
        }).then(res => {
          return res;
        }).catch(err => {
          return err;
        })
      },
      assignUsersToRole(addedUserIds, removedUserIds) {
        return dispatch({
          type: `userRoleDetail/assignUsersToRole`,
          payload: {
            role_type: userRoleDetail.roleType,
            role_id: userRoleDetail.currentItem.id,
            added_user_ids: addedUserIds,
            removed_user_ids: removedUserIds,
          },
        }).then(res => {
          console.log(res);
          return res;
        }).catch(err => {
          return err;
        })
      },
    }
  };

  get permissionsDetailsProps() {
    const {dispatch, userRoleDetail, i18n} = this.props;
    // here we need to get selected permissions from userRoleDetail
    // and default permission for current role/user
    return {
      permissionList: PERMISSIONS,
      selectedPermissions: userRoleDetail?.currentItem?.permissionList,
      onSave(data) {
        dispatch({
          type: data.action === 'add' ? `userRoleDetail/assignPermission` : `userRoleDetail/removePermission`,
          payload: {
            role_type: userRoleDetail?.roleType,
            role_id: userRoleDetail?.currentItem?.id,
            permission: data.permission,
            guard_name: data.guard_name,
          },
        }).then(res => {
          if (res.success) {
            message.success(i18n._(res.message));
          }
        }).catch(console.error);
      },
      onAddDefaultPermissions(data) {
        dispatch({
          type: `userRoleDetail/assignDefaultPermissions`,
          payload: {
            role_type: userRoleDetail?.roleType,
            role_id: userRoleDetail?.currentItem?.id,
            role_name: data.role_name,
          },
        }).then(res => {
          if (res.success) {
            message.success(i18n._(res.message));
          }
        }).catch(console.error);
      },
    }
  };

  render() {
    const {i18n, userRoleDetail} = this.props;
    const {canViewRolesPermissions} = this.permissions;
    if (!canViewRolesPermissions) {
      return <>
        <h1>{i18n.t`Access Denied`}</h1>
      </>
    }
    return (
      <div>
        <div className={styles['roles-header-wrapper']}>
          <RoleItem details={this.roleDetailsProps}/>
        </div>
        {userRoleDetail?.currentItem?.id &&
        <div className={styles['roles-body_content']}>
          <Permissions details={this.permissionsDetailsProps}/>
        </div>
        }
        <style jsx="true">{`
          main.ant-layout-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            background-color: transparent !important;
          }
        `}</style>
      </div>
    );
  }
}

UserRoleDetail.propTypes = {
  userRoleDetail: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default UserRoleDetail;
