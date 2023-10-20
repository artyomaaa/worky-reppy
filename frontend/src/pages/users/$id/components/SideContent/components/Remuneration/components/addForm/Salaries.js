import React from 'react';
import {Col, DatePicker, Row, Input, Popconfirm, Select} from 'antd';
import { v4 as uuidv4 } from 'uuid';
import {DEFAULT_CURRENCY, SYSTEM_CURRENCIES} from 'utils/constant';
import moment from 'moment';
import {withRouter} from 'dva/router';
import {withI18n} from '@lingui/react';
import {Form} from '@ant-design/compatible';
import store from "store";

import Icons from 'icons/icon';
import styles from './form.less';
import {connect} from "dva";


const mapStateToProps = ({userDetail}) => ({userDetail});
const initialState = {
    salariesArr: [],
  },
  FormItem = Form.Item;

@withRouter
@withI18n()
@connect(mapStateToProps)
class Salaries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {...initialState};
  }
  #dateFormat = 'YYYY/MM/DD';


  componentDidMount(){
    if (this.props.salaries && this.props.salaries !== this.state.salariesArr) {
      this.touchSalariesData();
    }
  }

  componentDidUpdate(oldProps) {
    if (oldProps.salaries !== this.props.salaries) {
      this.touchSalariesData();
    }
  }

  touchSalariesData = () => {
    const _salariesArr = [...this.props.salaries]
      .map(item => {
        item.key = uuidv4();
        if (item.salary_currency === undefined) item.salary_currency = DEFAULT_CURRENCY;
        if (item.true_cost_currency === undefined) item.true_cost_currency = DEFAULT_CURRENCY;
        return item;
    });
    this.setState({
      salariesArr: _salariesArr,
    });
  }

  handleAddSalary = () => {
    const {salariesArr} = this.state;
    const item = {
      id: null,
      key: uuidv4(),
      user_id: null,
      user_level_id: null,
      salary_currency: DEFAULT_CURRENCY,
      salary: null,
      true_cost: null,
      true_cost_currency: DEFAULT_CURRENCY,
      start_date: null,
      end_date: null,
    };
    this.setState({
      salariesArr: [item, ...salariesArr]
    });
  }

  handleRemoveSalary = (e, salary, type) => {
    this.setState({
      salariesArr: this.state.salariesArr.filter(item => item.key !== salary.key)
    });

    const {dispatch} = this.props;
    process.nextTick(() => {
      const deleteData = {
        id: salary.id,
        user_id: salary.user_id,
        type: type,
      };
      dispatch({
        type: `userDetail/deleteUserSalary`,
        payload: deleteData,
      });
    });
  }

  handleChangeGrowthSalaryCurrency = (data, item) => {
    const {handleChangeGrowthSalaryCurrency} = this.props;
    this.setState({
      salariesArr: this.state.salariesArr.map(salaryItem => {
        if (salaryItem.key === item.key) {
          salaryItem.salary_currency = data;
          handleChangeGrowthSalaryCurrency(salaryItem.key, data);
        }
        return salaryItem;
      })
    });
  }

  handleChangeNetSalaryCurrency = (data, item) => {
    const {handleChangeNetSalaryCurrency} = this.props;
    this.setState({
      salariesArr: this.state.salariesArr.map(salaryItem => {
        if (salaryItem.key === item.key) {
          salaryItem.true_cost_currency = data;
          handleChangeNetSalaryCurrency(salaryItem.key, data);
        }
        return salaryItem;
      })
    });
  }

  numberValidation = (rule, value, callback) => {
    if(value === '' || value === null) {
      callback();
      return null;
    }
    if (!value || isNaN(value) || value < 0) {
      callback('Please enter valid number');
    } else {
      callback();
    }
  };

  render() {
    const {salariesArr} = this.state;
    const {i18n, form, permissions, levels, userDetail} = this.props;
    const {
      addSalaryAccess,
      viewSalaryAccess,
      editSalaryAccess,
      deleteSalaryAccess,
    } = permissions;
    const {getFieldDecorator} = form;
    const loggedUser = store.get('user');
    return (
      <>
        <div className={styles['dFlex']}>
          <h3 className={styles['content-title']}>{i18n.t`Salary`}</h3>
          {addSalaryAccess &&
            <span onClick={this.handleAddSalary} className="add-btn">{i18n.t`+ Add`}</span>
          }
        </div>
        {salariesArr.map((item, index) => {
          const key = item.key;
          return (<React.Fragment key={`${key}-${index}`}>
            {viewSalaryAccess &&
            <div>
              <FormItem style={{display: 'none'}}>
                {getFieldDecorator('salaries['+key+'][id]', {
                  initialValue: item?.id
                })(<Input
                  disabled={!editSalaryAccess}
                  type={'hidden'}
                />)}
              </FormItem>
              <Row type='flex' justify="space-between" gutter={16}>
                <Col lg={24} md={24} sm={24} xs={24}>
                  <span className="label-txt">{i18n.t`Level`}*</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('salaries['+key+'][user_level_id]', {
                      initialValue: item.user_level_id,
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Level is required`
                        },
                      ]
                    })(<Select
                      mode="single"
                      suffixIcon={
                        <Icons name="arrowdown2" fill='#B3B3B3'/>
                      }
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      disabled={!editSalaryAccess}
                      // onChange={this.onHandelChange}
                      className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                      placeholder={i18n.t`Level`}>
                      {levels && levels.map((level) =>
                          <Select.Option
                            key={`l-${key}-${level.id}`}
                            value={level.id}>{level.name}
                          </Select.Option>
                        )
                      }
                    </Select>)}
                  </FormItem>
                </Col>
              </Row>
              <Row type='flex' justify="space-between" gutter={16}>
                <Col lg={12} className={styles['salary-col']}>
                  <span className="label-txt">{i18n.t`Growth Salary`}*</span>
                  <FormItem className="selectPhoneNumber">
                    {getFieldDecorator('salaries['+key+'][salary]', {
                      initialValue: item?.salary,
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Salary is required`
                        },
                        {validator: this.numberValidation}
                      ],
                    })(<Input
                      type={'number'}
                      disabled={!editSalaryAccess}
                      addonBefore={<Select
                        defaultValue={item.salary_currency || DEFAULT_CURRENCY}
                        className="select-before select-global-md w_100 color-black font-medium"
                        onChange={(e) => this.handleChangeGrowthSalaryCurrency(e, item)}
                        suffixIcon={
                          <Icons
                            name="arrowdown2"
                            fill="#B3B3B3"
                          />
                        }
                        getPopupContainer={triggerNode => triggerNode.parentNode}>
                        {SYSTEM_CURRENCIES.map(sc => (
                          <Select.Option value={sc} key={`scb-${key}-${sc}`}>{sc}</Select.Option>
                        ))}
                      </Select>}
                      className='input-group input-global-md w_100 color-black font-medium'
                    />)}
                  </FormItem>
                </Col>
                <Col lg={12} className={styles['salary-col']}>
                  <span className="label-txt">{i18n.t`Net Salary`}*</span>
                  <FormItem className="selectPhoneNumber">
                    {getFieldDecorator('salaries['+key+'][true_cost]', {
                      initialValue: item?.true_cost,
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Net Salary is required`
                        },
                        {validator: this.numberValidation}
                      ],
                    })(<Input
                      type={'number'}
                      disabled={!editSalaryAccess}
                      addonBefore={<Select
                        defaultValue={item.true_cost_currency || DEFAULT_CURRENCY}
                        className="select-before select-global-md w_100 color-black font-medium"
                        onChange={(e) => this.handleChangeNetSalaryCurrency(e, item)}
                        suffixIcon={
                          <Icons
                            name="arrowdown2"
                            fill="#B3B3B3"
                          />
                        }
                        getPopupContainer={triggerNode => triggerNode.parentNode}>
                        {SYSTEM_CURRENCIES.map(sc => (
                          <Select.Option value={sc} key={`sco-${key}-${sc}`}>{sc}</Select.Option>
                        ))}
                      </Select>}
                      className='input-group input-global-md w_100 color-black font-medium'
                    />)}
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" gutter={16}>
                <Col lg={12} className={styles['salary-col']}>
                  <span className="label-txt">{i18n.t`Start Date`}</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('salaries['+key+'][start_date]', {
                      initialValue: item.start_date ? moment(item.start_date) : moment(),
                    })(<DatePicker
                          suffixIcon={
                            <Icons name="calendar"/>
                          }
                          disabled={!editSalaryAccess}
                          getCalendarContainer={triggerNode => triggerNode.parentNode}
                          format={this.#dateFormat}
                          className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                          placeholder={i18n.t`DD/MM/YYYY`}/>)}
                  </FormItem>
                </Col>
                <Col lg={12} className={styles['salary-col']}>
                  <span className="label-txt">{i18n.t`End Date`}</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('salaries['+key+'][end_date]', {
                      initialValue: item.end_date ? moment(item.end_date): null,
                    })(<DatePicker
                          suffixIcon={
                            <Icons name="calendar"/>
                          }
                          disabled={!editSalaryAccess}
                          getCalendarContainer={triggerNode => triggerNode.parentNode}
                          format={this.#dateFormat}
                          className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                          placeholder={i18n.t`DD/MM/YYYY`}/>)}
                  </FormItem>
                </Col>
              </Row>
              <div className={styles['form-delete-action']}>
                <Popconfirm
                  tabIndex="0"
                  title={i18n.t`Are you sure delete this item?`}
                  okText={i18n.t`Yes`}
                  onConfirm={(e) => this.handleRemoveSalary(e, item, 'salary')}
                >
                  {deleteSalaryAccess &&
                    <span className={styles['ml156']}>
                      <Icons tabIndex={"0"} name="delete"/>
                    </span>
                  }
                </Popconfirm>
              </div>
            </div>
        } </React.Fragment>)
        })}
      </>
    )
  }
}

export default Salaries;
