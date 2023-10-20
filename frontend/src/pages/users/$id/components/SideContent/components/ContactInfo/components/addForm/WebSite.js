import React from "react";
import styles from "../../style.less";
import {withI18n} from "@lingui/react";
import {Button, ConfigProvider, Input, Form, Col, Select, Row} from "antd";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {CONTACT_TYPES} from 'utils/constant'

const FormItem = Form.Item;

@Form.create()
@withI18n()
class WebSite extends React.Component{


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

        values.type = CONTACT_TYPES.website.type;
        values.actionName = "WebSite"
        onSubmit(values)
      }
    });
  }

  render() {
    const {i18n, form, onClose} = this.props,
          {getFieldDecorator} = form,
          lang = i18n.language === 'en' ? en_GB : hy_AM;

    return (
      <Form hideRequiredMark onSubmit={this.onSubmit} noValidate={true}>
        <Row gutter={10}>
          <Col lg={8}>
            <ConfigProvider locale={lang}>
              <span className="label-txt">{i18n.t`Title Link`}</span>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator('webSiteTitleLink', {
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Name is required`
                    },
                  ]
                })(<Input
                  className="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={16}>
            <ConfigProvider locale={lang}>
              <span className="label-txt">{i18n.t`Link`}</span>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator('webSiteUrl', {
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Web Site is required`
                    },
                    {
                      type: "url",
                      message: "This field must be a valid url."
                    }
                  ]
                })(<Input
                  className="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <div className={styles['form-actions']}>
          <Button
            onClick={onClose}
            className="app-btn primary-btn-outline"
          >
            {i18n.t`Cancel`}
          </Button>
          <Button
            className="app-btn primary-btn"
            htmlType="submit"
          >
            {i18n.t`Add`}
          </Button>
        </div>
      </Form>
    )
  }
}

export default WebSite;
