import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {withI18n} from '@lingui/react';
import moment from 'utils/moment';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend, LabelList, Customized,
} from 'recharts';
import ChartContainer from '../ChartContainer';
import {fnDurationToHoursMinutesSecondsText, fnReportsGroupByStartDate, fnReportsGroupByProjectId} from 'utils';
import {fnDurationHoursMinutes, fnDurationToHoursMinutesSeconds} from "../../../utils";

const CustomTooltip = ({active, payload, label, i18n}) => {
  const tooltipStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0px 0px 9px rgba(71, 71, 71, 0.25)',
    borderRadius: '10px',
    padding: '16px',
  };
  if (active && payload) {
    let items = [];

    for (const [index, entry] of payload.entries()) {
      items.push(<p key={index} className="intro"
                    style={{color: entry.color}}>{entry.name + ' : ' + fnDurationToHoursMinutesSecondsText(entry.value, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)}</p>)
    }

    return (
      <div className="custom-tooltip" style={tooltipStyle}>
        <p className="label">{`${label}`}</p>
        {items}
      </div>
    );
  }
  return null;
};

const CustomizedTick = (props) => {
  const {x, y, style, isWeb, payload: { value }} = props;
  const date = value.split('\n');

  return (
    <g style={style} transform={`translate(${x}, ${y})`}>
      <text x={-13} y={2} dy={4} fill="#666">{date[0]}</text>
      {isWeb ? <text x={-21} y={6} dy={16} fill="#666">{date[1]}</text> : null}
    </g>
  )

  return null
}

@withI18n()
class DashboardSummeryBar extends PureComponent {
  state = {
    chartKey: 0,
    chartBars: {},
    chartData: [],
  };

  xAxisStyle = {
    color: '#000',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '0.03em',
    lineHeight: '19px'
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.list !== nextProps.list) {
      const {i18n} = this.props;
      const list = fnReportsGroupByStartDate(nextProps.list);

      const chartData = [];
      const chartBars = {};

      Object.keys(list).map(start_date => {
        if (list.hasOwnProperty(start_date)) {
          const reports = fnReportsGroupByProjectId(list[start_date]);
          let chartDataItem = {};
          chartDataItem = {
            name: `${moment(start_date).format('ddd')}\n${moment(start_date).format('MMM DD')}`,
            total: 0
          };
          let project_id = 0, project_name = i18n.t`No Project`, project_color = '#212121';

          Object.keys(reports).map(k => {
            if (reports.hasOwnProperty(k)) {
              const works = reports[k];
              const totalDuration = works.reduce((t, item) => t + item.duration, 0);

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
                chartDataItem.total += chartDataItem[project_name];
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
    const {i18n, dataSource, list, width, ...barProps} = this.props;
    const {chartData, chartKey, chartBars} = this.state;
    const isMobile = width > 540;

    if (chartData !== null && chartData.length > 0) {
      return (
        <ChartContainer minHeight={450} maxHeight={450}>
          <BarChart
            height={500}
            data={chartData}
            barSize={30}
            margin={{
              top: 20, right: 30, left: -40, bottom: 5,
            }}
            key={chartKey}
          >
            <CartesianGrid strokeDasharray="1 5"/>
            <XAxis xAxisId={'top'} axisLine={false}
                   style={this.xAxisStyle}
                   tickLine={false}
                   tickFormatter={tickItem => moment(fnDurationToHoursMinutesSeconds(tickItem)).format('HH:mm')}
                   dataKey="total" orientation="top"/>
            <XAxis axisLine={false} tickLine={false}
                   style={{...this.xAxisStyle}}
                   tick={(props) => <CustomizedTick {...props} isWeb={isMobile} />}
                   dataKey="name" orientation="bottom"/>
            <YAxis
              width={80}
              axisLine={false}
              tickLine={false}
              tick={{stroke: '#B3B3B3'}}
              tickFormatter={tickItem => fnDurationToHoursMinutesSeconds(tickItem).hours}
            />
            <Tooltip content={<CustomTooltip i18n={i18n}/>}/>
            {Object.keys(chartBars).map(key => {
              if (chartBars.hasOwnProperty(key)) {
                return (
                  <Bar dataKey={chartBars[key].name} stackId="a" fill={chartBars[key].color} key={key}/>
                )
              }
            })}
          </BarChart>
        </ChartContainer>
      )
    }
    return null;
  }
}

DashboardSummeryBar.propTypes = {
  location: PropTypes.object,
};

export default DashboardSummeryBar;
