import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import {checkLoggedUserPermission, disabledDate, getFilterInitialStatus} from 'utils';
import {PERMISSIONS, dateFormats} from 'utils/constant';

import {Trans, withI18n} from '@lingui/react';
import {Button, Row, Col, DatePicker, Input, Form, ConfigProvider, Dropdown, Radio, Menu} from 'antd';
import './Filter.less'
import en_GB from "antd/lib/locale-provider/en_GB";
import 'moment/locale/en-gb';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import styles from "../../../components/Page/Page.less";
import stylesProjects from "./Filter.less";
import stylesUsers from '../../users/components/Filter.less';
import globalStyles from "themes/global.less";
import Icons from 'icons/icon';
import 'components/SelectDate/index.less';
import store from "store";
import stylesFilter from '../../teams/components/Filter.less'
import MobileFilterModal from "../../../components/MobileFilterModal/MobileFilterModal";



@withI18n()
@Form.create()
class Filter extends Component {
  state = {
    filterModalVisible: false
  }
  handleFields = fields => {
    const {created_at} = fields;
    if (created_at?.length) {
      fields.created_at = [
        moment(created_at[0]).format('YYYY-MM-DD'),
        moment(created_at[1]).format('YYYY-MM-DD'),
      ]
    }
    return fields
  };

  handleSubmit = () => {
    const {onFilterChange, form} = this.props,
      {getFieldsValue} = form;

    let fields = getFieldsValue();
    fields = this.handleFields(fields);
    onFilterChange(fields)
  };

  handleChange = (key, values) => {
    const {form, onFilterChange} = this.props,
      {getFieldsValue} = form;

    let fields = getFieldsValue();
    if (key === 'status') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields[key] = (values instanceof Object) ? values.target.value : values;
    } else fields[key] = values;

