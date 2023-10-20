import React, {useMemo} from "react";
import styles from "./AccountInfo.less"
import {appUrl} from "utils/config";
import userAvatar from "img/avatar.png"
import Icons from 'icons/icon';
import {Menu, Dropdown} from "antd";
import { router, getResizedImage, checkLoggedUserPermission } from 'utils';
import { PERMISSIONS } from "utils/constant";
import {withRouter} from "dva/router";

const AccountInfo = (
  {
    menus,
    loggedUser,
    avatar,
    username,
    position,
    onSignOut,
    headerType,
    primaryLayout,
    location,
    isMobile
  }) => {
  const canViewUsers = useMemo(() =>
    checkLoggedUserPermission(PERMISSIONS.VIEW_USERS.name, PERMISSIONS.VIEW_USERS.guard_name),
    []
  );

  const menu = useMemo(() =>
    menus.filter(item => item.isBottom).filter(item => !canViewUsers ? item.name !== "Profile" : item),
    [menus, canViewUsers]
  );

  const handleClickMenu = e => {
    if (e.item.props.dataroute === '/logout') {
      onSignOut()
    } else if (e.item.props.dataroute === '/profile') {
      router.push({
        pathname: "/users/" + loggedUser?.id,
        query: {
          tab: location.query.tab,
        }
      })
        if(!window.matchMedia("(min-width: 768px)").matches) {
          const { query } = location;

          router.push({
            pathname: "/users/" + loggedUser?.id,
            query: {
              tab: query.tab,
              modal: 'open',
            }
          })
        }
    } else if (e.item.props.dataroute === '/dashboard') {
      router.push({
        pathname: "/dashboard",
      })
    }
  };

  const generateMenus = () => (
    <Menu className={styles.userTopMenu}>
      {
        menu && menu.map(item =>
          (
            <Menu.Item key={item.id} dataroute={item.route} onClick={handleClickMenu}>
              {item.icon && <Icons name={item.icon}/>}
              <span>{item.name}</span>
            </Menu.Item>
          )
        )
      }
    </Menu>
  );

  const nameArr = username.split(' ');
  const firstName = nameArr[0] ?? ' ';
  const lastName = nameArr[1] ? nameArr[1].charAt(0) + '.' :  ' ';

  return (
    <div className={styles['account-wrapper']}>
      <Dropdown placement="bottomCenter"
                overlay={generateMenus()}
                trigger={['click']}
                overlayClassName={`${styles['account-dropdown']} ${primaryLayout ? styles['fixed'] : ''}`}>
        <div>
          <div className={`${styles['account-info']} ${styles[headerType]}`}>
            <div className={styles['account-name']}>
              {isMobile ? `${firstName} ${lastName}` : username}
            </div>
          </div>
          <div className={styles['account-avatar']}>
            {<img
              src={avatar ? `${appUrl}storage/images/avatars${getResizedImage(avatar, 'avatar')}` : userAvatar}
            />}
          </div>
        </div>
      </Dropdown>
    </div>
  )
}

export default withRouter(React.memo(AccountInfo))
