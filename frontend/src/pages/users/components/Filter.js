import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import {checkLoggedUserPermission, disabledDate, getUserFullName, getFilterInitialStatus} from 'utils';
import {STATUSES, PERMISSIONS, dateFormats} from 'utils/constant';
import './Filter.less';
import styles from "../../../components/Page/Page.less";
import stylesUser from "./Filter.less";
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import FilterBy from './filterBy';
/* global document */
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css';
import {Trans, withI18n} from '@lingui/react';
import {Button, Row, Col, Menu, DatePicker, Input, Select, Radio, Dropdown, ConfigProvider} from 'antd';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import globalStyles from "themes/global.less";
import Icons from 'icons/icon';
import _ from "lodash";
import store from "store";
import stylesProjects from "../../projects/components/Filter.less";


const {Search} = Input;

const ColProps = {
  xs: 24,
  sm: 12,
};

const TwoColProps = {
  ...ColProps,
  xl: 96,
};

@withI18n()
@Form.create()
class Filter extends Component {
  state = {
    isOpen: false,
    matches: window.matchMedia("(min-width: 768px)").matches,
    mobileFilters: null,
  }

  componentDidMount() {
    const handler = e => this.setState({matches: e.matches});
    window.matchMedia("(min-width: 768px)").addListener(handler);
  }

  openModalForFilter = () => {
    this.setState((prevState) => ({
      ...prevState,
      isOpen: true
    }))
  }

  closedModalForFilter = () => {
    this.setState((prevState) => ({
      ...prevState,
      isOpen: false
    }))
  }

  handleFields = fields => {
    const {created_at} = fields;
    if (created_at && created_at.length) {
      fields.created_at = [
        moment(created_at[0]).format('YYYY-MM-DD'),
        moment(created_at[1]).format('YYYY-MM-DD'),
      ]
    }
    if(this.state.mobileFilters) {
      return {
        ...fields,
        ...this.state.mobileFilters
      }
    }
    return fields
  };

