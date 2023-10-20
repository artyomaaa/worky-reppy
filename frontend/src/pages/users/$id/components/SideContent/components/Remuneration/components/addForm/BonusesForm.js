import React from 'react';
import {Form} from "@ant-design/compatible";
import styles from "../../style.less";
import {withI18n, Trans} from "@lingui/react";
import {Button, Col, ConfigProvider, DatePicker, Input, InputNumber, Popconfirm, Row, Select} from "antd";
import Icons from 'icons/icon';
import {withRouter} from "dva/router";
import {connect} from "dva";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import moment from "moment";

const mapStateToProps = ({userDetail}) => ({userDetail});
const FormItem = Form.Item;


const selectBefore = (
  <Select defaultValue="AMD"
          className="select-before select-global-md w_100 color-black font-medium"
          suffixIcon={
            <Icons name="arrowdown"/>
          }
          getPopupContainer={triggerNode => triggerNode.parentNode}>
    <Select.Option value="AMD">AMD</Select.Option>
  </Select>
);

@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)

class BonusesForm extends React.Component {

  #dateFormat = 'DD/MM/YYYY';

  checkOnlyNumber = (number) => {
    let regexNumber = /^\d+$/;
    return regexNumber.test(String(number));
  }

  numberValidation = (rule, value, callback) => {
    if (isNaN(value) || value < 0) {
      callback('Please enter valid salary');
    } else {
      callback();
    }
  }

  onSubmit = (event) => {
    event.preventDefault();
    const {form, onSubmit, editItem} = this.props;

    form.validateFields((error, values) => {
      if (!error) {
        if (values.meta) {
          const _numberThreshold = Number(parseFloat(values.meta.threshold).toFixed(0)).toString();
          if (_numberThreshold !== "") {
            values.meta.threshold = _numberThreshold
          }
        }

        const {dateBonus, bonus} = values,
              sendData = {};

        sendData.actionName = editItem.id ? "updateBonus" : "Bonuses";
        sendData.bonus = +bonus;
        sendData.date = moment(dateBonus).format('YYYY-MM-DD');
        if (editItem.id) {
          sendData.id = editItem.id;
          sendData.user_id = editItem.user_id;
        }
        onSubmit(sendData)
      }
    });
  }

  render() {
    const {i18n, form, toggleAddEditSalary, editItem, permissions} = this.props,
          {getFieldDecorator} = form,
          lang = i18n.language === 'en' ? en_GB : hy_AM;

    return (
      <div className={styles['salary-forms']}>
        <Row type='flex' justify="space-between" gutter={16}>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`Bonus`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber no-icons-form-filed">
                {getFieldDecorator(`bonus`, {
                  initialValue: editItem.bonus ?? null,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Bonus amount is required!`,
                    },
                    {validator: this.numberValidation}
                  ]
                })(<Input
                  type="number"
                  min={1}
                  onInput={e => {
                    if(!this.checkOnlyNumber(e.target.value)) {
                      e.target.value = '';
                      return;
                    }
                  }}
                  disabled={permissions.canEditBonus}
                  addonBefore={selectBefore}
                  placeholder="Basic usage"
                  className="input-group input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`Date`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(`dateBonus`, {
                  initialValue: editItem.date ? moment(editItem.date, 'YYYY-MM-DD'): moment(),
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Date is required!`
                    },
                  ]
                })(<DatePicker
                  suffixIcon={
                    <Icons name="calendar"/>
                  }
                  disabled={permissions.canEditBonus}
                  getCalendarContainer={triggerNode => triggerNode.parentNode}
                  format={this.#dateFormat}
                  className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                  placeholder={i18n.t`DD/MM/YYYY`}/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <Row type='flex' justify="space-between" gutter={16}>
        <Col lg={24}>
          <span className="label-txt">{i18n.t`Description`}</span>
          <FormItem className="no-icons-form-filed">
            {getFieldDecorator('extra-working-hours', {

            })(<Input
              placeholder="Ex: Annual Bonus, Retention Bonus..."
              disabled={permissions.canEditBonus}
              className="input-global-md color-black font-medium"/>)}
          </FormItem>
        </Col>
        </Row>
        <div className={styles['form-delete-action']}>
          {permissions.canDeleteBonus && <Popconfirm
            tabIndex="0"
            title={i18n.t`Are you sure delete this item?`}
            okText={i18n.t`Yes`}
          >
            <span className={styles['ml156']}>
              <Icons tabIndex={"0"} name="delete"/>
            </span>
          </Popconfirm>}
        </div>
        {/*<div className={styles['form-actions']}>*/}
        {/*  <Button*/}
        {/*    onClick={toggleAddEditSalary}*/}
        {/*    className="app-btn primary-btn-outline"*/}
        {/*  >*/}
        {/*    {i18n.t`Cancel`}*/}
        {/*  </Button>*/}
        {/*  <Button*/}
        {/*    className="app-btn primary-btn"*/}
        {/*    htmlType="submit"*/}
        {/*  >*/}
        {/*    {editItem.id ? i18n.t`Edit` : i18n.t`Add`}*/}
        {/*  </Button>*/}
        {/*</div>*/}
      </div>

    )
  }
}

export default BonusesForm
