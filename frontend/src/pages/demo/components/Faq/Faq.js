import React, {PureComponent} from 'react';
import {withI18n} from '@lingui/react';
import style from './Faq.less';
import {Form} from "@ant-design/compatible";
import {Col, Row, Collapse} from "antd";
import Icons from 'icons/icon';

const { Panel } = Collapse;
@withI18n()
@Form.create()
class Faq extends PureComponent {

  changeIcon(panel) {
    return panel.isActive ? <span><Icons name="minusGradient"/></span> : <span><Icons name="plusGradient"/></span>
  }

  render() {
    return (
      <div className={style['faq-section']}>
        <div className="container">
          <Row type="flex" justify="center">
            <Col xs={24} sm={24} md={12}>
              <div className={style['faq-section_img']}/>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <h2>FAQ’s</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non eu, sed feugiat nibh arcu, sed non. Felis
                elit vehicula adipiscing maecenas mattis molestie tincidunt sed. Nam nibh id pellentesque aliquam id
                lorem. Sed duis turpis eu ut euismod ipsum eget lacus, ipsum.
              </p>
              <div>
                <Collapse
                  defaultActiveKey={['1']}
                  expandIconPosition="right"
                  expandIcon={(panelProps) => this.changeIcon(panelProps)}
                >
                  <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit." key="1">
                    <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
                      dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet,
                      consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                  </Panel>
                  <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit." key="2">
                    <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
                      dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet,
                      consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                  </Panel>
                  <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit." key="3">
                    <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
                      dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet,
                      consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                  </Panel>
                  <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit." key="4">
                    <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
                      dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet,
                      consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                  </Panel>
                </Collapse>
              </div>
            </Col>
          </Row>
        </div>
      </div>

    )
  }
}

export default Faq;
