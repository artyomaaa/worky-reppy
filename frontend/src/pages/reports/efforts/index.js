import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Menu, Col, Row} from 'antd';
import { checkLoggedUserPermission, router, getUserFullName, fnConvertSecondsAsHours } from 'utils';
import {connect} from 'dva';
import {Trans, withI18n} from '@lingui/react';
import {Page} from 'components';
import {stringify} from 'qs';
import List from './components/List';
import Filter from "./components/Filter";
import moment from 'utils/moment';
import store from 'store';
import {PERMISSIONS, DATE_FORMAT} from 'utils/constant';
import styles from "./index.less";
import reportStyles from "../index.less";
import stylesUser from '../../users/index.less'
import globalStyles from "themes/global.less";
import stylesProjects from '../../projects/components/Filter.less';
import stylesEfforts from './index.less'
import Icons from 'icons/icon';

const fileDownload = require('js-file-download');
const Excel = require('exceljs');
const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');

@withI18n()
@connect(({reportsEfforts, loading}) => ({reportsEfforts, loading}))
class NowWorkingOnTasks extends PureComponent {
  constructor(props) {
    super(props);
    const userTimeOffset =  store.get('user')?.time_offset || '+00:00';
    this.state = {
      userTimeOffset: userTimeOffset,
      today: moment().utcOffset(userTimeOffset).format(DATE_FORMAT),
    }
  }
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

  getDataSource = list => {
    return list;
  };

