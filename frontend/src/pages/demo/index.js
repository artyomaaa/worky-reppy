import React, {PureComponent} from 'react';
import {withI18n} from '@lingui/react';
import {Row, Col} from 'antd';
import style from './index.less';
import Faq from './components/Faq/Faq';
import GetDemoForm from './components/GetDemoForm/DemoForm';

@withI18n()

class Demo extends PureComponent {
  render() {
    const { i18n } = this.props;

    return (
      <>
        <div className={style['demo-main-section']}>
          <div className="container">
            <Row>
              <Col xs={24} sm={24} md={24} lg={10}>
                <div className={style['demo-main-content']}>
                  <h1>{i18n.t`spend_less_lime`}</h1>
                  <p>{i18n.t`demo_description_1`}</p>
                  <p>{i18n.t`demo_description_2`}</p>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={14}>
                <GetDemoForm/>
              </Col>
            </Row>
          </div>
        </div>
        <Faq/>
      </>
    )
  }
}
export default Demo;