    fields = this.handleFields(fields);
    onFilterChange(fields);
  };

  handleMobileFilterShow = () => {
    this.setState(prevState => ({
      filterModalVisible: !prevState.filterModalVisible
    }));
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

  get mobileFilterProps() {
    const {onFilterChange, filter} = this.props;
    const {filterModalVisible} = this.state;

    return {
      filter,
      onFilterChange,
      show: filterModalVisible,
      onApply: this.handleSubmit,
      onClose: this.handleMobileFilterShow
    }
  };

  render() {
    const {onAdd, filter, form, i18n, handleExportPDF, handleExportEXCEL, handleExportCSV} = this.props,
      {getFieldDecorator} = form,
      {name} = filter,
      user = store.get('user'),
      userTimeOffset = user.time_offset;
    let lang = i18n.language === 'en' ? en_GB : hy_AM;
    const canAddProjects = checkLoggedUserPermission(PERMISSIONS.ADD_PROJECTS.name, PERMISSIONS.ADD_PROJECTS.guard_name);

    let initialCreateAt = [];
    if (filter.created_at && filter.created_at[0]) {
      initialCreateAt[0] = moment(filter.created_at[0]);
    }
    if (filter.created_at && filter.created_at[1]) {
      initialCreateAt[1] = moment(filter.created_at[1]);
    }

    // filter by status
    const initialStatus = getFilterInitialStatus(filter);

    const menu = (
      <Menu>
        <Menu.Item onClick={handleExportPDF}>
          {i18n.t`PDF`}
        </Menu.Item>
        <Menu.Item onClick={handleExportCSV}>
          {i18n.t`CSV`}
        </Menu.Item>
        <Menu.Item onClick={handleExportEXCEL}>
          {i18n.t`XLS`}
        </Menu.Item>
      </Menu>
    );

    return (
      <>
        <Row
          className={`${styles.filtersReportsActionsSect} ${stylesUsers['parent-row__head']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
            <Col className={styles['taskSearch']}>
              <div className={`${styles['searchSect']} ${stylesUsers['head-search--bar']}`}>
                {getFieldDecorator('name', {initialValue: name})(
                  <Input
                    className={globalStyles['input-md-ex']}
                    placeholder={i18n.t`Search Project`}
                    onPressEnter={this.handleSubmit}
                    allowClear
                    prefix={
                      <span>
                      <Icons name="search" style={{marginRight: '10px', marginTop: '2px'}}/>
                    </span>
                    }
                  />
                )}
              </div>
            </Col>
          <Col className={stylesUsers['mobile-filter-row']}>
          <Col className={styles['taskSearch']}>
            {canAddProjects &&
            <div className={stylesUsers['btnWrap']}>
              <button
                onClick={onAdd}
                className="app-btn primary-btn"
              >
                <Icons name="plus" fill="#FFFFFF"/>
                <Trans>ADD PROJECT </Trans>
              </button>
            </div>
            }
          </Col>
            <Col className={stylesUsers['mobile-filter-container']}>
              <div className={stylesUsers['mobile-filter-button']}
                   onClick={() => this.handleMobileFilterShow()}>
                <span className={stylesUsers['filter-button-icon']}>
                <Icons name='filtersliders'/>
                  </span>
                <span className={stylesUsers['filter-button-text']}>Filter By</span>
              </div>
            </Col>
          </Col>
        </Row>
        <Row
          className={`${styles.filtersReportsActionsSect} ${stylesUsers['parent-row__head']} ${stylesFilter['filter-second-row']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
          <Col span={24}>
            <div className={`${stylesUsers['second-row__head']} ${stylesProjects['second-row__head']}`}>
              {this.props.width > 767 &&
              <>
                <div className={stylesUsers['label-head']}>
                  <ConfigProvider locale={lang}>
                    {getFieldDecorator('created_at', {
                      initialValue: initialCreateAt,
                    })(
                      <DatePicker.RangePicker
                        placeholder={[moment().utcOffset(userTimeOffset).format(dateFormats.tasksPageCalendarFormat), '']}
                        className={[stylesUsers['user-calendar-input'], globalStyles['input-md-ex']]}
                        dropdownClassName={stylesProjects['app-datepicker']}
                        ranges={{[i18n.t`Today`]: [moment(), moment()],
                          [i18n.t`Yesterday`]: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                          [i18n.t`This Week`]: [moment().startOf('week'), moment().endOf('week')],
                          [i18n.t`Last Week`]: [moment().subtract(1, 'weeks').startOf('week'), moment().subtract(1, 'weeks').endOf('week')],
                          [i18n.t`This Month`]: [moment().startOf('month'), moment().endOf('month')],
                          [i18n.t`Last Month`]: [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
                          [i18n.t`This Year`]: [moment().startOf('year'), moment().endOf('year')],
                          [i18n.t`Last Year`]: [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')],
                        } }
                        suffixIcon={
                          <span className={stylesUsers['head__calendar-icon']}>
                            <Icons name="calendar"/>
                          </span>
                        }
                        format='DD-MM-YY'
                        onChange={this.handleChange.bind(this, 'created_at')}
                        disabledDate={disabledDate}
                        separator={''}
                      >
                      </DatePicker.RangePicker>
                    )}
                  </ConfigProvider>
                </div>

                <div className={`${stylesUsers['user-radio-wrap']} ${stylesFilter['filter-radio-wrap']}`}
                     onClick={(e) => this.handleStatusToggle(e)}>
                  {/*this.handleModeChange*/}
                  {getFieldDecorator('status', {
                    initialValue: initialStatus,
                  })(
                    <Radio.Group onChange={this.handleChange.bind(this, 'status')}>
                      <Radio.Button value="1">
                        <Trans>Active</Trans>
                      </Radio.Button>
                      <Radio.Button value="0">
                        <Trans>Inactive</Trans>
                      </Radio.Button>
                    </Radio.Group>
                  )}
                  <div className={stylesUsers['user-button-wrap']}>
                    <Button type="secondary" onClick={this.handleReset}>
                      <Trans>Reset</Trans>
                    </Button>
                  </div>
                </div>
              </>
              }
              <div className={stylesProjects['secondRow-export']}>
                <Dropdown overlay={menu}
                          trigger={['click']}
                          placement="bottomLeft"
                          overlayClassName={stylesProjects["exportDropdown"]}>
                  <button className="btn-linked">
                    <Trans>EXPORT LIST</Trans>
                    <Icons name="arrowdown2" fill="#4A54FF"/>
                  </button>
                </Dropdown>
              </div>
            </div>
          </Col>
        </Row>
        {this.state.filterModalVisible && <MobileFilterModal {...this.mobileFilterProps}/>}
      </>
    )
  }
}


Filter.propTypes = {
  onAdd: PropTypes.func,
  form: PropTypes.object,
  filter: PropTypes.object,
  onFilterChange: PropTypes.func,
};

export default Filter
