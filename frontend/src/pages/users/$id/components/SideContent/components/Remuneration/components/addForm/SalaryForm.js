import React from 'react';
import {Form} from "@ant-design/compatible";
import styles from "../../style.less";
import {withI18n, Trans} from "@lingui/react";
import {Button, Col, ConfigProvider, DatePicker, Input, Popconfirm, Row, Select} from "antd";
import Icons from 'icons/icon';
import {withRouter} from "dva/router";
import {connect} from "dva";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import moment from "moment";
import {TYPE} from 'utils/constant';
import {calculateUserRate} from 'utils';

const mapStateToProps = ({userDetail}) => ({userDetail});
const FormItem = Form.Item;
const selectBefore = (
  <Select
    defaultValue="AMD"
    className="select-before select-global-md w_100 color-black font-medium"
    suffixIcon={
      <Icons name="arrowdown2" fill='#B3B3B3'/>
    }
    getPopupContainer={triggerNode => triggerNode.parentNode}>
    <Select.Option value="AMD">AMD</Select.Option>
  </Select>
);

@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)
class SalaryForm extends React.Component {

  #dateFormat = 'DD/MM/YYYY';

  setTrueCostValue = (inputValue) => {
    let salary = inputValue;

    if (salary === '') {
      this.props.form.setFieldsValue({
        'trueCost': ''
      });
    }

    if (!isNaN(salary) && salary > 0) {
      this.props.form.setFieldsValue({
        'trueCost': +salary * 2
      });
    }
  }

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
    const {form, onSubmit, editItem, userDetail: {remuneration: {type}}} = this.props;

    form.validateFields((error, values) => {
      if (!error) {
        if (values.meta) {
          const _numberThreshold = Number(parseFloat(values.meta.threshold).toFixed(0)).toString();
          if (_numberThreshold !== "") {
            values.meta.threshold = _numberThreshold
          }
        }
        const {currentSalary, date} = values,
          sendData = {};

        sendData.actionName = editItem.id ? "updateSalary" : "Salary";
        sendData.salary = +currentSalary;
        sendData.true_cost = +currentSalary * 2;
        sendData.date = moment(date).format('YYYY-MM-DD');
        sendData.rate = type !== TYPE['HOURLY']['value'] ? +calculateUserRate(sendData.true_cost, type) : +sendData.salary;
        if (editItem.id) {
          sendData.id = editItem.id;
          sendData.user_id = editItem.user_id;
        }
        onSubmit(sendData)
      }
    });
  }

  render() {
    const {i18n, form:{getFieldDecorator}, toggleAddEditSalary, editItem, permissions, historyName, onDelete, data, userDetail: {remuneration: {type, user_salary, bonuses}}} = this.props,
      lang = i18n.language === 'en' ? en_GB : hy_AM;

    return (

      <div className={styles['salary-forms']}>
        <Row type='flex' justify="space-between" gutter={16}>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`Level`}</span>
            <FormItem className="no-icons-form-filed">
              <Select
                mode="single"
                suffixIcon={
                  <Icons name="arrowdown2" fill='#B3B3B3'/>
                }
                getPopupContainer={triggerNode => triggerNode.parentNode}
                disabled={permissions.canEditBonus}
                value={type}
                onChange={this.onHandelChange}
                className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                placeholder={i18n.t`JobType`}>
                {
                  Object.values(TYPE).map((jobType) =>
                    <Select.Option
                      key={jobType.value}
                      value={jobType.value}>{jobType.text}
                    </Select.Option>
                  )
                }
              </Select>
            </FormItem>
          </Col>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`True Cost`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber">
                {getFieldDecorator(`trueCost`, {
                  initialValue: editItem.true_cost ?? null,
                })(<Input
                  disabled={permissions.canEditSalary}
                  addonBefore={selectBefore}
                  placeholder="Basic usage"
                  className="input-group input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <Row type='flex' justify="space-between" gutter={16}>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`Current Salary`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="selectPhoneNumber no-icons-form-filed">
                {getFieldDecorator(`currentSalary`, {
                  initialValue: editItem.salary ?? null,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Current Salary is required!`,
                    },
                    {validator: this.numberValidation}
                  ]
                })(<Input
                  type="number"
                  min={1}
                  onInput={e => {
                    if (!this.checkOnlyNumber(e.target.value)) {
                      e.target.value = '';
                      this.setTrueCostValue('');
                      return;
                    }
                    this.setTrueCostValue(e.target.value)
                  }}
                  disabled={permissions.canEditSalary}
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
                {getFieldDecorator(`date`, {
                  initialValue: editItem.date ? moment(editItem.date, 'YYYY-MM-DD') : moment(),
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
                  disabled={permissions.canEditSalary}
                  getCalendarContainer={triggerNode => triggerNode.parentNode}
                  format={this.#dateFormat}
                  className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                  placeholder={i18n.t`DD/MM/YYYY`}/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <div className={styles['form-delete-action']}>
          {permissions.canDeleteSalary && <Popconfirm
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
        {/*   {editItem.id ? i18n.t`Edit` : i18n.t`Add`}*/}
        {/*  </Button>*/}
        {/*</div>*/}
      </div>

    )
  }
}

export default SalaryForm
