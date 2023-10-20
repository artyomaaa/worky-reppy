import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {router} from 'utils';
import {connect} from 'dva';
import {Trans, withI18n} from '@lingui/react';
import {Page} from 'components';
import {stringify} from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import {Dropdown, Menu, Row} from 'antd';
import { ExportList } from "../components";
import globalStyles from "themes/global.less";
import Icons from 'icons/icon';
import styles from "../../../components/Page/Page.less";
import reportStyles from "../index.less";
import {fnDurationToHoursMinutesSecondsText, getPercent, getUserFullName} from "utils";
import {uniqBy} from 'lodash';

@withI18n()
@connect(({UserReport, loading}) => ({UserReport, loading}))

class UserReport extends PureComponent {

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

  getDataSource = (groupedProjects, totalCountofProject, list) => {
    let dataSource = [];
    if (groupedProjects) {
      let totalProjectCount;
      let totalDuration = [];
      let groupedData = [];
      Object.values(list).forEach(record => {
        let sumOfDuration = {};
        if (record instanceof Array) {
          record.forEach((item) => {
            if (sumOfDuration[item.work_user_id])
              sumOfDuration[item.work_user_id] += parseFloat(item.duration);
            else
              sumOfDuration[item.work_user_id] = parseFloat(item.duration);
          });
        }

        totalDuration.push(sumOfDuration)

        record.forEach(
          item => {
            if (!groupedData[item.work_user_id]) {
              groupedData[item.work_user_id] = [];
            }
            groupedData[item.work_user_id].push(item);

            if (groupedData.hasOwnProperty(item.project_name + '' + item.work_user_id)) {
              groupedData[item.project_name + '' + item.work_user_id] = groupedData[item.project_name + '' + item.work_user_id] + item.duration;
            } else {
              groupedData[item.project_name + '' + item.work_user_id] = item.duration;
            }
          }
        );

      })

      Object.values(groupedProjects).map(function (userData, key) {
        Object.keys(totalCountofProject).map(function (userId, key) {
          if (userId == userData.id) {
            totalProjectCount = totalCountofProject[userId];
          }
        })
        let _totalDuration = 0
        for (const element of totalDuration) {
          if (element[userData.id]) {
            _totalDuration = element[userData.id];
          }
        }

        uniqueData = uniqBy(groupedData[userData.id], 'project_name');

        dataSource.push({
          name: getUserFullName(userData),
          project_count: totalProjectCount,
          project_id: userData.project_id,
          status: userData.status,
          totalDuration: _totalDuration,
          childRowData: uniqueData && uniqueData.map(it => {
            return {
              project: it.project_name,
              duration: groupedData[it.project_name + '' + userData.id]
            }
          })
        })
      })
      let uniqueData = {};
      for (let i = 0, len = dataSource.length; i < len; i++) {
        uniqueData[dataSource[i]['name']] = dataSource[i];
      }
      let _dataSource = [];
      for (let key in uniqueData) {
        _dataSource.push(uniqueData[key]);
      }
      return (_dataSource)
    }
  }

  getTableData = (data) => {
    const {i18n} = this.props;
    const columns = [
      {text: 'MEMBER NAME', style: 'tableHeader'},
      {text: 'PROJECT', style: 'tableHeader'},
      {text: 'TIME', style: 'tableHeader'},
      {text: 'STATUS', style: 'tableHeader'},
    ];

    const colSpan = 4;
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
          value.project_count,
          fnDurationToHoursMinutesSecondsText(value.totalDuration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
          value.status === 1 ? 'active' : 'inactive'
        ])
        if (value?.childRowData) {
          let childTableValues = [[
            {text: 'PROJECT NAME', style: 'tableHeader', color: '#B3B3B3'},
            {text: 'TIME', style: 'tableHeader', color: '#B3B3B3'},
            {text: 'PERCENT', style: 'tableHeader', color: '#B3B3B3'}
          ]]

          value.childRowData.forEach((childData, childKey) => {
            childTableValues.push([
              childData.project ? childData.project : 'No Project',
              fnDurationToHoursMinutesSecondsText(childData.duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
              getPercent(childData.duration, value.totalDuration),
            ])
          });
          tableValues.push([
            {
              colSpan,
              table: {
                body: [
                  ...childTableValues
                ]
              },
              layout: nestedLayout,
              style: 'tableExample'
            },
            '',
            '',
            ''
          ])
        }
      });

      table = {
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

  handleExportPDF = () => {
    const {UserReport} = this.props;
    const {groupedProjects, totalCountofProject, list} = UserReport
    const reportData = this.getDataSource(groupedProjects, totalCountofProject, list);

    if (reportData.length > 0) {
      let docDefinition = this.getExportDataList(reportData);
      let pdfMake = require('pdfmake/build/pdfmake.js');
      let pdfFonts = require('pdfmake/build/vfs_fonts.js');
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      pdfMake.createPdf(docDefinition).download('ReportPerUser.pdf');
    }
  };

  handleExportEXCEL = () => {
    const {i18n, UserReport} = this.props;
    const Excel = require('exceljs');

    const {groupedProjects, totalCountofProject, list} = UserReport
    const reportData = this.getDataSource(groupedProjects, totalCountofProject, list);

    if (reportData.length > 0) {
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet('ReportPerUser');

      worksheet.columns = [
        { width: 25 }, { width: 15 }, { width: 10 }, { width: 10 }
      ];

      let headerRow = worksheet.addRow([
        'MEMBER NAME',
        'PROJECT',
        'TIME',
        'STATUS'
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
        let status = item.status === 1 ? 'active' : 'inactive';
        let row = worksheet.addRow([
          item.name,
          fnDurationToHoursMinutesSecondsText(item.totalDuration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
          item.project_count,
          status
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
        if (item.childRowData) {
          let nestedHeaderRow = worksheet.addRow([
            'PROJECT NAME',
            'TIME',
            'PERCENT'
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
          item.childRowData.forEach((childData, childKey) => {
          let nestedRow =  worksheet.addRow([
              childData.project ? childData.project : 'No Project',
              fnDurationToHoursMinutesSecondsText(childData.duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
              getPercent(childData.duration, item.totalDuration)
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
        fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), 'ReportPerUser.xlsx');
      });
    }
  };

  get listProps() {
    const {UserReport} = this.props;
    const {list, groupedProjects, totalCountofProject, pagination} = UserReport;
    return {
      pagination,
      dataSource: this.getDataSource(groupedProjects, totalCountofProject, list),
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
        })
      }
    }
  }

  get filterProps() {
    const {location, UserReport} = this.props;
    const {query} = location;
    const {projects, users} = UserReport;
    return {
      filter: {
        ...query,
      },
      projects,
      users,
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
            <p className={`${globalStyles['tableTitle']}`}><Trans>Users</Trans></p>
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

UserReport.propTypes = {
  projects: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default UserReport
