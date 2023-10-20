import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {router, calculateUserRate} from 'utils';
import {connect} from 'dva';
import {Trans, withI18n} from '@lingui/react';
import {Page} from 'components';
import {stringify} from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import {Dropdown, Menu, Row} from 'antd';
import {TYPE} from "../../../utils/constant";
import styles from "./index.less";
import reportStyles from "../index.less";
import pageStyles from "../../../components/Page/Page.less";
import filterStyles from "../details/components/Filter.less";
import globalStyles from "themes/global.less";
import Icons from 'icons/icon';
import { ExportList } from "../components";
import {fnDurationToHoursMinutesSecondsText, getPercent} from "../../../utils";

@withI18n()
@connect(({reportsFinancial, loading}) => ({reportsFinancial, loading}))

class ReportsFinancial extends PureComponent {
  handleRefresh = newQuery => {
    const {location} = this.props;
    const {query, pathname} = location;
    query.page = 1;
    router.push({
      pathname,
      search: stringify(
        {
          ...query,
          ...newQuery,
        },
        {arrayFormat: 'repeat'}
      ),
    })
  };

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

  getDataSource = list => {
    let userType = null;
    let userSalary = 0;
    let userWorkedHours = 0;
    let userSalaryCoefficient = 2; //todo salary coefficient will be dynamic

    if (list) {
      if (!(list instanceof Array)) {
        if (Object.keys(list).length === 1) {
          list = [list[Object.keys(list)[0]]];
        }
      }

      if (list instanceof Array) {
        list.forEach(project => {
          const attachedUsers = project?.attached_users;
          if (attachedUsers) {
            let projectMembersTotalSalary = 0;
            let projectBudget = project.rate ? parseInt(project.rate) : 0;

            attachedUsers.forEach(attachedUser => {
              if (attachedUser?.salary) {
                userSalary = parseInt(attachedUser?.salary);
              }
              userType = attachedUser?.type;
              userWorkedHours = parseInt(attachedUser?.userWorkedSecondsForCurrentProject)/3600;
              const trueCost = userSalary*userSalaryCoefficient;
              let calculatedUserRateForHour = calculateUserRate(trueCost, userType);
              let userRateForHour = (userType === TYPE.HOURLY['value'])
                ? calculatedUserRateForHour['salaryForFullTime']
                : calculatedUserRateForHour;
              let userRateForWorkedHours = parseInt(userRateForHour)*userWorkedHours;
              attachedUser.userSalaryForCurrentProject = Math.round(userRateForWorkedHours);
              projectMembersTotalSalary += Math.round(userRateForWorkedHours);
            })
            project.spent = parseInt(projectMembersTotalSalary);
            project.profit = projectBudget - parseInt(projectMembersTotalSalary);
          }
          project.key = project.id;
        });
        return list;
      }
    }
    return [];
  };

