import React from 'react';
import PropTypes from 'prop-types';
import { getTypeTextColor, checkLoggedUserPermission } from 'utils';
import {PERMISSIONS, ROLES} from 'utils/constant'
import UserAvatarWrap from './elements/AvatarWrap';
import UserContactWrap from './elements/ContactWrap';
import UserSkillsWrap from './elements/SkillsWrap';
import styles from "./style.less";
import store from "store";
import {connect} from "dva";

const mapStateToProps = ({userDetail}) => ({userDetail});

@connect(mapStateToProps)
class UserHeader extends React.Component {
  state = {

  };

  get userAvatarWrapProps () {
    return {
      id: this.props.details?.id,
      uploadAvatar: this.props.updateHeader?.onUploadAvatar,
      avatar: this.props.details?.avatar,
      patronymic: this.props.details?.patronymic,
      name: this.props.details?.name,
      surname: this.props.details?.surname,
      role: this.props.details?.user_role,
      trust: 85, /*Mock*/
      status: getTypeTextColor(this.props.details?.type).color, /*Need to discuss with backend*/
      email_verified_at: this.props.details?.email_verified_at,
    }
  }
  get userContactWrapProps () {
    const {id, email, contacts, birthday, user_job_information, email_verified_at, loggedUserId} = this.props?.details;
    const phone = contacts?.find((contact) => contact.name === "personalNumber")
    const address = contacts?.find((contact) => contact.name === "address1")

    return {
      id: id,
      email: email,
      phone,
      address: address || 'Somewhere',
      birthday: birthday,
      workExperience: user_job_information && user_job_information[0] ? user_job_information[0] : {},
      email_verified_at:email_verified_at,
      loggedUserId: loggedUserId,
    }
  }
  get userSkillsWrapProps () {
    return {
      skills: this.props.details?.skills ? this.props.details?.skills.map(item => item.name) : [],
      about: this.props?.details?.about ? this.props?.details?.about : '', /*Mock data*/
    }
  }

  get getPermissions () {
    const loggedUser = store.get('user'),
      isOwnerPage = +loggedUser.id === +this.props.userDetail?.headerData?.id,
      canEditUser = isOwnerPage ? true : checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name);

    return {
      loggedUser,
      isOwnerPage,
      canEditUser
    }
  }

  render () {
    return (
      <>
        <UserAvatarWrap data={{...this.userAvatarWrapProps}}/>
        <div className={styles['user-header-right']}>
          <UserContactWrap permissionsUser={this.getPermissions} data={{...this.userContactWrapProps}} />
          <UserSkillsWrap data={{...this.userSkillsWrapProps}} />
        </div>
      </>
    )
  }
}
// UserHeader.propTypes = {
//   details: PropTypes.object,
// };

export default UserHeader;
