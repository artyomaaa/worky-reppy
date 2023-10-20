import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import {ConfigProvider, Dropdown, Radio, Menu, message} from 'antd';
import {checkLoggedUserPermission, disabledDate, checkDateTimeFormat, getFilterInitialStatus} from 'utils';
import {PERMISSIONS, START_DATE_TIME_FORMAT, END_DATE_TIME_FORMAT, dateFormats} from 'utils/constant';
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import Icons from 'icons/icon';
import MobileFilterModal from "../../../components/MobileFilterModal/MobileFilterModal";
import stylesFilter from './Filter.less'
import stylesUsers from '../../users/components/Filter.less';
import globalStyles from "themes/global.less";
import styles from "../../../components/Page/Page.less";

import './Filter.less'
/* global document */

import {Form} from '@ant-design/compatible'

import '@ant-design/compatible/assets/index.css';
import {Trans, withI18n} from '@lingui/react';
import {Button, Row, Col, DatePicker, Input} from 'antd';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import stylesProjects from "../../projects/components/Filter.less";
import store from "store";
import {connect} from "dva";
import {getUserFullName} from 'utils';

const {Search} = Input;
const {RangePicker} = DatePicker;

const ColProps = {
  xs: 24,
  sm: 12,
  style: {
    marginBottom: 16,
  },
};

const TwoColProps = {
  ...ColProps,
  xl: 96,
};

@withI18n()
@Form.create()
@connect(({ teams }) => ({ teams }))
class Filter extends Component {
  state = {
    filterModalVisible: false
  }

  handleFields = fields => {
    const { created_at } = fields;
    if (created_at?.length) {
      fields.created_at = [
        moment(created_at[0]).format('YYYY-MM-DD'),
        moment(created_at[1]).format('YYYY-MM-DD'),
      ]
    }
    return fields
  };

  handleSubmit = () => {
    const { onFilterChange, form } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    fields = this.handleFields(fields);
    onFilterChange(fields)
  };

  handleReset = () => {
    const { form } = this.props;
    const { getFieldsValue, setFieldsValue } = form;

    const fields = getFieldsValue();
    for (let item in fields) {
      if ({}.hasOwnProperty.call(fields, item)) {
        if (fields[item] instanceof Array) {
          fields[item] = []
        } else {
          fields[item] = undefined
        }
      }
    }
    if (fields.status === undefined) fields.status = '1';
    setFieldsValue(fields);
    this.handleSubmit();
  };

  handleChange = (key, values) => {
    const { form, onFilterChange } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    if (key === 'status') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields[key] = (values instanceof Object) ? values.target.value : values;
    } else fields[key] = values;

