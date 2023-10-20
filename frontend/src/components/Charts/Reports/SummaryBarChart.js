import React, {PureComponent}  from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import moment from 'utils/moment';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from '../ChartContainer';
import {fnDurationToHoursMinutesSecondsText, fnDurationToHoursMinutesSeconds, fnReportsGroupByStartDate, fnReportsGroupByProjectId} from 'utils';

const CustomTooltip = ({ active, payload, label, i18n }) => {
  if (active && payload) {
    let items = [];

    for (const [index, entry] of payload.entries()) {
      items.push(<p key={index} className="intro" style={{color: entry.color}}>{entry.name + ' : ' + fnDurationToHoursMinutesSecondsText(entry.value, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)}</p>)
    }

    return (
      <div className="custom-tooltip" style={{background: '#ffffff', padding: '8px'}}>
        <p className="label">{`${label}`}</p>
        {items}
      </div>
    );
  }
  return null;
};

@withI18n()
class SummaryBarChart extends PureComponent {
  state = {
    chartKey: 0,
    chartBars: {},
    chartData: [],
  };
  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.list !== nextProps.list) {
      const { i18n } = this.props;
      const list = fnReportsGroupByStartDate(nextProps.list);

      const chartData = [];
      const chartBars = {};

      Object.keys(list).map(start_date => {
        if(list.hasOwnProperty(start_date)){
          const reports = fnReportsGroupByProjectId(list[start_date]);
          let chartDataItem = {};
          chartDataItem = {name: moment(start_date).format('ddd DD-MM')};
          let project_id = 0, project_name = i18n.t`No Project`, project_color = '#212121';

          Object.keys(reports).map(k => {
            if(reports.hasOwnProperty(k)){
              const works = reports[k];
              const totalDuration = works.reduce((total_duration, item) => {
                let duration = item.duration;
                if (item.duration === 0 && item.start_date_time && item.end_date_time === null) {
                  duration = moment.duration(moment().diff(moment(item.start_date_time))).asSeconds();
                }
                return total_duration + duration;
              }, 0);

              if (works[0] !== undefined) {
                if (works[0].project_id) {
                  project_id = works[0].project_id;
                  project_name = works[0].project_name ? works[0].project_name : i18n.t`No Project`;
                  project_color = works[0].project_color ? works[0].project_color : '#212121';
                }
                if (chartBars[project_id] === undefined) {
                  chartBars[project_id] = {};
                  chartBars[project_id] = {name: project_name, color: project_color};
                }

                chartDataItem[project_name] = totalDuration;
              }
            }
          });
          chartData.push(chartDataItem);
        }
      });

      this.setState({
        chartKey: (this.state.chartKey + 1),
        chartData,
        chartBars
      });
    }
  }
  render() {
    const { i18n } = this.props;
    const {chartData, chartKey, chartBars} = this.state;

    if (chartData !== null && chartData.length > 0) {
      return (
        <ChartContainer>
          <BarChart
            width={500}
            height={300}
            data={chartData}
            barSize={30}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
            key={chartKey}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={tickItem => fnDurationToHoursMinutesSeconds(tickItem).hours} />
            <Tooltip content={<CustomTooltip i18n={i18n} />}/>
            <Legend />
            {Object.keys(chartBars).map(key => {
              if (chartBars.hasOwnProperty(key)) {
                return <Bar dataKey={chartBars[key].name} stackId="a" fill={chartBars[key].color} key={key}/>
              }
            })}
          </BarChart>
        </ChartContainer>
      )
    }
    return null;
  }
}

SummaryBarChart.propTypes = {
  location: PropTypes.object,
};

export default SummaryBarChart;
