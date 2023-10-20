import React, {useEffect, useRef, useState} from 'react'
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {I18n, Trans} from "@lingui/react";
import Icons from 'icons/icon';
import {appUrl} from 'utils/config';
import {getResizedImage} from 'utils';
import PropTypes from "prop-types";
import {Avatar, Button} from "antd";
import {UserOutlined} from "@ant-design/icons";
import styles from './ProjectUsersDropdown.less'

const ProjectUsersDropdown = (
  {
    show,
    users,
    inputUsersList,
    selectedUsersList,
    onClose,
    addToInputUsersList,
  }) => {

  // Refs
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  //State
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowing, setIsShowing] = useState(show);
  const [usersToAdd, setUsersToAdd] = useState([])

  //Effects
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
    setUsersToAdd(inputUsersList)
  }, [show]);

  useEffect(() => {
    setIsShowing(show)
  }, [show]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isShowing]);

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
    const userIsSelected = usersToAdd.some(el => el.id === user.id);
    if (!userIsSelected) {
      setUsersToAdd([...usersToAdd, user])
    } else {
      setUsersToAdd(usersToAdd.filter(u => u.id !== user.id))
    }
  };

  const filteredUsers = users.filter(el => !selectedUsersList.find(sU => sU.id === el.id));
  const finalFilteredUsers = filteredUsers.filter(u => u.name?.toLowerCase().includes(search?.toLowerCase()));

  return (
    <I18n>
      {({i18n}) => (
        <CSSTransition
          in={Boolean(isShowing)}
          timeout={200}
          classNames="fade"
          unmountOnExit
        >
          <div ref={wrapperRef} onClick={e => handleInputClick(e)}
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
            {errorMessage.error && <div className={`${styles['error-message-block']}`}>{errorMessage.setErrorMessage}</div>}
            <CSSTransition
              key={0}
              timeout={200}
              classNames="animateHeight"
            >
              <div className={styles['users-sect']}>
                    <span className={styles['label']}>
                      <span>{usersToAdd.length}</span> {i18n._(`user(s) selected`)}
                    </span>
              </div>
            </CSSTransition>
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
                            usersToAdd &&
                            usersToAdd.length > 0 &&
                            usersToAdd.map(uAdd => {
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
                            <Avatar src={user?.avatar ? `${appUrl}/storage/images/avatars${getResizedImage(user.avatar, 'avatar')}` : ''}
                                    icon={!user.avatar ? <UserOutlined/> : ''}/>
                          </span>
                        </span>
                        <span className={styles['userName']}>
                          {user.name}
                        </span>
                        <span className={styles['add-user']}>
                          <Icons name="success"/>
                        </span>
                      </li>
                    </CSSTransition>)
                })}
              </TransitionGroup>
              {!finalFilteredUsers.length &&
              <span className={styles['notFound']}>
                {i18n._(`Not Found`)}
              </span>}
            </ul>
            {usersToAdd.length > 0 &&
            <div className={styles['dropdown-add-button-container']}>
              <button
                type='button'
                className='app-btn primary-btn md'
                onClick={() => addToInputUsersList(usersToAdd)}>
                Add
              </button>
            </div>
            }
          </div>
        </CSSTransition>
      )}
    </I18n>
  )
};

ProjectUsersDropdown.propTypes = {
  show: PropTypes.bool,
  users: PropTypes.array,
  inputUsersList: PropTypes.array,
  selectedUsersList: PropTypes.array,
  onClose: PropTypes.func,
  addToInputUsersList: PropTypes.func
}

export default ProjectUsersDropdown;
