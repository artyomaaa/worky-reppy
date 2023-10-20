import React from 'react';
import FormUniversityInfo from "./FormUniversityInfo";
import FormCollegeInfo from "./FormCollegeInfo";
import FormSchoolInfo from "./FormSchoolInfo";
import FormLanguageInfo from "./FormLanguageInfo";
import FormMilitaryInfo from "./FormMilitaryInfo";
import { connect } from 'dva';
import store from "store";
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant'
import {withRouter} from "umi";
import styles from "../PersonalInfo/style.less";


const mapStateToProps = ({ }) => ({ });

@withRouter
@connect(mapStateToProps)
class EducationInfo extends React.Component {
  state = {
    matches: window.matchMedia("(min-width: 768px)").matches,
  };

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  getPermissions = () => {
    const loggedUser = store.get('user'),
          isOwnerPage = loggedUser?.id === +this.props.match?.params?.id,
          canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name),
          canViewSelfUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name),
          canEditUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name),
          canEditSelfUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name),
          canViewEducation = checkLoggedUserPermission(PERMISSIONS.VIEW_EDUCATION.name, PERMISSIONS.VIEW_EDUCATION.guard_name),
          canAddEducation = checkLoggedUserPermission(PERMISSIONS.ADD_EDUCATION.name, PERMISSIONS.ADD_EDUCATION.guard_name),
          canEditEducation = checkLoggedUserPermission(PERMISSIONS.EDIT_EDUCATION.name, PERMISSIONS.EDIT_EDUCATION.guard_name),
          canDeleteEducation = checkLoggedUserPermission(PERMISSIONS.DELETE_EDUCATION.name, PERMISSIONS.DELETE_EDUCATION.guard_name),
          canViewSelfEducation = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_EDUCATION.name, PERMISSIONS.VIEW_SELF_EDUCATION.guard_name),
          canAddSelfEducation = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_EDUCATION.name, PERMISSIONS.ADD_SELF_EDUCATION.guard_name),
          canEditSelfEducation = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_EDUCATION.name, PERMISSIONS.EDIT_SELF_EDUCATION.guard_name),
          canDeleteSelfEducation = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_EDUCATION.name, PERMISSIONS.DELETE_SELF_EDUCATION.guard_name),
          canViewLanguage = checkLoggedUserPermission(PERMISSIONS.VIEW_LANGUAGE.name, PERMISSIONS.VIEW_LANGUAGE.guard_name),
          canAddLanguage = checkLoggedUserPermission(PERMISSIONS.ADD_LANGUAGE.name, PERMISSIONS.ADD_LANGUAGE.guard_name),
          canEditLanguage = checkLoggedUserPermission(PERMISSIONS.EDIT_LANGUAGE.name, PERMISSIONS.EDIT_LANGUAGE.guard_name),
          canDeleteLanguage = checkLoggedUserPermission(PERMISSIONS.DELETE_LANGUAGE.name, PERMISSIONS.DELETE_LANGUAGE.guard_name),
          canViewSelfLanguage = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_LANGUAGE.name, PERMISSIONS.VIEW_SELF_LANGUAGE.guard_name),
          canAddSelfLanguage = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_LANGUAGE.name, PERMISSIONS.ADD_SELF_LANGUAGE.guard_name),
          canEditSelfLanguage = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_LANGUAGE.name, PERMISSIONS.EDIT_SELF_LANGUAGE.guard_name),
          canDeleteSelfLanguage = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_LANGUAGE.name, PERMISSIONS.DELETE_SELF_LANGUAGE.guard_name);
    let   viewEducationAccess = false, addEducationAccess = false, editEducationAccess = false, deleteEducationAccess = false,
          viewLanguageAccess = false, addLanguageAccess = false, editLanguageAccess = false, deleteLanguageAccess = false;

    if ((canViewUserDetails || (isOwnerPage && canViewSelfUserDetails)) && (canViewEducation || (isOwnerPage && canViewSelfEducation))) {
      viewEducationAccess = true;
    }

    if (canEditUsers || (isOwnerPage && canEditSelfUsers)) {
      if (canAddEducation || (isOwnerPage && canAddSelfEducation)) {
        addEducationAccess = true;
      }
      if (canEditEducation || (isOwnerPage && canEditSelfEducation)) {
        editEducationAccess = true;
      }
      if (canDeleteEducation || (isOwnerPage && canDeleteSelfEducation)) {
        deleteEducationAccess = true;
      }
      if (canViewLanguage || (isOwnerPage && canViewSelfLanguage)) {
        viewLanguageAccess = true;
      }
      if (canAddLanguage || (isOwnerPage && canAddSelfLanguage)) {
        addLanguageAccess = true;
      }
      if (canEditLanguage || (isOwnerPage && canEditSelfLanguage)) {
        editLanguageAccess = true;
      }
      if (canDeleteLanguage || (isOwnerPage && canDeleteSelfLanguage)) {
        deleteLanguageAccess = true;
      }
    }
      return {
      viewEducationAccess,
      addEducationAccess,
      editEducationAccess,
      deleteEducationAccess,
      viewLanguageAccess,
      addLanguageAccess,
      editLanguageAccess,
      deleteLanguageAccess
    }
  }

  render() {
    return (
      <>
        { !this.state.matches &&
        <div className={styles['form-title']}>
          <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.0026 5.66504C13.0902 5.66506 13.1769 5.64783 13.2578 5.61434C13.3386 5.58084 13.4122 5.53174 13.4741 5.46983C13.536 5.40792 13.5851 5.33441 13.6186 5.25352C13.6521 5.17263 13.6693 5.08592 13.6693 4.99837V2.99837C13.6693 2.85849 13.6253 2.72214 13.5435 2.60867C13.4617 2.4952 13.3463 2.41037 13.2135 2.36621L7.21354 0.366211C7.07661 0.320638 6.9286 0.320638 6.79166 0.366211L0.791664 2.36621C0.658933 2.41037 0.543477 2.4952 0.461675 2.60867C0.379873 2.72214 0.33588 2.85849 0.335938 2.99837V4.99837C0.335915 5.08592 0.353143 5.17263 0.386638 5.25352C0.420133 5.33441 0.469239 5.40792 0.531149 5.46983C0.593059 5.53174 0.666561 5.58084 0.747455 5.61434C0.828349 5.64783 0.91505 5.66506 1.0026 5.66504H1.66927V10.4546C1.28043 10.5915 0.943514 10.8455 0.704782 11.1816C0.46605 11.5177 0.337206 11.9194 0.335938 12.3317V13.665C0.335915 13.7526 0.353143 13.8393 0.386638 13.9202C0.420133 14.0011 0.469239 14.0746 0.531149 14.1365C0.593059 14.1984 0.666561 14.2475 0.747455 14.281C0.828349 14.3145 0.91505 14.3317 1.0026 14.3317H13.0026C13.0902 14.3317 13.1769 14.3145 13.2578 14.281C13.3386 14.2475 13.4122 14.1984 13.4741 14.1365C13.536 14.0746 13.5851 14.0011 13.6186 13.9202C13.6521 13.8393 13.6693 13.7526 13.6693 13.665V12.3317C13.668 11.9194 13.5392 11.5177 13.3004 11.1816C13.0617 10.8455 12.7248 10.5915 12.3359 10.4546V5.66504H13.0026ZM12.3359 12.9984H1.66927V12.3317C1.66945 12.1549 1.73974 11.9855 1.86473 11.8605C1.98971 11.7355 2.15918 11.6652 2.33594 11.665H11.6693C11.846 11.6652 12.0155 11.7355 12.1405 11.8605C12.2655 11.9855 12.3358 12.1549 12.3359 12.3317V12.9984ZM3.0026 10.3317V5.66504H4.33594V10.3317H3.0026ZM5.66927 10.3317V5.66504H8.33594V10.3317H5.66927ZM9.66927 10.3317V5.66504H11.0026V10.3317H9.66927ZM1.66927 4.3317V3.47884L7.0026 1.70084L12.3359 3.47884V4.3317H1.66927Z" fill="#4A54FF"/>
          </svg>
          <h3>Education/Military</h3>
        </div>
        }
        <FormUniversityInfo permissionsUser={this.getPermissions()}/>
        <hr/>
        <FormCollegeInfo permissionsUser={this.getPermissions()}/>
        <hr/>
        <FormSchoolInfo permissionsUser={this.getPermissions()}/>
        <hr/>
        {/*<FormLanguageInfo permissionsUser={this.getPermissions()}/>*/}
        <FormMilitaryInfo permissionsUser={this.getPermissions()}/>
      </>
    );
  }
}

EducationInfo.propTypes = {};
export default EducationInfo;
