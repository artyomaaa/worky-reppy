import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import {fnDurationToHoursMinutesSecondsText} from 'utils';

import {
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import ChartContainer from '../ChartContainer';

const renderActiveShape = (props, i18n) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    payload, percent, color
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={color}>{i18n._(payload.name)}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={color}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={color}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={color} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={color} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${i18n._(payload.name)} ${fnDurationToHoursMinutesSecondsText(payload.value, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

@withI18n()
class SummaryPieChart extends PureComponent {
  state = {
    chartKey: 0,
    chartData: [],
    activeIndex: 0,
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
  onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index,
    });
  };
  render() {
    const { i18n, dataSource, ...pieProps } = this.props;
    const {chartData, chartKey} = this.state;

    return (
      <ChartContainer>
        <PieChart width={730} height={250} key={chartKey}>
          <Pie
            activeIndex={this.state.activeIndex}
            activeShape={(props) => renderActiveShape(props, i18n)}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={this.onPieEnter}
          >
          {
            chartData.map((entry, index) => <Cell fill={entry.color} key={index}/>)
          }
          </Pie>
        </PieChart>
      </ChartContainer>
    )
  }
}

SummaryPieChart.propTypes = {
  location: PropTypes.object,
};

export default SummaryPieChart;
