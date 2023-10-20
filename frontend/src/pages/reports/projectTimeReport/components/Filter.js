import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import {checkDateTimeFormat, getUserFullName} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';
import { Trans, withI18n } from '@lingui/react';
import { Row, Col, Select, Form, ConfigProvider } from 'antd';
import {ReportsSelect, ReportsDatePicker, Reset} from "../../components";
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import styles from "../../../../components/Page/Page.less";
import reportStyles from "../../index.less";
import filterStyles from "./Filter.less";
import globalStyles from "themes/global.less";
import store from 'store';

const loggedUser = store.get('user');
const DATE_RANGE_TITLE = 'Custom Range';

@withI18n()
@Form.create()
class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateRangeTitle: DATE_RANGE_TITLE,
      isInactiveProjects: false,
      isInactiveUsers: false,
    }
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
    fields.date_range = [moment(), moment()];
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
    return fields;
  };

  handleChange = (key, values) => {
    const {filter, onFilterChange} = this.props;
    let fields = filter;

    if (key === 'status') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields[key] = (values instanceof Object) ? values.target.value : values;
    } else {
      fields[key] = values;
    }

    fields = this.handleFields(fields);
    onFilterChange(fields)
  };

  handleToggleInactive = (inactive) => {
    this.setState((prevState) => {
      return { [inactive]: !prevState[inactive] };
    });
  };

  render() {
    const {filter, form, i18n, users = [], projects} = this.props;
    const {isInactiveUsers, isInactiveProjects} = this.state;
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
    // filter by projects
    let initialProjects = [];
    if (filter.projects) {
      if (filter.projects === "0") {
        initialProjects = [0];
      } else {
        const fItems = Array.isArray(filter.projects) ? filter.projects : [filter.projects];
        const filterIds = fItems.map(item => parseInt(item));
        const filterItems = projects.filter(item => filterIds.includes(item.id));

        initialProjects = filterItems.map(item => item.id);
        if (filterIds.includes(0)) initialProjects.unshift(0);
      }
    }

    // filter by users
    let initialUsers = [];
    if (filter.users) {
      if (filter.users === "0"){
        initialUsers = [0];
      } else {
        const fItems = Array.isArray(filter.users) ? filter.users : [filter.users];
        const filterIds = fItems.map(item => parseInt(item));
        const filterItems = users.filter(item => filterIds.includes(item.id));

        initialUsers = filterItems.map(item => item.id);
      }
    }
    // filter by status
    let initialStatus;
    if (filter.status) {
      initialStatus = filter.status;
    } else {
      initialStatus = null;
    }

    // filter by start and end date times
    let initialDateRange = [];
    if (!start_date_time && !end_date_time) {
      initialDateRange = [moment(), moment()];
    } else {
      if (start_date_time && checkDateTimeFormat(start_date_time, START_DATE_TIME_FORMAT)) {
        initialDateRange.push(moment(start_date_time));
      } else { // invalid date time format
        initialDateRange.push(moment());
      }

      if (end_date_time && checkDateTimeFormat(end_date_time, END_DATE_TIME_FORMAT)) {
        initialDateRange.push(moment(end_date_time));
      } else { // invalid date time format
        initialDateRange.push(moment());
      }
    }

    // filter by status
    const filterByStatus = (item) => item.status;

    const filteredProjects = !isInactiveProjects ? projects.filter(filterByStatus) : projects;
    const filteredUsers = !isInactiveUsers ? users.filter(filterByStatus) : users;

    return (
      <Row
        className={`${[reportStyles['reports-header']]} ${reportStyles['reports-header-border-bottom']} ${styles.filtersReportsActionsSect} ${globalStyles['parent-row__head']}`}
        type="flex"
        justify="space-between"
        align="middle"
      >
        <Col className={globalStyles['reportTopSection']}>
          <div className={`${filterStyles['filter-select']} ${globalStyles['head-search--bar']}`}>
            {getFieldDecorator('projects', {
              initialValue: initialProjects,
            })(
              <ReportsSelect
                name="Projects"
                placeholder={i18n.t`Select Projects`}
                isInactive={isInactiveProjects}
                toggleInactive={this.handleToggleInactive}
                onChange={this.handleChange.bind(this, 'projects')}
              >
                <Select.Option key={0} value={0}>{i18n.t`No Project`}</Select.Option>
                {canViewProjectList && filteredProjects.map(item => {//for Administrator and Hr
                    return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                  })
                  ||
                  filteredProjects.map(item => {//for manager and staff
                    for (let i = 0; i < item.attached_users.length; i++) {
                      if (item.attached_users[i].id === loggedUser.id) {
                        return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                      }
                    }
                  })
                }
              </ReportsSelect>
            )}
          </div>
          <div className={`${filterStyles['filter-select']} ${globalStyles['head-search--bar']}`}>
            {getFieldDecorator('users', {
              initialValue: initialUsers,
            })(
              <ReportsSelect
                name="Users"
                placeholder={i18n.t`Select Users`}
                isInactive={isInactiveUsers}
                toggleInactive={!canViewUserReportFullList ? false : this.handleToggleInactive}
                onChange={this.handleChange.bind(this, 'users')}
              >
                {!canViewUserReportFullList && uniqueAttachedUsers.map(item => {
                  return item && <Select.Option key={item.id}
                                                value={item.id}>{getUserFullName(item)}</Select.Option>;
                })}
                {canViewUserReportFullList && filteredUsers.map(item => {
                  return item && <Select.Option key={item.id}
                                                value={item.id}>{getUserFullName(item)}</Select.Option>;
                })}
              </ReportsSelect>
            )}
          </div>
          <div className={`${globalStyles['second-row__head']} ${filterStyles['filter-select']} ${globalStyles['head-search--bar']}`}>
            <ConfigProvider locale={lang}>
              {getFieldDecorator('date_range', { initialValue: initialDateRange })(
                <ReportsDatePicker onChange={this.handleChange.bind(this, 'date_range')} />
              )}
            </ConfigProvider>
          </div>
          <Reset handleReset={this.handleReset} />
        </Col>
      </Row>
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
