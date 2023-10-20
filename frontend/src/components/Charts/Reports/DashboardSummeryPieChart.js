import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {withI18n} from '@lingui/react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip, Sector,
} from 'recharts';
import moment from "../../../utils/moment";
import {fnDurationPercent, fnDurationToHoursMinutesSeconds} from "../../../utils";

const CustomTooltip = ({active, payload, totalDuration, isWeb}) => {
  const tooltipStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0px 0px 9px rgba(71, 71, 71, 0.25)',
    borderRadius: '10px',
    padding: isWeb ? '16px' : '8px',
  };
  const textStyle = {
    fontSize: isWeb ? '14px' : '12px',
    fontWeight: 'bold',
    lineHeight: '19px',
    letterSpacing: '0.03em'
  };
  const radiusStyle = {
    width: isWeb ? '12px' : '8px',
    height: isWeb ? '12px' : '8px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '10px'
  };
  if (active && payload) {
    const {name, value, payload: {color}} = payload[0];

    const percent = (+fnDurationPercent(value, totalDuration)).toFixed(1);
    const timeFormat = fnDurationToHoursMinutesSeconds(value);
    for(const key in timeFormat) {
      if (timeFormat[key] <= 9) {
        timeFormat[key] = `0${timeFormat[key]}`
      }
    }

    const time = `${timeFormat.hours}:${timeFormat.minutes}:${timeFormat.seconds}`;

    return (
      <div className="custom-tooltip" style={tooltipStyle}>
        <p className="label" style={{...textStyle, padding: isWeb ?  '0 28px' : '0'}}>
          <span style={{...radiusStyle, background: color}}/>
          {`${name}`}
        </p>
        <p className="label" style={textStyle}>
          <span style={{color: '#000'}}>{time}</span>
          <span style={{marginLeft: '11px'}}>({percent}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props, i18n, totalHours, width) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, color
  } = props;
  const totalHoursStyle = {
    fontSize: '25px',
    fontWeight: 'bold',
    lineHeight: '33px',
    letterSpacing: '0.03em'
  };
  const totalTextStyle = {
    fontSize: '12px',
    fontWeight: 'bold',
    lineHeight: '16px',
    letterSpacing: '0.03'
  }

  return (
    <g>
      {width <= 540 ? <text x={cx} y={cy} dy={0} style={totalHoursStyle} textAnchor="middle" fill={'#000'}>{totalHours}</text> : null}
      {width <= 540 ? <text x={cx} y={cy} dy={16} style={totalTextStyle} textAnchor="middle" fill={'#B3B3B3'}>{i18n.t`Total Hours`}</text> : null}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={color}
      />
    </g>
  )
}


@withI18n()
class DashboardSummaryPieChart extends PureComponent {
  state = {
    chartKey: 0,
    chartData: [],
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.dataSource !== nextProps.dataSource) {
      const chartData = nextProps.dataSource.map(item => {
        return {
          name: item.title,
          value: item.duration,
          color: item.color,
        }
      });
      this.setState({
        chartKey: (this.state.chartKey + 1),
        chartData
      });
    }
  };

  render() {
    const {i18n, dataSource, totalDuration, totalHours, width, ...pieProps} = this.props;
    const {chartData, chartKey} = this.state;
    const isWeb = width > 540;

    return (
      <PieChart width={200} height={200} key={chartKey}>
        <Pie
          activeIndex={0}
          activeShape={(props) => renderActiveShape(props, i18n, totalHours, width)}
          data={chartData}
          cx="50%"
          cy="50%"
          startAngle={240}
          endAngle={600}
          innerRadius={70}
          outerRadius={80}
          paddingAngle={0}
          dataKey="value"
        >
          {
            chartData.map((entry, index) => <Cell fill={entry.color} key={index}/>)
          }
        </Pie>
        <Tooltip position={{x: isWeb ? 110 : 90, y: isWeb ? -85 : -60}} content={<CustomTooltip isWeb={isWeb} totalDuration={totalDuration} />}/>
      </PieChart>
    )
  }
}

DashboardSummaryPieChart.propTypes = {
  location: PropTypes.object,
};

export default DashboardSummaryPieChart;
