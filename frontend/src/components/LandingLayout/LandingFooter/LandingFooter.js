import React, { Component } from 'react';
import { withI18n } from '@lingui/react';
import Navlink from 'umi/navlink';
import style from './LandingFooter.less'
import Icons from 'icons/icon';
import Brand from 'shared/UIElements/Brand'


@withI18n()

class LandingFooter extends Component {

  render() {
    return (
      <>
        <div className={style['footer']}>
          <div className="container h-100">
            <div className={style['footer_content']}>
              <div className={style['footer_content-brand']}>
                <Brand width="48px"
                       height="48px"
                       fontSize="18px"
                />
              </div>
              <ul className={style['footer_content-icons']}>
                <li>
                  <a href="#">
                    <Icons name="fb"/>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Icons name="in"/>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Icons name="ln"/>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Icons name="tw"/>
                  </a>
                </li>
              </ul>
              <ul className={style['footer_content-nav']}>
                <li><img src='armenia1.svg' alt="screen 02"/></li>
                <li>
                  <Navlink to="privacypolicy">
                    Privacy & Policy
                  </Navlink>
                </li>
                <li>© 2020 All Rights Reserved</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default LandingFooter;