  //Export PDF functionality
  getTableData = (data) => {
    const {i18n} = this.props;
    const columns = [
      {text: 'PROJECT NAME', style: 'tableHeader'},
      {text: 'MEMBERS', style: 'tableHeader'},
      {text: 'WORKED HOURS', style: 'tableHeader'},
      {text: 'REVENUE', style: 'tableHeader'},
      {text: 'COST', style: 'tableHeader'},
      {text: 'TOTAL PROFIT', style: 'tableHeader'}
    ];

    const colSpan = 6;
    const nestedLayout = {
      fillColor: function (rowIndex, node, columnIndex) {
        return (rowIndex === 0) ? '#f6f4fd' : '#fbfbfb';
      }
    };
    let table = {};
    let tableValues = [];
    if (data) {
      data.forEach((value, key) => {
        tableValues.push([
          value.name,
          value.membersCount,
          fnDurationToHoursMinutesSecondsText(value.workedHours, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
          value.rate ? value.rate + '$' : 0 + '$',
          value.spent ? value.spent + '$' : 0 + '$',
          value.profit ? value.profit + '$' : 0 + '$',
        ])
        if (value?.attached_users) {
          let childTableValues = [[
            {text: 'MEMBERS NAME', style: 'tableHeader', color: '#B3B3B3'},
            {text: 'WORKED HOURS', style: 'tableHeader', color: '#B3B3B3'},
            {text: 'PROFIT PER MEMBER', style: 'tableHeader', color: '#B3B3B3'}
          ]]

          value.attached_users.forEach((childData, childKey) => {
            let workedHours = fnDurationToHoursMinutesSecondsText(childData.userWorkedSecondsForCurrentProject, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
            let workedHoursPercent = getPercent(childData.userWorkedSecondsForCurrentProject, value.workedHours);
            let workedHoursForTable = workedHours + '/' + workedHoursPercent;

            childTableValues.push([
              childData.name ? childData.name : 'No Name',
              workedHoursForTable,
              childData.userSalaryForCurrentProject + '$/' + getPercent(childData.userSalaryForCurrentProject, value.spent)
            ])
          });
          tableValues.push([
            {
              colSpan,
              table: {
                widths: [270, 110, 135],
                body: [
                  ...childTableValues
                ]
              },
              layout: nestedLayout,
              style: 'tableExample'
            },
            '',
            '',
            '',
            '',
            '',
          ])
        }
      });

      table = {
        widths: [150, 65, 100, 60, 50, 90],
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
    const pageStyles = {
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
    exportDataList.pageStyles = pageStyles;
    exportDataList.defaultStyle = defaultStyle;
    exportDataList.pageMargins = [ 15, 15, 15, 15 ];

    return exportDataList;
  }

  handleExportPDF = () => {
    const {dispatch, location} = this.props;
    const {query} = location;

    dispatch({
      type: 'reportsFinancial/export',
      payload: {...query},
    }).then(response => {
      const reportData = this.getDataSource(response);

      if (reportData.length > 0) {
        let docDefinition = this.getExportDataList(reportData);
        let pdfMake = require('pdfmake/build/pdfmake.js');
        let pdfFonts = require('pdfmake/build/vfs_fonts.js');
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMake.createPdf(docDefinition).download('FinancialReport.pdf');
      }
    })
  };

  //Export EXCEL functionality
  handleExportEXCEL = () => {
    const {dispatch, location, i18n} = this.props;
    const {query} = location;

    dispatch({
      type: 'reportsFinancial/export',
      payload: {...query},
    }).then(response => {
      const reportData = this.getDataSource(response);
      const Excel = require('exceljs');
      if (reportData.length > 0) {
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('FinancialReport');

        worksheet.columns = [
          {width: 25}, {width: 15}, {width: 16}, {width: 15}, {width: 15}, {width: 15}
        ];

        let headerRow = worksheet.addRow([
          'PROJECT NAME',
          'MEMBERS',
          'WORKED HOURS',
          'REVENUE',
          'COST',
          'TOTAL PROFIT'
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
        reportData.forEach(item => {

          let row = worksheet.addRow([
            item.name,
            item.membersCount,
            fnDurationToHoursMinutesSecondsText(item.workedHours, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
            item.rate ? item.rate + '$' : 0 + '$',
            item.spent ? item.spent + '$' : 0 + '$',
            item.profit ? item.profit + '$' : 0 + '$',
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

          if (item.attached_users) {
            let nestedHeaderRow = worksheet.addRow([
              'MEMBERS NAME',
              'WORKED HOURS',
              'PROFIT PER MEMBER'
            ]);
            nestedHeaderRow.eachCell(function(cell) {
              cell.fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{argb:'F6F4FD'}
              };
              cell.alignment = {
                vertical: 'middle', horizontal: 'center'
              };
              cell.font = {
                name: 'Arial',
                family: 2,
                bold: true,
                size: 10,
                color:{argb:'B3B3B3'}
              };
            });
            nestedHeaderRow.outlineLevel = 1;
            item.attached_users.forEach((childData, childKey) => {
              let workedHours = fnDurationToHoursMinutesSecondsText(childData.userWorkedSecondsForCurrentProject, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
              let workedHoursPercent = getPercent(childData.userWorkedSecondsForCurrentProject, item.workedHours);
              let workedHoursForTable = workedHours + '/' + workedHoursPercent;

              let nestedRow =  worksheet.addRow([
                childData.name ? childData.name : 'No Name',
                workedHoursForTable,
                childData.userSalaryForCurrentProject + '$/' + getPercent(childData.userSalaryForCurrentProject, item.spent)
              ])
              nestedRow.eachCell(function(cell) {
                cell.fill = {
                  type: 'pattern',
                  pattern:'solid',
                  fgColor:{argb:'e6e6e6'}
                };
                cell.font = {
                  name: 'Arial',
                  family: 2,
                  bold: true,
                  size: 10,
                  color:{argb:'000'}
                };
              })
              nestedRow.outlineLevel = 1;
            });
          }
        });

        workbook.xlsx.writeBuffer().then(function(buffer) {
          const fileDownload = require('js-file-download');
          fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), 'FinancialReport.xlsx');
        });
      }
    })
  };

  get listProps() {
    const {reportsFinancial} = this.props;
    const {list, pagination} = reportsFinancial;

    return {
      pagination,
      dataSource: this.getDataSource(list),
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
        })
      }
    }
  }

  get filterProps() {
    const {location, reportsFinancial} = this.props;
    const {query} = location;
    const {projects} = reportsFinancial;

    return {
      filter: {
        ...query,
      },
      projects,
      onFilterChange: value => {
        if (value.date_range) {
          delete value.date_range;
        }
        this.handleRefresh({
          ...value,
        })
      }
    }
  }

  render() {

    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <Page.Head>
          <Row
            className={`${reportStyles['table-header']} ${globalStyles['flexRow']}`}
            type="flex"
            justify="space-between"
            align="middle"
          >
            <p className={`${globalStyles['tableTitle']}`}><Trans>Finance</Trans></p>
            <ExportList overlay={this.getExportListDropdownMenu} />
          </Row>
        </Page.Head>
        <div className={`${styles['reports-table']} ${globalStyles['table-align-left']} ${globalStyles['global-table']}`}>
          <List {...this.listProps} />
        </div>
      </Page>
    )
  }
}

ReportsFinancial.propTypes = {
  projects: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default ReportsFinancial
