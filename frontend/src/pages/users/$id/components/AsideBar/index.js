import React from 'react';
import stylesFilterBy from '../../../components/filterBy.less';
import styles from './style.less';
import { withI18n } from '@lingui/react';
import EveryLink from './elements/EveryItem';
import { withRouter } from 'dva/router';
import {router} from 'utils';
import PropsTypes from 'prop-types';
import { USER_DYNAMIC_COMPONENTS } from 'utils/constant';

const asideBarLinks = [
  {
    text: `PersonalInfo`,
    switchKey: USER_DYNAMIC_COMPONENTS.PERSONAL_INFO,
    icon: 'person',
  },
  {
    text: `ContactInfo`,
    switchKey: USER_DYNAMIC_COMPONENTS.CONTACT_INFO,
    icon: 'phone',
    iconColor: '#2C3E50',
  },
  {
    text: `Education/Military`,
    switchKey: USER_DYNAMIC_COMPONENTS.EDU,
    icon: 'building',
  }, {
    text: `Employment History`,
    switchKey: USER_DYNAMIC_COMPONENTS.JOB_INFO,
    icon: 'job',
  }, {
    text: `Remuneration`,
    switchKey: USER_DYNAMIC_COMPONENTS.REMUNERATION,
    icon: 'cart',
  }, {
    text: `Files`,
    switchKey: USER_DYNAMIC_COMPONENTS.FILE,
    icon: 'file',
  },
  // {
  //   text: `Permissions`,
  //   switchKey: USER_DYNAMIC_COMPONENTS.PERMISSION,
  //   icon: 'lock',
  // },
  {
    text: `Notes`,
    switchKey: USER_DYNAMIC_COMPONENTS.NOTES,
    icon: 'paper',
  }, {
    text: `Calendar`,
    switchKey: USER_DYNAMIC_COMPONENTS.CALENDAR,
    icon: 'calendar',
    iconColor: '#2C3E50',
  }, {
    text: `Casual Information`,
    switchKey: USER_DYNAMIC_COMPONENTS.CASUAL_INFO,
    icon: 'more-plus',
  }
];

@withI18n()
class AsideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      matches: window.matchMedia("(min-width: 768px)").matches,
    }
  }

  closedModal = (e) => {
    e.stopPropagation();
    const { location } = this.props;
    const { query, pathname } = location;

    router.push({
      pathname,
      query: {
        ...query,
        modal: 'close',
      }
    })
  }

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  changeTab (tab) {
    this.props.changeParentTab(tab);
  }

  render () {
    const {activeLink, permissions, location} = this.props;

    return (
      <>
        {
          this.state.matches ?
            <div className={styles['main-aside']}>
              {asideBarLinks.map((item, index) =>
                (permissions[item.switchKey]) &&
                <EveryLink
                  key={index}
                  activeLink={activeLink}
                  data={item}
                  changeTab={(tab) => this.changeTab(tab)}
                />
              )}
            </div>
        :
        <>
          {location.query.modal === 'open' &&
          <div className={stylesFilterBy['status-container']}>
            <div onClick={this.closedModal}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.4119 9.00019L16.7119 2.71019C16.9002 2.52188 17.006 2.26649 17.006 2.00019C17.006 1.73388 16.9002 1.47849 16.7119 1.29019C16.5236 1.10188 16.2682 0.996094 16.0019 0.996094C15.7356 0.996094 15.4802 1.10188 15.2919 1.29019L9.00189 7.59019L2.71189 1.29019C2.52359 1.10188 2.26819 0.996094 2.00189 0.996094C1.73559 0.996094 1.4802 1.10188 1.29189 1.29019C1.10359 1.47849 0.997801 1.73388 0.997801 2.00019C0.997801 2.26649 1.10359 2.52188 1.29189 2.71019L7.59189 9.00019L1.29189 15.2902C1.19816 15.3831 1.12377 15.4937 1.073 15.6156C1.02223 15.7375 0.996094 15.8682 0.996094 16.0002C0.996094 16.1322 1.02223 16.2629 1.073 16.3848C1.12377 16.5066 1.19816 16.6172 1.29189 16.7102C1.38486 16.8039 1.49546 16.8783 1.61732 16.9291C1.73917 16.9798 1.86988 17.006 2.00189 17.006C2.1339 17.006 2.26461 16.9798 2.38647 16.9291C2.50833 16.8783 2.61893 16.8039 2.71189 16.7102L9.00189 10.4102L15.2919 16.7102C15.3849 16.8039 15.4955 16.8783 15.6173 16.9291C15.7392 16.9798 15.8699 17.006 16.0019 17.006C16.1339 17.006 16.2646 16.9798 16.3865 16.9291C16.5083 16.8783 16.6189 16.8039 16.7119 16.7102C16.8056 16.6172 16.88 16.5066 16.9308 16.3848C16.9816 16.2629 17.0077 16.1322 17.0077 16.0002C17.0077 15.8682 16.9816 15.7375 16.9308 15.6156C16.88 15.4937 16.8056 15.3831 16.7119 15.2902L10.4119 9.00019Z" fill="black"/>
              </svg>
            </div>
            <div className={stylesFilterBy['status-container-center']}>
            <h1 className={stylesFilterBy['status-title']}>Subsection</h1>
            <div className={styles['main-aside']}>
              {asideBarLinks.map((item, index) =>
                (permissions[item.switchKey]) &&
                <EveryLink
                  key={index}
                  activeLink={activeLink}
                  data={item}
                  changeTab={(tab) => this.changeTab(tab)}
                />
              )}
            </div>
            </div>
          </div>
          }
        </>
        }
      </>
    )
  }
}
AsideBar.propTypes = {
  changeParentTab: PropsTypes.func,
  activeLink: PropsTypes.string,
};
export default withRouter(AsideBar);
