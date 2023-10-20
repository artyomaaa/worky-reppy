import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Button, Avatar, Upload, message} from 'antd';
import styles from './style.less';
import {UserOutlined} from "@ant-design/icons";
import Icons from 'icons/icon';
import {appUrl} from 'utils/config';
import {checkLoggedUserPermission, getResizedImage, getUserFullName, router} from 'utils';
import {PERMISSIONS, FILE_LIMITS} from 'utils/constant';
import {withI18n} from "@lingui/react";
import {Form} from '@ant-design/compatible';
import ImageCropper from "../../../../../components/ImageCropper/ImageCropper";
import store from "store";

const {IMG_MAX_SIZE} = FILE_LIMITS

@withI18n()
@Form.create()
class UserAvatar extends PureComponent {
  state = {
    imageUrl: "",
    loading: false,
    avatar: {},
    matches: window.matchMedia("(min-width: 768px)").matches,
  };

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  resetImageUrl = () => {

    this.setState({
      imageUrl: "",
      avatar: {}
    })
  }

  handleImgFile = imgObj => {
    const {uploadAvatar, id} = this.props.data;

    this.setState({
      avatar: imgObj
    }, () => uploadAvatar(this.state.avatar, id, this.resetImageUrl))
  }

  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
    this.setState({
      avatar: img,
    })
  };

  customRequest = ({file, onSuccess}) => {
    this.getBase64(file, imageUrl =>
      this.setState({
        imageUrl,
        loading: false,
      }),
    );
  };

  beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';

    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt10M = file.size < IMG_MAX_SIZE;

    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!');
    }
    return isJpgOrPng && isLt10M;
  };

  handleImageUrl = imageUrl => {
    this.setState({
      imageUrl
    })
  }

  goToCalendarPage = (userId) => {
    if (!userId) return;
    const calendarUrl = store.get('user')?.id?.toString() === userId?.toString() ? `/calendar` : `/calendar?userId=${userId}`;
    router.push(calendarUrl);
  }

  // getName (name, surname, patronymic) {
  //   name && name.length > 35 ? name = name.slice(0, 35) + "..." : name;
  //   surname && surname.length > 35 ? surname = surname.slice(0, 35) + "..." : surname;
  //   patronymic && patronymic.length > 35 ? patronymic = patronymic.slice(0, 35) + "..." : patronymic;
  //   return name + ' ' + (surname || '') + ' ' + (patronymic || '');
  // }

  get avatarPermissions() {
    const loggedUser = store.get('user'),
      isOwnerPage = +loggedUser.id === +this.props.data?.id,
      canUploadAvatar = isOwnerPage ? true : checkLoggedUserPermission(PERMISSIONS.UPLOAD_AVATAR.name, PERMISSIONS.UPLOAD_AVATAR.guard_name),
      canUploadSelfAvatar = isOwnerPage ? true : checkLoggedUserPermission(PERMISSIONS.UPLOAD_SELF_AVATAR.name, PERMISSIONS.UPLOAD_SELF_AVATAR.guard_name);

    return {
      canUploadSelfAvatar,
      canUploadAvatar,
      isOwnerPage,
    }
  }

  render() {
    const {i18n, data} = this.props;
    const {imageUrl} = this.state;
    const {avatar, status, role, trust} = data;
    const roleType = role?.name ?? '';
    const {canUploadAvatar, isOwnerPage, canUploadSelfAvatar} = this.avatarPermissions;

    return (
      <div className={styles['avatar-wrapper']}>
        <div className={styles['avatar-wrapper__image']}>

          <ImageCropper
            resetImageUrl={this.resetImageUrl}
            handleImageUrl={this.handleImageUrl}
            handleBlobImgObj={this.handleImgFile}
            imageUrl={imageUrl}/>
          <Upload
            openFileDialogOnClick={canUploadAvatar || (isOwnerPage && canUploadSelfAvatar)}
            customRequest={this.customRequest}
            multiple={false}
            className='avatar-uploader'
            listType="picture-card"
            showUploadList={false}
            beforeUpload={this.beforeUpload}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{width: '100%'}}/> :
              <Avatar shape="circle" size={100}
                      src={avatar ? `${appUrl}storage/images/avatars${getResizedImage(avatar, 'sm')}` : ''}
                      icon={!avatar ? <UserOutlined/> : ''}/>}
            <span className={styles['avatar-icon']}>
                  <Icons name="camera"/>
                </span>
          </Upload>
        </div>
        <div className={styles['avatar-wrapper__name']}>
          <h2 title={data && getUserFullName(data, true)}>
            { this.state.matches ? <> {data && getUserFullName(data, true)} </> : <> {data && getUserFullName(data, false)} </> }
          </h2>
          <p>{roleType}</p>
          <div className={styles['view-calendar']}>
            <Button type="link" onClick={() => this.goToCalendarPage(data.id)}>View  Calendar</Button>
          </div>
        </div>
      </div>
    )
  }
}

UserAvatar.propTypes = {
  data: PropTypes.object,
};

export default UserAvatar;
