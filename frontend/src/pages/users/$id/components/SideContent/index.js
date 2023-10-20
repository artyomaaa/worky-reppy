import React from 'react';
import PropTypes from 'prop-types';
import styles from './style.less';
import {withI18n} from "@lingui/react";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import PersonalInfo from './components/PersonalInfo';
import Permissions from './components/Permissions';
import File from './components/File';
import ContactInfo from './components/ContactInfo';
import Remuneration from './components/Remuneration';
import CasualInfo from './components/CasualInfo';
import JobInfo from './components/JobInfo';
import Notes from './components/Notes';
import Education from './components/Education';
import {
  USER_DYNAMIC_COMPONENTS,
} from 'utils/constant';


@withI18n()
class SideContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.switchComponents = {
        [USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]: {
          Component: PersonalInfo,
        },
        [USER_DYNAMIC_COMPONENTS.JOB_INFO]: {
          Component: JobInfo,
        },
        [USER_DYNAMIC_COMPONENTS.REMUNERATION]: {
          Component: Remuneration,
        },
        [USER_DYNAMIC_COMPONENTS.CONTACT_INFO]: {
          Component: ContactInfo,
        },
        [USER_DYNAMIC_COMPONENTS.FILE]: {
          Component: File,
        },
        [USER_DYNAMIC_COMPONENTS.EDU]: {
          Component: Education,
        },
        [USER_DYNAMIC_COMPONENTS.PERMISSION]: {
          Component: Permissions,
        },
        [USER_DYNAMIC_COMPONENTS.NOTES]: {
          Component: Notes,
        },
        [USER_DYNAMIC_COMPONENTS.CASUAL_INFO]: {
          Component: CasualInfo,
        }
    }
  }

  render () {
    const {i18n, tabContent, permissions} = this.props,
          {Component} = this.switchComponents[tabContent];
    return (
      <div className={styles['user-side-main-content']}>
        <div
          className={`${styles['user-content-switch']}
                      ${tabContent === USER_DYNAMIC_COMPONENTS.PERSONAL_INFO || tabContent === USER_DYNAMIC_COMPONENTS.JOB_INFO ? styles['overflow-unset'] : 'rounded-scrollbar'} `}>
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={tabContent}
              timeout={300}
              classNames="fade-content-user"
              unmountOnExit
            >
              <div className={styles['user-dynamic-component']}>
                {permissions[tabContent] ?
                  <Component details={this.props.detailsProps} /> :
                  i18n.t`You dont have Access to view this content`
                }
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
    )
  }
}

SideContent.propTypes = {
  getDetailsProps: PropTypes.object,
  tabContent: PropTypes.string,
};

export default SideContent;
