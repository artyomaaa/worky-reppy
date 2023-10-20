import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import {Row, Col, Form, message} from 'antd'
import { Page } from 'components'
import {getDateRanges} from 'utils';
import styles from './index.less'
import store from 'store'
import WeeklyActivity from './components/WeeklyActivity'
import {withI18n} from "@lingui/react";
import moment from 'utils/moment';
import {START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT} from 'utils/constant';
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import StatisticsSummeryBar from "./components/StatisticsSummeryBar";
import StatisticsSummeryPieChart from "./components/StatisticsSummeryPieChart";
import DashboardDatePicker from "./components/DashboardDatePicker";
import UserProjects from "./components/UserProjects";

const DATE_RANGES = getDateRanges(true);
const DATE_RANGE_TITLE = 'This week';

@withI18n()
@Form.create()
@connect(({dashboard, loading}) => ({
  dashboard,
  loading,
}))
class Dashboard extends Component {
  constructor(props) {
    super(props);
    const {i18n} = props;
    const user = store.get('user');
    const userTimeOffset = user.time_offset ?? 0;

    this.initialState = {
      dates: {
        start_date_time: moment().utcOffset(userTimeOffset).startOf('isoWeek').format(START_DATE_TIME_FORMAT),
        end_date_time: moment().utcOffset(userTimeOffset).endOf('isoWeek').format(END_DATE_TIME_FORMAT)
      },
      switcherTeam: false,
      switcherPerson: false,
      showDefaultDates: true,
      userTimeOffset: userTimeOffset,
    };
    // preserve the initial state in a new object
    this.state = {
      ...this.initialState,
      dateRangeTitle: i18n._(DATE_RANGE_TITLE),
      date: {
        date_range: [moment().utcOffset(userTimeOffset).startOf('isoWeek'), moment().utcOffset(userTimeOffset).endOf('isoWeek')],
        start_date_time: moment().utcOffset(userTimeOffset).startOf('isoWeek').format(START_DATE_TIME_FORMAT),
        end_date_time: moment().utcOffset(userTimeOffset).endOf('isoWeek').format(END_DATE_TIME_FORMAT)
      },
      projectIds: [],
      width: 0
    };
    this.handleSendRequest = this.handleSendRequest.bind(this);
  }
  componentDidMount() {
    const {location, history, i18n} = this.props;
    const {code, scope} = location.query;
    if (code && scope) {
      const user = store.get('user');
      const userId = store.get('gcuId') || user?.id;
      const calendarUrl = user?.id?.toString() === userId?.toString() ? `calendar` : `calendar?userId=${userId}`;
      history.push(calendarUrl);
      message.success(i18n._('Google calendar connected'))
    }
    window.addEventListener("resize", this.updateScreenSize);
    this.updateScreenSize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreenSize);
  }

  updateScreenSize = () => {
    this.setState({
      width: window.innerWidth
    });
  };


  handleSendRequest = fields => {
    const {dispatch} = this.props;
    dispatch({
      type: `dashboard/query`,
      payload: fields,
    });
  };

  get barChartProps() {
    const {width} = this.state;
    const {dashboard, loading, form} = this.props;
    const {reportsForBarChart} = dashboard;
    return {
      form,
      width,
      list: reportsForBarChart,
      dataSource: reportsForBarChart,
      projects: this.userAttachedProjects,
      handleChangeProjects: this.handleChangeProjects,
      onChangeProjectsFilter: this.onChangeProjectsFilter,
      loading: loading.effects['dashboard/query'],
      projectIds: this.state.projectIds
    }
  }

  get pieChartProps() {
    const {width} = this.state;
    const {i18n, dashboard, loading} = this.props;
    const {reportsGroupByProjects, totalDuration} = dashboard;

    return {
      i18n,
      width,
      totalDuration,
      dataSource: reportsGroupByProjects,
      loading: loading.effects['dashboard/query']
    }
  }

  get datePickerProps() {
    const {form, i18n} = this.props;
    const { date: { date_range } } = this.state;
    const {getFieldDecorator} = form;
    let lang = i18n.language === 'en' ? en_GB : hy_AM;

    return {
      i18n,
      lang,
      getFieldDecorator,
      date_range,
      onChangeDateRangeFilter: this.onChangeDateRangeFilter
    }
  }

  get userProjectsProps() {
    const {i18n, form} = this.props;

    return {
      form,
      i18n,
      projectIds: this.state.projectIds,
      projects: this.userAttachedProjects,
      handleChangeProjects: this.handleChangeProjects,
      onChangeProjectsFilter: this.onChangeProjectsFilter,
    }
  }

  get dataWeek() {
    const { dashboard, loading } = this.props;
    const { weeklyActivities } = dashboard;

    return {
      weeklyActivities,
      loading: loading.effects['dashboard/query']
    }
  }

  get userAttachedProjects() {
    const {dashboard} = this.props;
    const { userAttachedProjects } = dashboard;

    return userAttachedProjects;

  }

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

    const date = {
      date_range: [startDateTime, endDateTime],
      start_date_time: moment(startDateTime).format(START_DATE_TIME_FORMAT),
      end_date_time: moment(endDateTime).format(END_DATE_TIME_FORMAT)
    }

    this.setState(() => {
      return {
        dateRangeTitle: dateRangeTitle,
        date: date
      }
    });
    this.handleSendRequest(date);
  };

  onChangeProjectsFilter = (ids = null) => {
    const {date, projectIds} = this.state;
    this.handleSendRequest({...date, projectIds: ids ?? projectIds});
  }

  handleChangeProjects = (projectIds) => {
    this.setState({projectIds});
  }

  render() {
    const {loading} = this.props;

    return (
      <Page
        loading={loading.models.dashboard}
        className={styles.dashboard}
      >
        <WeeklyActivity {...this.dataWeek} />
        <Row className={styles["row-padding"]}>
          <Col xl={{span: 24}} sm={{span: 24}}>
            <DashboardDatePicker {...this.datePickerProps} />
            <UserProjects {...this.userProjectsProps} />
          </Col>
          <Col xl={{span: 24}} sm={{span: 24}}>
            <StatisticsSummeryBar {...this.barChartProps} />
            <StatisticsSummeryPieChart {...this.pieChartProps}/>
          </Col>
        </Row>
      </Page>
    );
  }
}

Dashboard.propTypes = {
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
  dashboard: PropTypes.object,
};

export default Dashboard
