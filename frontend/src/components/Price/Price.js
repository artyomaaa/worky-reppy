import React, {Component} from 'react';
import {withI18n} from '@lingui/react';
import {Row, Col} from 'antd';
import Slider from 'react-slick';
import style from './Price.less'
import "slick-carousel/slick/slick.css";

@withI18n()

class Price extends Component {
  constructor() {
    super();
    this.state = {
      width: 0
    };
    window.addEventListener("resize", this.updateScreenSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateScreenSize);
  }

  componentDidMount() {
    this.updateScreenSize();
  }

  updateScreenSize = () => {
    this.setState({
      width: window.innerWidth
    });
  };

  render() {
    const settings = {
      className: "center",
      centerMode: true,
      infinite: true,
      centerPadding: "20px",
      slidesToShow: 1,
      speed: 500
    }

    return (
      <div className={style['price']}>
        <div className="container">
          <h2>A Price To Suit Everyone</h2>
          <p>Unpack and review time reported, billable vs. non-billable time, and more on one dashboard.</p>
          <p>With Worky-Reppy you can bring time and expense tracking under one roof.</p>
          {
            this.state.width > 991 ?
              <div className={style['price-types']}>
                <Row type="flex" justify="center">
                  <Col sm={24} md={15} lg={8}>
                    <div className={style['card']}>
                      <div className={style['card-header']}>
                        <h6>FREE</h6>
                        <div className={style['card-price']}>$0</div>
                      </div>
                      <div className={style['card-content']}>
                        <ul style={{marginRight: '70px'}}>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>One user</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>1000 ui elements</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>E-mail support</span>
                          </li>
                        </ul>
                      </div>
                      <div className={style['card-action']}>
                        <button className={style['btn-outline']}>PURCHASE</button>
                      </div>
                    </div>
                  </Col>
                  <Col sm={24} md={15} lg={8}>
                    <div className={`${style['card']} ${style['card-active']}`}>
                      <div className={style['card-header']}>
                        <h5>TEAM</h5>
                        <div className={style['card-price']}>$50</div>
                        <div className={style['card-type']}>PER MONTH</div>
                      </div>
                      <div className={style['card-content_mid']}>
                        <ul>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>Up to 100 users</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>10 000 ui elements</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>Phone Support</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>Analytics</span>
                          </li>
                        </ul>
                        <div className={style['section-content-img']}>
                          <img src={require('img/landing/Frame4.svg')} alt="screen 02"/>
                        </div>
                      </div>

                      <div className={style['card-action']}>
                        <button className={style['btn-outline']}>PURCHASE</button>
                      </div>
                    </div>
                  </Col>
                  <Col sm={24} md={15} lg={8}>
                    <div className={style['card']}>
                      <div className={style['card-header']}>
                        <h6>PRO</h6>
                        <div className={style['card-price']}>$72</div>
                        <div className={style['card-type']}>PER MONTH</div>
                      </div>
                      <div className={style['card-content']}>
                        <ul>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>Up to 100 users</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>10 000 ui elements</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>Phone Support</span>
                          </li>
                          <li>
                            <i className={style['check-icon']}/>
                            <span>Analytics</span>
                          </li>
                        </ul>
                      </div>
                      <div className={style['card-action']}>
                        <button className={style['btn-outline']}>PURCHASE</button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
              :
              <Slider {...settings}>
                <div>
                  <div className={style['card']}>
                    <div className={style['card-header']}>
                      <h6>FREE</h6>
                      <div className={style['card-price']}>$0</div>
                    </div>
                    <div className={style['card-content']}>
                      <ul style={{marginRight: '70px'}}>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>One user</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>1000 ui elements</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>E-mail support</span>
                        </li>
                      </ul>
                    </div>
                    <div className={style['card-action']}>
                      <button className={style['btn-outline']}>PURCHASE</button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={`${style['card']} ${style['card-active']}`}>
                    <div className={style['card-header']}>
                      <h5>TEAM</h5>
                      <div className={style['card-price']}>$50</div>
                      <div className={style['card-type']}>PER MONTH</div>
                    </div>
                    <div className={style['card-content_mid']}>
                      <ul>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>Up to 100 users</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>10 000 ui elements</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>Phone Support</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>Analytics</span>
                        </li>
                      </ul>
                      <div className={style['section-content-img']}>
                        <img src={require('img/landing/Frame4.svg')} alt="screen 02"/>
                      </div>
                    </div>
                    <div className={style['card-action']}>
                      <button className={style['btn-outline']}>PURCHASE</button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={style['card']}>
                    <div className={style['card-header']}>
                      <h6>PRO</h6>
                      <div className={style['card-price']}>$72</div>
                      <div className={style['card-type']}>PER MONTH</div>
                    </div>
                    <div className={style['card-content']}>
                      <ul>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>Up to 100 users</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>10 000 ui elements</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>Phone Support</span>
                        </li>
                        <li>
                          <i className={style['check-icon']}/>
                          <span>Analytics</span>
                        </li>
                      </ul>
                    </div>
                    <div className={style['card-action']}>
                      <button className={style['btn-outline']}>PURCHASE</button>
                    </div>
                  </div>
                </div>
              </Slider>
          }
        </div>
      </div>
    )
  }

}

export default Price;
