import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { router, getUserFullName, getLocale } from 'utils';
import { connect } from 'dva';
import { withI18n } from '@lingui/react';
import { Page } from 'components';
import { stringify } from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import Modal from './components/Modal';
import stylesProject from "./index.less";
import {message, Pagination} from 'antd';
import store from "store";
import moment from 'utils/moment';
import {Redirect} from "umi";
import {checkLoggedUserPermission} from "utils";
import {PERMISSIONS} from 'utils/constant'

@withI18n()
@connect(({ projects, loading }) => ({ projects, loading }))
class Projects extends Component {
  state = {
    width: 0
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateScreenSize);
    this.updateScreenSize();
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreenSize);
  }

  updateScreenSize = () => {
    this.setState({
      width: window.innerWidth
    });
  };

  handleRefresh = newQuery => {
    const { location, projects } = this.props;
    const { filterStatus } = projects;
    const { query, pathname } = location;
    let searchObj = { ...query, ...newQuery };
    if (newQuery &&  !("status" in newQuery) && filterStatus !== undefined) {
      searchObj = { ...searchObj, status: filterStatus };
    }
    router.push({
      pathname,
      search: stringify(
        searchObj,
        { arrayFormat: 'repeat' }
      ),
    })
  };

  handleDeleteItems = () => {
    const { dispatch, projects } = this.props;
    const { list, pagination, selectedRowKeys } = projects;

    dispatch({
      type: 'projects/multiDelete',
      payload: {
        ids: selectedRowKeys,
      },
    }).then(() => {
      this.handleRefresh({
        page:
          list.length === selectedRowKeys.length && pagination.current > 1
            ? pagination.current - 1
            : pagination.current,
      })
    })
  };

  addNewLines = (str) => {
    return str.replace(/(?!$|\n)([^\n]{30}(?!\n))/g, '$1\n');
  }

  //Export PDF functionality
  getTableData = (data) => {
    const user = store.get('user');
    const userTimeOffset = user.time_offset;
    const dateFormat = 'YYYY-MM-DD';

    const columns = [
      {text: 'PROJECT NAME', style: 'tableHeader'},
      {text: 'MEMBERS', style: 'tableHeader'},
      {text: 'DESCRIPTION', style: 'tableHeader'},
      {text: 'STATUS', style: 'tableHeader'},
      {text: 'DATE', style: 'tableHeader'},
    ];

    let table = {};
    let tableValues = [];
    if (data) {
      data.forEach((value, key) => {
        let date = moment.parseZone(value.created_at).utcOffset(userTimeOffset).format(dateFormat);
        let members = '';
        if (value.attached_users && value.attached_users.length > 0) {
          let count = value.attached_users.length;
          value.attached_users.forEach((user, index) => {
            let suffix = (index === count - 1) ? '' : '\n';
            members += '*' + getUserFullName(user) + suffix
          });
        }

        tableValues.push([
          this.addNewLines(value.name),
          members,
          value.description ? this.addNewLines(value.description) : '-',
          (value.status === 1) ? 'Active' : 'Inactive',
          date
        ])
      });

      table = {
        widths: [80, 120, 230, 50, 65],
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

  handleExportPDF = () => {
    const {dispatch, location} = this.props;
    const {query} = location;

    dispatch({
      type: 'projects/export',
      payload: {...query},
    }).then(response => {

      if (response.length > 0) {
        let docDefinition = this.getExportDataList(response);
        let pdfMake = require('pdfmake/build/pdfmake.js');
        let pdfFonts = require('pdfmake/build/vfs_fonts.js');
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMake.createPdf(docDefinition).download('ProjectsList.pdf');
      }
    })
  };

  //Export CSV functionality
  handleExportCSV = () => {
    const {dispatch, location} = this.props;
    const {query} = location;

    dispatch({
      type: 'projects/export',
      payload: {...query},
    }).then(data => {
      const user = store.get('user');
      const userTimeOffset = user.time_offset;
      const dateFormat = 'YYYY-MM-DD';

      let projectData = "PROJECT NAME,MEMBERS,DESCRIPTION,STATUS,DATE" + ',\n';
      if (data) {
        data.forEach((value, key) => {
          let date = moment.parseZone(value.created_at).utcOffset(userTimeOffset).format(dateFormat);
          let members = '';
          if (value.attached_users && value.attached_users.length > 0) {
            let count = value.attached_users.length;
            value.attached_users.forEach((user, index) => {
              let suffix = (index === count - 1) ? '' : '\n';
              members += '*' + getUserFullName(user) + suffix + ','
            });
          }
          projectData += value.name + ','
            + members
            + value.description + ','
            + (value.status ? 'Active' : 'Inactive') + ','
            + date + ',\n'
        });

        const fileDownload = require('js-file-download');
        fileDownload(projectData, 'projectsList.csv');
      }
    })
  }

  //Export EXCEL functionality
  handleExportEXCEL = () => {
    const {dispatch, location} = this.props;
    const {query} = location;
    const user = store.get('user');
    const userTimeOffset = user.time_offset;
    const dateFormat = 'YYYY-MM-DD';
    dispatch({
      type: 'projects/export',
      payload: {...query},
    }).then(response => {
      const Excel = require('exceljs');
      if (response.length > 0) {
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('SummaryReport');

        worksheet.columns = [
          {width: 25}, {width: 25}, {width: 50}, {width: 25}, {width: 25}
        ];

        let headerRow = worksheet.addRow([
          'PROJECT NAME',
          'MEMBERS',
          'DESCRIPTION',
          'STATUS',
          'DATE'
        ]);
        headerRow.height = 25;
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
          let date = moment.parseZone(value.created_at).utcOffset(userTimeOffset).format(dateFormat);
          let members = '';
          if (value.attached_users && value.attached_users.length > 0) {
            let count = value.attached_users.length;
            value.attached_users.forEach((user, index) => {
              let suffix = (index === count - 1) ? '' : '\n';
              members += '*' + getUserFullName(user) + suffix
            });
          }

          let row = worksheet.addRow([
            this.addNewLines(value.name),
            members,
            value.description ? this.addNewLines(value.description) : '-',
            (value.status === 1) ? 'Active' : 'Inactive',
            date
          ]);
          row.height=50;
          row.margins = { top: 110, bottom: 110};
          row.eachCell(function(cell) {
            cell.alignment = {
              vertical: 'middle', horizontal: 'center'
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
          fileDownload(new Blob([buffer], { type: 'application/octet-stream' }), 'ProjectsList.xlsx');
        });
      }
    })
  };

  get modalProps() {
    const { dispatch, projects, loading, i18n } = this.props;
    const {
      currentItem,
      modalVisible,
      modalType,
      displayColorPicker,
      itemColor,
      users,
      errorMessages,
      userProjectRoles,
      technologies
    } = projects;

    return {
      dispatch: dispatch,
      item: modalType === 'create' ? {} : currentItem,
      users: users,
      userProjectRoles,
      technologies,
      visible: modalVisible,
      destroyOnClose: true,
      maskClosable: false,
      confirmLoading: loading.effects[`projects/${modalType}`],
      title: `${
        modalType === 'create' ? i18n.t`Add a project` : i18n.t`Update project`
      }`,
      centered: true,
      displayColorPicker: displayColorPicker,
      itemColor: itemColor,
      errorMessages,
      onShowHideColors: () =>{
        dispatch({
          type: 'projects/showHideColors'
        });
      },
      onChangeItemColor: (color) =>{
        dispatch({
          type: 'projects/changeItemColor',
          payload:{itemColor: color}
        });
      },
      onOk: data => {
        dispatch({
          type: `projects/resetErrorMessages`
        });
        return dispatch({
          type: `projects/${modalType}`,
          payload: data,
        }).then((response) => {
          message.success(response);
          this.handleRefresh();
        })
          .catch(err => {
          throw err;
        })
      },
      onCancel() {
        dispatch({
          type: 'projects/hideModal',
        })
        dispatch({
          type: `projects/resetErrorMessages`
        })
      },
    }
  }

  get listProps() {
    const { dispatch, projects, loading } = this.props;
    const { list, pagination, selectedRowKeys } = projects;
    const {width}= this.state;

    return {
      width,
      dataSource: list,
      loading: loading.effects['projects/query'],
      pagination,
      onChange: (page, pageSize) => {
        this.handleRefresh({
          page,
          pageSize
        });
      },
      onDeleteItem: (e,id) => {
        dispatch({
          type: 'projects/delete',
          payload: id,
        }).then(() => {
          this.handleRefresh({
            page:
              list.length === 1 && pagination.current > 1
                ? pagination.current - 1
                : pagination.current,
          })
        })
      },
      onEditItem: (e,item) => {
        dispatch({
          type: 'projects/showModal',
          payload: {
            modalType: 'update',
            currentItem: item,
            itemColor: item.color,
          },
        })
      },
      rowSelection: {
        selectedRowKeys,
        onChange: keys => {
          dispatch({
            type: 'projects/updateState',
            payload: {
              selectedRowKeys: keys,
            },
          })
        },
      },
    }
  }

  get filterProps() {
    const { location, dispatch } = this.props;
    const { query } = location;
    const {width} = this.state;

    return {
      filter: {
        ...query,
      },
      width,
      handleExportPDF: this.handleExportPDF,
      handleExportEXCEL: this.handleExportEXCEL,
      handleExportCSV: this.handleExportCSV,
      onFilterChange: value => {
        this.handleRefresh({
          page: 1,
          ...value,
        })
      },
      onAdd() {
        dispatch({
          type: 'projects/showModal',
          payload: {
            modalType: 'create',
          },
        })
      }
    }
  }

  render() {
    const { projects, i18n } = this.props;
    const {pagination, list} = projects;

    const canViewProjects = checkLoggedUserPermission(PERMISSIONS.VIEW_PROJECTS.name, PERMISSIONS.VIEW_PROJECTS.guard_name) ||
      checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_PROJECTS.name, PERMISSIONS.VIEW_SELF_PROJECTS.guard_name);

    if(!canViewProjects || list === undefined) {
      return <Redirect to={`/${getLocale()}/dashboard`} />;
    }

    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <div className={`${stylesProject['card-wrapper']}`}>
          <List {...this.listProps} />
          {pagination.total > 12 && <Pagination
            onChange={(page, pageSize) => this.listProps.onChange(page, pageSize)}
            defaultCurrent={1}
            current={pagination?.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            defaultPageSize={12}
          />}
        </div>
        <Modal okText={i18n.t`ADD`} {...this.modalProps} />
      </Page>
    )
  }
}

Projects.propTypes = {
  projects: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default Projects
