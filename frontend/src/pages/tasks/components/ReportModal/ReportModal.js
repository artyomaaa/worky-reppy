import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import moment from 'utils/moment';
import store from 'store';
import {Trans, I18n} from '@lingui/react';
import {Button, Dropdown, Input, message, Modal, Menu, Tooltip} from 'antd';
import {EllipsisOutlined} from '@ant-design/icons';
import {fnDurationToHoursMinutesSeconds, fnDurationToHoursMinutesSecondsForReports, fnEndTimeText} from 'utils';
import styles from './ReportModal.less';
import ClientReportHour from './ClientReportHour';
import Icons from 'icons/icon';
import {CSVLink} from "react-csv";
import Tag from 'components/Tag';

const ReportModal = ({
                       selectedDate,
                       show,
                       isSubmittingReport,
                       projects,
                       toSubmitTasks,
                       onClose,
                       onSubmit,
                       todayTotalDuration
                     }) => {
  // State
  const [totalDuration, setTotalDuration] = useState([])
  const [inputData, setInputData] = useState([])
  const [invalidReportHourData, setInvalidReportHourData] = useState([])
  const [csvData, setCsvData] = useState([])

  const validateProjectReportHours = async (submitted, inputData) => {

    if (inputData && Object.values(inputData).length > 0) {

      const reportHours = [...inputData];
      return reportHours.map((reportHour, idx) => {
        if (reportHour && !reportHour.hasOwnProperty("project")) {
          if (reportHour && typeof reportHour === "object" && !reportHour.hasOwnProperty("isProjectValid")) {
            setInvalidReportHourData(prevState => [...prevState, {...reportHour, isProjectValid: false}])
            return {...reportHour, isProjectValid: false}
          } else {
            return reportHour
          }
        } else if (reportHour && !reportHour.hasOwnProperty("minutes") && !reportHour.hasOwnProperty("hours")) {
          setInvalidReportHourData(prevState => [...prevState, {
            ...reportHour,
            isHourValid: false,
            isMinutesValid: false
          }])
          return {...reportHour, isHourValid: false, isMinutesValid: false}
        } else if (reportHour && !reportHour.hasOwnProperty("minutes") && reportHour.hasOwnProperty("hours") && !!+reportHour.hours) {
          setInvalidReportHourData(prevState => [...prevState, {
            ...reportHour,
            isHourValid: true,
            isMinutesValid: false
          }])
          return {...reportHour, isHourValid: true, isMinutesValid: false}
        } else if (reportHour && !reportHour.hasOwnProperty("hours") && reportHour.hasOwnProperty("minutes") && !!+reportHour.minutes) {
          setInvalidReportHourData(prevState => [...prevState, {
            ...reportHour,
            isHourValid: false,
            isMinutesValid: true
          }])
          return {...reportHour, isHourValid: false, isMinutesValid: true}
        } else if (reportHour && reportHour.hasOwnProperty("hours") && reportHour.hasOwnProperty("minutes") && !!+reportHour.hours && !!+reportHour.minutes) {
          setInvalidReportHourData(prevState => [...prevState, {
            ...reportHour,
            isHourValid: true,
            isMinutesValid: true
          }])
          return {...reportHour, isHourValid: true, isMinutesValid: true}
        } else {
          return reportHour
        }
      });
    } else {
      return false
    }
  }

  const onSubmitData = (submitted, inputDataReportHour) => {
    if (inputData?.length > 0) {
      validateProjectReportHours(submitted, inputDataReportHour)
        .then((data) => {
          let invalidData;
          if (data && data.length > 0) {
            setInputData([...data])
            invalidData = data.map(dataItem => {
              return (dataItem?.project && dataItem?.isProjectValid !== false) && ((dataItem?.hours && dataItem?.isHourValid !== false) || (dataItem?.minutes && dataItem?.isMinutesValid !== false))
            })
          }
          setInvalidReportHourData([...invalidData])
          return invalidData
        })
        .then((data) => {
          const invalidFields = data.filter(el => el === false || el === undefined || el === "")
          if (invalidFields?.length === 0) {
            onSubmit(submitted, [...inputData])
          }
        })
        .then(() => {
          // commented out, because did not show error message, and closed dropdown project
          // setInputData([]);
        })
        .catch(() => {
          message.error(`Something went wrong!`)
        })
    } else {
      onSubmit(submitted, [])
    }
  }

  // Effects
  useEffect(() => {
    setTotalDuration(todayTotalDuration);
  }, [todayTotalDuration, setTotalDuration])

  const handleShowImpute = () => {
    setInputData(prevState => [...prevState, {key: Math.random().toString(36).substring(7)}]);
  }

  function handleRemoveField(key) {
    let newData = [];
    inputData.map((item) => {
      if (item.key !== key.key) {
        newData.push(item);
      }
      setInputData(newData)
    })
    setInvalidReportHourData([])
  }

  function handleChangeReportsFields(input, key, value) {
    let newData = [...inputData];
    newData.map((item) => {
      if (item.key === key) {
        item[input] = value;
        if (input === "project") {
          value ? item.isProjectValid = true : item.isProjectValid = false;
        } else if (input === "minutes") {
          !!+value ? item.isMinutesValid = true : item.isMinutesValid = false
        } else if (input === "hours") {
          !!+value ? item.isHourValid = true : item.isHourValid = false;
        }
      }
      setInputData(newData);
    })
  }

  const userTimeOffset = store.get('user')?.time_offset || '+00:00';
  const totalDurationObject = fnDurationToHoursMinutesSeconds(totalDuration);
  const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';


  const getTableData = (data) => {
    const columns = [
      {text: 'USER NAME', style: 'tableHeader'},
      {text: 'TASK NAME', style: 'tableHeader'},
      {text: 'PROJECT NAME', style: 'tableHeader'},
      {text: 'TAG NAME', style: 'tableHeader'},
      {text: 'WORKED HOURS', style: 'tableHeader'},
    ];

    const colSpan = 4;
    const nestedLayout = {
      fillColor: function (rowIndex) {
        return (rowIndex === 0) ? '#f6f4fd' : '#fbfbfb';
      }
    };
    let table = {};
    let tableValues = [];
    if (data) {
      data.forEach((value, key) => {
        let tagNames = [];
        value.tags.forEach((tag) => {
          tagNames.push(tag.name);
        })
        tableValues.push([
          value.work_user_name,
          value.work_name,
          value.project_name,
          tagNames,
          fnDurationToHoursMinutesSecondsForReports(value.duration),
        ])
      });

      table = {
        widths: [60, 65, 150, 150, 60],
        body: [
          columns,
          ...tableValues
        ],
        headerRows: 1
      }
    }
    return table;
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
    exportDataList.defaultStyle = defaultStyle;
    exportDataList.pageMargins = [15, 15, 15, 15];

    return exportDataList;
  }

//Export PDF functionality
  const handleExportPDF = () => {
    if (toSubmitTasks.length > 0) {
      let docDefinition = getExportDataList(toSubmitTasks);
      let pdfMake = require('pdfmake/build/pdfmake.js');
      let pdfFonts = require('pdfmake/build/vfs_fonts.js');
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      pdfMake.createPdf(docDefinition).download('DailyReport.pdf');
    }
  };

  //Export EXCEL functionality
  const handleExportEXCEL = () => {

    const Excel = require('exceljs');
    if (toSubmitTasks.length > 0) {
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet('DailyReport');

      worksheet.columns = [
        {width: 25}, {width: 25}, {width: 25}, {width: 25}
      ];


      let headerRow = worksheet.addRow([
        'USER NAME',
        'TASK NAME',
        'PROJECT NAME',
        'TAG NAME',
        'WORKED HOURS',
      ]);
      headerRow.eachCell(function (cell) {
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
      toSubmitTasks.forEach(item => {
        let tagNames = [];
        item.tags.forEach((tag) => {
          tagNames.push(tag.name);
        })
        let row = worksheet.addRow([
          item.work_user_name,
          item.work_name,
          item.project_name,
          tagNames,
          fnDurationToHoursMinutesSecondsForReports(item.duration),
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
      });

      workbook.xlsx.writeBuffer().then(function (buffer) {
        const fileDownload = require('js-file-download');
        fileDownload(new Blob([buffer], {type: 'application/octet-stream'}), 'DailyReport.xlsx');
      });
    }
  };

  //Export CSV functionality
  const handleExportCSV = () => {

    if (toSubmitTasks) {
      let tableValues = [];
      const header = ["USER NAME", "TASK NAME", "PROJECT NAME", "TAG NAME", "WORKED HOURS"]
      tableValues.push(header);
      toSubmitTasks.forEach((value, key) => {
        let tagNames = [];
        value.tags.forEach((tag) => {
          tagNames.push(tag.name);
        })
        tableValues.push([
          value.work_user_name,
          value.work_name,
          value.project_name,
          tagNames,
          fnDurationToHoursMinutesSecondsForReports(value.duration),
        ])
      });
      setCsvData(tableValues);
    }

  }

  const getExportListDropdownMenu = () => {
    return (
      <Menu>
        <Menu.Item onClick={handleExportPDF}>PDF</Menu.Item>
        <Menu.Item onClick={handleExportCSV}><CSVLink className={styles['csv-link']}
                                                      data={csvData}>CSV</CSVLink></Menu.Item>
        <Menu.Item onClick={handleExportEXCEL}>XLS</Menu.Item>
      </Menu>
    );
  }

  return (
    <I18n>
      {({i18n}) => (
        <Modal
          closeIcon={
            <span onClick={() => onClose()}
                  className="close-icon">
                  <Icons name="close"/>
                </span>
          }
          title={i18n.t`LET’S FINALIZE`}
          centered
          visible={show}
          footer={null}
          className={styles['report-modal']}
          onOk={onClose}
          onCancel={onClose}
        >
          <div className={styles['modal-content']}>
            <h2 style={{textAlign: 'center', marginButton: 10}}>{selectedDate}</h2>
            <div className={styles['reportHours']}>
              <div className={styles['reportHoursItem']}>
                <div>
                  <div className={styles['reportHoursInput']}>
                    <div>
                      <span className={styles['reportHoursTitle']}>
                        <Trans>Worky hours</Trans>
                      </span>
                    </div>
                    <div className={styles['reportWorkHours']}>
                      <Input placeholder={i18n.t`HOURS`} disabled={true} value={totalDurationObject.hours}/>
                      <Input placeholder={i18n.t`MINUTES`} disabled={true} value={totalDurationObject.minutes}/>
                      <Input placeholder={i18n.t`SECONDS`} disabled={true} value={totalDurationObject.seconds}/>
                    </div>
                    <Dropdown overlay={() => getExportListDropdownMenu()} trigger={['click']} placement="bottomLeft"
                              overlayClassName={styles["exportDropdown"]}>
                      <button
                        className="app-btn primary-btn-outline"
                      >
                        <Trans>EXPORT</Trans>
                        <Icons name="arrowdown2" fill="#808080"/>
                      </button>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles['scrollableSect']}>
              {toSubmitTasks?.length > 0 && toSubmitTasks.map(task => {
                return (
                  <div key={task.work_time_id} className={styles['dFlexCenter']}>
                    <div
                      tabIndex={"0"}
                      className={styles['todayTasks']}
                      key={'task' + task.start_date_time}
                    >
                      <div className={styles['taskTitle']}>
                            <span title={task.work_name}>
                              {task.work_name}
                            </span>
                        <span>
                              {task?.task_description?.length > 0 && <EllipsisOutlined/>}
                            </span>
                      </div>
                      <div className={styles['taskProject']}>
                        <Tooltip placement="top" title={task.project_name}>
                          <Button
                            tabIndex={"-1"}
                            className={styles['reppyBtn']}
                            style={{backgroundColor: task.project_color}}
                          >
                            {task.project_name || <Trans>No Project</Trans>}
                          </Button>
                        </Tooltip>
                        {/*{task.tags.map(item => {*/}
                        {/*  {item.name || <Trans>No Tag</Trans>}*/}
                        {/*})}*/}
                        {task.tags.length ?
                          <Tag activeTagsArray={task?.tags}/>
                          : null}
                      </div>
                      <div className={styles['workHours']}>
                        <span>{moment.parseZone(task.start_date_time).utcOffset(userTimeOffset).format('HH:mm')} - {fnEndTimeText(moment.parseZone(task.start_date_time).utcOffset(userTimeOffset).format(dbDateTimeFormat), moment.parseZone(task.end_date_time).utcOffset(userTimeOffset).format(dbDateTimeFormat))}</span>
                        <span style={{padding: "0 10px"}}
                              className={styles['greyHour']}>{task.duration !== 0 ? moment.utc(task.duration * 1000).format('HH:mm:ss') : fnDurationToHoursMinutesSecondsForReports(moment.duration(moment().diff(moment(task.start_date_time))).asSeconds())}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={styles['reportProjectHours']}>
              <div className={styles['reportHoursInput']}>
                <div>
                  <span className={styles['reportHoursTitle']}>
                    {i18n.t`PROJECT REPORT HOURS`}
                  </span>
                </div>
                <div>
                  <span
                    tabIndex={"0"}
                    onKeyPress={e => e?.charCode === 13 ? handleShowImpute() : null}
                    onClick={handleShowImpute}
                    className={styles['plusIcon']}
                  >
                      <Icons name="plus" fill="#353FDF" style={{marginRight: '15px', cursor: 'pointer'}}/>
                  </span>
                </div>
              </div>
              <div>
                <div className={styles['scrollableSect']}>
                  {
                    inputData && inputData.length > 0 && inputData.map((el) => {
                      return (
                        <ClientReportHour
                          key={el.key}
                          data={el}
                          projects={projects}
                          handleRemoveField={handleRemoveField}
                          handleChangeReportsFields={handleChangeReportsFields}
                          toSubmitTasks={toSubmitTasks}
                        />
                      );
                    })
                  }
                </div>
              </div>
            </div>
            <div className="modal-footer-actions">
              <Button
                className="app-btn primary-btn-outline md"
                shape="round"
                onClick={() => onClose()}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                tabIndex={"0"}
                className="app-btn primary-btn md"
                shape="round"
                onClick={() => onSubmitData(1, inputData)}
              >
                <Trans>Submit</Trans>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </I18n>
  )
}

ReportModal.propTypes = {
  show: PropTypes.bool,
  isSubmittingReport: PropTypes.bool,
  toSubmitTasks: PropTypes.array,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default React.memo(ReportModal);
