import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {Icon, message,} from 'antd';
import {checkLoggedUserPermission, router, getLocale} from 'utils';
import {withI18n} from "@lingui/react";
import {Form} from '@ant-design/compatible';
import {withRouter} from "dva/router";
import {Redirect} from 'umi'
import {stringify} from "qs";
import store from "store";
import {PERMISSIONS, USER_DYNAMIC_COMPONENTS} from 'utils/constant';
import styles from "./index.less";
import UserHeaderWrapper from './components/UserHeader';
import AsideBar from './components/AsideBar';
import UserSideContent from './components/SideContent';
import Error from '../../error';

@connect(({ userDetail, loading }) => ({ userDetail, loading }))
@withI18n()
@Form.create()
class UserDetail extends PureComponent {
  state = {
    matches: window.matchMedia("(min-width: 768px)").matches,
    loading: false,
    tabContent: USER_DYNAMIC_COMPONENTS.PERSONAL_INFO,
    headerData: {},
    loggedUserId: null,
  };

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    const {location} = this.props;
    const {query} = location;
    let tab = query?.tab ? query?.tab : USER_DYNAMIC_COMPONENTS.PERSONAL_INFO;
    const user = store.get('user');
    this.setState({
      tabContent: tab,
      loggedUserId: user.id
    });
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.userDetail?.headerData !== this.props.userDetail?.headerData) { // Detect User Details changes
      this.setState({
        headerData: {
          ...this.props?.userDetail?.headerData,
          loggedUserId: this.state.loggedUserId,
        },
      })
    }
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  handleRefresh = newQuery => {
    const { location } = this.props;
    const { query, pathname } = location;

    router.push({
      pathname,
      search: stringify(
        {
          ...query,
          ...newQuery,
          modal: 'close',
        },
        { arrayFormat: 'repeat' }
      ),
    });
  };

  changeParentTab = (tab) => {
    this.setState({
      tabContent: tab,
    })
    this.handleRefresh({tab});
  };

  get permissions() {
    const loggedUser = store.get('user'),
          isOwnerPage = +loggedUser.id === +this.props.userDetail?.headerData?.id,
          canViewJobInfo = checkLoggedUserPermission(PERMISSIONS.VIEW_JOB_INFORMATION.name, PERMISSIONS.VIEW_JOB_INFORMATION.guard_name) ||
            (isOwnerPage && checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_JOB_INFORMATION.name, PERMISSIONS.VIEW_SELF_JOB_INFORMATION.guard_name)),
          canViewRemuneration = checkLoggedUserPermission(PERMISSIONS.VIEW_REMUNERATION.name, PERMISSIONS.VIEW_REMUNERATION.guard_name) ||
            (isOwnerPage && checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_REMUNERATION.name, PERMISSIONS.VIEW_SELF_REMUNERATION.guard_name)),
          canViewDocuments = checkLoggedUserPermission(PERMISSIONS.VIEW_DOCUMENTS.name, PERMISSIONS.VIEW_DOCUMENTS.guard_name) ||
            (isOwnerPage && checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_DOCUMENTS.name, PERMISSIONS.VIEW_SELF_DOCUMENTS.guard_name)),
          canViewMoreInfo = checkLoggedUserPermission(PERMISSIONS.VIEW_MORE_INFO.name, PERMISSIONS.VIEW_MORE_INFO.guard_name) ||
            (isOwnerPage && checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_MORE_INFO.name, PERMISSIONS.VIEW_SELF_MORE_INFO.guard_name)),
          canViewEducation = checkLoggedUserPermission(PERMISSIONS.VIEW_EDUCATION.name, PERMISSIONS.VIEW_EDUCATION.guard_name) ||
            (isOwnerPage && checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_EDUCATION.name, PERMISSIONS.VIEW_SELF_EDUCATION.guard_name)),
          canViewContacts = checkLoggedUserPermission(PERMISSIONS.VIEW_CONTACTS.name, PERMISSIONS.VIEW_CONTACTS.guard_name) ||
            (isOwnerPage && checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_CONTACTS.name, PERMISSIONS.VIEW_SELF_CONTACTS.guard_name)),
          canViewCasualInfo = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_CASUAL.name, PERMISSIONS.VIEW_USER_CASUAL.guard_name);

    return {
      //this is for checking the tabs to see if the user sees or not , only added here remuneration, then you can add others, they are now by default true
      [USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]: true,
      [USER_DYNAMIC_COMPONENTS.JOB_INFO]: canViewJobInfo,
      [USER_DYNAMIC_COMPONENTS.REMUNERATION]: canViewRemuneration,
      [USER_DYNAMIC_COMPONENTS.CONTACT_INFO]: canViewContacts,
      [USER_DYNAMIC_COMPONENTS.FILE]: canViewDocuments,
      [USER_DYNAMIC_COMPONENTS.EDU]: canViewEducation,
      [USER_DYNAMIC_COMPONENTS.PERMISSION]: true,
      [USER_DYNAMIC_COMPONENTS.NOTES]: true,
      [USER_DYNAMIC_COMPONENTS.CASUAL_INFO]: canViewCasualInfo,
    }
  }

  get getUserHeaderWrapperProps() {
    const {dispatch, i18n} = this.props;

    return {
      onUploadAvatar(avatar, id, resetImageUrl) {
        dispatch({
          type: `userDetail/uploadAvatar`,
          payload: {avatar, id},
        }).then((res) => {
          if (!res.success) {
            resetImageUrl()
          }
          message.success(i18n._(res.message));
        })
      }
    }
  }

  get detailsProps() {
    const {dispatch, userDetail, i18n} = this.props;
    let tabContentProps = {};
    if (this.state?.tabContent === USER_DYNAMIC_COMPONENTS.JOB_INFO) {
      const {allPositions, allRoles, allSkills, allSoftSkills,isLoading} = userDetail;
      tabContentProps = (userDetail && this.state?.tabContent) ? userDetail[this.state?.tabContent] : {};
      tabContentProps.allPositions = allPositions;
      tabContentProps.allRoles = allRoles;
      tabContentProps.allSkills = allSkills;
      tabContentProps.allSoftSkills = allSoftSkills;
      tabContentProps.isLoading = isLoading;
    }

    return {
      ...tabContentProps,
      onSave(updateData) {
        dispatch({
          type: `userDetail/update`,
          payload: {
            ...updateData
          },
        }).then(response=>{
          if (response.success) {
            message.success(i18n._(response.message));
          }
        })
      },
      onRemoveJobInformation(data){
        return dispatch({
          type: `userDetail/removeJobInformation`,
          payload: {
            id: data.id,
            userId: data.user_id,
          },
        }).then(response => {
          if (response.success) {
            message.success(i18n._(response.message));
          }
          return response;
        }).catch(e => {
          return e.response;
        })
      }
    }
  };

  render() {
    const {location} = this.props;
    const {userDetail} = this.props;

    if(!userDetail.headerData) {
      return <Redirect to={`/${getLocale()}/dashboard`} />;
    }

    return (
      <div>
        <div className={styles['user-header-wrapper']}>
          {this.state?.headerData ?
            <UserHeaderWrapper updateHeader={this.getUserHeaderWrapperProps} details={this.state?.headerData}/> :
            <span className={styles['user-header-wrapper_loading']}><Icon type="loading"/></span>}
        </div>
        {userDetail ?
          <div className={styles['user-body_content']}>
            <div className={styles['user-aside-bar']}>
              { !this.state.matches &&
                <div className={styles['user-aside-bar-media-content']}
                  onClick={() => {
                    router.push({
                    pathname: location.pathname,
                    query: {
                      modal: 'open',
                        },
                      },
                    )
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.33322 3C0.597875 3 0 3.62814 0 4.40002C0 5.1722 0.597875 5.80003 1.33322 5.80003C2.06827 5.80003 2.66644 5.1722 2.66644 4.40002C2.66644 3.62814 2.06827 3 1.33322 3Z" fill="black"/>
                    <path d="M1.33322 8.59961C0.597875 8.59961 0 9.22775 0 9.99963C0 10.7718 0.597875 11.3996 1.33322 11.3996C2.06827 11.3996 2.66644 10.7718 2.66644 9.99963C2.66644 9.22775 2.06827 8.59961 1.33322 8.59961Z" fill="black"/>
                    <path d="M1.33322 14.2002C0.597875 14.2002 0 14.8283 0 15.6002C0 16.3724 0.597875 17.0002 1.33322 17.0002C2.06827 17.0002 2.66644 16.3724 2.66644 15.6002C2.66644 14.8283 2.06827 14.2002 1.33322 14.2002Z" fill="black"/>
                    <rect x="4" y="3" width="15.9986" height="2.80003" rx="1.40002" fill="black"/>
                    <rect x="4" y="8.59961" width="15.9986" height="2.80003" rx="1.40002" fill="black"/>
                    <rect x="4" y="14.2002" width="15.9986" height="2.80003" rx="1.40002" fill="black"/>
                  </svg>
                </div>
              }
              <AsideBar
                permissions={this.permissions}
                activeLink={this.state.tabContent}
                changeParentTab={(tab) => this.changeParentTab(tab)}
              />
            </div>
            <div className={styles['user-tab-content']}>
              <UserSideContent
                permissions={this.permissions}
                tabContent={this.state.tabContent}
                detailsProps={this.detailsProps}
              />
            </div>
          </div>
          : <Error />}

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

UserDetail.propTypes = {
  userDetail: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default withRouter(UserDetail);
