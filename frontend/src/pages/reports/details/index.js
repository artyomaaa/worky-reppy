import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { router } from 'utils';
import { connect } from 'dva';
import {Trans, withI18n} from '@lingui/react';
import { Page } from 'components';
import { stringify } from 'qs';
import ExportList from "../components/ExportList";
import List from './components/List';
import Filter from './components/Filter';
import globalStyles from "themes/global.less";
import stylesFilter from "./components/Filter.less";
import Icons from 'icons/icon';
import { fnDurationToHoursMinutesSecondsForReports, calculateUserRate, calculateProjectRate, fnEndTimeText } from 'utils';
import moment from 'utils/moment';
import {
  Row,
  Col,
  Dropdown,
  Button,
  Menu
} from 'antd';
import {fnDurationToHoursMinutesSecondsText} from "../../../utils";
import styles from "../../../components/Page/Page.less";
import store from "store";

@withI18n()
@connect(({ reportsDetails, loading }) => ({ reportsDetails, loading }))

class ReportsDetails extends PureComponent {
  handleRefresh = newQuery => {
    const { location } = this.props;
    const { query, pathname } = location;

    router.push({
      pathname,
      search: stringify(
        {
          ...query,
          ...newQuery,
        },
        { arrayFormat: 'repeat' }
      ),
    })
  };

  //Export PDF functionality
  getTableData = (data) => {
    const {i18n} = this.props;
    const user = store.get('user');
    const userTimeOffset = user.time_offset;
    const timeFormat = 'HH:mm';
    const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    const dateFormat = 'YYYY-MM-DD';
    const columns = [
      {text: 'WORK NAME', style: 'tableHeader'},
      {text: 'PROJECT NAME', style: 'tableHeader'},
      {text: 'USER NAME', style: 'tableHeader'},
      {text: 'DURATION', style: 'tableHeader'},
      {text: 'TIME', style: 'tableHeader'},
      {text: 'USER\'S HOURLY SALARY', style: 'tableHeader'},
      {text: 'PROJECT\'S HOURLY SALARY', style: 'tableHeader'},
    ];

    let table = {};
    let tableValues = [];
    if (data) {
      data.forEach((value, key) => {
        let endDateTime = value.end_date_time ? moment.parseZone(value.end_date_time).utcOffset(userTimeOffset).format(dbDateTimeFormat) : null;
        let endTimeText = fnEndTimeText(moment.parseZone(value.start_date_time).utcOffset(userTimeOffset).format(dbDateTimeFormat), endDateTime, i18n.t`in process`);
        let startDateTime = moment.parseZone(value.start_date_time).utcOffset(userTimeOffset).format(timeFormat);
        let date = moment.parseZone(value.start_date_time).utcOffset(userTimeOffset).format(dateFormat);
        let userHourlySalary = value.user_salary && value.end_date_time ?
          moment(value.end_date_time).diff(moment(value.start_date_time), 'hours') * this.calculateUserRateByType(value.user_salary, value.work_user_type) :
          moment(Date()).diff(moment(value.start_date_time), 'hours') * this.calculateUserRateByType(value.user_salary, value.work_user_type);
        let projectHourlySalary = value.project_rate && value.end_date_time ?
          moment(value.end_date_time).diff(moment(value.start_date_time), 'hours') * value.project_rate :
          moment(Date()).diff(moment(value.start_date_time), 'hours') * value.project_rate;
        tableValues.push([
          value.work_name,
          value.project_name,
          value.member_full_name,
          fnDurationToHoursMinutesSecondsText(value.duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
          startDateTime + ' - ' + endTimeText + ', ' + date,
          userHourlySalary,
          projectHourlySalary
        ])
      });

      table = {
        widths: [90, 90, 80, 75, 75, 55, 55],
        body: [
          columns,
          ...tableValues
        ],
        headerRows: 1
      }
    }
    return table;
  }

  getExportDataList = (dataSource) => {
    let exportDataList = {};
    const style = 'tableExample';
    const layout = {
      fillColor: function (rowIndex, node, columnIndex) {
        return (rowIndex % 2 === 0) && (rowIndex !== 0) ? '#f4f4f4' : (rowIndex === 0) ? '#353FDF' : null;
      }
    }
    const defaultStyle = {};
    const styles = {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
        color: '#4b4545'
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: '#fff'
      }
    };

    exportDataList.content = [{table: this.getTableData(dataSource), layout, style}];
    exportDataList.styles = styles;
    exportDataList.pageMargins = [5, 5, 5, 5];
    exportDataList.defaultStyle = defaultStyle;

    return exportDataList;
  }

