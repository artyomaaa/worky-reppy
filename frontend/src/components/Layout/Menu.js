import React, {PureComponent, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Icon as LegacyIcon} from '@ant-design/compatible';
import {Menu} from 'antd';
import Navlink from 'umi/navlink';
import withRouter from 'umi/withRouter';
import styles from './Menu.less';
import Icons from 'icons/icon';
import {
  arrayToTree,
  queryAncestors,
  pathMatchRegexp,
  addLangPrefix,
} from 'utils';
import store from 'store';

const {SubMenu} = Menu;

@withRouter
class SiderMenu extends PureComponent {
  state = {
    openKeys: store.get('openKeys') || [],
    hideShowModal: true
  }

  toggleMobileMenu = (cond) => {
    if (!this.props.isMobile) return;
    !this.state.hideMobileMenu && this.setState({hideMobileMenu: cond});
    this.sendHideMobileMenu(cond)
  };

  sendHideMobileMenu = () => {
    this.props.parentCallback(false);
  };

  onOpenChange = openKeys => {
    const {menus} = this.props;
    const rootSubmenuKeys = menus.filter(_ => !_.menuParentId).map(_ => _.id);

    const latestOpenKey = openKeys.find(
      key => this.state.openKeys.indexOf(key) === -1
    );

    let newOpenKeys = openKeys;
    if (rootSubmenuKeys.indexOf(latestOpenKey) !== -1) {
      newOpenKeys = latestOpenKey ? [latestOpenKey] : []
    }

    this.setState({
      openKeys: newOpenKeys,
    });
    store.set('openKeys', newOpenKeys)
  };

  generateMenus = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <SubMenu
            key={item.id}
            title={
              <a>
                {item.icon && <Icons name={item.icon} style={{...(!this.props.collapsed && {marginRight: '22px'})}}/>}
                <span>{item.name}</span>
              </a>
            }
          >
            {this.generateMenus(item.children)}
          </SubMenu>
        )
      }
      return (
        <Menu.Item tabIndex="0" key={item.id}>
          <Navlink tabIndex="-1" to={addLangPrefix(item.route) || '#'} onClick={() => this.toggleMobileMenu(false)}>
            {
              (
                item?.icon === "bar-chart" ||
                item?.icon === "pie-chart"
              )
                ? <LegacyIcon type={item.icon}/>
                : <Icons name={item.icon} style={{...(!this.props.collapsed && {marginRight: '22px'}), ...(this.props.collapsed && {marginRight: '10px'})}}/>
            }
            <span>{item.name}</span>
          </Navlink>
        </Menu.Item>
      )
    })
  };

  render() {
    const {
      collapsed,
      theme,
      menus,
      location,
      isMobile,
      onCollapseChange,
    } = this.props;


    // Generating tree-structured data for menu content.
    const menuTree = arrayToTree(menus, 'id', 'menuParentId');

    // Find a menu that matches the pathname.
    const currentMenu = menus.find(
      _ => _.route && pathMatchRegexp(_.route, location.pathname)
    );

    // Find the key that should be selected according to the current menu.
    const selectedKeys = currentMenu
      ? queryAncestors(menus, currentMenu, 'menuParentId').map(_ => _.id)
      : [];

    const menuProps = collapsed
      ? {}
      : {
        openKeys: this.state.openKeys,
      };

    return (
      <Menu
        mode="inline"
        theme={theme}
        onOpenChange={this.onOpenChange}
        selectedKeys={selectedKeys}
        className={styles.menu}
        onClick={
          isMobile
            ? () => {
              onCollapseChange(true)
            }
            : undefined
        }
        {...menuProps}
      >
        {this.generateMenus(menuTree)}
      </Menu>
    )
  }
}

SiderMenu.propTypes = {
  menus: PropTypes.array,
  theme: PropTypes.string,
  isMobile: PropTypes.bool,
  onCollapseChange: PropTypes.func,
};

export default SiderMenu
