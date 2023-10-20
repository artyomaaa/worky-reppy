/* global window */
/* global document */
import React, {PureComponent, Fragment} from 'react';
import PropTypes from 'prop-types';
import withRouter from 'umi/withRouter';
import {connect} from 'dva';
import {MyLayout} from '../components';
import {DownOutlined} from '@ant-design/icons';
import {BackTop, Layout, Drawer, Menu, Avatar} from 'antd';
import { checkLoggedUserPermission } from 'utils';
import {GlobalFooter} from 'ant-design-pro';
import {enquireScreen, unenquireScreen} from 'enquire-js';
import {config, pathMatchRegexp, langFromPath, setLocale, getResizedImage, getUserFullName} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import Error from '../pages/error';
import styles from './PrimaryLayout.less';
import store from 'store';
import {withI18n} from '@lingui/react';
import _config from 'config';


const {Content} = Layout;
const {Header, Bread, Sider} = MyLayout;
const {SubMenu} = Menu;

@withI18n()
@withRouter
@connect(({app, loading}) => ({app, loading}))
class PrimaryLayout extends PureComponent {
  state = {
    isMobile: false,
    showMobileMenu: false
  };

  componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      const {isMobile} = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile,
        })
      }
    })
  };

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler)
  };

  onCollapseChange = collapsed => {
    this.props.dispatch({
      type: 'app/handleCollapseChange',
      payload: collapsed,
    })
  };

  callbackShowMobileMenu = (childData) => {
    this.setState({showMobileMenu: childData})
  };

  callbackHideMobileMenu = (childData) => {
    this.setState({showMobileMenu: childData})
  };

  render() {
    const {i18n, app, location, dispatch, children, locale} = this.props;
    const {theme, notifications, collapsed} = app;
    const user = store.get('user') || {};
    const permissions = store.get('permissions') || {};
    const routeList = store.get('routeList') || [];
    const {isMobile} = this.state;
    const {onCollapseChange} = this;
    const pathname = location.pathname.split('/');
    const pathClassName = pathname[pathname.length - 1];
    // Localized route name.
    const lang = langFromPath(location.pathname);
    const newRouteList =
      lang !== 'en'
        ? routeList.map(item => {
          const {name, ...other} = item;
          return {
            ...other,
            name: (item[lang] || {}).name || name,
          }
        })
        : routeList;


    // Find a route that matches the pathname.
    const currentRoute = newRouteList.find(
      _ => _.route && pathMatchRegexp(_.route, location.pathname)
    );
    // Query whether you have permission to enter this page

    // Only Admin can view this
    const canViewRolesPermissions = checkLoggedUserPermission(PERMISSIONS.VIEW_ROLES_PERMISSIONS.name, PERMISSIONS.VIEW_ROLES_PERMISSIONS.guard_name);
    // Only user with these permissions can view this
    const canViewTeams = checkLoggedUserPermission(PERMISSIONS.VIEW_TEAMS.name, PERMISSIONS.VIEW_TEAMS.guard_name) ||
      checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_TEAMS.name, PERMISSIONS.VIEW_SELF_TEAMS.guard_name);
    const canViewUsers = checkLoggedUserPermission(PERMISSIONS.VIEW_USERS.name, PERMISSIONS.VIEW_USERS.guard_name);
    const canViewProjects = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECTS.name, PERMISSIONS.VIEW_PROJECTS.guard_name) ||
      checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_PROJECTS.name, PERMISSIONS.VIEW_SELF_PROJECTS.guard_name);

    const hasPermission = currentRoute
      ? permissions.visit.includes(currentRoute.id)
      : false;

    const allNeededPermissions = [
      {permission: canViewTeams, name: 'teams'},
      {permission: canViewRolesPermissions, name: 'userRoles'},
      {permission: canViewUsers, name: 'users'},
      {permission: canViewProjects, name: 'projects'},
    ];
    const menusPermissions = allNeededPermissions.filter((p) => !p.permission);
    // MenuParentId is equal to -1 is not a available menu.
    const menus = newRouteList.filter(_ => {
      const hasParent = _.menuParentId !== '-1';

      if(menusPermissions.length > 0) {
        const permission = menusPermissions.find((p) => _.route.includes(p.name));
        if(!permission) {
          return hasParent;
        }

        return false;
      }

      return hasParent;
    });

    const headerProps = {
      menus,
      collapsed,
      notifications,
      isMobile,
      onCollapseChange,
      avatar: getResizedImage(user.avatar, 'avatar'),
      username: getUserFullName(user),
      position: user.position,
      fixed: config.fixedHeader,
      onAllNotificationsRead() {
        dispatch({type: 'app/allNotificationsRead'})
      },
      onSignOut() {
        dispatch({type: 'app/signOut'});
        dispatch({type: 'dashboard/resetState', payload: {}});
        dispatch({type: 'works/resetState', payload: {}});
        dispatch({type: 'user/resetState', payload: {}});
        dispatch({type: 'projects/resetState', payload: {}});
        dispatch({type: 'teams/resetState', payload: {}});
        dispatch({type: 'reportsSummary/resetState', payload: {}});
        dispatch({type: 'reportsDetails/resetState', payload: {}});
      },
    };
    const siderProps = {
      theme,
      menus,
      isMobile,
      collapsed,
      username: getUserFullName(user),
      avatar: getResizedImage(user.avatar, 'avatar'),
      onCollapseChange,
      onThemeChange(theme) {
        dispatch({
          type: 'app/handleThemeChange',
          payload: theme,
        })
      },
    };
    const rightContent = [];
    if (_config.i18n) {
      const {languages} = _config.i18n;
      const currentLanguage = languages.find(
        item => item.key === i18n._language
      );
      rightContent.unshift(
        <div key="language" className={styles.langSect}>
          <Menu
            selectedKeys={[currentLanguage.key]}
            onClick={data => {
              setLocale(data.key)
            }}
            mode="horizontal"
          >
            <SubMenu title={<Avatar size="small" src={currentLanguage.flag}/>}>
              {languages.map(item => (
                <Menu.Item key={item.key}>
                  <Avatar
                    size="small"
                    style={{marginRight: 8, borderRadius: 0}}
                    src={item.flag}
                  />
                  {item.title}
                </Menu.Item>
              ))}
            </SubMenu>
          </Menu>
          <DownOutlined/>
        </div>
      )
    }
    return (
      <>
        {hasPermission ? <Layout>
          {isMobile ? (
            <Drawer
              maskClosable
              closable={false}
              onClose={onCollapseChange.bind(this, !collapsed)}
              visible={!collapsed}
              placement="left"
              width={200}
              style={{
                padding: 0,
                height: '100vh',
              }}
            >
              <Sider {...siderProps} onCollapseChange={(collapsed) => onCollapseChange(collapsed)}/>
            </Drawer>
          ) : (
            <Sider {...siderProps} onCollapseChange={(collapsed) => onCollapseChange(collapsed)}/>
          )}
          <div className={`main-content ${collapsed ? 'collapsed' : ''} ${styles[pathClassName]}`}>
            <Header {...headerProps} parentCallback={this.callbackShowMobileMenu}/>
            {this.state.showMobileMenu && isMobile ?
              <Sider {...siderProps} parentCallback={this.callbackHideMobileMenu}
                     showMobileMenu={this.state.showMobileMenu} collapsed={!isMobile}/>
              : null}
            <div
              className={styles.container}
              style={{paddingTop: config.fixedHeader ? 72 : 0}}
              id="primaryLayout"
            >
              <Content className={styles.content}>
                {children}
              </Content>
              <BackTop
                className={styles.backTop}
                target={() => document.querySelector('#primaryLayout')}
              />
              <div className={styles.footerSect}>
                {rightContent}
                <GlobalFooter
                  className={styles.footer}
                  copyright={config.copyright}
                />
              </div>
            </div>
          </div>
        </Layout> : <Error/>}
      </>
    )
  }
}

PrimaryLayout.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  app: PropTypes.object,
  loading: PropTypes.object,
};

export default PrimaryLayout
