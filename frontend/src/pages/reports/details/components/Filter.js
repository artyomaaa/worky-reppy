import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import { FilterItem } from 'components';
import { ReportsDatePicker, ReportsSelect, Reset, Search } from "../../components";
import {checkDateTimeFormat, getUserFullName, getDateRanges} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';

import { Trans, withI18n } from '@lingui/react';
import { Row, Col, Select, Form, ConfigProvider } from 'antd';
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import styles from "../../../../components/Page/Page.less";
import filterStyles from "./Filter.less";
import reportStyles from "../../index.less";
import globalStyles from "themes/global.less";

const DATE_RANGES = getDateRanges();
const DATE_RANGE_TITLE = 'Custom Range';

@withI18n()
@Form.create()
class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateRangeTitle: DATE_RANGE_TITLE,
      isInactiveTeams: false,
      isInactiveProjects: false,
      isInactiveUsers: false,
    }
  }
  handleFields = fields => {
    const { date_range } = fields;
    if (date_range && date_range.length) {
      fields.start_date_time = date_range[0] ? date_range[0].format(START_DATE_TIME_FORMAT) : moment().format(START_DATE_TIME_FORMAT);
      fields.end_date_time = date_range[1] ? date_range[1].format(END_DATE_TIME_FORMAT) : moment().format(END_DATE_TIME_FORMAT);
    } else {
      fields.start_date_time = moment().format(START_DATE_TIME_FORMAT);
      fields.end_date_time = moment().format(END_DATE_TIME_FORMAT);
    }
    return fields;
  };

  handleSubmit = () => {
    const { onFilterChange, form } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    fields = this.handleFields(fields);

    onFilterChange(fields)
  };

  handleReset = () => {
    const { form } = this.props;
    const { getFieldsValue, setFieldsValue } = form;

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
    setFieldsValue(fields);
    this.handleSubmit()
  };
  handleChange = (key, values) => {
    const { form, onFilterChange } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    fields[key] = values;
    fields = this.handleFields(fields);
    onFilterChange(fields)
  };


  onChangeDateRangeFilter = (dates) => {
    const startDateTime = dates[0] ? dates[0] : moment();
    const endDateTime = dates[1] ? dates[1] : moment();

    let dateRangeTitle = DATE_RANGE_TITLE;
    Object.keys(DATE_RANGES).map(key => {
      if (DATE_RANGES.hasOwnProperty(key)) {
        if (startDateTime.isSame(DATE_RANGES[key][0], 'day') && endDateTime.isSame(DATE_RANGES[key][1], 'day')) {
          dateRangeTitle = key;
        }
      }
    });
    this.setState({
      dateRangeTitle: dateRangeTitle
    })
  };

  handleToggleInactive = (inactive) => {
    this.setState((prevState) => {
      return { [inactive]: !prevState[inactive] };
    });
  };

  render() {
    const { filter, form, i18n, teams = [], projects = [], users = [] } = this.props;
    const { isInactiveTeams, isInactiveProjects, isInactiveUsers } = this.state;
    const { getFieldDecorator } = form;
    const { start_date_time, end_date_time } = filter;
    let lang = i18n.language == 'en' ? en_GB : hy_AM;


    // filter by teams
    let initialTeams = [];
    if (filter.teams) {
      const fItems = Array.isArray(filter.teams) ? filter.teams : [filter.teams];
      const filterIds = fItems.map(item => parseInt(item));
      const filterItems = teams.filter(item => filterIds.includes(item.id));

      initialTeams = filterItems.map(item => item.id);
    }

    // filter by projects
    let initialProjects = [];
    if (filter.projects) {
      if (filter.projects === "0"){
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
      const fItems = Array.isArray(filter.users) ? filter.users : [filter.users];
      const filterIds = fItems.map(item => parseInt(item));
      const filterItems = users.filter(item => filterIds.includes(item.id));

      initialUsers = filterItems.map(item => item.id);
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

    const filteredTeams = !isInactiveTeams ? teams.filter(filterByStatus) : teams;
    const filteredProjects = !isInactiveProjects ? projects.filter(filterByStatus) : projects;
    const filteredUsers = !isInactiveUsers ? users.filter(filterByStatus) : users;

    return (
      <Row
        className={`${reportStyles['reports-header']} ${reportStyles['reports-header-border-bottom']} ${globalStyles['parent-row__head']}`}
        type="flex"
        justify="space-between"
        align="middle"
      >
        <Col className={globalStyles['reportTopSection']}>
          <div className={`${styles.searchSect} ${globalStyles['head-search--bar']} ${filterStyles['filter_selects']}`}>
            {getFieldDecorator('teams', { initialValue: initialTeams })(
              <ReportsSelect
                name="Teams"
                placeholder={i18n.t`Select Teams`}
                isInactive={isInactiveTeams}
                toggleInactive={this.handleToggleInactive}
              >
                {filteredTeams.map(item =>{
                  return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                })}
              </ReportsSelect>
            )}
          </div>
          <div className={`${styles.searchSect} ${globalStyles['head-search--bar']} ${filterStyles['filter_selects']}`}>
            {getFieldDecorator('projects', {
              initialValue: initialProjects,
            })(
              <ReportsSelect
                name="Projects"
                placeholder={i18n.t`Select Projects`}
                isInactive={isInactiveProjects}
                toggleInactive={this.handleToggleInactive}
              >
                {filteredProjects.map(item =>{
                  return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                })}
              </ReportsSelect>
            )}
          </div>
          <div className={`${styles.searchSect} ${globalStyles['head-search--bar']} ${filterStyles['filter_selects']}`}>
            {getFieldDecorator('users', {
              initialValue: initialUsers,
            })(
              <ReportsSelect
                name="Users"
                placeholder={i18n.t`Select Users`}
                isInactive={isInactiveUsers}
                toggleInactive={this.handleToggleInactive}
              >
                {filteredUsers.map(item => {
                  return <Select.Option key={item.id} value={item.id}>{getUserFullName(item)}</Select.Option>;
                })}
              </ReportsSelect>
            )}
          </div>
          <div className={`${styles.searchSect} ${globalStyles['second-row__head']} ${globalStyles['head-search--bar']} ${filterStyles['filter_selects']}`}>
            <FilterItem>
              <ConfigProvider locale={lang}>
                {getFieldDecorator('date_range', { initialValue: initialDateRange })(
                  <ReportsDatePicker />
                )}
              </ConfigProvider>
            </FilterItem>
          </div>
          <div className={filterStyles['filter-buttons']}>
            <Search handleSearch={this.handleSubmit} />
            <Reset horizontalMargin handleReset={this.handleReset} />
          </div>
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
