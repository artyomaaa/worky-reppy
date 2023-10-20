import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Layout, Popover, Badge, List, Button} from 'antd';
import {Ellipsis} from 'ant-design-pro';
import {RightOutlined} from '@ant-design/icons';
import {Trans, withI18n} from '@lingui/react';
import moment from 'utils/moment';
import {langFromPath, checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import styles from './Header.less';
import store from "store";
import withRouter from "umi/withRouter";
import AccountInfo from "../AccountInfo"
import Icons from 'icons/icon';
import {pathMatchRegexp, checkCanSubmitDayReport} from 'utils';
import {connect} from "dva";

@withI18n()
@withRouter
@connect(({works,}) => ({works}))
class Header extends PureComponent {
  state = {
    showTodoModal: false,
    showMobileMenu: false,
  }

  toggleTodoModal = (e) => {
    const {dispatch, works: {showTodoModal, totalToDo, toDoList}} = this.props;

    dispatch({
      type: 'works/openModalToDoList',
      payload: {
        showTodoModal: !showTodoModal,
        showTodoMore: !!((totalToDo > 10 && !toDoList) || (toDoList && ((totalToDo - toDoList.length) < 10 ))),
      },
    });
  };

  toggleMobileMenu = (cond) => {
    !this.state.showMobileMenu && this.setState({showMobileMenu: cond})
    this.sendShowMobileMenu(cond);
  };

  sendShowMobileMenu= () => {
    this.props.parentCallback(true);
  };

  render() {
    const {
      location,
      i18n,
      avatar,
      username,
      position,
      collapsed,
      notifications,
      onAllNotificationsRead,
      menus,
      onSignOut,
      works,
      isMobile
    } = this.props;
    const rightContent = [];
    const routeList = store.get('routeList') || [];
    const loggedUser = store.get('user');
    const lang = langFromPath(location.pathname);
    const canViewTodos = checkLoggedUserPermission(PERMISSIONS.VIEW_TODOS.name, PERMISSIONS.VIEW_TODOS.guard_name);
    const accountInfoProps = () => {
      return {
        loggedUser,
        menus,
        avatar,
        username,
        onSignOut,
        position,
        isMobile,
        primaryLayout: false
      }
    }
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
    rightContent.unshift(
      <AccountInfo {...accountInfoProps()} />
    );

    return (
      <Layout.Header
        className={styles['header']}
        id="layoutHeader"
      >
        <div className={styles['header_top']}>
          <div className={styles['header_top-left']}>
            {
              isMobile ?
                <div
                  className={styles['menu-hamburger']}
                  onClick={() => this.toggleMobileMenu(true)}
                >
                  <Icons name="menu"/>
                </div>
                : null
            }
            {
              pathMatchRegexp('/tasks', location.pathname) && canViewTodos ?
                <div className={styles['header_top-task-page']}>
                  <Button
                    className="app-btn primary-btn"
                    onClick={() => this.toggleTodoModal(true)}
                  >
                    <Icons name="note"/>
                    <div><Trans>TO DO LIST </Trans></div>
                    <span>- {works?.totalToDo}</span>
                  </Button>
                </div>
                : null
            }
          </div>
          <div className={styles['header_top-right']}>
            <AccountInfo {...accountInfoProps()} />
          </div>
        </div>
      </Layout.Header>
    )
  }
}

Header.propTypes = {
  fixed: PropTypes.bool,
  user: PropTypes.object,
  menus: PropTypes.array,
  collapsed: PropTypes.bool,
  notifications: PropTypes.array,
  onCollapseChange: PropTypes.func,
  onAllNotificationsRead: PropTypes.func,
};

export default Header
