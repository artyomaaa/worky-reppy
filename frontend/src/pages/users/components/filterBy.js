import React from 'react';
import stylesFilterBy from './filterBy.less';
import moment from 'utils/moment';
import {disabledDate, getFilterInitialStatus} from 'utils';
import {dateFormats} from 'utils/constant';
import './Filter.less';
import styles from "../../../components/Page/Page.less";
import stylesUser from "./Filter.less";
import mobileFilterModalStyle from "../../../components/MobileFilterModal/MobileFilterModal.less"
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
/* global document */
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css';
import {Trans, withI18n} from '@lingui/react';
import {Button, Row, Col, DatePicker, Input, Select, Radio, ConfigProvider} from 'antd';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import globalStyles from "themes/global.less";
import Icons from 'icons/icon';
import store from "store";
import _ from "lodash";


@withI18n()
class FilterBy extends React.Component {
  state = {
    values: {}
  }

  handleFields = fields => {
    const {created_at} = fields;
    if (created_at && created_at.length) {
      fields.created_at = [
        moment(created_at[0]).format('YYYY-MM-DD'),
        moment(created_at[1]).format('YYYY-MM-DD'),
      ]
    }
    return fields
  };

  handleChange = (key, values) => {
    const {form} = this.props,
      {getFieldsValue} = form;

    let fields = getFieldsValue();
    if (key === 'status') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields.status = (values instanceof Object) ? values.target.value : values;
    } else fields[key] = values;
  };

  handleStatusToggle = (e) => {
    const {form} = this.props,
      {getFieldsValue, setFieldsValue} = form;

    let fields = getFieldsValue();
    if (e.target.value && (e.target.value === fields.status)) {
      fields.status = undefined;
      setFieldsValue(fields);
      this.handleSubmit();
    }
  };

  handleSubmit = _.debounce(() => {
    const {form} = this.props,
      {getFieldsValue} = form;

    let fields = getFieldsValue();
    fields = this.handleFields(fields);
  }, 300);

  handleReset = () => {
    const {form} = this.props,
      {getFieldsValue, setFieldsValue} = form;

    const fields = getFieldsValue();
    for (let item in fields) {
      if ({}.hasOwnProperty.call(fields, item)) {
        if (fields[item] instanceof Array) {
          fields[item] = []
        } else {
          fields[item] = undefined
        }
      }
    }
    if (fields.status === undefined) fields.status = '1';
    setFieldsValue(fields);
    this.handleSubmit()
  };

  filterChange = () => {
    const {form, onMobileFilterChange, closedModalForFilter} = this.props,
      {getFieldsValue} = form;
    let fields = getFieldsValue();
    fields = this.handleFields(fields);
    onMobileFilterChange(fields);
    closedModalForFilter();
  }

  render() {
    const { closedModalForFilter, form, filter, i18n, roles } = this.props;
    const {getFieldDecorator} = form;
    const initialStatus = getFilterInitialStatus(filter);
    let lang = i18n.language == 'en' ? en_GB : hy_AM;
    const user = store.get('user');
    const  userTimeOffset = user.time_offset;
    let initialCreateAt = [];
    const initialRoles = filter.roles ? filter.roles : [];
    if (filter.created_at && filter.created_at[0]) {
      initialCreateAt[0] = moment(filter.created_at[0])
    }
    if (filter.created_at && filter.created_at[1]) {
      initialCreateAt[1] = moment(filter.created_at[1])
    }

    return (
      <>
        <div className={stylesFilterBy['status-container']}>

          <div onClick={closedModalForFilter}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.4119 9.00019L16.7119 2.71019C16.9002 2.52188 17.006 2.26649 17.006 2.00019C17.006 1.73388 16.9002 1.47849 16.7119 1.29019C16.5236 1.10188 16.2682 0.996094 16.0019 0.996094C15.7356 0.996094 15.4802 1.10188 15.2919 1.29019L9.00189 7.59019L2.71189 1.29019C2.52359 1.10188 2.26819 0.996094 2.00189 0.996094C1.73559 0.996094 1.4802 1.10188 1.29189 1.29019C1.10359 1.47849 0.997801 1.73388 0.997801 2.00019C0.997801 2.26649 1.10359 2.52188 1.29189 2.71019L7.59189 9.00019L1.29189 15.2902C1.19816 15.3831 1.12377 15.4937 1.073 15.6156C1.02223 15.7375 0.996094 15.8682 0.996094 16.0002C0.996094 16.1322 1.02223 16.2629 1.073 16.3848C1.12377 16.5066 1.19816 16.6172 1.29189 16.7102C1.38486 16.8039 1.49546 16.8783 1.61732 16.9291C1.73917 16.9798 1.86988 17.006 2.00189 17.006C2.1339 17.006 2.26461 16.9798 2.38647 16.9291C2.50833 16.8783 2.61893 16.8039 2.71189 16.7102L9.00189 10.4102L15.2919 16.7102C15.3849 16.8039 15.4955 16.8783 15.6173 16.9291C15.7392 16.9798 15.8699 17.006 16.0019 17.006C16.1339 17.006 16.2646 16.9798 16.3865 16.9291C16.5083 16.8783 16.6189 16.8039 16.7119 16.7102C16.8056 16.6172 16.88 16.5066 16.9308 16.3848C16.9816 16.2629 17.0077 16.1322 17.0077 16.0002C17.0077 15.8682 16.9816 15.7375 16.9308 15.6156C16.88 15.4937 16.8056 15.3831 16.7119 15.2902L10.4119 9.00019Z" fill="black"/>
            </svg>
          </div>

          <div className={stylesFilterBy['status-container-center']}>
            <h1 className={stylesFilterBy['status-title']}>Filter</h1>

            <Row
              className={`${styles.filtersReportsActionsSect} ${stylesUser['parent-row__head']}`}
              type="flex"
              justify="space-between"
              align="middle"
            >
              <Col span={24}>
                <Row className={`${stylesUser['second-row__head']} ${stylesFilterBy['filter-pdd']}`} gutter={[16, 20]}
                     type="flex"
                     align="middle"
                >
                  <Col className={stylesFilterBy['status-filter']}>
                    {/*Created date bar*/}
                    <Col className={`${stylesFilterBy['input-style']}`}>
                      <ConfigProvider locale={lang}>
                        {getFieldDecorator('created_at', {
                          initialValue: initialCreateAt,
                        })(
                          <DatePicker.RangePicker
                            placeholder={[moment().utcOffset(userTimeOffset).format(dateFormats.tasksPageCalendarFormat), '']}
                            className={` ${stylesUser['user-calendar-input']} ${globalStyles['input-md-ex']} ${stylesFilterBy['input-datePicker']}`}
                            dropdownClassName={mobileFilterModalStyle['app-datepicker']}
                            suffixIcon={
                            <span className={`${stylesUser['head__calendar-icon']}`}>
                              <Icons name="calendar"/>
                            </span>
                            }
                            format='DD-MM-YY'
                            onChange={this.handleChange.bind(this, 'created_at')}
                            disabledDate={disabledDate}
                            getCalendarContainer={triggerNode => triggerNode.parentNode}
                          >
                          </DatePicker.RangePicker>
                        )}
                      </ConfigProvider>
                    </Col>

                    {/*Role Select Bar*/}
                    <Col className={`${stylesUser['label-head']} ${stylesFilterBy['input-style']}`}>
                      <span className={stylesUser['label-head__text']}>
                        <Trans>Role</Trans>
                      </span>
                      {getFieldDecorator('roles', {
                        initialValue: initialRoles,
                      })(
                        <Select
                          suffixIcon={
                            <Icons name="arrowdown2" fill='#B3B3B3' style={{marginRight: '10px'}}/>
                          }
                          dropdownClassName={stylesUser['selectRole']}
                          className={`${stylesUser['user-role-input']} ${globalStyles['input-md-ex']} ${stylesFilterBy['input-datePicker']}`}
                          placeholder={i18n.t`Role`}

                          onChange={this.handleChange.bind(this, 'roles')}
                        >
                          <Select.Option value={''}>
                            <Trans>All</Trans>
                          </Select.Option>
                          {roles.map(key => (
                            <Select.Option key={key} value={key}>{i18n._(key)}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Col>
                  </Col>

                  {/*Status Tab Content*/}
                  <Col className={`${stylesUser['user-radio-wrap']} ${stylesFilterBy['filter-by-button-col']}`} onClick={(e) => this.handleStatusToggle(e)}>
                    <h2 className={stylesFilterBy['status-subtitle']}>Status</h2>
                    {/*this.handleModeChange*/}
                    {getFieldDecorator('status', {
                      initialValue: initialStatus,
                    })(
                      <Radio.Group onChange={this.handleChange.bind(this, 'status')} className={stylesFilterBy['status-btn']}>
                        <Radio.Button value="1">
                          <Trans>Active</Trans>
                        </Radio.Button>
                        <Radio.Button value="0">
                          <Trans>Inactive</Trans>
                        </Radio.Button>
                      </Radio.Group>
                    )}
                    <div className={`${stylesUser['user-button-wrap']} ${stylesFilterBy['reset-btn-content']}`}>
                      <Button type="secondary" onClick={this.handleReset} className={stylesFilterBy['reset-btn']}>
                        <Trans>Reset</Trans>
                      </Button>
                    </div>
                  </Col>

                  <Col className={stylesFilterBy['confirm-status-content']}>
                    <Button className={stylesFilterBy['cencel-btn']} onClick={closedModalForFilter}>
                      Cancel
                    </Button>
                    <Button className={stylesFilterBy['save-btn']} onClick={() => this.filterChange()}>
                      Save
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </>
    )
  }
}

export default FilterBy;
