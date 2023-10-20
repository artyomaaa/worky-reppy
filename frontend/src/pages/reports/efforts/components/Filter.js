import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { Row, Col, Select, Radio, Form, DatePicker, ConfigProvider } from 'antd';
import {
  checkLoggedUserPermission,
  disabledDate,
  getFilterInitialUsers,
  getFilterInitialDateRange,
  getFilterInitialProjects,
  getFilterInitialTeams,
  getFilterInitialStatus,
  getUserFullName,
  getDateRangesTranslated,
} from 'utils';
import {PERMISSIONS, START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';
import { ReportsDatePicker, ReportsSelect, Reset, Search } from "../../components";
import styles from './Filter.less';
import reportStyles from "../../index.less";
import pageStyles from 'components/Page/Page.less';
import globalStyles from "themes/global.less";
import stylesUser from '../../../users/components/Filter.less'
import store from 'store';
import moment from 'utils/moment';
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import Icons from 'icons/icon';

const loggedUser = store.get('user');

@withI18n()
@Form.create()
class Filter extends Component {
  constructor(props) {
    super(props);
  }

  handleReset = () => {
    const {filter, form, onFilterChange} = this.props;
    const {setFieldsValue} = form;
    let fields = filter;
    for (let item in fields) {
      if ({}.hasOwnProperty.call(fields, item)) {
        if (fields[item] instanceof Array) {
          fields[item] = []
        } else {
          fields[item] = undefined
        }
      }
    }

    if (fields.date_range === undefined) fields.date_range = [moment(), moment()];
    if (fields.status === undefined) fields.status = '1';

    setFieldsValue(fields);
    onFilterChange(fields)
  };

  handleFields = fields => {
    const { date_range } = fields;
    if (date_range && date_range.length) {
      fields.start_date_time = date_range[0] ? date_range[0].format(START_DATE_TIME_FORMAT) : moment().format(START_DATE_TIME_FORMAT);
      fields.end_date_time = date_range[1] ? date_range[1].format(END_DATE_TIME_FORMAT) : moment().format(END_DATE_TIME_FORMAT);
    } else if (!(fields.start_date_time && fields.end_date_time)) {
      fields.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      fields.end_date_time = moment().format(END_DATE_TIME_FORMAT);
    }
    // if (fields.status === undefined) fields.status = '1';
    return fields;
  };

  handleSubmit = () => {
    const { onFilterChange, form } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    fields = this.handleFields(fields);

    onFilterChange(fields);
  };

  handleChange = (key, values) => {
    const {filter, onFilterChange} = this.props;
    let fields = {...filter};

    if (key === 'status') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields[key] = (values instanceof Object) ? values.target.value : values;
    } else {
      fields[key] = values;
    }

    fields = this.handleFields(fields);
    onFilterChange(fields)
  };


  handleStatusToggle = (e) => {
    const {form, onFilterChange} = this.props;
    const {getFieldsValue, setFieldsValue} = form;

    let fields = getFieldsValue();
    if (e.target.value && (e.target.value === fields.status)) {
      fields.status = undefined; // important
      setFieldsValue(fields);
      onFilterChange(fields);
    }
  };

  render() {
    const {filter, form, i18n, teams = [], users = [], projects} = this.props;
    const {getFieldDecorator} = form;
    const {start_date_time, end_date_time} = filter;
    let lang = i18n.language === 'en' ? en_GB : hy_AM;
    const canViewProjectList = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECTS_LIST.name, PERMISSIONS.VIEW_PROJECTS_LIST.guard_name);
    const canViewUserReportFullList = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_REPORT_FULL_LIST.name, PERMISSIONS.VIEW_USER_REPORT_FULL_LIST.guard_name);
    let uniqueAttachedUsers = [];
    if (!canViewUserReportFullList) {
      let attachedUsers = [];
      projects.map(project => project.attached_users.map(it => attachedUsers.push(it)))
      uniqueAttachedUsers = attachedUsers.reduce((unique, curr) => {
        if (!unique.some(obj => obj.id === curr.id && obj.name === curr.name)) {
          unique.push(curr);
        }
        return unique;
      }, []);
    }

    // filter by status
    const initialProjectStatus = getFilterInitialStatus(filter);
    // filter by teams
    const initialTeams = getFilterInitialTeams(filter, teams);
    // filter by projects
    const initialProjects = getFilterInitialProjects(filter, projects);
    // filter by users
    const initialUsers = getFilterInitialUsers(filter, users);
    // filter by start and end date times
    const initialDateRange = getFilterInitialDateRange(start_date_time, end_date_time);

    return (
      <>
      <Row
        className={`${reportStyles['reports-header']} ${styles['first-row']} ${globalStyles['parent-row__head']}`}
        type="flex"
        justify="space-between"
        align="middle"
      >
        <Col className={styles['efforts-head-col']}>
          <div className={`${pageStyles.searchSect} ${styles['search-bar']}`}>
            {getFieldDecorator('teams', {
              initialValue: initialTeams,
            })(
              <Select
                mode="multiple"
                style={{width: '100%'}}
                placeholder={i18n.t`Select Teams`}
                optionFilterProp='children'
                className={`${globalStyles['input-md-ex']} ${styles['custom-select-input']}`}
              >
                <Select.Option key={0} value={0}>{i18n.t`All Teams`}</Select.Option>
                {teams.map(item => {
                  return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                })}
              </Select>
            )}
          </div>
        </Col>
        <Col className={styles['efforts-head-col']}>
          <div className={`${pageStyles.searchSect} ${styles['search-bar']}`}>
            {getFieldDecorator('users', {
              initialValue: initialUsers,
            })(
              <Select
                mode="multiple"
                style={{width: '100%'}}
                placeholder={i18n.t`Select Users`}
                optionFilterProp='children'
                className={`${globalStyles['input-md-ex']} ${styles['custom-select-input']}`}
              >
                {!canViewUserReportFullList && uniqueAttachedUsers.map(item => {
                  return item && <Select.Option key={item.id}
                                                value={item.id}>{getUserFullName(item)}</Select.Option>;
                })}
                {canViewUserReportFullList && users.map(item => {
                  return item && <Select.Option key={item.id}
                                                value={item.id}>{getUserFullName(item)}</Select.Option>;
                })}
              </Select>
            )}
          </div>
        </Col>
        <Col className={styles['efforts-head-col']}>
          <div className={`${pageStyles.searchSect} ${styles['search-bar']}`}>
            {getFieldDecorator('projects', {
              initialValue: initialProjects,
            })(
              <Select
                mode="multiple"
                style={{width: '100%'}}
                placeholder={i18n.t`Select Projects`}
                optionFilterProp='children'
                className={`${globalStyles['input-md-ex']} ${styles['custom-select-input']}`}
              >
                <Select.Option key={0} value={0}>{i18n.t`No Project`}</Select.Option>
                {canViewProjectList && projects.map(item => {//for Administrator and Hr
                  return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                })
                ||
                projects.map(item => {//for manager and staff
                  for (let i = 0; i < item.attached_users.length; i++) {
                    if (item.attached_users[i].id === loggedUser.id) {
                      return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                    }
                  }
                })
                }
              </Select>
            )}
          </div>
        </Col>
        </Row>

        <Row
          className={`${styles['efforts-header-row']} ${reportStyles['reports-header']} ${reportStyles['reports-header-border-bottom']} ${globalStyles['parent-row__head']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
          <Col className={`${styles['efforts-head-col']} ${stylesUser['label-head']} ${styles['filter-col']}`}>
            <div className={`${styles['search-bar']} ${globalStyles['second-row__head']}`}>
              <ConfigProvider locale={lang}>
                {getFieldDecorator('date_range', { initialValue: initialDateRange })(
                  <ReportsDatePicker />
                )}
              </ConfigProvider>
            </div>
          </Col>
          <Col>
            <div className={`${styles['user-radio-wrap']} ${styles['search-bar']}`}  onClick={(e) => this.handleStatusToggle(e)}>
              {getFieldDecorator('status', {
                initialValue: initialProjectStatus,
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
            </div>
          </Col>
          <Col className={`${styles['efforts-head-buttons']} ${styles['reset-button-col']}`}>
            <Search handleSearch={this.handleSubmit} />
            <Reset horizontalMargin handleReset={this.handleReset} />
          </Col>
        </Row>
    </>
    );
  }
}

Filter.propTypes = {
  onAdd: PropTypes.func,
  form: PropTypes.object,
  filter: PropTypes.object,
  onFilterChange: PropTypes.func,
};

export default Filter
