import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Layout} from 'antd';
import {withI18n} from '@lingui/react';
import ScrollBar from '../ScrollBar';
import SiderMenu from './Menu';
import styles from './Sider.less';
import {connect} from "dva";
import Icons from 'icons/icon';
import Brand from 'shared/UIElements/Brand'

@connect(({dashboard, userDetail, loading}) => ({
  dashboard,
  loading,
  userDetail
}))
@withI18n()
class Sider extends PureComponent {
  state = {
    hideMobileMenu: true,
  }

  toggleMobileMenu = (cond) => {
    !this.state.hideMobileMenu && this.setState({hideMobileMenu: cond})
    this.sendShowMobileMenu(cond);
  };

  sendShowMobileMenu = () => {
    this.props.parentCallback(false);
  };

  callbackHideMobileMenuItem = (childData) => {
    this.setState({hideMobileMenu: childData})
    this.props.parentCallback(false);
  };

  render() {
    const {
      menus,
      theme,
      isMobile,
      collapsed,
      onCollapseChange,
      onSignOut,
    } = this.props;

    return (
      <Layout.Sider
        width={260}
        theme={theme}
        breakpoint="lg"
        trigger={null}
        collapsible
        collapsed={this.props.collapsed}
        onBreakpoint={!isMobile && onCollapseChange}
        className={isMobile ? "mobileNav" : "sider"}
      >
        <div className={styles['logoWrapper']} onClick={() => this.toggleMobileMenu(false)}>
          {
            isMobile ? <Icons name="close"/> : null
          }
          <div className="logo">
            <Brand width="50px" height="50px"/>
          </div>
        </div>
        <div className={styles['menuContainer']}>
          <ScrollBar
            options={{
              // Disabled horizontal scrolling, https://github.com/utatti/perfect-scrollbar#options
              suppressScrollX: true,
            }}
          >
            <SiderMenu
              menus={menus}
              theme={theme}
              isMobile={isMobile}
              collapsed={collapsed}
              onCollapseChange={onCollapseChange}
              onSignOut={onSignOut}
              parentCallback={this.callbackHideMobileMenuItem}
            />
          </ScrollBar>
        </div>
        <div className={`toggleIcon ${collapsed ? 'collapsed' : ''}`} onClick={() => onCollapseChange(!collapsed)}>
          <Icons name={'asideToggle'}/>
        </div>
      </Layout.Sider>
    )
  }
}

Sider.propTypes = {
  userDetail: PropTypes.object,
  menus: PropTypes.array,
  theme: PropTypes.string,
  isMobile: PropTypes.bool,
  collapsed: PropTypes.bool,
  onThemeChange: PropTypes.func,
  onCollapseChange: PropTypes.func,
  onSignOut: PropTypes.func,
};

export default Sider
