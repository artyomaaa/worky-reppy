import React, {useRef} from 'react';
import {DatePicker, Button, ConfigProvider} from 'antd';
import moment from 'utils/moment';
import store from 'store';
import PropTypes from 'prop-types';
import {START_DATE_TIME_FORMAT, dateFormats} from 'utils/constant';
import styles from "./index.less";
import Icons from 'icons/icon';
import { Trans } from '@lingui/react';
import {disabledDate} from 'utils';
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
const SelectDate = (props) => {

  const datePickerRef = useRef();
  const {tasksPageCalendarFormat} = dateFormats;
  const user = store.get('user');
  const userTimeOffset = user.time_offset;
  let lang = props.i18n.language === 'en' ? en_GB : hy_AM;

  function onChange(date) {
    if(date === null) {
      return;
    }
    datePickerRef.current.picker.state.open = false;
    props.onDateChange(date ? date.format(START_DATE_TIME_FORMAT) : moment().utcOffset(userTimeOffset).format(START_DATE_TIME_FORMAT));
  }

  return (
    <div>
      <ConfigProvider locale={lang}>
        <DatePicker
          value={props.selectedDate ? moment.parseZone(props.selectedDate) : null}
          onChange={onChange}
          ref={datePickerRef}
          disabledDate={props.notDisableFutureDates === true ? null : disabledDate}
          dropdownClassName={styles['app-datepicker']}
          showToday={false}
          format={tasksPageCalendarFormat}
          className="app-datepicker-input show-icon"
          suffixIcon={<Icons name="calendar"/>}
          allowClear={false}
          renderExtraFooter={() => {
            return (
              <div>
                <Button onClick={() => onChange(moment().utcOffset(userTimeOffset))}>
                  <Trans>
                    Today
                  </Trans>
                </Button>
                <Button onClick={() => onChange(moment().utcOffset(userTimeOffset).subtract(1, 'days'))}>
                  <Trans>
                    Yesterday
                  </Trans>
                </Button>
              </div>
            )
          }}
        />
      </ConfigProvider>
    </div>
  )
};


SelectDate.propTypes = {
  onDateChange: PropTypes.func,
};

export default React.memo(SelectDate);
