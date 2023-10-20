import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import {checkDateTimeFormat, getUserFullName, getFilterInitialStatus} from 'utils';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';
import { Trans, withI18n } from '@lingui/react';
import { Row, Col, Select, Form, ConfigProvider, Radio } from 'antd';
import { ReportsDatePicker, ReportsSelect, Reset } from "../../components";
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import styles from "../../../../components/Page/Page.less";
import reportStyles from "../../index.less";
import filterStyles from "./Filter.less";
import globalStyles from "themes/global.less";

const DATE_RANGE_TITLE = 'Custom Range';

@withI18n()
@Form.create()
class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateRangeTitle: DATE_RANGE_TITLE,
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
    if (fields.status === undefined) fields.status = '1';
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

  render() {
    const {filter, form, i18n, users = [], projects} = this.props;
    const {getFieldDecorator} = form;
    const {start_date_time, end_date_time} = filter;
    let lang = i18n.language === 'en' ? en_GB : hy_AM;
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
    const initialStatus = getFilterInitialStatus(filter);

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

    return (
      <Row
        className={`${[reportStyles['reports-header']]} ${reportStyles['reports-header-border-bottom']} ${styles.filtersReportsActionsSect} ${globalStyles['parent-row__head']}`}
        type="flex"
        justify="space-between"
        align="middle"
      >
        <Col className={globalStyles['reportTopSection']}>
          <div className={`${filterStyles['filter-select']} ${globalStyles['head-search--bar']}`}>
            {getFieldDecorator('users', {
              initialValue: initialUsers,
            })(
              <ReportsSelect
                name="Users"
                placeholder={i18n.t`Select Users`}
                onChange={this.handleChange.bind(this, 'users')}
              >
                {!canViewUserReportFullList && uniqueAttachedUsers.map(item => {
                  return item && <Select.Option key={item.id}
                                                value={item.id}>{getUserFullName(item)}</Select.Option>;
                })}
                {canViewUserReportFullList && users.map(item => {
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
          <div className={`${globalStyles['second-row__head']} ${reportStyles['filter-select']}`}>
            <div className={globalStyles['user-radio-wrap']}>
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
            </div>
          </div>
          <Reset margin handleReset={this.handleReset} />
        </Col>
      </Row>
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
