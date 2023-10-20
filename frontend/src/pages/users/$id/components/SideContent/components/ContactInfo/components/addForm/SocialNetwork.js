import React from "react";
import styles from "../../style.less";
import {withI18n} from "@lingui/react";
import {Button, ConfigProvider, Input, Select, Form, Col, Row} from "antd";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import Icons from 'icons/icon';
import {CONTACT_TYPES} from 'utils/constant'
import classes from "../../../../../../../../tasks/components/AddEditTask/AddEditTask.less";

const FormItem = Form.Item;

@Form.create()
@withI18n()

class SocialNetwork extends React.Component {

  onSubmit = (event) => {
    event.preventDefault();
    const {onSubmit, form} = this.props;
    form.validateFields((error, values) => {
      if (!error && onSubmit) {
        if (values.meta) {
          const _numberThreshold = Number(parseFloat(values.meta.threshold).toFixed(0)).toString();
          if (_numberThreshold !== "") {
            values.meta.threshold = _numberThreshold
          }
        }

        values.type = CONTACT_TYPES.social.type;
        values.actionName = "SocialNetwork";
        if (values.nameUserSocialNetwork === undefined || values.nameSocialNetwork === undefined || values.linkSocialNetwork === undefined) {
          return;
        }
        onSubmit(values)
      }
    });
  }

  render() {
    const {i18n, onClose, form, isSubmittedLoading} = this.props,
          {getFieldDecorator} = form,
          lang = i18n.language === 'en' ? en_GB : hy_AM,
          socialNetworkIcons = Object.values(CONTACT_TYPES.social.names);

    return (
      <Form hideRequiredMark onSubmit={this.onSubmit} noValidate={true} style={{marginBottom: "30px"}}>
        <Row type="flex" justify="space-between" gutter={16}>
          <Col lg={3} className={styles['icon-content']}>
            <span className="label-txt">{i18n.t`Icon`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(`nameSocialNetwork`, {
                  rules: [
                    {
                      required: true,
                      message: ' '
                    }
                  ]
                })(<Select
                  disabled={isSubmittedLoading}
                  mode="single"
                  suffixIcon={
                    <Icons name="arrowdown2" fill="#B3B3B3"/>
                  }
                  className="select-global-md w_100 single-select color-black font-medium select_img">
                  {socialNetworkIcons.map((social, index) =>
                    <Select.Option key={index} className={styles['genderUpperCase']}
                                   value={social}><Icons name={social}/></Select.Option>
                  )}
                </Select>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={8} className={styles['name-content']}>
            <span className="label-txt">{i18n.t`Name`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(`nameUserSocialNetwork`, {
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Name is required`
                    }
                  ]
                })(<Input
                  disabled={isSubmittedLoading}
                  className="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={10} className={styles['url-content']}>
            <span className="label-txt">{i18n.t`URL`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(`linkSocialNetwork`, {
                  rules: [
                    {
                      type: "url",
                      message: "This field must be a valid url."
                    },
                    {
                      required: true,
                      message: i18n.t`URL is required`
                    }
                  ]
                })(<Input
                  disabled={isSubmittedLoading}
                  className="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={3} className={styles['save-cancel-content']}>
            <div className={styles['social-actions']}>
              <Button
                className={styles['social-actions-text']}
                htmlType="submit"
              >
                {i18n.t`Save`}
              </Button>
              <Button
                onClick={onClose}
                className={styles['social-actions-text']}
              >
                {i18n.t`Cancel`}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default SocialNetwork
