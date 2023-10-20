import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {router} from 'utils';
import {connect} from 'dva';
import {Trans, withI18n} from '@lingui/react';
import {Page} from 'components';
import {ExportList} from "../components";
import {stringify} from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import {Dropdown, Menu, Row} from 'antd';
import globalStyles from "themes/global.less";
import reportsStyles from "../index.less";
import Icons from 'icons/icon';
import styles from 'components/Page/Page.less';
import {fnDurationHoursMinutes, getUserFullName, fnConvertSecondsAsHours} from 'utils';
import reportStyles from "../index.less";

@withI18n()
@connect(({projectTimeReport, loading}) => ({projectTimeReport, loading}))

class ProjectTimeReport extends PureComponent {

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


  getTableData = (data) => {
    const {i18n} = this.props;
    const columns = [
      {text: 'USER ID', style: 'tableHeader'},
      {text: 'NAME', style: 'tableHeader'},
      {text: 'PROJECT ID', style: 'tableHeader'},
      {text: 'PROJECT', style: 'tableHeader'},
      {text: 'WORKED TIME (H)', style: 'tableHeader'},
      {text: 'REPORTED TIME (H)', style: 'tableHeader'},
    ];

    let table = {};
    let tableValues = [];
    if (data) {
      for (let i = 0; i < data.length; i++){
        tableValues.push([
          data[i].work_user_id,
          getUserFullName({name: data[i].user_name, surname: data[i].user_surname}).trim(),
          data[i].project_id,
          data[i].project_name ? data[i].project_name : i18n.t`No Project`,
          data[i].worked_time ? fnConvertSecondsAsHours(data[i].worked_time).toFixed(2) : null,
          data[i].reported_time ? fnConvertSecondsAsHours(data[i].reported_time).toFixed(2) : null,
        ]);
      }
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
    const {dispatch} = this.props;
    dispatch({
      type: 'projectTimeReport/getExportData',
      payload: {}
    })
      .then(res => {
        const {reports, startDateTime, endDateTime} = res;
        if (reports.length > 0) {
          const fileName = startDateTime !== endDateTime
            ? `ProjectTimeReport from ${startDateTime} to ${endDateTime}`
            : `ProjectTimeReport for ${startDateTime}`;

          let docDefinition = this.getExportDataList(reports);
          let pdfMake = require('pdfmake/build/pdfmake.js');
          let pdfFonts = require('pdfmake/build/vfs_fonts.js');
          pdfMake.vfs = pdfFonts.pdfMake.vfs;
          pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
        }
      })
      .catch(console.error);
  };

  handleExportEXCEL = () => {
    const {dispatch, i18n} = this.props;
    dispatch({
      type: 'projectTimeReport/getExportData',
      payload: {}
    })
      .then(res => {
        const {reports, startDateTime, endDateTime} = res;
        const Excel = require('exceljs');
        if (reports.length > 0) {
          const sheetFileName = startDateTime !== endDateTime
            ? `ProjectTimeReport from ${startDateTime} to ${endDateTime}`
            : `ProjectTimeReport for ${startDateTime}`;

          const workbook = new Excel.Workbook();
          const worksheet = workbook.addWorksheet(sheetFileName);
          worksheet.columns = [
            { width: 25 }, { width: 15 }, { width: 10 }, { width: 10 }
          ];

          const headerRow = worksheet.addRow([
            'USER ID',
            'NAME',
            'PROJECT ID',
            'PROJECT',
            'WORKED TIME (H)',
            'REPORTED TIME (H)',
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
          });
          for (let i = 0; i < reports.length; i++){
            const diffTime = fnDurationHoursMinutes(Math.abs(reports[i].reported_time - reports[i].worked_time));
            worksheet.addRow([
              reports[i].work_user_id,
              getUserFullName({name: reports[i].user_name, surname: reports[i].user_surname}).trim(),
              reports[i].project_id,
              reports[i].project_name ? reports[i].project_name : i18n.t`No Project`,
              reports[i].worked_time ? fnConvertSecondsAsHours(reports[i].worked_time).toFixed(2) : null,
              reports[i].reported_time ? fnConvertSecondsAsHours(reports[i].reported_time).toFixed(2) : null,
            ]);
          }

          workbook.xlsx.writeBuffer().then(function(buffer) {
            const fileDownload = require('js-file-download');
            fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), `${sheetFileName}.xlsx`);
          });
        }
      })
      .catch(console.error);
  };

  get listProps() {
    const {projectTimeReport} = this.props;
    const {list} = projectTimeReport;
    return {
      pagination: {
        current: list.current_page,
        total: list.total,
        pageSize: list.per_page,
      },
      dataSource: list.data,
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
        })
      }
    }
  }

  get filterProps() {
    const {location, projectTimeReport} = this.props;
    const {query} = location;
    const {projects, users} = projectTimeReport;
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
          page: 1,
          pageSize: 10,
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
            <p className={globalStyles['tableTitle']}><Trans>Projects Time List</Trans></p>
            <ExportList overlay={this.getExportListDropdownMenu} />
          </Row>
        </Page.Head>
        <div className={`${reportsStyles['reports-table']} ${globalStyles['table-reports']} ${globalStyles['table-align-left']} ${globalStyles['global-table']}`}>
          <List {...this.listProps} />
        </div>
      </Page>
    )
  }
}

ProjectTimeReport.propTypes = {
  projects: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default ProjectTimeReport
