import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import Icons from 'icons/icon';
import {DatePicker} from "antd";
import {getDateRangesTranslated, disabledDate} from "utils";
import {withI18n} from "@lingui/react/index";

import styles from "./index.less";
import globalStyles from "themes/global.less";

@withI18n()
class ReportsDatePicker extends PureComponent {
  render() {
    const { className, i18n, ...props } = this.props;
    return (
      <DatePicker.RangePicker
        {...props}
        allowClear={false}
        ranges={getDateRangesTranslated(i18n)}
        format="DD-MM-YYYY"
        disabledDate={disabledDate}
        className={[className, styles['date-picker'], globalStyles['user-calendar-input'], globalStyles['input-md-ex']]}
        suffixIcon={
          <span className={globalStyles['head__calendar-icon']}>
          <Icons name="calendar" style={{marginRight: '10px', marginTop: '-2px'}}/>
        </span>
        }
      />
    );
  }
}

ReportsDatePicker.defaultProps = {
  className: '',
};

ReportsDatePicker.propTypes = {
  className: PropTypes.string,
};

export default ReportsDatePicker;
