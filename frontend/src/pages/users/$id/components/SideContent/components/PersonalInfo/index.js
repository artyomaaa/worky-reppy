import React from 'react';
import FormPersonalInfo from "./FormPersonalInfo";
import store from "store";
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS, ROLES, USER_DYNAMIC_COMPONENTS} from 'utils/constant'
import {connect} from "dva";

const mapStateToProps = ({userDetail}) => ({userDetail});

@connect(mapStateToProps)
class PersonalInfo extends React.Component {

  getPermissions = () => {
    const loggedUser = store.get('user'),
      isOwnerPage = +loggedUser.id === +this.props.userDetail?.headerData?.id,
      canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name),
      canViewSelfUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name),
      canEditUser = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name),
      canEditSelfUser = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name),
      canViewRelatives = checkLoggedUserPermission(PERMISSIONS.VIEW_RELATIVES.name, PERMISSIONS.VIEW_RELATIVES.guard_name),
      canViewSelfRelatives = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_RELATIVES.name, PERMISSIONS.VIEW_SELF_RELATIVES.guard_name),
      canAddRelatives = checkLoggedUserPermission(PERMISSIONS.ADD_RELATIVES.name, PERMISSIONS.ADD_RELATIVES.guard_name),
      canAddSelfRelatives = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_RELATIVES.name, PERMISSIONS.ADD_SELF_RELATIVES.guard_name),
      canEditRelatives = checkLoggedUserPermission(PERMISSIONS.EDIT_RELATIVES.name, PERMISSIONS.EDIT_RELATIVES.guard_name),
      canEditSelfRelatives = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_RELATIVES.name, PERMISSIONS.EDIT_SELF_RELATIVES.guard_name),
      canDeleteRelatives = checkLoggedUserPermission(PERMISSIONS.DELETE_RELATIVES.name, PERMISSIONS.DELETE_RELATIVES.guard_name),
      canDeleteSelfRelatives = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_RELATIVES.name, PERMISSIONS.DELETE_SELF_RELATIVES.guard_name),
      checkUserRole = loggedUser.roles.find(element => (element.name === ROLES.ADMINISTRATOR || element.name === ROLES.MANAGER || element.name === ROLES.HUMAN_RESOURCES_MANAGER)) !== undefined;

    let editUserAccess = false,
      viewRelativeAccess = false,
      addRelativeAccess = false,
      editRelativeAccess = false,
      deleteRelativeAccess = false;

    if ((canViewUserDetails || (isOwnerPage && canViewSelfUserDetails)) && (canViewRelatives || (isOwnerPage && canViewSelfRelatives))) {
      viewRelativeAccess = true;
    }

    if (canEditUser || (isOwnerPage && canEditSelfUser)) {
      editUserAccess = true;

      if (canAddRelatives || (isOwnerPage && canAddSelfRelatives)) {
        addRelativeAccess = true;
      }
      if (canEditRelatives || (isOwnerPage && canEditSelfRelatives)) {
        editRelativeAccess = true;
      }
      if (canDeleteRelatives || (isOwnerPage && canDeleteSelfRelatives)) {
        deleteRelativeAccess = true;
      }

    }

    return {
      editUserAccess,
      viewRelativeAccess,
      addRelativeAccess,
      editRelativeAccess,
      deleteRelativeAccess,
      loggedUser,
      isOwnerPage,
      checkUserRole,
    }
  }

  onSubmit = (data) => {
    const {details} = this.props;
    const {onSave} = details;

    data.tab = USER_DYNAMIC_COMPONENTS.PERSONAL_INFO;
    onSave(data);
  }

  render() {
    const {userDetail: {isLoading}} = this.props;

    return (
      <>
        {isLoading ? <div className="linear-activity linear-activity__top">
          <div className="indeterminate"/>
        </div> : <FormPersonalInfo permissionsUser={this.getPermissions()} onSubmit={this.onSubmit}/>}
      </>
    );
  }
}

PersonalInfo.propTypes = {};
export default PersonalInfo;
