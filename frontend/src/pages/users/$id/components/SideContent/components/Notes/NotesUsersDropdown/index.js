import React, {useEffect, useRef, useState} from 'react'
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {I18n, Trans} from "@lingui/react";
import Icons from 'icons/icon';
import {appUrl} from 'utils/config';
import {getResizedImage, getUserFullName} from 'utils';
import PropTypes from "prop-types";
import {Avatar, Button, Checkbox, Row, Col} from "antd";
import {UserOutlined} from "@ant-design/icons";
import styles from './style.less'
import store from "store";

const NotesUsersDropdown = (
  {
    show,
    users,
    onClose,
    parentCallback,
    userDetail,
    attachedUsers
  }
) => {
  const [isShowing, setIsShowing] = useState(show);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(attachedUsers.length ? [...attachedUsers] : (store.get('user').id === userDetail.id) ? [] : [userDetail]);
  const finalFilteredUsers = users.filter(u => u.name?.toLowerCase().includes(search?.toLowerCase()));
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!show) return;
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onClose()
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [show]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isShowing]);


  useEffect(() => {
    setIsShowing(show)
  }, [show]);

  const handleInputClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSearchChange = (event) => {
    const searchText = event.target.value;
    if (searchText.length <= 100) {
      setSearch(searchText);
      setErrorMessage("");
    } else {
      setErrorMessage({
        error: true,
        setErrorMessage: <Trans>Letter amount must be less than 100</Trans>
      });
      setSearch();
    }
  };

  const handleUserCheck = (user) => {
    const userIsSelected = selectedUsers.some(el => el.id === user.id);
    if (!userIsSelected) {
      setSelectedUsers([...selectedUsers, user])
    } else {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
    }
  };

  const handleAllUserCheck = () => {
    (selectedUsers?.length !== users.length) ?
      setSelectedUsers([...users]) : setSelectedUsers([])
  }

  const addUsersList = () => {
    parentCallback(selectedUsers);
    onClose();
  }

  const cancelUsersAdd = () => {
    setSelectedUsers([]);
    onClose();
  }

  return (
    <I18n>
      {({i18n}) => (
        <CSSTransition
          in={Boolean(isShowing)}
          timeout={200}
          classNames="fade"
          unmountOnExit
        >
          <div
            ref={wrapperRef} onClick={e => handleInputClick(e)}
            className={`${styles['dropdown']} ${styles['modal-dropdown']}`}>
            <div className={styles['search-field']}>
              <input
                type="text"
                placeholder={i18n._(`Find User`)}
                value={search}
                onChange={handleSearchChange}
                ref={searchInputRef}
              />
            </div>
            {errorMessage.error &&
            <div className={`${styles['error-message-block']}`}>{errorMessage.setErrorMessage}</div>}
            <div className={styles['users-sect']}>
              <span className={styles['label']}>
                <span>{selectedUsers.length}</span> {i18n._(`user(s) selected`)}
              </span>
              <div className={`${styles['all-select']}
              ${selectedUsers?.length === finalFilteredUsers.length ? styles.active : ''}`}>
                <div className={styles['all-select-label']}>
                  {i18n._(`Select All`)}
                </div>
                <span onClick={() => handleAllUserCheck(finalFilteredUsers)} className={styles['add-user']}>
                  <Icons name="success"/>
                </span>
              </div>
            </div>
            <ul className={styles['list']}>
              <TransitionGroup>
                {finalFilteredUsers && Object.values(finalFilteredUsers).map(user => {
                  if (!user || !user.id) return "";
                  return (
                    <CSSTransition
                      key={user.id}
                      timeout={200}
                      classNames="animateHeight"
                    >
                      <li
                        onClick={() => handleUserCheck(user)}
                        tabIndex="0"
                        className={
                          `${
                            selectedUsers?.length > 0 &&
                            selectedUsers?.map(uAdd => {
                              let currentUKey = 'id';
                              return uAdd && uAdd[currentUKey] === user.id ? styles.active : ""
                            })
                          } ${styles['user-item']}`.trim()
                            .split(",")
                            .join("")
                        }
                      >
                        <span className={styles['user-avatar-wrapper']}>
                          <span>
                            <Avatar
                              src={user?.avatar ? `${appUrl}/storage/images/avatars${getResizedImage(user.avatar, 'avatar')}` : ''}
                              icon={!user.avatar ? <UserOutlined/> : ''}/>
                          </span>
                        </span>
                        <span className={styles['userName']}>
                          {getUserFullName(user)}
                        </span>
                        <span className={styles['add-user']}>
                          <Icons name="success"/>
                        </span>
                      </li>
                    </CSSTransition>)
                })}
              </TransitionGroup>
            </ul>
            <Row className={styles['dropdown-actions']}>
              <Button className="app-btn primary-btn-outline" onClick={() => cancelUsersAdd()}>
                {i18n.t`Cancel`}
              </Button>
              <Button disabled={!selectedUsers.length} className="app-btn primary-btn"
                      onClick={() => addUsersList(selectedUsers)}>
                <span>{i18n.t`Add`}</span>
              </Button>
            </Row>
          </div>
        </CSSTransition>
      )}
    </I18n>
  )
};

NotesUsersDropdown.propTypes = {
  show: PropTypes.bool,
  users: PropTypes.array,
  inputUsersList: PropTypes.array,
  selectedUsersList: PropTypes.array,
  onClose: PropTypes.func,
  addToInputUsersList: PropTypes.func
}

export default NotesUsersDropdown;
