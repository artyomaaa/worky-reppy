import React from 'react';
import styles from "./style.less";
import {Button, Form} from "antd";
import {withRouter} from "dva/router";
import {withI18n} from "@lingui/react";
import {connect} from "dva";
import WebSite from "./components/addForm/WebSite"
import SocialNetwork from "./components/addForm/SocialNetwork"
import Social from "./components/social"
import WorkNumberAndEmailForm from "./components/addForm/WorkNumberAndEmailForm"
import {USER_DYNAMIC_COMPONENTS, PERMISSIONS, CONTACT_TYPES} from 'utils/constant'
import store from "store";
import {checkLoggedUserPermission} from 'utils';

const mapStateToProps = ({userDetail}) => ({userDetail});

@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)
class ContactInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isActiveWorkTime: false,
      isActiveWebsiteForm: false,
      isActiveSocialNetwork: false,
    }
  }

  toggleAddWebsiteOrSocial = (formName) => {
    this.setState((state) => {
      if (formName === "WebSite") {
        return {
          isActiveWebsiteForm: !state.isActiveWebsiteForm
        }
      } else if (formName === 'SocialNetwork') {
        return {
          isActiveSocialNetwork: !state.isActiveSocialNetwork
        }
      } else if (formName === 'timeAndEmail') {
        return {
          isActiveWorkTime: !state.isActiveWorkTime,
        }
      }
    })
  }

  generateData = (contacts, find) => {
    return contacts?.length > 0 ? contacts.filter((el) => el.type === find) : [];
  }

  findWorkNumberAndEmail = (contacts) => {
    const data = {};
    const contactFields = [
      CONTACT_TYPES.email.workedEmail.name,
      CONTACT_TYPES.email.personalEmail.name,
      CONTACT_TYPES.phone.personalNumber.name,
      CONTACT_TYPES.phone.otherPhoneNumber.name,
      CONTACT_TYPES.phone.workedNumber.name,
      CONTACT_TYPES.phone.homeNumber.name,
      CONTACT_TYPES.phone.extraNumber.name,
      CONTACT_TYPES.extraName.name,
    ];
    for (let i = 0; i < contacts?.length; i++) {
      if (contactFields.includes(contacts[i].name)) {
        data[contacts[i].name] = contacts[i].value;
      }
    }
    return data;
  }

  onDelete = (id) => {
    const sendData = {};

    sendData.actionName = "deleteItem"
    sendData.deleteId = id;

    this.onSubmit(sendData)
  }

  getPermissions = () => {
    const loggedUser = store.get('user'),
          isOwnerPage = +loggedUser.id === +this.props.userDetail?.headerData?.id,
          canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name),
          canViewSelfUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name),
          canEditUser = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name),
          canEditSelfUser = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name),
          canViewContacts = checkLoggedUserPermission(PERMISSIONS.VIEW_CONTACTS.name, PERMISSIONS.VIEW_CONTACTS.guard_name),
          canViewSelfContacts = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_CONTACTS.name, PERMISSIONS.VIEW_SELF_CONTACTS.guard_name),
          canAddContacts = checkLoggedUserPermission(PERMISSIONS.ADD_CONTACTS.name, PERMISSIONS.ADD_CONTACTS.guard_name),
          canAddSelfContacts = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_CONTACTS.name, PERMISSIONS.ADD_SELF_CONTACTS.guard_name),
          canEditContacts = checkLoggedUserPermission(PERMISSIONS.EDIT_CONTACTS.name, PERMISSIONS.EDIT_CONTACTS.guard_name),
          canEditSelfContacts = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_CONTACTS.name, PERMISSIONS.EDIT_SELF_CONTACTS.guard_name),
          canDeleteContacts = checkLoggedUserPermission(PERMISSIONS.DELETE_CONTACTS.name, PERMISSIONS.DELETE_CONTACTS.guard_name),
          canDeleteSelfContacts = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_CONTACTS.name, PERMISSIONS.DELETE_SELF_CONTACTS.guard_name);

    let viewContactAccess = false,
      addContactAccess = false,
      editContactAccess = false,
      deleteContactAccess = false;

    if ((canViewUserDetails || (isOwnerPage && canViewSelfUserDetails)) && (canViewContacts || (isOwnerPage && canViewSelfContacts))) {
      viewContactAccess = true;
    }

    if (canEditUser || (isOwnerPage && canEditSelfUser)) {
      if (canAddContacts || (isOwnerPage && canAddSelfContacts)) {
        addContactAccess = true;
      }
      if (canEditContacts || (isOwnerPage && canEditSelfContacts)) {
        editContactAccess = true;
      }
      if (canDeleteContacts || (isOwnerPage && canDeleteSelfContacts)) {
        deleteContactAccess = true;
      }
    }

    return {
      viewContactAccess,
      addContactAccess,
      editContactAccess,
      deleteContactAccess,
      loggedUser,
      canEditContacts,
      isOwnerPage,
      canEditUser
    }
  }

  onSubmit = (data) => {
    const {details: {onSave}, match: {params: {id}}} = this.props;
    data.user_id = +id
    data.tab = USER_DYNAMIC_COMPONENTS.CONTACT_INFO;
    onSave(data)
    this.toggleAddWebsiteOrSocial(data.actionName)
  }

  render() {
    const {i18n, userDetail: {contact_info: {contacts}, isSubmittedLoading}} = this.props,
          {isActiveWebsiteForm, isActiveSocialNetwork, isActiveWorkTime} = this.state,
          {editContactAccess,addContactAccess,viewContactAccess} = this.getPermissions();

    return (
      <>
        <WorkNumberAndEmailForm permissions={this.getPermissions()}
                                data={this.findWorkNumberAndEmail(contacts)} onSubmit={this.onSubmit}
                                toggleAddWebsiteOrSocial={this.toggleAddWebsiteOrSocial}
                                isSubmittedLoading={isSubmittedLoading} isActiveWorkTime={isActiveWorkTime}/>
        {viewContactAccess &&
          <>
            <h3 className={styles['content-title']}>{i18n.t`On The Web`}</h3>
            <Social i18n={i18n} permissions={this.getPermissions()} onDelete={this.onDelete}
                    socialNetworks={this.generateData(contacts, "social")}/>
          </>
        }
        {
          isActiveSocialNetwork ?
            <SocialNetwork isSubmittedLoading={isSubmittedLoading} onSubmit={this.onSubmit}
                           onClose={() => this.toggleAddWebsiteOrSocial("SocialNetwork")}/> :
            editContactAccess && <div className={styles['add-section']}>
              {addContactAccess &&
                <span onClick={() => this.toggleAddWebsiteOrSocial("SocialNetwork")}
                      className="add-btn">{i18n.t`+ Add`}</span>
              }
            </div>
        }
      </>
    );
  }
}

ContactInfo.propTypes = {};
export default ContactInfo;
