import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { router } from 'utils';
import { connect } from 'dva';
import {Trans, withI18n} from '@lingui/react';
import { Page } from 'components';
import { stringify } from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import {Button, Dropdown, Menu, Row} from 'antd';
import globalStyles from "themes/global.less";
import Icons from 'icons/icon';
import styles from "./index.less";
import pageStyles from "../../../components/Page/Page.less";
import filterStyles from "../details/components/Filter.less";
import {fnDurationToHoursMinutesSecondsText, getPercent, checkLoggedUserPermission} from "../../../utils";
import {PERMISSIONS} from '../../../utils/constant';
import store from "store";
import reportStyles from "../index.less";

@withI18n()
@connect(({ projectReport, loading }) => ({ projectReport, loading }))

class ProjectReport extends PureComponent {
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
    const {projectReport} = this.props;
    const {projectsOfUsers} = projectReport;
    const loggedUser = store.get('user');
    const canViewSelfProjectMemberList = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_PROJECT_MEMBER_LIST.name, PERMISSIONS.VIEW_SELF_PROJECT_MEMBER_LIST.guard_name);
    const canViewTeamProjectMemberList = checkLoggedUserPermission(PERMISSIONS.VIEW_TEAM_PROJECT_MEMBER_LIST.name, PERMISSIONS.VIEW_TEAM_PROJECT_MEMBER_LIST.guard_name);
    const canViewProjectMemberList = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECT_MEMBER_LIST.name, PERMISSIONS.VIEW_PROJECT_MEMBER_LIST.guard_name);
    const canViewProjectList = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECTS_LIST.name, PERMISSIONS.VIEW_PROJECTS_LIST.guard_name);

    if (list) {
      if (!(list instanceof Array)) {
        if (Object.keys(list).length === 1) {
          list = [list[Object.keys(list)[0]]];
        }
      }

      if (list instanceof Array) {
        list.forEach(project => {
          if (projectsOfUsers) {
            let attachedUsers = [];
            projectsOfUsers.forEach(user => {
              if (parseInt(user.project_id) === parseInt(project.project_id)) {
                if ((canViewProjectMemberList && canViewProjectList) ||
                  (canViewSelfProjectMemberList && user.id === loggedUser.id) ||
                  (canViewTeamProjectMemberList && user.id === loggedUser.id)) {
                  attachedUsers.push(user);
                }
              }
            });
            project.children = attachedUsers;
          }
          project.key = project.id + project.project_name;
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
      {text: 'TIME', style: 'tableHeader'},
      {text: 'STATUS', style: 'tableHeader'}
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
        if (value.project_name) {
          tableValues.push([
            value.project_name,
            value.members_count,
            fnDurationToHoursMinutesSecondsText(value.total_duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
            value.project_status === 1 ? 'Active' : 'Inactive'
          ])
          if (value?.children) {
            let childTableValues = [[
              {text: 'NAME', style: 'tableHeader', color: '#B3B3B3'},
              {text: 'TIME', style: 'tableHeader', color: '#B3B3B3'},
              {text: 'PERCENT', style: 'tableHeader', color: '#B3B3B3'}
            ]]

            value.children.forEach((childData, childKey) => {
              let workedHours = fnDurationToHoursMinutesSecondsText(childData.total_duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
              let surname = childData?.surname ? ' ' + childData?.surname : '';
              let patronymic = childData?.patronymic ? ' ' + childData?.patronymic : '';
              let memberFullName = childData?.name + surname + patronymic;
              let workedHoursPercent = getPercent(childData.total_duration, value.total_duration);

              childTableValues.push([
                memberFullName,
                workedHours,
                workedHoursPercent
              ])
            });
            tableValues.push([
              {
                colSpan,
                table: {
                  widths: [375, 80, 65],
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
        }
      });

      table = {
        widths: [320, 65, 90, 50],
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
    exportDataList.pageMargins = [ 15, 15, 15, 15 ];

    return exportDataList;
  }

  handleExportPDF = () => {
    const {projectReport} = this.props;
    const {reportsGroupByProjects} = projectReport;
    const reportData = this.getDataSource(reportsGroupByProjects);
    if (reportData.length > 0) {
      let docDefinition = this.getExportDataList(reportData);
      let pdfMake = require('pdfmake/build/pdfmake.js');
      let pdfFonts = require('pdfmake/build/vfs_fonts.js');
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      pdfMake.createPdf(docDefinition).download('ProjectReport.pdf');
    }

  };

  //Export EXCEL functionality
  handleExportEXCEL = () => {
    const {projectReport, i18n} = this.props;
    const {reportsGroupByProjects} = projectReport;
    const reportData = this.getDataSource(reportsGroupByProjects);
    if (reportData.length > 0) {
      const Excel = require('exceljs');
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet('ProjectReport');

      worksheet.columns = [
        {width: 25}, {width: 13}, {width: 18}, {width: 10}
      ];

      let headerRow = worksheet.addRow([
        'PROJECT NAME',
        'MEMBERS',
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
        if (item.project_name) {
          let row = worksheet.addRow([
            item.project_name,
            item.members_count,
            fnDurationToHoursMinutesSecondsText(item.total_duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
            item.project_status === 1 ? 'Active' : 'Inactive'
          ]);
          row.eachCell(function (cell) {
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

          if (item.children) {
            let nestedHeaderRow = worksheet.addRow([
              'NAME',
              '',
              'TIME',
              'PERCENT'
            ]);
            nestedHeaderRow.eachCell(function (cell) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'F6F4FD'}
              };
              cell.alignment = {
                vertical: 'middle', horizontal: 'center'
              };
              cell.font = {
                name: 'Arial',
                family: 2,
                bold: true,
                size: 10,
                color: {argb: 'B3B3B3'}
              };
            });
            nestedHeaderRow.outlineLevel = 1;
            item.children.forEach((childData, childKey) => {
              let workedHours = fnDurationToHoursMinutesSecondsText(childData.total_duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`);
              let surname = childData?.surname ? ' ' + childData?.surname : '';
              let patronymic = childData?.patronymic ? ' ' + childData?.patronymic : '';
              let memberFullName = childData?.name + surname + patronymic;
              let workedHoursPercent = getPercent(childData.total_duration, item.total_duration);

              let nestedRow = worksheet.addRow([
                memberFullName,
                '',
                workedHours,
                workedHoursPercent
              ])
              nestedRow.eachCell(function (cell) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: {argb: 'e6e6e6'}
                };
                cell.font = {
                  name: 'Arial',
                  family: 2,
                  bold: true,
                  size: 10,
                  color: {argb: '000'}
                };
              })
              nestedRow.outlineLevel = 1;
            });
          }
        }
      });

      workbook.xlsx.writeBuffer().then(function(buffer) {
        const fileDownload = require('js-file-download');
        fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), 'ProjectReport.xlsx');
      });
    }
  };

  get listProps() {
    const {projectReport, loading} = this.props;
    const {reportsGroupByProjects, projects, members, projectsOfUsers} = projectReport;

    return {
      dataSource: reportsGroupByProjects,
      projects: projects,
      members: members,
      projectsOfUsers: projectsOfUsers,
      loading: loading.effects['reports/projectReport/query'],
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
        })
      },
    }
  }


  get filterProps() {
    const { location, projectReport } = this.props;
    const { query } = location;
    const {users, projects} = projectReport;
    return {
      filter: {
        ...query,
      },
      users,
      projects,
      onFilterChange: value => {
        if (value.date_range){
          delete value.date_range;
        }
        this.handleRefresh({
          ...value,
        })
      }
    }
  }


  render() {
    const { i18n } = this.props;
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
            <p className={`${globalStyles['tableTitle']}`}><Trans>Projects</Trans></p>
            <div className={`${globalStyles['flexRow']}`}>
              <Dropdown overlay={this.getExportListDropdownMenu()} placement="bottomLeft">
                <button className={`btn-linked ${filterStyles['export-list']}`}>
                  <Trans>EXPORT LIST</Trans>
                  <Icons name="arrowdown2" fill="#4A54FF"/>
                </button>
              </Dropdown>
            </div>
          </Row>
        </Page.Head>
        <div className={`${styles['reports-table']} ${globalStyles['table-align-left']} ${globalStyles['global-table']}`}>
          <List {...this.listProps} />
        </div>
      </Page>
    )
  }
}

ProjectReport.propTypes = {
  projects: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default ProjectReport

