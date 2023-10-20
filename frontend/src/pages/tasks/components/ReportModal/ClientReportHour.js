import React, {useState, useRef} from "react";
import style from "./ReportModal.less";
import {I18n} from '@lingui/react';
import {Select} from 'antd';
import Icons from 'icons/icon';

const ClientReportHour = ({projects, data, handleRemoveField, handleChangeReportsFields, toSubmitTasks}) => {
  const [selectedProjectColor, setSelectedProjectColor] = useState({});

  const handleProjectSelect = (value, options) => {
    const {props: {style}} = options;
    setSelectedProjectColor(style)
  }

  const [inputHoursValue, setInputHoursValue] = useState('');
  const [inputMinutesValue, setInputMinutesValue] = useState('');

  const validateNumber = (number) => {
    return /^[0-9]{1,2}$/.test(String(number));
  }

  const filteredProjectsList = toSubmitTasks?.filter((e, index, self) => self.findIndex(t => (t.project_id === e.project_id)) === index);
  return (
    <I18n>
      {({i18n}) => (
        <div className={style['projectReportHours']}>
          <div
            className={`${data.hasOwnProperty("isProjectValid") && !data.isProjectValid && style['validationErrorBorder']} ${style['projectFieldWrapper']}`}>
            <div>
              <Select
                suffixIcon={<Icons name="arrowdown2" fill='#B3B3B3'/>}
                tabIndex={"0"}
                placeholder={i18n.t`Select Project`}
                className={style['project']}
                onChange={ev => handleChangeReportsFields('project', data.key, ev)}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                onSelect={handleProjectSelect}
                style={selectedProjectColor?.color ? selectedProjectColor : {color: "#000"}}
              >
                {filteredProjectsList && filteredProjectsList.map((project, i) => {
                  return (
                    project.project_name ?
                      <Select.Option
                        tabIndex={"0"}
                        key={i}
                        value={project.project_id}
                      >
                        <span className="dot" style={{background: project.project_color}}/>
                        {project.project_name}
                      </Select.Option> : null
                  )
                })
                }
              </Select>
            </div>
            {data.hasOwnProperty("isProjectValid") &&
            !data.isProjectValid &&
            <span className={style['validationMessage']}>
            {i18n.t`Please, add a project.`}
          </span>}
          </div>
          <div className={style['timeFieldWrapper']}>
            <div className={`${style['timeField']}
            ${data &&
            data.hasOwnProperty("isHourValid") &&
            !data.isHourValid &&
            data.hasOwnProperty("isMinutesValid") &&
            !data.isMinutesValid && style['timeValidationError']}`}>
              <input
                onChange={ev => {
                  let hours = ev.target.value;
                  if (!validateNumber(hours)) {
                    hours = "";
                  } else {
                    if (parseInt(hours) > 23) {
                      hours = "23";
                    }
                  }
                  setInputHoursValue(hours);
                  handleChangeReportsFields('hours', data.key, hours);
                }}
                className={style['hour']}
                type="text"
                value={inputHoursValue}
                placeholder={i18n.t`Hours`}
              />
            </div>
            {data && data.hasOwnProperty("isHourValid") &&
            !data.isHourValid && !data.isMinutesValid &&
            <span className={style['validationMessage']}>
              {i18n.t`Please, add an hour or a minute.`}
            </span>
            }
            {data && data.hasOwnProperty("isMinutesValid") &&
            !data.isMinutesValid && !data.isHourValid &&
            <span className={style['validationMessage']}>
              {i18n.t`Please, add an hour or a minute.`}
            </span>
            }
          </div>
          <div className={style['timeFieldWrapper']}>
            <div className={`${style['timeField']} ${
              data &&
              data.hasOwnProperty("isHourValid") &&
              !data.isHourValid &&
              data.hasOwnProperty("isMinutesValid") &&
              !data.isMinutesValid && style['timeValidationError']}`}>
              <input
                onChange={ev => {
                  let minutes = ev.target.value;
                  if (!validateNumber(minutes)) {
                    minutes = "";
                  } else {
                    if (parseInt(minutes) > 59) {
                      minutes = "59";
                    }
                  }
                  setInputMinutesValue(minutes);
                  handleChangeReportsFields('minutes', data.key, minutes);
                }}
                className={style['minute']}
                type="text"
                value={inputMinutesValue}
                placeholder={i18n.t`Minutes`}
              />
            </div>
          </div>
          {/*<CloseOutlined*/}
          {/*  tabIndex={"0"}*/}
          {/*  onKeyPress={e => e?.charCode === 13 ? handleRemoveField(data) : null}*/}
          {/*  onClick={() => handleRemoveField(data)}*/}
          {/*  className={style.closeOutlinedIcon}*/}
          {/*/>*/}
          <span
            tabIndex={"0"}
            onKeyPress={e => e?.charCode === 13 ? handleRemoveField(data) : null}
            onClick={() => handleRemoveField(data)}
            className={style['closeOutlinedIcon']}
          >
            <Icons name="delete" fill="#B6B6B6" style={{cursor: 'pointer', outline: 'none'}}/>
          </span>
        </div>
      )}
    </I18n>
  )
};

ClientReportHour.propTypes = {};

export default React.memo(ClientReportHour);
