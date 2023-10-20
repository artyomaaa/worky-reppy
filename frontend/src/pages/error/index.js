import React, {PureComponent} from 'react';

import {Button, Col, Row} from 'antd';
import Brand from 'shared/UIElements/Brand';
import style from './index.less';
import {Trans} from "@lingui/react";
import {addLangPrefix} from 'utils';
import Navlink from "umi/navlink";

class Error extends PureComponent {
  render() {
    return (
      <>
        <div className={style['error-page']}>
          <div className="container">
            <div className={style['error-page-header']}>
              <Brand color="dark"
                     width="54"
                     height="54"
                     fontSize="18px"
              />
            </div>

              <Row gutter={40}>
                <Col xs={24} sm={24} md={24} lg={12}>
                  <div className={style['error-page-content']}>
                  <div className={style['img-block']}>
                    <img src={require('../../../public/img/landing/error.svg')} alt="Oh No!"/>
                  </div>
                  <p className={style['error-text']}>We’re usually a treasure chest of knowledge, but we couldn’t find what you’re looking for</p>
                    <Navlink tabIndex="-1" to={addLangPrefix('/')}>
                      <button
                        className="app-btn primary-btn"
                      >
                        <Trans>Go Homepage</Trans>
                      </button>
                    </Navlink>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12}>
                  <div className={style['error-page-img']}>
                    <img src={require('../../../public/img/landing/rob.png')} alt="robot"/>
                  </div>
                </Col>
              </Row>
          </div>
        </div>
      </>
    )
  }
}

export default Error;