  //Export PDF functionality
  getTableData = (data) => {
    const {userTimeOffset} = this.state;
    const columns = [
      {text: 'User Id', style: 'tableHeader'},
      {text: 'Name', style: 'tableHeader'},
      {text: 'Project Id', style: 'tableHeader'},
      {text: 'Project Name', style: 'tableHeader'},
      {text: 'Role in Project', style: 'tableHeader'},
      {text: 'Currency', style: 'tableHeader'},
      {text: 'Rate per hour', style: 'tableHeader'},
      {text: 'Efforts (h)', style: 'tableHeader'},
      {text: 'Reported effort (h)', style: 'tableHeader'},
      {text: 'Billed amount', style: 'tableHeader'},
      {text: 'Start', style: 'tableHeader'},
      {text: 'End', style: 'tableHeader'},
      {text: 'Day', style: 'tableHeader'},
    ];
    let table = {};
    let tableValues = [];
    if (data) {
      data.forEach((item, key) => {
        tableValues.push([
          item.work_user_id,
          getUserFullName({name: item.work_user_name, surname: item.work_user_surname}),
          item.project_id,
          item.project_name,
          item.user_project_role_name,
          item.rate_currency,
          item.rate,
          item.worked_time ? fnConvertSecondsAsHours(item.worked_time).toFixed(2) : null,
          item.reported_time ? fnConvertSecondsAsHours(item.reported_time).toFixed(2) : null,
          item.reported_time ? (fnConvertSecondsAsHours(item.reported_time) * item.rate).toFixed(2) : null,
          item.start_date_time ? moment.parseZone(item.start_date_time).utcOffset(userTimeOffset).format('HH:mm') : '',
          item.end_date_time ? moment.parseZone(item.end_date_time).utcOffset(userTimeOffset).format('HH:mm') : '',
          item.start_date,
        ])
      });

      table = {
        widths: [30, 60, 30, 60, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        body: [
          columns,
          ...tableValues
        ],
        headerRows: 1
      }
    }
    return table;
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
    exportDataList.pageMargins = [ 15, 15, 15, 15 ];

    return exportDataList;
  }

  handleExportPDF = () => {
    const {dispatch, location} = this.props;
    const {query} = location;

    dispatch({
      type: 'reportsEfforts/export',
      payload: {...query},
    }).then(response => {
      const reportData = this.getDataSource(response);

      if (reportData.length > 0) {
        let docDefinition = this.getExportDataList(reportData);
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMake.createPdf(docDefinition).download('EffortsReport.pdf');
      }
    })
  };

  //Export EXCEL functionality
  handleExportEXCEL = () => {
    const {dispatch, location, i18n} = this.props;
    const {query} = location;

    dispatch({
      type: 'reportsEfforts/export',
      payload: {...query},
    }).then(response => {
      const reportData = this.getDataSource(response);
      if (reportData.length > 0) {
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('EffortsReport');

        worksheet.columns = [
          {width: 25}, {width: 15}, {width: 16}, {width: 15}, {width: 15}, {width: 15}
        ];

        const headerRow = worksheet.addRow([
          'User Id',
          'Name',
          'Project Id',
          'Project Name',
          'Role in Project',
          'Currency',
          'Rate per hour',
          'Efforts (h)',
          'Reported effort (h)',
          'Billed amount',
          'Start',
          'End',
          'Day',
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
            item.work_user_id,
            getUserFullName({name: item.work_user_name, surname: item.work_user_surname}),
            item.project_id,
            item.project_name,
            item.user_project_role_name,
            item.rate_currency,
            item.rate,
            item.worked_time ? fnConvertSecondsAsHours(item.worked_time).toFixed(2) : null,
            item.reported_time ? fnConvertSecondsAsHours(item.reported_time).toFixed(2) : null,
            item.reported_time ? (fnConvertSecondsAsHours(item.reported_time) * item.rate).toFixed(2) : null,
            item.start_date_time ? moment.parseZone(item.start_date_time).utcOffset(this.state.userTimeOffset).format('HH:mm') : '',
            item.end_date_time ? moment.parseZone(item.end_date_time).utcOffset(this.state.userTimeOffset).format('HH:mm') : '',
            item.start_date,
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
          fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), 'EffortsReport.xlsx');
        });
      }
    })
  };

  get listProps() {
    const {reportsEfforts} = this.props;
    const {list} = reportsEfforts;
    return {
      pagination: {
        current: list.current_page,
        total: list.total,
        pageSize: parseInt(list.per_page),
      },
      dataSource: list && list.data ? list.data : [],
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: parseInt(page.pageSize),
        })
      }
    }
  }

  get filterProps() {
    const {location, reportsEfforts} = this.props;
    const {query} = location;
    const {teams, projects, users} = reportsEfforts;
    return {
      filter: {
        ...query,
      },
      teams,
      projects,
      users,
      onFilterChange: value => {
        if (value.date_range){
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
  get permissions() {
    return {
      canViewEfforts: checkLoggedUserPermission(PERMISSIONS.VIEW_EFFORTS.name, PERMISSIONS.VIEW_EFFORTS.guard_name)
    }
  }

  render() {
    const {i18n} = this.props;
    const {canViewEfforts} = this.permissions;
    if (!canViewEfforts) {
      return <>
        <h1>{i18n.t`Access Denied`}</h1>
      </>
    }

    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <Page.Head>
          <Row
            type="flex"
            justify="space-between"
            align="middle"
            className={`${reportStyles['table-header']} ${globalStyles['flexRow']}`}
          >
            <p className={globalStyles['tableTitle']}>
              <Trans>Efforts</Trans>
            </p>
            <Dropdown overlay={() => this.getExportListDropdownMenu()} trigger={['click']} placement="bottomLeft"
                      overlayClassName={stylesProjects["exportDropdown"]}>
              <button className="btn-linked">
                <Trans>EXPORT LIST</Trans>
                <Icons name="arrowdown2" fill="#4A54FF"/>
              </button>
            </Dropdown>
          </Row>
        </Page.Head>
        <div className={`${stylesUser['table-align-left']} ${stylesUser['user-table']}`}>
          <List {...this.listProps} />
        </div>
      </Page>
    )
  }
}

NowWorkingOnTasks.propTypes = {
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default NowWorkingOnTasks;