    fields = this.handleFields(fields);
    onFilterChange(fields);
  };

  handleMobileFilterShow = () => {
    this.setState(prevState => ({
      filterModalVisible: !prevState.filterModalVisible
    }));
  };

  handleStatusToggle = (e) => {
    const {form} = this.props,
      {getFieldsValue, setFieldsValue} = form;

    let fields = getFieldsValue();
    if (e.target.value && (e.target.value === fields.status)) {
      fields.status = undefined;
      setFieldsValue(fields);
      this.handleSubmit();
    }
  };

  get mobileFilterProps() {
    const {onFilterChange, filter} = this.props;
    const {filterModalVisible} = this.state;

    return {
      filter,
      onFilterChange,
      show: filterModalVisible,
      onApply: this.handleSubmit,
      onClose: this.handleMobileFilterShow
    }
  };

  render() {
    const {onAdd, filter, form, i18n} = this.props,
      {getFieldDecorator} = form,
      {name} = filter,
      user = store.get('user'),
      userTimeOffset = user.time_offset,
      canAddTeams = checkLoggedUserPermission(PERMISSIONS.ADD_TEAMS.name, PERMISSIONS.ADD_TEAMS.guard_name);

    let lang = i18n.language == 'en' ? en_GB : hy_AM;
    let initialCreateAt = [];
    if (!Object.keys(filter).length) {
      initialCreateAt = [];
    } else {
      if (filter?.created_at) {
        if (filter?.created_at[0] && checkDateTimeFormat(filter?.created_at[0], START_DATE_TIME_FORMAT)) {
          initialCreateAt.push(moment(filter?.created_at[0]));
        } else { // invalid date time format
          initialCreateAt.push(moment());
        }

        if (filter?.created_at[1] && checkDateTimeFormat(filter?.created_at[1], END_DATE_TIME_FORMAT)) {
          initialCreateAt.push(moment(filter?.created_at[1]));
        } else { // invalid date time format
          initialCreateAt.push(moment());
        }
      }
    }

    const getExportDataList = (dataSource) => {
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

      exportDataList.content = [{table: getTableData(dataSource), layout, style}];
      exportDataList.styles = styles;
      exportDataList.pageMargins = [5, 5, 5, 5];
      exportDataList.defaultStyle = defaultStyle;

      return exportDataList;
    }
    const getTableData = (data) => {
      const user = store.get('user');
      const userTimeOffset = user.time_offset;
      const dateFormat = 'YYYY-MM-DD';

      const columns = [
        {text: 'TEAM NAME', style: 'tableHeader'},
        {text: 'USER NAME', style: 'tableHeader'},
        {text: 'STATUS', style: 'tableHeader'},
        {text: 'DATE', style: 'tableHeader'},
      ];

      let table = {};
      let tableValues = [];
      if (data) {
        data.forEach((value, key) => {
          let date = moment.parseZone(value.created_at).utcOffset(userTimeOffset).format(dateFormat);
          let members = '';
          if (value.members && value.members.length > 0) {
            let count = value.members.length;
            value.members.forEach((user, index) => {
              let suffix = (index === count - 1) ? '' : '\n';
              members += '*' + getUserFullName(user) + suffix
            });
          }

          tableValues.push([
            (value.name),
            members,
            (value.status === 1) ? 'Active' : 'Inactive',
            date
          ])
        });

        table = {
          widths: [80, 120, 80, 80],
          body: [
            columns,
            ...tableValues
          ],
          headerRows: 1
        }
      }
      return table;
    }

    //Export PDF functionality
    const handleExportPDF = () => {
      const {dispatch} = this.props;
      const {form} = this.props;
      const {getFieldsValue} = form;
      let fields = getFieldsValue();

      dispatch({
        type: 'teams/export',
        payload: {fields: fields, type: 'PDF'},
      }).then((file) => {

        if (file) {
          let docDefinition = getExportDataList(file);
          let pdfMake = require('pdfmake/build/pdfmake.js');
          let pdfFonts = require('pdfmake/build/vfs_fonts.js');
          pdfMake.vfs = pdfFonts.pdfMake.vfs;
          pdfMake.createPdf(docDefinition).download('TeamsList.pdf');
        }

      })

    };

    //Export CSV functionality
    const handleExportCSV = () => {
      const {dispatch} = this.props;
      const {form} = this.props;
      const {getFieldsValue} = form;
      let fields = getFieldsValue();

      dispatch({
        type: 'teams/export',
        payload: {fields: fields, type: 'CSV'},
      }).then(file => {

        const user = store.get('user');
        const userTimeOffset = user.time_offset;
        const dateFormat = 'YYYY-MM-DD';

        let projectData = "TEAM NAME,USER NAME,STATUS,DATE" + ',\n';
        if (file) {
          file.forEach((value, key) => {
            let date = moment.parseZone(value.created_at).utcOffset(userTimeOffset).format(dateFormat);
            let members = '';
            if (value.members && value.members.length > 0) {
              let count = value.members.length;
              value.members.forEach((user, index) => {
                let suffix = (index === count - 1) ? '' : '\n';
                members += '*' + getUserFullName(user) + suffix + ','
              });
            }
            projectData += value.name + ','
              + members
              + (value.status ? 'Active' : 'Inactive') + ','
              + date + ',\n'
          });

          const fileDownload = require('js-file-download');
          fileDownload(projectData, 'TeamLists.csv');
        }
      })
    }

    //Export EXCEL functionality
    const handleExportEXCEL = () => {
      const {dispatch} = this.props;
      const {form} = this.props;
      const {getFieldsValue} = form;
      let fields = getFieldsValue();
      const user = store.get('user');
      const userTimeOffset = user.time_offset;
      const dateFormat = 'YYYY-MM-DD';
      dispatch({
        type: 'teams/export',
        payload: {fields: fields, type: 'CSV'},
      }).then(file => {
        const Excel = require('exceljs');
        console.log(file,'file')
        if (file) {
          let workbook = new Excel.Workbook();
          let worksheet = workbook.addWorksheet('SummaryReport');

          worksheet.columns = [
            {width: 25}, {width: 25}, {width: 25}, {width: 25}
          ];

          let headerRow = worksheet.addRow([
            'TEAM NAME',
            'USER NAME',
            'STATUS',
            'DATE'
          ]);
          headerRow.height = 25;
          headerRow.eachCell(function(cell) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: {argb: 'fff'},
              bgColor: {argb: '353FDF'}
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
          file.forEach(value => {
            let date = moment.parseZone(value.created_at).utcOffset(userTimeOffset).format(dateFormat);
            let members = '';
            if (value.members && value.members.length > 0) {
              let count = value.members.length;
              value.members.forEach((user, index) => {
                let suffix = (index === count - 1) ? '' : '\n';
                members += '*' + getUserFullName(user) + suffix
              });
            }

            let row = worksheet.addRow([
              (value.name),
              members,
              (value.status === 1) ? 'Active' : 'Inactive',
              date
            ]);
            row.height = 50;
            row.margins = {top: 110, bottom: 110};
            row.eachCell(function (cell) {
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

          workbook.xlsx.writeBuffer().then(function (buffer) {
            const fileDownload = require('js-file-download');
            fileDownload(new Blob([buffer], {type: 'application/octet-stream'}), 'TeamList.xlsx');
          });
        }
      })
    };

    const getExportListDropdownMenu = () => {
      return (
        <Menu>
          <Menu.Item onClick={handleExportPDF}><Trans>PDF</Trans></Menu.Item>
          <Menu.Item onClick={handleExportCSV}><Trans>CSV</Trans></Menu.Item>
          <Menu.Item onClick={handleExportEXCEL}><Trans>XLS</Trans></Menu.Item>
        </Menu>
      );
    }

    // filter by status
    const initialStatus = getFilterInitialStatus(filter);

    return (
      <>
        <Row
          className={`${styles.filtersReportsActionsSect} ${stylesUsers['parent-row__head']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
          <Col className={styles['taskSearch']}>
            <div className={`${styles['searchSect']} ${stylesUsers['head-search--bar']}`}>
              {getFieldDecorator('name', {initialValue: name})(
                <Search
                  placeholder={i18n.t`Search Team`}
                  onSearch={this.handleSubmit}
                  className={globalStyles['input-md-ex']}
                  prefix={
                    <span>
                    <Icons name="search" style={{marginRight: '10px', marginTop: '2px'}}/>
                  </span>
                  }
                />
              )}
            </div>
          </Col>
          <Col className={`${stylesUsers['mobile-filter-row']} ${stylesFilter['teams-mobile-filter-row']}`}>
            <Col className={stylesUsers['mobile-filter-container']}>
              <div className={stylesUsers['mobile-filter-button']}
                   onClick={() => this.handleMobileFilterShow()}>
                <span className={stylesUsers['filter-button-icon']}>
                <Icons name='filtersliders'/>
                  </span>
                <span className={stylesUsers['filter-button-text']}>Filter By</span>
              </div>
            </Col>

            <Col className={styles['taskSearch']}>
              {canAddTeams &&
              <div className={stylesUsers['btnWrap']}>
                <button
                  onClick={onAdd}
                  className="app-btn primary-btn"
                >
                  <Icons name="plus" fill="#fff"/>
                  <Trans>Add_team</Trans>
                </button>
              </div>
              }
            </Col>
          </Col>
      </Row>
    <Row
      className={`${styles.filtersReportsActionsSect} ${stylesUsers['parent-row__head']} ${stylesFilter['filter-second-row']}`}
      type="flex"
      justify="space-between"
      align="middle">
        <Col span={24}>
          <div className={`${stylesUsers['second-row__head']} ${stylesProjects['second-row__head']}`}>
            {this.props.width > 767 &&
              <>
            <div className={stylesUsers['label-head']}>
              <ConfigProvider locale={lang}>
                {getFieldDecorator('created_at', {
                  initialValue: initialCreateAt,
                })(
                  <DatePicker.RangePicker
                    placeholder={[moment().utcOffset(userTimeOffset).format(dateFormats.tasksPageCalendarFormat), '']}
                    className={[stylesUsers['user-calendar-input'], globalStyles['input-md-ex']]}
                    dropdownClassName={stylesFilter['app-datepicker']}
                    ranges={{[i18n.t`Today`]: [moment(), moment()],
                      [i18n.t`Yesterday`]: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                      [i18n.t`This Week`]: [moment().startOf('week'), moment().endOf('week')],
                      [i18n.t`Last Week`]: [moment().subtract(1, 'weeks').startOf('week'), moment().subtract(1, 'weeks').endOf('week')],
                      [i18n.t`This Month`]: [moment().startOf('month'), moment().endOf('month')],
                      [i18n.t`Last Month`]: [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
                      [i18n.t`This Year`]: [moment().startOf('year'), moment().endOf('year')],
                      [i18n.t`Last Year`]: [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')],
                    } }
                    suffixIcon={
                      <span className={stylesUsers['head__calendar-icon']}>
                        <Icons name="calendar" />
                      </span>
                      }
                      format='DD-MM-YY'
                      onChange={this.handleChange.bind(this, 'created_at')}
                      disabledDate={disabledDate}
                      separator={''}
                    >
                    </DatePicker.RangePicker>
                  )}
                </ConfigProvider>
              </div>

            <div className={`${stylesUsers['user-radio-wrap']} ${stylesFilter['filter-radio-wrap']}`}
                 onClick={(e) => this.handleStatusToggle(e)}>
              {getFieldDecorator('status', {
                initialValue: initialStatus,
              })(
                <Radio.Group onChange={this.handleChange.bind(this, 'status')}>
                  <Radio.Button value="1">
                    <Trans>Active</Trans>
                  </Radio.Button>
                  <Radio.Button value="0">
                    <Trans>Inactive</Trans>
                  </Radio.Button>
                </Radio.Group>
              )}
              <div className={stylesUsers['user-button-wrap']}>
                <Button type="secondary" onClick={this.handleReset}>
                  <Trans>Reset</Trans>
                </Button>
              </div>
            </div>
            </>
            }
            <div className={stylesProjects['secondRow-export']}>
              <Dropdown overlay={() => getExportListDropdownMenu()} trigger={['click']} placement="bottomLeft"
                        overlayClassName={stylesProjects["exportDropdown"]}>
                <button className="btn-linked">
                  <Trans>EXPORT LIST</Trans>
                  <Icons name="arrowdown2" fill="#4A54FF"/>
                </button>
              </Dropdown>
            </div>
          </div>
        </Col>
      </Row>
      {this.state.filterModalVisible && <MobileFilterModal {...this.mobileFilterProps}/>}
      </>
    )
  }
}

Filter.propTypes = {
  onAdd: PropTypes.func,
  form: PropTypes.object,
  filter: PropTypes.object,
  onFilterChange: PropTypes.func,
  dispatch: PropTypes.func,
};

export default Filter