  handleSubmit = _.debounce(() => {
    const {onFilterChange, form} = this.props,
      {getFieldsValue} = form;

    let fields = getFieldsValue();
    fields = this.handleFields(fields);
    onFilterChange(fields)
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

  handleChange = (key, values) => {
    const {form, onFilterChange} = this.props,
      {getFieldsValue} = form;

    let fields = getFieldsValue();
    if (key === 'status') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields.status = (values instanceof Object) ? values.target.value : values;
    } else fields[key] = values;
    fields = this.handleFields(fields);
    onFilterChange(fields)
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

  onMobileFilterChange = (filters) => {
    this.setState({
      mobileFilters: filters
    });
    this.handleSubmit()
  }

  render() {
    const {onAdd, filter, form, i18n, roles, onFilterChange} = this.props,
      {getFieldDecorator} = form,
      {q} = filter,
      user = store.get('user'),
      userTimeOffset = user.time_offset;

//Export PDF functionality
    const handleExportPDF = () => {
      const {dispatch} = this.props;
      const {form} = this.props;
      const {getFieldsValue} = form;
      let fields = getFieldsValue();
      fields = this.handleFields(fields);

      dispatch({
        type: 'user/export',
        payload: {fields: fields, type: 'PDF'},
      }).then(file => {
        const jsPDF = require('jspdf');
        require('jspdf-autotable');
        let doc = new jsPDF('p', 'pt');
        let data = [];
        for (let key in file.users) {
          const name = getUserFullName(file.users[key]),
            email = file.users[key].email,
            userRoleName = file.users[key].role,
            status = file.users[key].status === 1 ? STATUSES.ACTIVE.text : STATUSES.INACTIVE.text,
            createdAt = moment(file.users[key].created_at).format('L');
          data[key] = [name, email, userRoleName, status, createdAt];
        }
        let columns = ["Name", "Email", "Role", "Status", "Date Created"];
        doc.autoTable({head: [columns], body: data,});
        doc.save("usersList.pdf");
      })
    };

    //Export EXCEL functionality
    const handleExportEXCEL = () => {
      const {dispatch} = this.props,
        {form} = this.props,
        {getFieldsValue} = form;
      let fields = getFieldsValue();
      fields = this.handleFields(fields);

      dispatch({
        type: 'user/export',
        payload: {fields: fields, type: 'EXCEL'},
      }).then(file => {
        const fileDownload = require('js-file-download');
        fileDownload(file.data, 'UsersList.xlsx');
      })
    };

    const getFieldValue = (value) => {
      if (value) {
        return value
      }
      return '';
    }

    const getStatus = (value) => {
      if (value) {
        return 'Active';
      }
      return 'Inactive';
    }

    //Export CSV functionality
    const handleExportCSV = () => {
      const {dispatch} = this.props;
      const {form} = this.props;
      const {getFieldsValue} = form;
      let fields = getFieldsValue();
      fields = this.handleFields(fields);

      dispatch({
        type: 'user/export',
        payload: {fields: fields, type: 'CSV'},
      }).then(file => {
        if (file.users) {

          let data = "Name,Email,Role,Status,Date" + ',\n';
          for (let i = 0; i < file.users.length; i++) {
            data += getUserFullName(file.users[i]) + ','
              + getFieldValue(file.users[i].email) + ','
              + getFieldValue(file.users[i].position) + ','
              + getStatus(file.users[i].status) + ','
              + getFieldValue(moment(file.users[i].created_at).format('MM-DD-YYYY')) + ',\n';
          }
          const fileDownload = require('js-file-download');
          fileDownload(data, 'usersList.csv');
        }
      })
    }

    const getExportListDropdownMenu = () => {
      return (
        <Menu>
          <Menu.Item onClick={handleExportPDF}>PDF</Menu.Item>
          <Menu.Item onClick={handleExportCSV}>CSV</Menu.Item>
          <Menu.Item onClick={handleExportEXCEL}>XLS</Menu.Item>
        </Menu>
      );
    }

    let lang = i18n.language == 'en' ? en_GB : hy_AM;
    const canAddUsers = checkLoggedUserPermission(PERMISSIONS.ADD_USERS.name, PERMISSIONS.ADD_USERS.guard_name);
    const canExportUsersData = checkLoggedUserPermission(PERMISSIONS.EXPORT_USERS_DATA.name, PERMISSIONS.EXPORT_USERS_DATA.guard_name);
    let initialCreateAt = [];
    const initialRoles = filter.roles ? filter.roles : [];
    const initialStatus = getFilterInitialStatus(filter);
    if (filter.created_at && filter.created_at[0]) {
      initialCreateAt[0] = moment(filter.created_at[0])
    }
    if (filter.created_at && filter.created_at[1]) {
      initialCreateAt[1] = moment(filter.created_at[1])
    }

    return (
      <>
        <Row
          className={`${styles.filtersReportsActionsSect} ${stylesUser['parent-row__head']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
          <Col className={`${styles['taskSearch']} ${stylesUser['filterHead']}`}>
            <div className={`${styles['searchSect']} ${stylesUser['head-search--bar']}`}>
              {getFieldDecorator('q', {initialValue: q})(
                <Input
                  className={globalStyles['input-md-ex']}
                  placeholder={i18n.t`Search User`}
                  allowClear
                  onChange={this.handleSubmit}
                  onPressEnter={this.handleSubmit}
                  prefix={
                    <span onClick={this.handleSubmit}>
                    <Icons name="search" style={{marginRight: '10px', marginTop: '2px'}}/>
                  </span>
                  }
                />
              )}
            </div>
          </Col>
          <Col className={`${styles['taskSearch']} ${stylesUser['filterHead']}`}>
            {canAddUsers &&
            <div className={stylesUser['btnWrap']}>
              <button
                onClick={onAdd}
                className="app-btn primary-btn"
              >
                <Icons name="plus" fill="#FFFFFF"/>
                <Trans>ADD USER</Trans>
              </button>
            </div>
            }
            <div className={stylesUser['mobile-filter-container']}>
              <span className={stylesUser['filter-button-icon']}>
               <Icons name='filtersliders'/>
              </span>
              <span
                className={stylesUser['filter-button-text']}
                onClick={this.openModalForFilter}
              >Filter By</span>
            </div>
          </Col>
        </Row>

        {this.state.matches &&
        <Row
          className={`${styles.filtersReportsActionsSect} ${stylesUser['parent-row__head']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
          <Col span={24}>
            <Row className={stylesUser['second-row__head']} gutter={[16, 20]}
                 type="flex"
                 align="middle"
            >
              {/*Role Select Bar*/}
              <Col className={stylesUser['label-head']}>
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
                    className={stylesUser['user-role-input'] + ' ' + globalStyles['input-md-ex']}
                    placeholder={i18n.t`All`}
                    onChange={this.handleChange.bind(this, 'roles')}>
                    <Select.Option value={''}>
                      <Trans>All</Trans>
                    </Select.Option>
                    {roles.map(key => (
                      <Select.Option key={key} value={key}>{i18n._(key)}</Select.Option>
                    ))}
                  </Select>
                )}
              </Col>

              {/*Created date bar*/}
              <Col className={stylesUser['label-head']}>
                <ConfigProvider locale={lang}>
                  {getFieldDecorator('created_at', {
                    initialValue: initialCreateAt,
                  })(
                    <DatePicker.RangePicker
                      placeholder={[moment().utcOffset(userTimeOffset).format(dateFormats.tasksPageCalendarFormat), '']}
                      className={[stylesUser['user-calendar-input'], globalStyles['input-md-ex']]}
                      dropdownClassName={stylesUser['app-datepicker']}
                      suffixIcon={
                        <span className={stylesUser['head__calendar-icon']}>
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

              {/*Status Tab Content*/}
              <Col className={stylesUser['user-radio-wrap']} onClick={(e) => this.handleStatusToggle(e)}>
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
                <div className={stylesUser['user-button-wrap']}>
                  <Button type="secondary" onClick={this.handleReset}>
                    <Trans>Reset</Trans>
                  </Button>
                </div>
              </Col>
              {canExportUsersData &&
              <Col className={stylesUser['secondRow-export']}>
                <Dropdown overlay={() => getExportListDropdownMenu()} trigger={['click']} placement="bottomLeft"
                          overlayClassName={stylesProjects["exportDropdown"]}>
                  <button className="btn-linked">
                    <Trans>EXPORT LIST</Trans>
                    <Icons name="arrowdown2" fill="#4A54FF"/>
                  </button>
                </Dropdown>
              </Col>
              }
            </Row>
          </Col>
        </Row>
          // :
          // <>
          //   {this.state.isOpen && <FilterBy
          //     closedModalForFilter={this.closedModalForFilter}
          //     onFilterChange={onFilterChange}
          //     onMobileFilterChange={this.onMobileFilterChange}
          //     form={form}
          //     filter={filter}
          //     roles={roles}/>
          //   }
          //
          //   {canAddUsers && canExportUsersData &&
          //   <Row
          //     type="flex"
          //     justify="space-between"
          //     align="middle"
          //     className={`${styles.filtersReportsActionsSect} ${stylesUser['secondParent-row__head']}`}
          //   >
          //     <Col>
          //       <Dropdown overlay={() => getExportListDropdownMenu()} trigger={['click']} placement="bottomLeft"
          //                 overlayClassName={stylesProjects["exportDropdown"]}>
          //         <button className="btn-linked">
          //           <Trans>EXPORT LIST</Trans>
          //           <Icons name="arrowdown2" fill="#4A54FF"/>
          //         </button>
          //       </Dropdown>
          //     </Col>
          //   </Row>
          //   }
          // </>
        }
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
