import React, { PureComponent } from 'react';
import { withI18n } from '@lingui/react';
import Icons from 'icons/icon';
import {Row, Col, Input, Button, Modal} from 'antd';
import contactStyles from './ContactModal.less';
import {Form} from "@ant-design/compatible";


import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";

const FormItem = Form.Item;
const { TextArea } = Input;



@withI18n()
@Form.create()
class ContactModal extends PureComponent {


  render() {
    const { onOk, onCancel, visible } = this.props;
    const { item = {}, form, i18n, ...modalProps } = this.props;
    const { getFieldDecorator } = form;
    const {roles = [], skills = []} = modalProps;
    let lang = i18n.language == 'en' ? en_GB : hy_AM;

    const status = item.status !== undefined ? item.status : 1;


    return (
      <Modal  centered
              visible={visible}
              footer={null}
              closeIcon={
                <span onClick={onCancel}
                      className="close-icon">
                  <Icons name="close" fill="#A9AAAB"/>
                </span>
              }
              className={contactStyles['contact-modal']}
      >
        <h2>Let's get in touch</h2>
        <p>We're open for any suggestion or just to have a chat.</p>
        <Form layout="horizontal">
          <Row type="flex" justify="center" className="w-100">
            <Col lg={12}>
              <FormItem>
                {getFieldDecorator('name', {
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Name is required`,

                    },
                    {
                      pattern: /^[^0-9\s-*\/=;'":,`!@#$%^&()\[\]\{\}\\\|<>+_՞»«՜։]*$/,
                      message: i18n.t`Name must contain only letters`,
                    },
                    {
                      max: 70,
                    },
                  ],
                })(<Input
                  placeholder="Full Name"
                  className={contactStyles['contact-form-input']} />)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="center" className="w-100">
            <Col lg={12}>
              <FormItem>
                {getFieldDecorator('phone', {
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Phone Number is required!`,
                    },
                    {
                      pattern: /^\d+$/,
                      message: `Phone Number must be only numbers`,
                    },
                    {
                      min: 9,
                      max: 20,
                    },
                  ],
                })(<Input
                  placeholder="Phone Number"
                  className={contactStyles['contact-form-input']} />)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="center" className="w-100">
            <Col lg={12}>
              <FormItem
              >
                {getFieldDecorator('email', {
                  rules: [
                    {
                      required: true,
                      message: i18n.t`E-mail is required!`,
                    },
                    {
                      type: 'email',
                      message: i18n.t`The E-mail is not valid!`,
                    },
                  ],
                })(<Input
                  placeholder="Email Address"
                  className={contactStyles['contact-form-input']} />)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="center" className="w-100">
            <Col lg={12}>
              <FormItem>
                {getFieldDecorator('about')
                (<Input.TextArea
                  placeholder="Message"
                  className={contactStyles['contact-form-textarea']}
                  rows={3} cols={24} />)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="center" className="w-100">
            <Col lg={12}>
              <Button
                className={contactStyles['send-btn']}
                onClick={onOk}
              >
                Send Message
              </Button>
            </Col>
          </Row>
        </Form>
        <Row type="flex" justify="center" className="w-100">
          <Col lg={12}>
            <div className={contactStyles['contact-footer']}>
              <span>Follow us</span>
              <ul className={contactStyles['social_icons']}>
                <li><a href="#"><img src={require('../../../../public/img/landing/FB.svg')} alt="facebook" /></a></li>
                <li><a href="#"><img src={require('../../../../public/img/landing/INSTA.svg')} alt="instagram" /></a></li>
                <li><a href="#"><img src={require('../../../../public/img/landing/IN.svg')} alt="Linkedin" /></a></li>
                <li><a href="#"><img src={require('../../../../public/img/landing/TW.svg')} alt="twitter" /></a></li>
              </ul>
            </div>
          </Col>
        </Row>
      </Modal>
    )
  }
}

export default ContactModal;
