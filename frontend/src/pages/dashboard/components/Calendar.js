import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import {checkDateTimeFormat, disabledDate} from 'utils';
import styles from './calendar.less';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';

import { withI18n } from '@lingui/react';
import {Col, DatePicker, Form, Row, ConfigProvider} from 'antd';
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';

const ColProps = {
  xs: 24,
  sm: 12,
  style: {
    marginBottom: 16,
  },
};

const TwoColProps = {
  ...ColProps,
  xl: 96,
};

const DATE_RANGES  = {
  'Today': [moment(), moment()],
  'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
  'This Week': [moment().startOf('week'), moment().endOf('week')],
  'Last Week': [moment().subtract(1, 'weeks').startOf('week'), moment().subtract(1, 'weeks').endOf('week')],
  'This Month': [moment().startOf('month'), moment().endOf('month')],
  'Last Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
};

const DATE_RANGE_TITLE = 'This week';

@withI18n()
@Form.create()
class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateRangeTitle: DATE_RANGE_TITLE
    };
    this.handleChange = this.handleChange.bind(this);
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
  handleChange = (key, values) => {
    const { form, onDatesChange } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    values = [moment(values[0], 'DD-MM-YYYY'), moment(values[1], 'DD-MM-YYYY')];
    this.onChangeDateRangeFilter(values);
    fields['date_range'] = values;
    fields = this.handleFields(fields);

    onDatesChange(fields);
  };


  onChangeDateRangeFilter = (dates) => {
    const startDateTime = dates[0] ? dates[0] : moment();
    const endDateTime = dates[1] ? dates[1] : moment();

    let dateRangeTitle = '';
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

  render() {
    const { filter, form, i18n } = this.props;
    const { start_date_time, end_date_time } = filter;

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
      <Col xl={{ span: 18 }}  md={{ span: 18 }} sm={{ span: 18 }}>
        <Col {...ColProps}  xl={{ span: 18 }}  md={{ span: 18 }} sm={{ span: 18 }}>
          <div className={styles.calendar_container}>
            <span className={styles.calendar_name}>{i18n._(this.state.dateRangeTitle)}</span>
            <ConfigProvider locale={locale} >
              <DatePicker.RangePicker
                allowClear={false}
                ranges={DATE_RANGES}
                format="DD-MM-YYYY"
                onChange={this.handleChange}
                defaultValue={initialDateRange}
                disabledDate={disabledDate}
              />
            </ConfigProvider>
          </div>
        </Col>
        <Col
          {...TwoColProps}
          xl={{ span: 24 }}
          md={{ span: 24 }}
          sm={{ span: 24 }}
        >
        </Col>
      </Col>
    )
  }
}

Calendar.propTypes = {
  form: PropTypes.object,
  filter: PropTypes.object,
  onFilterChange: PropTypes.func,
};

export default Calendar
