import React from "react";
import {Col} from "antd";
import {DashboardSummaryPieChart} from "../../../components/Charts";
import styles from "./statisticsSummeryPieChart.less";
import {fnDurationToHoursMinutesSeconds, fnDurationPercent} from "../../../utils";

const timeFormat = (duration) => {
  const time = fnDurationToHoursMinutesSeconds(duration);
  for (const key in time) {
    if (time[key] <= 9) {
      time[key] = `0${time[key]}`
    }
  }
  return `${time.hours}:${time.minutes}:${time.seconds}`
}

const StatisticsSummeryPieChart = (props) => {

  const {i18n, width, dataSource, totalDuration} = props;
  const totalHours = timeFormat(totalDuration)
  const elements = dataSource.length ? dataSource.map(({title, color, duration, project_id}) => {

    const time = timeFormat(duration)
    const percent = (+fnDurationPercent(duration, totalDuration)).toFixed(1);

    return (
      <li key={project_id}>
        <span className={styles['project-title']}>
          <span style={{backgroundColor: color}} className={styles['radius']}/>
          {title}
        </span>
        <span className={styles['project-time']}>
          {duration !== 0 ? time : i18n.t`in process`}
          {!!duration && <span className={styles['project-percent']}>({percent}%)</span>}
        </span>
      </li>
    );
  }) : null;

  return (
    <Col lg={9} md={24} className={styles['pie-chart-content']}>
      <h3 className={styles['pie-chart-title']}>{i18n.t`Projects`}</h3>
      <div className={styles['statistics-radius-total']}>
        <DashboardSummaryPieChart {...props} totalHours={totalHours}/>
        {width > 540 ? <div className={styles['total']}>
          <h3>{i18n.t`Total Hours`}</h3>
          <p>{totalHours}</p>
        </div> : null}
      </div>
      <ul className={styles['projects']}>
        {elements}
      </ul>
    </Col>
  )
}

export default StatisticsSummeryPieChart;
