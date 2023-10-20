import React from 'react';
import {Col, ConfigProvider, DatePicker, Row, Input, Popconfirm, Select} from 'antd';
import { v4 as uuidv4 } from 'uuid';
import {DEFAULT_CURRENCY, SYSTEM_CURRENCIES} from 'utils/constant';
import moment from 'moment';
import {withRouter} from 'dva/router';
import {withI18n} from '@lingui/react';
import en_GB from 'antd/lib/locale-provider/en_GB';
import hy_AM from 'antd/lib/locale-provider/hy_AM';
import {Form} from '@ant-design/compatible';

import Icons from 'icons/icon';
import styles from './form.less';
import {connect} from "dva";

const mapStateToProps = ({userDetail}) => ({userDetail});
const initialState = {
    bonusesArr: [],
    otherSpendsArr: [],
  },
  FormItem = Form.Item;

@withRouter
@withI18n()
@connect(mapStateToProps)
class BonusesAndOtherSpends extends React.Component {
  constructor(props) {
    super(props);
    this.state = {...initialState};
  }
  #dateFormat = 'YYYY/MM/DD';

  componentDidMount(){
    const _bonusesArr = this.props.bonusesAndOtherSpends.filter(item => item.type === 'bonus');
    const _otherSpendsArr = this.props.bonusesAndOtherSpends.filter(item => item.type === 'other_spend');
    if (_bonusesArr !== this.state.bonusesArr || _otherSpendsArr !== this.state.otherSpendsArr) {
      this.touchBonusesAndOtherSpendsData();
    }
  }

  componentDidUpdate(oldProps) {
    if (oldProps?.bonusesAndOtherSpends !== this.props.bonusesAndOtherSpends) {
      this.touchBonusesAndOtherSpendsData();
    }
  }

  touchBonusesAndOtherSpendsData = () => {
    const _bonusesArr = this.props.bonusesAndOtherSpends
      .filter(item => item.type === 'bonus')
      .map(item => {
        item.key = uuidv4();
      return item;
    });

    const _otherSpendsArr = this.props.bonusesAndOtherSpends
      .filter(item => item.type === 'other_spend')
      .map(item => {
        item.key = uuidv4();
      return item;
    });

    this.setState({
      bonusesArr: _bonusesArr,
      otherSpendsArr: _otherSpendsArr,
    });
  }

  handleAddBonus = () => {
    const {bonusesArr} = this.state;
    const item = {
      id: null,
      user_id: null,
      key: uuidv4(),
      type: 'bonus',
      title: null,
      currency: DEFAULT_CURRENCY,
      bonus: null,
      date: null,
      description: null,
    };
    this.setState({
      bonusesArr: [item, ...bonusesArr]
    });
  }

  handleAddOtherSpends = () => {
    const {otherSpendsArr} = this.state;
    const item = {
      id: null,
      user_id: null,
      key: uuidv4(),
      type: 'other_spend',
      title: null,
      currency: null,
      bonus: null,
      date: null,
      description: null,
    };
    this.setState({
      otherSpendsArr: [item, ...otherSpendsArr]
    });
  }

  handleRemoveBonusAndOtherSpends = (e, elem, type) => {
    this.setState({
      bonusesArr: this.state.bonusesArr.filter(item => item.key !== elem.key),
      otherSpendsArr: this.state.otherSpendsArr.filter(item => item.key !== elem.key),
    });

    const {dispatch, i18n} = this.props;
    process.nextTick(() => {
      const deleteData = {
        id: elem.id,
        user_id: elem.user_id,
        type: type,
        tab: 'REMUNERATION',
      };
      dispatch({
        type: `userDetail/deleteUserBonusAndOtherSpends`,
        payload: deleteData,
      })
    });
  }

  handleChangeBonusCurrency = (data, item) => {
    const {handleChangeBonusCurrency} = this.props;
    this.setState({
      bonusesArr: this.state.bonusesArr.map(bonusItem => {
        if (bonusItem.key === item.key) {
          bonusItem.currency = data;
          handleChangeBonusCurrency(bonusItem.key, data);
        }
        return bonusItem;
      })
    });
  }

  handleChangeOtherSpendCurrency = (data, item) => {
    const {handleChangeOtherSpendCurrency} = this.props;
    this.setState({
      otherSpendsArr: this.state.otherSpendsArr.map(otherSpendItem => {
        if (otherSpendItem.key === item.key) {
          otherSpendItem.currency = data;
          handleChangeOtherSpendCurrency(otherSpendItem.key, data);
        }
        return otherSpendItem;
      })
    });
  }