  calculateUserRateByType = (salary, type) => {
    return type === 2 ? salary : calculateUserRate(salary, type);
  };

  handleExportPDF = () => {
    const {dispatch, location} = this.props;
    const {query} = location;

    dispatch({
      type: 'reportsDetails/export',
      payload: {...query},
    }).then(response => {
      if (response.length > 0) {
        let docDefinition = this.getExportDataList(response);
        let pdfMake = require('pdfmake/build/pdfmake.js');
        let pdfFonts = require('pdfmake/build/vfs_fonts.js');
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMake.createPdf(docDefinition).download('DetailsReport.pdf');
      }
    })
  };

  //Export EXCEL functionality
  handleExportEXCEL = () => {
    const {dispatch, location, i18n} = this.props;
    const {query} = location;
    const user = store.get('user');
    const userTimeOffset = user.time_offset;
    const timeFormat = 'HH:mm';
    const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    const dateFormat = 'YYYY-MM-DD';
    dispatch({
      type: 'reportsDetails/export',
      payload: {...query},
    }).then(response => {
      const Excel = require('exceljs');
      if (response.length > 0) {
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('SummaryReport');

        worksheet.columns = [
          {width: 25}, {width: 25}, {width: 18}, {width: 15}, {width: 20}, {width: 10}, {width: 10}
        ];

        let headerRow = worksheet.addRow([
          'WORK NAME',
          'PROJECT NAME',
          'USER NAME',
          'DURATION',
          'TIME',
          'USER\'S HOURLY SALARY',
          'PROJECT\'S HOURLY SALARY'
        ]);
        headerRow.eachCell(function(cell) {
          cell.fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'fff'},
            bgColor:{argb:'353FDF'}
          };
          cell.alignment = {
            vertical: 'middle', horizontal: 'center'
          };
          cell.font = {
            name: 'Arial',
            family: 2,
            bold: true,
            size: 11
          };
        })
        response.forEach(value => {
          let endDateTime = value.end_date_time ? moment.parseZone(value.end_date_time).utcOffset(userTimeOffset).format(dbDateTimeFormat) : null;
          let endTimeText = fnEndTimeText(moment.parseZone(value.start_date_time).utcOffset(userTimeOffset).format(dbDateTimeFormat), endDateTime, i18n.t`in process`);
          let startDateTime = moment.parseZone(value.start_date_time).utcOffset(userTimeOffset).format(timeFormat);
          let date = moment.parseZone(value.start_date_time).utcOffset(userTimeOffset).format(dateFormat);
          let userHourlySalary = value.user_salary && value.end_date_time ?
            moment(value.end_date_time).diff(moment(value.start_date_time), 'hours') * this.calculateUserRateByType(value.user_salary, value.work_user_type) :
            moment(Date()).diff(moment(value.start_date_time), 'hours') * this.calculateUserRateByType(value.user_salary, value.work_user_type);
          let projectHourlySalary = value.project_rate && value.end_date_time ?
            moment(value.end_date_time).diff(moment(value.start_date_time), 'hours') * value.project_rate :
            moment(Date()).diff(moment(value.start_date_time), 'hours') * value.project_rate;
          let row = worksheet.addRow([
            value.work_name,
            value.project_name,
            value.member_full_name,
            fnDurationToHoursMinutesSecondsText(value.duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
            startDateTime + ' - ' + endTimeText + ', ' + date,
            userHourlySalary,
            projectHourlySalary
          ]);
          row.eachCell(function(cell) {
            cell.alignment = {
              vertical: 'middle', horizontal: 'left'
            };
            cell.font = {
              name: 'Arial',
              family: 2,
              bold: true,
              size: 10
            };
          });
        });

        workbook.xlsx.writeBuffer().then(function(buffer) {
          const fileDownload = require('js-file-download');
          fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), 'DetailsReport.xlsx');
        });
      }
    })
  };

  get listProps() {
    const { dispatch, reportsDetails, loading } = this.props;
    const { list, pagination } = reportsDetails;

    return {
      dataSource: list,
      loading: loading.effects['reports/details/query'],
      pagination,
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
        })
      }
    }
  }

  getExportListDropdownMenu = () => {
    const {i18n} = this.props;
    return (
      <Menu>
        <Menu.Item onClick={this.handleExportPDF}>
          {i18n.t`PDF`}
        </Menu.Item>
        <Menu.Item onClick={this.handleExportEXCEL}>
          {i18n.t`Excel`}
        </Menu.Item>
      </Menu>
    );
  }

  get filterProps() {

    const { location, reportsDetails } = this.props;
    const { query } = location;
    const {users, teams, projects} = reportsDetails;

    return {
      filter: {
        ...query,
      },
      users,
      teams,
      projects,
      onFilterChange: value => {
        if (value.date_range){
          delete value.date_range;
        }
        this.handleRefresh({
          ...value,
          page: 1
        })
      }
    }
  }
  calculateUserRateByType = (salary, type) => {
    return type === 2 ? salary : calculateUserRate(salary, type);
  };
  getTeamById = (id) => {
    return this.filterProps.teams.find(unfilteredTeam => {
      if(unfilteredTeam.id === +id){
        return unfilteredTeam;
      }
    })
  }
  countTeamUsersTotal(teamUsersData){
    let salary = 0;
    teamUsersData.map((teamUser) => {
      if (teamUser.user_salary) {
        salary += (teamUser.end_date_time ?
          moment(teamUser.end_date_time).diff(moment(teamUser.start_date_time), 'hours') * this.calculateUserRateByType(teamUser.user_salary, teamUser.user_type) :
          moment(Date()).diff(moment(teamUser.start_date_time), 'hours') * this.calculateUserRateByType(teamUser.user_salary, teamUser.user_type))
      }
    })
    return salary
  }

  render() {
    const { i18n, reportsDetails } = this.props;
    const {totalDuration, teamUsersData, projectsTotalDuration} = reportsDetails;


    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <Page.Head>
          {
            teamUsersData && Object.keys(teamUsersData).length && this.filterProps.filter.teams ?
              <Row
                type="flex"
                justify="space-between"
                align="middle"
                style={{padding: '35px'}}
              >
                <p className={`${globalStyles['reportsDetailsTitle']}`}>{i18n.t`Team total hourly salary`}</p>
                {
                  Array.isArray(this.filterProps.filter.teams) ?
                    this.filterProps.filter.teams.map((team) => {
                      return <p style={{fontSize: 14}} key={team}>
                        <b>{this.getTeamById(team).name} </b>
                        {teamUsersData.hasOwnProperty(team) && this.countTeamUsersTotal(teamUsersData[team])}
                      </p>
                    }) :
                    <p style={{fontSize: 14}}>
                      <b>{this.getTeamById(this.filterProps.filter.teams).name} </b>
                      {teamUsersData.hasOwnProperty(this.filterProps.filter.teams) && this.countTeamUsersTotal(teamUsersData[this.filterProps.filter.teams]).toFixed(2)}
                    </p>
                }
              </Row> : ''
          }
          {
            projectsTotalDuration && Object.keys(projectsTotalDuration).length ?
              <Row
                type="flex"
                justify="space-between"
                align="middle"
                className={stylesFilter['total-salary-row']}
              >
                <p className={`${globalStyles['reportsDetailsTitle']}`}>{i18n.t`Project total salary`}</p>
                {
                  projectsTotalDuration.map(item => {
                    let calculatedProjectRate = calculateProjectRate(item.project_rate, item.project_type, item.total_duration);
                    return calculatedProjectRate ?
                      <p style={{fontSize: 14}} key={item.project_id}>
                        <b>{item.project_name} </b>
                        { calculatedProjectRate }
                      </p> : ''
                  })
                }
              </Row>: ''
          }
          <Row
            type="flex"
            justify="space-between"
            align="middle"
            className={stylesFilter['total-hour-row']}
          >
            <p className={`${globalStyles['reportsDetailsTitle']}`} style={{textTransform: 'uppercase'}}>
              {i18n.t`Total hours`}
              <span className={`${globalStyles['reportsDetailsDuration']}`}>{totalDuration ? fnDurationToHoursMinutesSecondsForReports(totalDuration) : 0}</span>
            </p>
            <ExportList overlay={this.getExportListDropdownMenu} />
          </Row>
        </Page.Head>
        <div className={`${globalStyles['table-align-left']} ${globalStyles['global-table']}`}>
          <List {...this.listProps} />
        </div>
      </Page>
    )
  }
}

ReportsDetails.propTypes = {
  projects: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default ReportsDetails
