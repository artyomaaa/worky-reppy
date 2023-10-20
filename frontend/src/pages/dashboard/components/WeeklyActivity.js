import React from 'react'
import {Row, Col, Divider, Popover} from 'antd';
import stylesWeeklyActivity from './weeklyActivity.less';
import {withI18n} from "@lingui/react";
import {
  fnDurationToHoursMinutesSeconds,
  fnDurationPercent,
  fnConvertSecondsAsHours,
} from "../../../utils";
import moment from 'utils/moment';


@withI18n()
class WeeklyActivity extends React.Component {
  render() {
    const { i18n, weeklyActivities } = this.props;
    const thisWeek = fnDurationPercent(Math.round(fnConvertSecondsAsHours(weeklyActivities?.thisWeek)), 40); // We have to get the number 40 from the database, which is a separate task
    const lastWeek = fnDurationPercent(Math.round(fnConvertSecondsAsHours(weeklyActivities?.lastWeek)), 40); // We have to get the number 40 from the database, which is a separate task
    const thisWeekWorkedTime = fnDurationToHoursMinutesSeconds(weeklyActivities?.thisWeek);
    let thisWeekHour = thisWeekWorkedTime.hours;
    let thisWeekMinute = thisWeekWorkedTime.minutes;
    let thisWeekSecond = thisWeekWorkedTime.seconds;
    const todayWorkedTime = fnDurationToHoursMinutesSeconds(weeklyActivities?.workedToday);
    let todayHour = todayWorkedTime.hours;
    let todayMinute = todayWorkedTime.minutes;
    let todaySecond = todayWorkedTime.seconds;
    const duration = moment.duration(moment(weeklyActivities?.lastWeek).diff(moment(weeklyActivities?.thisWeek)));
    const diffTime = Math.abs(moment.utc(duration.asMilliseconds()));
    let diffHours = fnDurationToHoursMinutesSeconds(diffTime).hours;
    let diffMinute = fnDurationToHoursMinutesSeconds(diffTime).minutes;
    let diffSecond = fnDurationToHoursMinutesSeconds(diffTime).seconds;

    return (
      <Row className={stylesWeeklyActivity["row-info"]}>
        <Col xl={6} lg={12} md={12} sm={12} xs={12} className={stylesWeeklyActivity["col-box"]}>
          <p className={stylesWeeklyActivity["col-subtitle"]}>{i18n._('Weekly activity')}</p>
          <p className={stylesWeeklyActivity["percent"]}>{+thisWeek}%</p>
          <Popover placement="bottomLeft" content={<span>{i18n.t`Compared to previous week.`}</span>}>
            <p className={stylesWeeklyActivity["differnce-percent"]}>
              {duration.asMilliseconds() <= 0 ?
                <svg width="5" height="3" viewBox="0 0 5 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.49308 3C4.99325 3 5.14055 2.49469 4.85746 2.21143L2.83226 0.145298C2.6457 -0.0418713 2.34309 -0.0516565 2.15703 0.136014L0.131334 2.18183C-0.122753 2.43724 -0.0107141 3 0.489707 3C1.01589 3 4.09344 3 4.49308 3Z" fill="#24FF00"/>
                </svg>
                :
                <svg width="5" height="3" viewBox="0 0 5 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.506874 0C0.00670265 0 -0.140598 0.505306 0.142499 0.788568L2.16769 2.8547C2.35426 3.04187 2.65686 3.05166 2.84292 2.86399L4.86862 0.818174C5.12271 0.562761 5.01067 0 4.51025 0C3.98407 0 0.906511 0 0.506874 0Z" fill="#FF0404"/>
                </svg>
              }
              <span className={`${stylesWeeklyActivity["differnce-percent-item"]} ${duration.asMilliseconds() <= 0 ? stylesWeeklyActivity["differnce-percent-color-green"] : stylesWeeklyActivity["differnce-percent-color-red"]}`}>
                {Math.abs(lastWeek - thisWeek)}%
              </span>
            </p>
          </Popover>
          <Divider type="vertical" />
          <Divider />
        </Col>

        <Col xl={6} lg={12} md={12} sm={12} xs={12} className={stylesWeeklyActivity["col-box"]}>
          <p className={stylesWeeklyActivity["col-subtitle"]}>{i18n._("Worked this week")}</p>
          <p className={stylesWeeklyActivity["percent"]}>
            {`${thisWeekHour < 10 ? thisWeekHour = "0" + thisWeekHour : thisWeekHour}:${thisWeekMinute < 10 ? thisWeekMinute = "0" + thisWeekMinute : thisWeekMinute}:${thisWeekSecond < 10 ? thisWeekSecond = "0" + thisWeekSecond : thisWeekSecond}`}
          </p>
          <Popover placement="bottomLeft" content={<span>{i18n.t`Compared to previous week.`}</span>}>
            <p className={stylesWeeklyActivity["differnce-percent"]}>
              {duration.asMilliseconds() <= 0 ?
              <svg width="5" height="3" viewBox="0 0 5 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.49308 3C4.99325 3 5.14055 2.49469 4.85746 2.21143L2.83226 0.145298C2.6457 -0.0418713 2.34309 -0.0516565 2.15703 0.136014L0.131334 2.18183C-0.122753 2.43724 -0.0107141 3 0.489707 3C1.01589 3 4.09344 3 4.49308 3Z" fill="#24FF00"/>
              </svg>
              :
              <svg width="5" height="3" viewBox="0 0 5 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.506874 0C0.00670265 0 -0.140598 0.505306 0.142499 0.788568L2.16769 2.8547C2.35426 3.04187 2.65686 3.05166 2.84292 2.86399L4.86862 0.818174C5.12271 0.562761 5.01067 0 4.51025 0C3.98407 0 0.906511 0 0.506874 0Z" fill="#FF0404"/>
              </svg>
              }
              <span className={`${stylesWeeklyActivity["differnce-percent-item"]} ${duration.asMilliseconds() <= 0 ? stylesWeeklyActivity["differnce-percent-color-green"] : stylesWeeklyActivity["differnce-percent-color-red"]}`}>
              {`${diffHours < 10 ? "0" + diffHours : diffHours}:${diffMinute < 10 ? "0" + diffMinute : diffMinute}:${diffSecond < 10 ? "0" + diffSecond : diffSecond}`}
              </span>
            </p>
          </Popover>
          <Divider type="vertical" />
          <Divider />
        </Col>

        <Col xl={6} lg={12} md={12} sm={12} xs={12} className={stylesWeeklyActivity["col-box"]}>
          <p className={stylesWeeklyActivity["col-subtitle"]}>{i18n._("Projects worked")}</p>
          <p className={stylesWeeklyActivity["percent"]}>{weeklyActivities?.workedProjectsCount}</p>
          <Divider type="vertical" />
        </Col>

        <Col xl={6} lg={12} md={12} sm={12} xs={12} className={stylesWeeklyActivity["col-box"]}>
          <p className={stylesWeeklyActivity["col-subtitle"]}>{i18n._("Worked today")}</p>
          <p className={stylesWeeklyActivity["percent"]}>
            {`${todayHour < 10 ? "0" + todayHour : todayHour}:${todayMinute < 10 ? "0" + todayMinute : todayMinute}:${todaySecond < 10 ? "0" + todaySecond : todaySecond}`}
          </p>
        </Col>
      </Row>
    )
  }
}

export default WeeklyActivity;
