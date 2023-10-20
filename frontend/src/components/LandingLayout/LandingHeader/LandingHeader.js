import React, {Component} from 'react';
import AccountInfo from '../../../components/AccountInfo/index'
import Navlink from 'umi/navlink';
import {addLangPrefix, getUserFullName} from 'utils';
import withRouter from 'umi/withRouter';
import Brand from 'shared/UIElements/Brand'
import ContactModal from '../ContactModal/ContactModal'
import style from './LandingHeader.less'
import {Row, Col, Modal} from "antd";
import store from "store";
import {langFromPath} from 'utils';
import {connect} from "dva";
import Icons from 'icons/icon';

@withRouter
@connect(({}) => ({}))
class LandingHeader extends Component {
  state = {
    isSticky: false,
    modalVisible: false,
    width: 0,
    visible: false
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateScreenSize);
    window.addEventListener('scroll', this.handleScroll);
    this.updateScreenSize();
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener("resize", this.updateScreenSize);

  }

  updateScreenSize = () => {
    this.setState({
      width: window.innerWidth
    });
  };

  handleScroll = () => {
    this.setState({isSticky: window.scrollY >= 80});
  };

  setModalVisible() {
    this.setState({modalVisible: true});
  }

  setModalHide() {
    this.setState({modalVisible: false});
  }

  onSignOut = () => {
    const {dispatch} = this.props;
    dispatch({type: 'app/signOut'});
  }

  toggleMobileMenu = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {type, location, isPrivacyPolicy} = this.props;
    const {isSticky, modalVisible} = this.state;
    const userLogged = store.get('user')
    const username = userLogged ? getUserFullName(userLogged) : null;
    const routeList = store.get('routeList') || [];
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

    const menus = newRouteList.filter(_ => _.menuParentId !== '-1');

    return (
      <div className={`${style['header']} ${isPrivacyPolicy ? style['privacy-policy'] : ''} ${style[type]} ${isSticky ? style['fixed'] : ''}`}>
        <div className="container">
          <Row type="flex" justify="space-between">
            <Col lg={8}>
              <Brand width="50px"
                     height="50px"
                     fontSize="18px"
                     color={isSticky ? 'dark' : ''}
              />
            </Col>
            {
              this.state.width < 1126 ?
                <div className={style['menu-hamburger']}>
                  <div
                    onClick={this.toggleMobileMenu}
                  >
                    <Icons name="menu" fill={isSticky ? '#000000' : '#ffffff'}/>
                  </div>
                  <Modal
                    className={style['landing-mobile-menu']}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    footer={null}
                    header={null}
                    width='initial'
                    style={{maxWidth: '100%', margin: '0', top: '0'}}
                    closeIcon={
                      <span className={style["close-icon"]} onClick={() => this.handleCancel()}>
                        <Icons name="close"/>
                      </span>
                    }
                  >
                    <div className={style['nav-menu']}>
                      <div className={style['brand-block']} onClick={() => this.handleCancel()}>
                        <Brand width="30px"
                               height="30px"
                        />
                        <h1>Worky-Reppy</h1>
                      </div>
                      <div className={style['links-block']}>
                        <Navlink tabIndex="-1" to={addLangPrefix('/')} className={`${style['nav-item']} `}
                                 onClick={() => this.handleCancel()}>About
                          <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.501473 0.143855L0.166414 0.438663C0.0617754 0.531444 0.00412912 0.654883 0.00412912 0.786811C0.00412913 0.918666 0.0617754 1.04225 0.166414 1.13503L3.96231 4.49799L0.162202 7.86482C0.0575637 7.95745 -4.0169e-08 8.08104 -3.44054e-08 8.2129C-2.86419e-08 8.34475 0.0575637 8.46841 0.162202 8.56112L0.495196 8.856C0.711741 9.048 1.06447 9.048 1.28102 8.856L5.82178 4.84738C5.92633 4.75475 6 4.63131 6 4.49828L6 4.49674C6 4.36482 5.92625 4.24138 5.82178 4.14874L1.29332 0.143855C1.18877 0.051074 1.04523 0.00014682 0.896407 -3.91832e-08C0.747501 -3.26743e-08 0.605946 0.051074 0.501473 0.143855Z" fill="#494949"/>
                          </svg>
                        </Navlink>
                        <Navlink tabIndex="-1" to={addLangPrefix('/demo')} className={style['nav-item']}
                                 onClick={() => this.handleCancel()}>Demo
                          <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.501473 0.143855L0.166414 0.438663C0.0617754 0.531444 0.00412912 0.654883 0.00412912 0.786811C0.00412913 0.918666 0.0617754 1.04225 0.166414 1.13503L3.96231 4.49799L0.162202 7.86482C0.0575637 7.95745 -4.0169e-08 8.08104 -3.44054e-08 8.2129C-2.86419e-08 8.34475 0.0575637 8.46841 0.162202 8.56112L0.495196 8.856C0.711741 9.048 1.06447 9.048 1.28102 8.856L5.82178 4.84738C5.92633 4.75475 6 4.63131 6 4.49828L6 4.49674C6 4.36482 5.92625 4.24138 5.82178 4.14874L1.29332 0.143855C1.18877 0.051074 1.04523 0.00014682 0.896407 -3.91832e-08C0.747501 -3.26743e-08 0.605946 0.051074 0.501473 0.143855Z" fill="#494949"/>
                          </svg>
                        </Navlink>
                        <a onClick={() => this.setModalVisible()} className={style['nav-item']}>Contact Us
                          <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.501473 0.143855L0.166414 0.438663C0.0617754 0.531444 0.00412912 0.654883 0.00412912 0.786811C0.00412913 0.918666 0.0617754 1.04225 0.166414 1.13503L3.96231 4.49799L0.162202 7.86482C0.0575637 7.95745 -4.0169e-08 8.08104 -3.44054e-08 8.2129C-2.86419e-08 8.34475 0.0575637 8.46841 0.162202 8.56112L0.495196 8.856C0.711741 9.048 1.06447 9.048 1.28102 8.856L5.82178 4.84738C5.92633 4.75475 6 4.63131 6 4.49828L6 4.49674C6 4.36482 5.92625 4.24138 5.82178 4.14874L1.29332 0.143855C1.18877 0.051074 1.04523 0.00014682 0.896407 -3.91832e-08C0.747501 -3.26743e-08 0.605946 0.051074 0.501473 0.143855Z" fill="#494949"/>
                          </svg>
                        </a>
                      </div>

                      <Row className={style['social-media-icons']}>
                        <Col sm={6} xs={6}>
                          <svg width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="25.2489" cy="25.2489" r="25.2489" fill="#EFEFEF"/>
                            <g clip-path="url(#clip0)">
                              <path d="M28.9079 17.919H30.9123V14.428C30.5665 14.3805 29.3772 14.2734 27.9922 14.2734C25.1023 14.2734 23.1226 16.0912 23.1226 19.4321V22.5068H19.9336V26.4094H23.1226V36.229H27.0326V26.4103H30.0926L30.5784 22.5077H27.0317V19.8191C27.0326 18.6911 27.3363 17.919 28.9079 17.919Z" fill="black"/>
                            </g>
                            <defs>
                              <clipPath id="clip0">
                                <rect width="21.9556" height="21.9556" fill="white" transform="translate(14.2734 14.2734)"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </Col>

                        <Col sm={6} xs={6}>
                          <svg width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="25.2489" cy="25.2472" r="25.2489" transform="rotate(-90 25.2489 25.2472)" fill="#EFEFEF"/>
                            <g clip-path="url(#clip0)">
                              <path d="M29.0789 14.457H20.8455C17.0568 14.457 13.9844 17.5294 13.9844 21.3182V29.5515C13.9844 33.3402 17.0568 36.4126 20.8455 36.4126H29.0789C32.8676 36.4126 35.94 33.3402 35.94 29.5515V21.3182C35.94 17.5294 32.8676 14.457 29.0789 14.457ZM33.8816 29.5515C33.8816 32.1999 31.7272 34.3543 29.0789 34.3543H20.8455C18.1971 34.3543 16.0427 32.1999 16.0427 29.5515V21.3182C16.0427 18.6698 18.1971 16.5154 20.8455 16.5154H29.0789C31.7272 16.5154 33.8816 18.6698 33.8816 21.3182V29.5515Z" fill="black"/>
                              <path d="M24.9616 19.9453C21.9303 19.9453 19.4727 22.403 19.4727 25.4342C19.4727 28.4655 21.9303 30.9231 24.9616 30.9231C27.9928 30.9231 30.4505 28.4655 30.4505 25.4342C30.4505 22.403 27.9928 19.9453 24.9616 19.9453ZM24.9616 28.8648C23.0706 28.8648 21.531 27.3251 21.531 25.4342C21.531 23.5419 23.0706 22.0036 24.9616 22.0036C26.8525 22.0036 28.3921 23.5419 28.3921 25.4342C28.3921 27.3251 26.8525 28.8648 24.9616 28.8648Z" fill="black"/>
                              <path d="M30.8603 20.2636C31.2642 20.2636 31.5917 19.9361 31.5917 19.5322C31.5917 19.1282 31.2642 18.8008 30.8603 18.8008C30.4564 18.8008 30.1289 19.1282 30.1289 19.5322C30.1289 19.9361 30.4564 20.2636 30.8603 20.2636Z" fill="black"/>
                            </g>
                            <defs>
                              <clipPath id="clip0">
                                <rect width="21.9556" height="21.9556" fill="white" transform="translate(13.9844 14.457)"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </Col>

                        <Col sm={6} xs={6}>
                          <svg width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="25.2489" cy="25.2489" r="25.2489" fill="#EFEFEF"/>
                            <g clip-path="url(#clip0)">
                              <path d="M35.1213 35.1257V35.1248H35.1262V27.8778C35.1262 24.3326 34.363 21.6016 30.2183 21.6016C28.2258 21.6016 26.8888 22.695 26.3429 23.7315H26.2852V21.9325H22.3555V35.1248H26.4474V28.5925C26.4474 26.8726 26.7735 25.2094 28.9035 25.2094C31.0021 25.2094 31.0334 27.1722 31.0334 28.7028V35.1257H35.1213Z" fill="black"/>
                              <path d="M15.6953 21.9336H19.7922V35.1259H15.6953V21.9336Z" fill="black"/>
                              <path d="M17.74 15.3672C16.4301 15.3672 15.3672 16.4301 15.3672 17.74C15.3672 19.05 16.4301 20.1351 17.74 20.1351C19.05 20.1351 20.1129 19.05 20.1129 17.74C20.1121 16.4301 19.0491 15.3672 17.74 15.3672V15.3672Z" fill="black"/>
                            </g>
                            <defs>
                              <clipPath id="clip0">
                                <rect width="19.76" height="19.76" fill="white" transform="translate(15.3672 15.3672)"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </Col>

                        <Col sm={6} xs={6}>
                          <svg width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="25.2489" cy="25.2489" r="25.2489" fill="#EFEFEF"/>
                            <g clip-path="url(#clip0)">
                              <path d="M36.229 18.4439C35.4126 18.802 34.5426 19.0394 33.6355 19.1547C34.5686 18.5976 35.2808 17.7221 35.6157 16.6669C34.7457 17.1856 33.7851 17.5519 32.7614 17.7564C31.9353 16.8768 30.758 16.332 29.4736 16.332C26.9816 16.332 24.9754 18.3547 24.9754 20.8343C24.9754 21.1911 25.0056 21.5341 25.0797 21.8607C21.3377 21.6782 18.0265 19.8847 15.8021 17.1526C15.4138 17.8264 15.186 18.5976 15.186 19.4278C15.186 20.9866 15.9887 22.3684 17.1853 23.1685C16.4621 23.1547 15.7527 22.9448 15.1517 22.6141C15.1517 22.6278 15.1517 22.6456 15.1517 22.6635C15.1517 24.8508 16.7119 26.6676 18.7579 27.0862C18.3915 27.1863 17.9922 27.2344 17.5778 27.2344C17.2896 27.2344 16.9987 27.2179 16.7256 27.1575C17.3088 28.94 18.9637 30.2505 20.9315 30.293C19.4001 31.491 17.4556 32.2128 15.3506 32.2128C14.9815 32.2128 14.6275 32.1963 14.2734 32.151C16.2673 33.4368 18.6303 34.171 21.1785 34.171C29.4612 34.171 33.9896 27.3098 33.9896 21.3626C33.9896 21.1636 33.9827 20.9715 33.9731 20.7808C34.8664 20.1468 35.617 19.355 36.229 18.4439Z" fill="black"/>
                            </g>
                            <defs>
                              <clipPath id="clip0">
                                <rect width="21.9556" height="21.9556" fill="white" transform="translate(14.2734 14.2734)"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </Col>
                      </Row>

                      <div className={style['nav-actions']}>
                        {
                          !userLogged ? <>
                            <Navlink tabIndex="-1" to={addLangPrefix('/login')} className={style['link-mg-mg-btm']}>
                              <button
                                className={'primary-btn app-btn'}>Sign
                                In
                              </button>
                            </Navlink>
                            <Navlink tabIndex="-1" to={addLangPrefix('/signup')}>
                              <button
                                className={'primary-btn-outline app-btn'}>Sign
                                Up
                              </button>
                            </Navlink>
                          </> : null
                        }
                      </div>
                    </div>
                  </Modal>
                </div>
                :
                <Col lg={16}>
                  <div className={style['nav-menu']}>
                    <Navlink tabIndex="-1" to={addLangPrefix('/')} className={style['nav-item']}>Why
                      Worky-Reppy?</Navlink>
                    <Navlink tabIndex="-1" to={addLangPrefix('/demo')} className={style['nav-item']}>Demo</Navlink>
                    <a onClick={() => this.setModalVisible()} className={style['nav-item']}>Contact Us</a>
                    <div className={`${style['nav-actions']} ${style['ffff']}`}>
                      {
                        userLogged ? <div className="landing-avatar">
                          <AccountInfo onSignOut={this.onSignOut}
                                       loggedUser={userLogged}
                                       avatar={userLogged.avatar}
                                       username={username}
                                       menus={menus}
                                       headerType={type === 'transparent' && !isSticky ? 'transparent' : ''}
                                       primaryLayout={true}/>
                        </div> : <>
                          <Navlink tabIndex="-1" to={addLangPrefix('/login')}>
                            <button
                              className={`${type !== 'transparent' || isSticky ? 'primary-btn' : 'secondary-btn'} app-btn`}>Sign
                              In
                            </button>
                          </Navlink>
                          <Navlink tabIndex="-1" to={addLangPrefix('/signup')}>
                            <button
                              className={`${type !== 'transparent' || isSticky ? 'primary-btn-outline' : 'secondary-btn-outline'} app-btn`}>Sign
                              Up
                            </button>
                          </Navlink>
                        </>
                      }
                    </div>
                  </div>
                </Col>
            }
          </Row>
        </div>
        <ContactModal visible={modalVisible}
                      onCancel={() => this.setModalHide()}/>
      </div>
    )
  }

}

export default LandingHeader;
