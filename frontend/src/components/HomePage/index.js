import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Row, Col} from 'antd';
import {addLangPrefix} from 'utils';
import Icons from 'icons/icon';
import {withI18n} from '@lingui/react';
import style from './HomePage.less'
import Navlink from "umi/navlink";

@withI18n()
@connect(({about}) => ({about}))

class index extends PureComponent {

  render() {
    const {i18n} = this.props;

    return (
      <>
        <div className={style['home-page']}>
          <div className={style['main_section']}>
            <div className="container">
              <Row>
                <Col lg={10}>
                  <div className={style['main-section-content']}>
                    <h1>
                      {i18n.t`optimize_your_business`}
                    </h1>
                    <p>{i18n.t`time_is_everything`}</p>
                    <p>{i18n.t`easy_to_use_tagging`}</p>
                    <div className={style['about_actions']}>
                      <Navlink tabIndex="-1" to={addLangPrefix('/demo')}>
                        <button className="app-btn secondary-btn">
                          {i18n.t`request_demo`}
                        </button>
                      </Navlink>
                    </div>
                  </div>
                </Col>
                <Col lg={14}>
                  <div className={style['main-section-image']}/>
                </Col>
              </Row>
            </div>
          </div>
          <div className={style['section_01']}>
            <div className="container">
              <Row type="flex" align="middle" gutter={30}>
                <Col lg={10}>
                  <div className={style['section-content']}>
                    <div>
                      <h2><span>01․</span>
                        <span>{i18n.t`reports_dashboards`}</span>
                      </h2>
                      <p>{i18n.t`reports_dashboard_1`}</p>
                      <p>{i18n.t`reports_dashboard_2`}</p>
                      <p>{i18n.t`reports_dashboard_3`}</p>
                    </div>
                  </div>
                </Col>
                <Col lg={14}>
                  <div className={style['screen-block']}>
                    <img src={require('img/landing/screen1.png')} alt="screen 01"/>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className={style['section_02']}>
            <div className="container">
              <Row className={style['row-reveres']} type="flex" align="middle" gutter={30}>
                <Col lg={15}>
                  <div className={style['screen-block']}>
                    <img src={require('img/landing/screen2.png')} alt="screen 02"/>
                  </div>
                </Col>
                <Col lg={9}>
                  <div className={style['section-content']}>
                    <div>
                      <h2><span>02․</span>{i18n.t`human_resources`}</h2>
                      <p>{i18n.t`human_resource_1`}</p>
                      <p>{i18n.t`human_resource_2`}</p>
                    </div>
                    <div className={style['section-content-img']}>
                      <img src={require('img/landing/Frame1.svg')} alt="screen 02"/>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className={style['section_03']}>
            <div className="container">
              <Row type="flex" align="middle" gutter={30}>
                <Col lg={10}>
                  <div className={style['section-content']}>
                    <div>
                      <h2><span>03․</span>{i18n.t`teams`}</h2>
                      <p>{i18n.t`teams_1`}</p>
                      <p>{i18n.t`teams_2`}</p>
                    </div>
                    <div className={style['section-content-img-rev']}>
                        <img src={require('img/landing/Frame2.svg')} alt="screen 02"/>
                      </div>
                  </div>
                </Col>
                <Col lg={14}>
                  <div className={style['screen-block']}>
                    <img src={require('img/landing/screen3.png')} alt="screen 03"/>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className={style['section_04']}>
            <div className="container">
              <Row className={style['row-reveres']} type="flex" align="middle" gutter={30}>
                <Col lg={15}>
                  <div className={style['screen-block']}>
                    <img src={require('img/landing/screen4.png')} alt="screen 04"/>
                  </div>
                </Col>
                <Col lg={9}>
                  <div className={style['section-content']}>
                    <div>
                      <h2><span>04․</span>{i18n.t`projects`}</h2>
                      <p>{i18n.t`project_1`}</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className={style['section_05']}>
            <div className="container">
              <Row type="flex" align="middle" gutter={30}>
                <Col lg={10}>
                  <div className={style['section-content']}>
                    <div>
                      <h2><span>05․</span>{i18n.t`tracking`}</h2>
                      <p>{i18n.t`tracking_1`}</p>
                      <ul>
                        <li>
                          <Icons name="TimerMode"/>
                          <h5>{i18n.t`timer_mode`}</h5>
                          <p>{i18n.t`watch_a_video`}</p>
                        </li>
                        <li>
                          <Icons name="ManualMode"/>
                          <h5>{i18n.t`manual_mode`}</h5>
                          <p>{i18n.t`watch_a_video`}</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Col>
                <Col lg={14}>
                  <div className={style['screen-block']}>
                    <img src={require('img/landing/screen5.png')} alt="screen 03"/>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default index;