  numberValidation = (rule, value, callback) => {
    if(value === '' || value === null) {
      callback();
      return null;
    }
    if (!value || isNaN(value) || value < 0) {
      callback('Please enter valid price');
    } else {
      callback();
    }
  };

  render() {
    const {bonusesArr, otherSpendsArr} = this.state;
    const {i18n, form, permissions, userDetail} = this.props;
    const {
      loggedUser,
      editBonusAccess,
      editOtherSpendsAccess,
      viewBonusesAccess,
      viewOtherSpendsAccess,
      addOtherSpendsAccess,
      deleteBonusesAccess,
      addBonusAccess,
      deleteOtherSpendsAccess,
    } = permissions;
    const lang = i18n.language === 'en' ? en_GB : hy_AM;
    const {getFieldDecorator} = form;
    return (
      <>
        <div className={styles['dFlex']}>
          <h3 className={styles['content-title']}>{i18n.t`Bonus`}</h3>
          {addBonusAccess &&
            <span onClick={this.handleAddBonus} className="add-btn">{i18n.t`+ Add`}</span>
          }
        </div>
        {bonusesArr.map((item, index) => {
          const key = item.key;
          return (<>
              {viewBonusesAccess &&
            <div key={`${key}-${index}`}>
              <FormItem style={{display: 'none'}}>
                {getFieldDecorator('bonuses['+key+'][id]', {
                  initialValue: item?.id
                })(<Input
                  // disabled={!editJobInfoAccess}
                  type={'hidden'}
                />)}
              </FormItem>
              <Row type="flex" justify="space-between" gutter={16}>
                <Col lg={12} className={styles['salary-col']}>
                  <span className="label-txt">{i18n.t`Bonus`}*</span>
                  <FormItem className="selectPhoneNumber">
                    {getFieldDecorator('bonuses['+key+'][bonus]', {
                      initialValue: item?.bonus,
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Bonus is required`
                        },
                        {validator: this.numberValidation}
                      ],
                    })(<Input
                      type={'number'}
                      disabled={!editBonusAccess}
                      addonBefore={<Select
                        defaultValue={item.currency || DEFAULT_CURRENCY}
                        className="select-before select-global-md w_100 color-black font-medium"
                        onChange={(e) => this.handleChangeBonusCurrency(e, item)}
                        suffixIcon={
                          <Icons
                            name="arrowdown2"
                            fill="#B3B3B3"
                          />
                        }
                        getPopupContainer={triggerNode => triggerNode.parentNode}>
                        {SYSTEM_CURRENCIES.map(sc => (
                          <Select.Option value={sc} key={`sc-${key}-${sc}`}>{sc}</Select.Option>
                        ))}
                      </Select>}
                      className='input-group input-global-md w_100 color-black font-medium'
                    />)}
                  </FormItem>
                </Col>
                <Col lg={12} className={styles['bonus-col']}>
                  <span className="label-txt">{i18n.t`Date`}</span>

                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('bonuses['+key+'][date]', {
                      initialValue: item.date ? moment(item.date, 'YYYY-MM-DD'): moment(),
                    })(<DatePicker
                      suffixIcon={
                        <Icons name="calendar"/>
                      }
                      disabled={!editBonusAccess}
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                      format={this.#dateFormat}
                      className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                      placeholder={i18n.t`DD/MM/YYYY`}/>)}
                  </FormItem>
                </Col>
              </Row>
              <Row type='flex' justify="space-between" gutter={16}>
                <Col lg={24} md={24} sm={24} xs={24}>
                  <span className="label-txt">{i18n.t`Description`}</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('bonuses['+key+'][description]', {
                      initialValue: item?.description,
                      rules: [
                        {
                          max: 1000,
                          message: i18n.t`Description is too long!`
                        },
                      ]
                    })(<Input
                      placeholder="Ex: Annual Bonus, Retention Bonus..."
                      disabled={!editBonusAccess}
                      className="input-global-md color-black font-medium"/>)}
                  </FormItem>
                </Col>
              </Row>
              <div className={styles['form-delete-action']}>
                <Popconfirm
                  tabIndex="0"
                  title={i18n.t`Are you sure delete this item?`}
                  okText={i18n.t`Yes`}
                  onConfirm={(e) => this.handleRemoveBonusAndOtherSpends(e, item, 'bonus')}
                >
                  {deleteBonusesAccess &&
                    <span className={styles['ml156']}>
                      <Icons tabIndex={"0"} name="delete"/>
                    </span>
                  }
                </Popconfirm>
              </div>
            </div>
           } </>)
        })}

        <div className={styles['dFlex']}>
          <h3 className={styles['content-title']}>{i18n.t`Other Spends`}</h3>
          {addOtherSpendsAccess &&
          <span onClick={this.handleAddOtherSpends} className="add-btn">{i18n.t`+ Add`}</span>
          }
        </div>
        {otherSpendsArr.map((item, index) => {
          const key = item.key;
          return (<>
              {viewOtherSpendsAccess &&
            <div key={`${key}-${index}`}>
              <FormItem style={{display: 'none'}}>
                {getFieldDecorator('otherSpends['+key+'][id]', {
                  initialValue: item?.id
                })(<Input
                  // disabled={!editJobInfoAccess}
                  type={'hidden'}
                />)}
              </FormItem>
              {viewOtherSpendsAccess &&
                <>
              <Row type='flex' justify="space-between" gutter={16}>
                <Col lg={24} md={24} sm={24} xs={24}>
                  <span className="label-txt">{i18n.t`Title`}*</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('otherSpends['+key+'][title]', {
                      initialValue: item?.title,
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Title is required`
                        },
                        {
                          max: 191,
                          message: i18n.t`Title is too long!`
                        },
                      ]
                    })(<Input
                      placeholder="Ex: Training"
                      disabled={!editOtherSpendsAccess}
                      className="input-global-md color-black font-medium"/>)}
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" gutter={16}>
                <Col lg={12} className={styles['salary-col']}>
                  <span className="label-txt">{i18n.t`Overtime`}*</span>
                  <FormItem className="selectPhoneNumber">
                    {getFieldDecorator('otherSpends['+key+'][bonus]', {
                      initialValue: item?.bonus,
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Overtime is required`
                        },
                        {validator: this.numberValidation}
                      ],
                    })(<Input
                      type={'number'}
                      disabled={!editOtherSpendsAccess}
                      addonBefore={<Select
                        defaultValue={item.currency || DEFAULT_CURRENCY}
                        className="select-before select-global-md w_100 color-black font-medium"
                        onChange={(e) => this.handleChangeOtherSpendCurrency(e, item)}
                        suffixIcon={
                          <Icons
                            name="arrowdown2"
                            fill="#B3B3B3"
                          />
                        }
                        getPopupContainer={triggerNode => triggerNode.parentNode}>
                        {SYSTEM_CURRENCIES.map(sc => (
                          <Select.Option value={sc} key={`sc-${key}-${sc}`}>{sc}</Select.Option>
                        ))}
                      </Select>}
                      className='input-group input-global-md w_100 color-black font-medium'
                    />)}
                  </FormItem>
                </Col>
                <Col lg={12} className={styles['overtime-col']}>
                  <span className="label-txt">{i18n.t`Date`}</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('otherSpends['+key+'][date]', {
                      initialValue: item.date ? moment(item.date, 'YYYY-MM-DD'): moment(),
                    })(<DatePicker
                      suffixIcon={
                        <Icons name="calendar"/>
                      }
                      disabled={!editOtherSpendsAccess}
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                      format={this.#dateFormat}
                      className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                      placeholder={i18n.t`DD/MM/YYYY`}/>)}
                  </FormItem>
                </Col>
              </Row>
              <Row type='flex' justify="space-between" gutter={16}>
                <Col lg={24} md={24} sm={24} xs={24}>
                  <span className="label-txt">{i18n.t`Description`}</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('otherSpends['+key+'][description]', {
                      initialValue: item?.description,
                      rules: [
                        {
                          max: 1000,
                          message: i18n.t`Description is too long!`
                        },
                      ]
                    })(<Input
                      placeholder="Ex: +1 day Sunday 01-02-21, 4 hours-22-04-22..."
                      disabled={!editOtherSpendsAccess}
                      className="input-global-md color-black font-medium"/>)}
                  </FormItem>
                </Col>
              </Row>
              <div className={styles['form-delete-action']}>
                <Popconfirm
                  tabIndex="0"
                  title={i18n.t`Are you sure delete this item?`}
                  okText={i18n.t`Yes`}
                  onConfirm={(e) => this.handleRemoveBonusAndOtherSpends(e, item, 'other_spend')}
                >
                  {deleteOtherSpendsAccess &&
                  <span className={styles['ml156']}>
                    <Icons tabIndex={"0"} name="delete"/>
                  </span>
                  }
                </Popconfirm>
              </div>
                </>
              }
            </div>
          } </>)
        })}
      </>
    )
  }
}

export default BonusesAndOtherSpends;
