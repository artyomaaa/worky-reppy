import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { router } from 'utils';
import { connect } from 'dva';
import { withI18n } from '@lingui/react';
import { Page, SummaryPieChart, SummaryBarChart } from 'components';
import { stringify } from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import {fnDurationToHoursMinutesSecondsForReports, fnGetSumOfAllDurations} from 'utils';
import {
  Row,
  Col,
} from 'antd';
import {fnDurationToHoursMinutesSecondsText} from "../../../utils";
import styles from "./index.less";
import {ChartContainer} from "../../../components/Charts";
import {DashboardSummaryPieChart} from "../../../components/Charts";

@withI18n()
@connect(({ reportsSummary, loading }) => ({ reportsSummary, loading }))

class ReportsSummary extends PureComponent {
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

  getDataSource = list => {
    if (list) {
      if (!(list instanceof Array)) {
        if (Object.keys(list).length === 1) {
          return [list[Object.keys(list)[0]]];
        }
      }
      return list;
    }
    return [];
  };

  //Export PDF functionality
  getTableData = (data) => {
    const {i18n} = this.props;
    const columns = [
      {text: 'PROJECT NAME', style: 'tableHeader'},
      {text: 'WORKED HOURS', style: 'tableHeader'}
    ];

    const colSpan = 2;
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
          fnDurationToHoursMinutesSecondsText(value.workedHours, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)
        ])
        if (value?.projectTasks) {
          let childTableValues = [[
            {text: 'TASK NAME', style: 'tableHeader', color: '#B3B3B3'},
            {text: 'MEMBER NAME', style: 'tableHeader', color: '#B3B3B3'},
            {text: 'WORKED HOURS', style: 'tableHeader', color: '#B3B3B3'}
          ]]

          value.projectTasks.forEach((childData, childKey) => {
            let workedHours = fnDurationToHoursMinutesSecondsText(childData.userWorkedSecondsForCurrentWork, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);

            childTableValues.push([
              childData.workName ? childData.workName : 'No Name',
              childData.userName ? childData.userName : 'No Name',
              workedHours
            ])
          });
          tableValues.push([
            {
              colSpan,
              table: {
                widths: [200, 180, 100],
                body: [
                  ...childTableValues
                ]
              },
              layout: nestedLayout,
              style: 'tableExample'
            },
            ''
          ])
        }
      });

      table = {
        widths: [400, 100],
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
    exportDataList.defaultStyle = defaultStyle;

    return exportDataList;
  }

  handleExportPDF = () => {
    const {dispatch, location} = this.props;
    const {query} = location;

    dispatch({
      type: 'reportsSummary/export',
      payload: {...query},
    }).then(response => {
      const reportData = this.getDataSource(response);
      if (reportData.length > 0) {
        let docDefinition = this.getExportDataList(reportData);
        let pdfMake = require('pdfmake/build/pdfmake.js');
        let pdfFonts = require('pdfmake/build/vfs_fonts.js');
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMake.createPdf(docDefinition).download('SummaryReport.pdf');
      }
    })
  };

  //Export EXCEL functionality
  handleExportEXCEL = () => {
    const {dispatch, location, i18n} = this.props;
    const {query} = location;

    dispatch({
      type: 'reportsSummary/export',
      payload: {...query},
    }).then(response => {
      const reportData = this.getDataSource(response);
      const Excel = require('exceljs');
      if (reportData.length > 0) {
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('SummaryReport');

        worksheet.columns = [
          {width: 40}, {width: 25}, {width: 18}
        ];

        let headerRow = worksheet.addRow([
          'PROJECT NAME',
          'WORKED HOURS',
          ''
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
            fnDurationToHoursMinutesSecondsText(item.workedHours, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
            ''
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

          if (item.projectTasks) {
            let nestedHeaderRow = worksheet.addRow([
              'TASK NAME',
              'MEMBER NAME',
              'WORKED HOURS'
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
            item.projectTasks.forEach((childData, childKey) => {
              let workedHours = fnDurationToHoursMinutesSecondsText(childData.userWorkedSecondsForCurrentWork, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);

              let nestedRow =  worksheet.addRow([
                childData.workName ? childData.workName : 'No Name',
                childData.userName ? childData.userName : 'No Name',
                workedHours
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
          fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), 'SummaryReport.xlsx');
        });
      }
    })
  };

  get listProps() {
    const { dispatch, reportsSummary, loading, location } = this.props;
    const { reportsGroupByProjects } = reportsSummary;
    const { query } = location;

    return {
      dataSource: reportsGroupByProjects,
      loading: loading.effects['reports/summary/query'],
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
        })
      },
      onOpenProjectRow: project_id => {
        dispatch({ type: 'reportsSummary/projectWorkList', payload: {
            ...query,
            project_id: project_id,
        }});
      }
    }
  }

  get barChartProps() {
    const { reportsSummary, loading } = this.props;
    const { reportsGroupByProjects, reportsForBarChart } = reportsSummary;

    return {
      list: reportsForBarChart,
      dataSource: reportsGroupByProjects,
      loading: loading.effects['reports/summary/query']
    }
  }

  get totalClockedTime() {
    const {reportsSummary} = this.props;
    const {reportsGroupByProjects} = reportsSummary;
    if(reportsGroupByProjects){
      const sum =  reportsGroupByProjects.reduce((total, obj) => obj.duration + total, 0);
      return fnDurationToHoursMinutesSecondsForReports(sum);
    }
  }

  get pieChartProps() {
    const { reportsSummary, loading } = this.props;
    const { reportsGroupByProjects } = reportsSummary;
    const totalDuration = fnGetSumOfAllDurations(reportsGroupByProjects);

    return {
      dataSource: reportsGroupByProjects,
      totalDuration,
      loading: loading.effects['reports/summary/query']
    }
  }

  get filterProps() {

    const { location, reportsSummary } = this.props;
    const { query } = location;
    const {users, teams, projects} = reportsSummary;

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
        })
      },
      handleExportPDF: this.handleExportPDF,
      handleExportEXCEL: this.handleExportEXCEL
    }
  }

  render() {
    const { i18n } = this.props;
    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <SummaryBarChart {...this.barChartProps} />
        <Row style={{ marginTop: 24 }}>
          <Col xl={{ span: 12 }}  md={{ span: 12 }} sm={{ span: 12 }}>
            <List {...this.listProps} />
          </Col>
          <Col className={styles['chart-wrapper']} xl={{span: 12}} md={{span: 12}} sm={{span: 12}}>
            <Col style={{fontSize: 18}}>{i18n.t`CLOCKED HOURS`}</Col>
            <Col style={{fontSize: 24}}>{this.totalClockedTime}</Col>
            <ChartContainer>
              <DashboardSummaryPieChart {...this.pieChartProps} totalHours={this.totalClockedTime} />
            </ChartContainer>
          </Col>
        </Row>
      </Page>
    )
  }
}

ReportsSummary.propTypes = {
  projects: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default ReportsSummary
