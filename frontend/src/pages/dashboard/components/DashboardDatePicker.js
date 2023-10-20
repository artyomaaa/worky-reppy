import React from "react";
import PropTypes from "prop-types";
import {Col, ConfigProvider, DatePicker} from "antd";
import {getDateRangesTranslated, disabledDate} from 'utils';
import Icons from 'icons/icon';
import styles from "../index.less";
import globalStyles from "themes/global.less";

const DashboardDatePicker = (props) => {
  const {lang, i18n, getFieldDecorator, date_range, onChangeDateRangeFilter} = props;

  return (
    <Col sm={24} md={12}>
      <ConfigProvider locale={lang}>
        {getFieldDecorator('date_range', {initialValue: date_range})(
          <DatePicker.RangePicker
            className={[styles['dashboard-calendar-input'], globalStyles['input-md-ex']]}
            allowClear={false}
            ranges={getDateRangesTranslated(i18n, true)}
            suffixIcon={
              <span className={styles['calendar-icon']}>
                <Icons name="calendar"/>
              </span>
            }
            format="DD-MM-YYYY"
            onChange={onChangeDateRangeFilter}
            disabledDate={disabledDate}
          >
          </DatePicker.RangePicker>
        )}
      </ConfigProvider>
    </Col>
  );
}

DashboardDatePicker.propTypes = {
  lang: PropTypes.object,
  onChangeDateRangeFilter: PropTypes.func,
};

export default DashboardDatePicker;
