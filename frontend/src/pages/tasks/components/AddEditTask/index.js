import React, {useCallback, useEffect, useRef, useState} from "react";
import classes from "./AddEditTask.less"
import {Button, Col, Input, Row, TimePicker, AutoComplete, message} from 'antd';
import Icons from 'icons/icon'
import PropTypes from 'prop-types';
import {
  allTodayBusyTimes,
  fnIsDateToday,
  fnGetBusyHoursMinutes,
  fnGetBusyStartHours,
  fnGetBusyStartMinutes,
  fnGetBusyEndHours,
  fnGetBusyEndMinutes,
  fnCheckAvailableStartEndRange,
} from 'utils';
import moment from 'utils/moment';
import {isColorLikeWhite} from "utils/theme";
import ProjectsDropdown from "../ProjectsDropdown/ProjectsDropdown";
import {CSSTransition, SwitchTransition} from 'react-transition-group';
import store from 'store';
import {intersectionWith, isEqual} from 'lodash';
import useTypeOnTimer from '../../../../components/Hooks/useTypeOnTimer';
import Tag from 'components/Tag';


const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
let timer;
let timerID;


function AddEditTask(props) {
  const {
    latestTask,
    onUpdateActiveTask,
    i18n,
    tagsProps,
    workTimeTags,
    getActiveTags,
    items,
    onHandleTagClick,
    onHandleSelectedTags,
    onSearchForAutoComplete,
    currentTags,
    handleTagDelete,
    _todayBusyTimes,
    todayBusyTimes,
    buttonDisabled,
    selectedDate,
  } = props;
  const [taskName, setTaskName] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [dropdownsData, setDropdownsData] = useState([]);
  const [foundTags, setFoundTags] = useState([]);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
  const [isTimerModeActive, setIsTimerModeActive] = useState(false);
  const [isManualModeActive, setIsManualModeActive] = useState(false);
  const [isProjectModeActive, setIsProjectModeActive] = useState(false);
  const [isDisabledManualBtn, setIsDisabledManualBtn] = useState(false);
  const [isTimerTurnedOn, setIsTimerTurnedOn] = useState(false);
  const [activeTagsArray, setActiveTagsArray] = useState(currentTags);
  const [activeProject, setActiveProject] = useState({});
  const [newDataForAutoComplete, setNewDataForAutoComplete] = useState({});
  const [isTaskNameValid, setIsTaskNameValid] = useState(true);
  const [isWindowLarger, setIsWindowLarger] = useState(false);
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  const [isEnterKeyPressActive, setIsEnterKeyPressActive] = useState(true);
  const [timerValue, setTimerValue] = useState('00:00:00');
  const [isTaskNameMaxLengthValid, setIsTaskNameMaxLengthValid] = useState(null);
  const [enableButton, setEnableButton] = useState(false);
  const [showFromTimer, setShowFromTimer] = useState(false);
  const [showToTimer, setShowToTimer] = useState(false);
  const [isHoursClicked, setIsHoursClicked] = useState(false);
  const [isToday, setIsToday] = useState(false);
  const [isInvalidTimeRange, setIsInvalidTimeRange] = useState(false);
  const [busyHoursMinutes, setBusyHoursMinutes] = useState([]);
  const [busyStartHours, setBusyStartHours] = useState([]);
  const [busyStartMinutes, setBusyStartMinutes] = useState([]);
  const [busyEndHours, setBusyEndHours] = useState([]);
  const [busyEndMinutes, setBusyEndMinutes] = useState([]);

  const [manualStartTime, setManualStartTime] = useState({
    timeStr: "00:00",
    timeObj: moment.parseZone('00:00', 'HH:mm'),
    selected: false
  })
  const [manualEndTime, setManualEndTime] = useState({
    timeStr: "00:00",
    timeObj: moment.parseZone('00:00', 'HH:mm'),
    selected: false
  })

  const inputRef = useRef()
  const timerFromRef = useRef()
  const timerToRef = useRef()

  useTypeOnTimer(timerFromRef, showFromTimer, setShowFromTimer, busyStartHours, busyStartMinutes);
  useTypeOnTimer(timerToRef, showToTimer, setShowToTimer, busyEndHours, busyEndMinutes);

  const pickerInput = document.querySelector(".ant-time-picker-panel-input");

  /*Effects*/
  const resetStartEndTimeRange = () => {
    // resetting start end hours ranges
    setIsInvalidTimeRange(false);
    setBusyHoursMinutes([]);
    setBusyStartHours([]);
    setBusyStartMinutes([]);
    setBusyEndHours([]);
    setBusyEndMinutes([]);
  }

  useEffect(() => {
    setIsToday(fnIsDateToday(selectedDate));
    resetStartEndTimeRange();
  }, [selectedDate])

  useEffect(() => {
    setActiveTagsArray(currentTags)
  }, [currentTags])

  useEffect(() => {
    if (validateTaskName()) {
      setIsDisabledManualBtn(false)
    } else {
      setIsDisabledManualBtn(true)
    }
  }, [taskName, isManualModeActive])

  useEffect(() => {
    const noTaskRunning = () => {
      if (latestTask && Object.values(latestTask).length > 0 && latestTask.end_date_time) {
        countUpTimer(latestTask.created_at, latestTask.start_date_time, latestTask.end_date_time)
        setIsTimerTurnedOn(false);
        if (isTaskRunning) {
          setIsTimerModeActive(true)
        } else {
          setIsTimerModeActive(false)
        }
      } else if (latestTask && Object.values(latestTask).length === 0) {
        setIsTaskRunning(false)
        if (timerID) clearInterval(timerID)
      }
    }
    noTaskRunning()
    return () => {
      noTaskRunning();
      if (timerID) clearInterval(timerID);
    }
  }, [latestTask, latestTask.start_date_time, latestTask.created_at, latestTask.end_date_time, isTaskRunning])
  let dropdownData = [], foundTasks, foundTasksTags;

  useEffect(() => {
    if (latestTask && Object.values(latestTask).length > 0 && !latestTask.end_date_time) {
      setIsTaskRunning(true);
    } else if (latestTask && Object.values(latestTask).length > 0 && latestTask.end_date_time) {
      setIsTaskRunning(false);
    }
  }, [latestTask, latestTask.end_date_time])

  useEffect(() => {
    const taskRunning = () => {
      if (latestTask && Object.values(latestTask).length > 0 && !latestTask.end_date_time && isTaskRunning) {
        if (latestTask && !latestTask.end_date_time && latestTask.work_time_id && workTimeTags && workTimeTags.length > 0 && isTaskRunning) {
          setActiveTagsArray(workTimeTags.filter(workTimeTag => latestTask.work_time_id === workTimeTag.work_time_id))
          getActiveTags(workTimeTags.filter(workTimeTag => latestTask.work_time_id === workTimeTag.work_time_id))
        }

        setActiveProject({
          name: latestTask.project_name,
          id: latestTask.project_id,
          color: latestTask.project_color,
        })
        setIsTimerModeActive(true)
        setIsTimerTurnedOn(true)
        setTaskName(latestTask.name)
        countUpTimer(latestTask.created_at, latestTask.start_date_time, latestTask.end_date_time, "taskRunning");
      }
    }
    taskRunning()
    return () => {
      taskRunning();
      if (timerID) clearInterval(timerID);
    }
  }, [latestTask, latestTask.start_date_time, latestTask.created_at, latestTask.end_date_time, latestTask.work_time_id, latestTask.project_name, latestTask.project_id, latestTask.project_color, workTimeTags, isTaskRunning])

  useEffect(() => {
    if (latestTask && !latestTask.project_id && !latestTask.end_date_time && activeTagsArray && activeTagsArray.length > 0) {
      setIsProjectModeActive(true)
    }

  }, [latestTask, latestTask.project_id, latestTask.end_date_time, latestTask.work_time_id, workTimeTags, activeTagsArray, activeTagsArray.length])

  useEffect(() => {
    const changeProject = () => {
      if (activeProject && activeProject.id && activeProject.name && activeProject.color && latestTask.project_id !== activeProject.id && activeProject.id > 0) {
        switchTimerManualModeAnimation("project", true)
      } else if (activeProject && activeProject.id !== 0 && activeProject.name && activeProject.color) {
        switchTimerManualModeAnimation("project", true)
      }
    }
    changeProject()
    return () => changeProject()
  }, [latestTask.project_id, activeProject, activeProject.id, activeProject.name, activeProject.color, latestTask.project_name, latestTask.project_id, latestTask.project_color])

  useEffect(() => {
    if (activeTagsArray && activeTagsArray.length > 0) {
      if (!isProjectModeActive) {
        setIsProjectModeActive(true)
      }
    }
    if (activeTagsArray && activeTagsArray.length === 0 && activeProject && !activeProject.name && activeProject.id === 0) {
      if (isProjectsDropdownOpen) setIsProjectsDropdownOpen(false)
      if (isManualModeActive) {
        setIsManualModeActive(false)
      }
    }

  }, [activeTagsArray, activeTagsArray.length, isProjectModeActive, activeProject, activeProject.id, activeProject.name])

  useEffect(() => {
    if (!isTaskRunning) {
      setTaskName("")
      setActiveProject({
        id: 0,
        color: "unset",
        name: ""
      })
      setActiveTagsArray([])
      setIsProjectModeActive(false)
      setIsTimerModeActive(false)
      setIsManualModeActive(false)
      setIsEnterKeyPressActive(true)
    }
  }, [isTaskRunning])

  useEffect(() => {
    if (activeProject && activeProject.id === 0) {
      if (activeTagsArray && activeTagsArray.length === 0) {
        setIsProjectModeActive(false)
        if (isProjectsDropdownOpen) setIsProjectsDropdownOpen(false)
      }
    } else if (!activeProject.id && !activeProject.name && activeTagsArray && activeTagsArray.length === 0) {
      switchTimerManualModeAnimation("project", false)
    }
  }, [activeProject, activeTagsArray, activeTagsArray.length])

  useEffect(() => {
    pickerInput?.addEventListener("input", (e) => {
      let val = e.target.value.trim();
      if (val === '') {
        pickerInput.value = ':';
      } else {
        if (val[0] === ':') {
          pickerInput.value = val?.slice(1, 2);
        } else if (val[1] === ':') {
          pickerInput.value = val?.slice(0, 1);
        }
      }
    });
  }, [showFromTimer, pickerInput])

  // Hook
  const useWindowSize = () => {
    const isClient = typeof window === 'object';

    function getSize() {
      return {
        width: isClient ? window.innerWidth : undefined,
        height: isClient ? window.innerHeight : undefined
      };
    }

    const [windowSize, setWindowSize] = useState(getSize);

    const handleManualTimeHourClick = (e) => {
      const selectedOptionListEl = e.target.closest(".ant-time-picker-panel-select");
      if (selectedOptionListEl) {
        const parentEL = selectedOptionListEl.parentElement;
        //antd doesnt provide with an option to work with the minute dropdown so we use this manually
        const isHoursClicked = parentEL.querySelectorAll(".ant-time-picker-panel-select")[0] === selectedOptionListEl ||
                               parentEL.querySelectorAll(".ant-time-picker-panel-select")[1] === selectedOptionListEl;
        setIsHoursClicked(isHoursClicked);
      } else {
        setIsHoursClicked(false);
      }
    }

    useEffect(() => {
      if (!isClient) {
        return false;
      }

      function handleResize() {
        setWindowSize(getSize());
      }

      window.addEventListener('resize', handleResize);
      window.addEventListener('mousedown', handleManualTimeHourClick);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousedown', handleManualTimeHourClick);
      }
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return windowSize;
  }

  const size = useWindowSize();

  useEffect(() => {
    if (size.width > 1400) {
      setIsWindowLarger(true)
    }
  }, [size])

  /*Methods*/

  const validateTaskName = () => {
    if (taskName && taskName.trim().length > 190) {
      setIsTaskNameMaxLengthValid(false)
    } else {
      setIsTaskNameMaxLengthValid(true)
    }
    return typeof taskName === "string" && taskName && taskName.trim().length > 0 && taskName.length < 191
  }

  const handleSave = (timer = false) => {
    if (isProjectsDropdownOpen) setIsProjectsDropdownOpen(false)
    const {item = {}, onSave, currentItem, startValue, endValue} = props;
    const user = store.get('user');
    const values = {}
    values.name = taskName;
    values.tag_id = activeTagsArray.map(tag => tag.id);
    values.start_date_time = startValue ? startValue.format(dbDateTimeFormat) : moment().utcOffset(user.time_offset).format(dbDateTimeFormat);
    values.end_date_time = endValue ? endValue.format(dbDateTimeFormat) : null;
    values.project_id = activeProject && activeProject.id ? activeProject.id : 0;
    values.project_color = activeProject.color;
    values.project_name = activeProject.name;

    if (currentItem.id) {
      values.id = currentItem.id;
      values.work_time_id = currentItem.work_time_id;
    } else {
      values.id = null;
      values.work_time_id = null;
    }
    if (values.work_time_id && !values.end_date_time) { // stopping the work
      values.end_date_time = moment().format(dbDateTimeFormat);
    }
    const data = {
      ...values,
      key: item.key,
    };
    if (validateTaskName()) {
      onSave(data, timer);
      setIsTaskRunning(true)
    }
  };

  const countUpTimer = (creationTime, startTime, stopTime) => {
    let resultTime;
    const userTimeOffset = store.get('user')?.time_offset || '+00:00';
    if (timerID) {
      setTimerValue(timerValue)
      clearInterval(timerID);
    }
    if ((creationTime === startTime || creationTime !== startTime) && !stopTime) {
      timerID = setInterval(() => {
        resultTime = moment.duration(moment.parseZone().diff(moment.parseZone(startTime).utcOffset(userTimeOffset))).asSeconds();
        let seconds = parseInt(resultTime);
        let format = moment.utc(seconds * 1000).format('HH:mm:ss');
        setTimerValue(format)
      }, 1000)
    }
    setTimerValue("00:00:00");
  };

  const projectDropdownProps = () => {
    return {
      show: isProjectsDropdownOpen,
      currentProject: activeProject,
      onClose: handleProjectsDropdownClose,
      onChange: handleProjectClick,
      onChangeTag: handleTagClick,
      onDelete: handleTagDelete,
      projects: props.projects,
      allTags: props.allTags,
      tagsProps,
      activeTagsArray,
      handleSelectedTags: selectedTagsFromAddTagModal,
      workTimeTags
    }
  };

  const selectedTagsFromAddTagModal = selectedTags => {
    setIsProjectsDropdownOpen(false)
    onHandleSelectedTags(selectedTags)
    setActiveTagsArray(selectedTags)
  }

  const handleProjectsDropdownClick = e => {
    e.stopPropagation()
    setIsProjectsDropdownOpen(prevState => !prevState)
  };
  const handleProjectsDropdownEnter = e => {
    e.stopPropagation();
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 13) {
      setIsProjectsDropdownOpen(prevState => !prevState)
    }
  }
  const handleProjectsDropdownClose = () => {
    setIsProjectsDropdownOpen(false)
  };

  const handleProjectClick = (project) => {
    const {activeTask} = props;
    if (isTimerModeActive) {
      onUpdateActiveTask({
        action: "changeActiveTaskProject",
        projectId: project.id,
        taskName: activeTask.name ? activeTask.name : taskName
      })
    }
    setActiveProject({
      name: project.name,
      id: project.id,
      color: project.color,
    })
    if (project && project.id !== 0) {
      if (!isProjectModeActive) {
        switchTimerManualModeAnimation("project", true)
      }
    } else {
      switchTimerManualModeAnimation("project", false)
    }
  };

  const handleTagClick = (tag) => {
    const {activeTask} = props;
    let toSendTaskName = activeTask.name ? activeTask.name : taskName;
    setIsProjectModeActive(true)
    onHandleTagClick(tag, activeTask.project_id, toSendTaskName)
    if (!(activeTagsArray.filter(item => {
      let currentTagKey = !item.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
      return tag.id === item[currentTagKey];
    }).length > 0)) {
      setActiveTagsArray(prevState =>
        [
          ...prevState,
          {
            name: tag.name,
            id: tag.id,
            color: tag.color
          }
        ])
    } else {
      setActiveTagsArray(prevState => prevState.filter(item => {
        let currentTagKey = !item.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
        return tag.id !== item[currentTagKey]
      }));
    }
  }

  const handleTaskNameChange = useCallback(e => {
    const taskNameValue = e
    setIsTaskNameValid(true)
    setTaskName(taskNameValue)
  }, [])

  const switchTimerManualModeAnimation = (animationMode, hideActiveTimerMode) => {
    if (animationMode === "timer") {
      setTimerValue("00:00:00")
      if (validateTaskName()) {
        handleSave(true);
        setIsTaskNameValid(true)
        if (!buttonDisabled) {
          setEnableButton(true)
        }
        setTimeout(() => {
          setEnableButton(false)
        }, 0)
      }
    } else if (animationMode === "manual") {
      setIsManualModeActive(hideActiveTimerMode);

      const busyHoursMinutes = fnGetBusyHoursMinutes(isToday, _todayBusyTimes, {});
      setBusyHoursMinutes(busyHoursMinutes);
      setBusyStartHours(fnGetBusyStartHours(busyHoursMinutes));

      const userTimeOffset = store.get('user')?.time_offset || '+00:00';
      const _selectedDate = moment.parseZone(selectedDate).utcOffset(userTimeOffset).format('YYYY-MM-DD');
      const _startTime = _selectedDate + ' ' + manualStartTime.timeObj.format('HH:mm');
      const _endTime = _selectedDate + ' ' + manualEndTime.timeObj.format('HH:mm');
      const isAllowed = fnCheckAvailableStartEndRange(_startTime, _endTime, _todayBusyTimes, isToday);
      setIsInvalidTimeRange(!isAllowed);
    } else if (animationMode === "project" && hideActiveTimerMode) {
      if (activeProject.id !== 0 && activeProject.name) {
        setIsProjectModeActive(true)
      } else if (activeTagsArray && activeTagsArray.length > 0) {
        setIsProjectModeActive(true)
      }
    } else {
      setIsProjectModeActive(false)
    }
  }

  const clearForm = () => {
    setTaskName("")
    setActiveProject({
      id: 0,
      color: "unset",
      name: ""
    })
    setIsProjectModeActive(false)
    setIsTimerModeActive(false)
    setIsManualModeActive(false)
  };

  /*Timer mode*/

  const handleStopTimer = (e, latestTask) => {
    e.stopPropagation()
    const {onStartOrPause} = props;
    setIsTimerTurnedOn(false)
    setActiveProject({
      id: 0,
      color: "unset",
      name: ""
    })
    setActiveTagsArray([])
    setIsProjectModeActive(false)

    if (latestTask && Object.keys(latestTask).length > 0 && !latestTask.end_date_time) {
      const duration = moment.utc(timerValue, 'HH:mm:ss'),
        seconds = duration.clone().startOf('day');
      let lastTask = {...latestTask};
      lastTask.duration = duration.diff(seconds, 'seconds');
      lastTask.name = (taskName && latestTask?.name !== taskName) ? taskName : latestTask?.name;
      lastTask.project_id = latestTask?.project_id !== activeProject?.id ? activeProject?.id : latestTask.project_id;
      lastTask.tagIds = activeTagsArray?.length > 0 ? activeTagsArray.map(activeTag => {
        let currentTagKey = !activeTag.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
        return activeTag[currentTagKey]
      }) : [];
      lastTask.tag_id = activeTagsArray?.length > 0 ? activeTagsArray.map(activeTag => {
        let currentTagKey = !activeTag.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
        return activeTag[currentTagKey]
      }) : [];

      if (lastTask && lastTask?.id && lastTask?.work_time_id) {
        onStartOrPause(lastTask)
        setIsTaskRunning(false)
      }
    }
  }

  /*Manual mode*/

  const handleManualFormChanged = (manualEndDateTime = manualEndTime.timeObj) => {
    process.nextTick(() => {
      if (taskName.trim().length > 0 && moment(manualEndDateTime, 'HH:mm').isAfter(moment(manualStartTime.timeObj, 'HH:mm'))) {
        setIsDisabledManualBtn(false)
      } else {
        setIsDisabledManualBtn(true)
      }
    })
  }

  const getSelectedTaskTimes = (startDate, endDate) => {
    const startDateTime = moment(startDate.format('YYYY-MM-DD HH:mm:ss')).utc().format('YYYY-MM-DD HH:mm:ss');
    const endDateTime = moment(endDate.format('YYYY-MM-DD HH:mm:ss')).utc().format('YYYY-MM-DD HH:mm:ss');

    return allTodayBusyTimes([
      {
        start_date_time: startDateTime,
        end_date_time: endDateTime
      }
    ]);
  }

  const validateSelectedTaskTimes = (selectedTaskTimes) => {
    if (todayBusyTimes && Object.keys(todayBusyTimes).length > 0) {
      for (let [hour, minutes] of Object.entries(todayBusyTimes)) {
        if (Object.keys(selectedTaskTimes).length > 0) {
          for (let [_hour, _minutes] of Object.entries(selectedTaskTimes)) {
            if (_hour === hour) {
              if (_minutes instanceof Array && minutes instanceof Array) {
                let presents = intersectionWith(_minutes, minutes, isEqual);
                if (presents.length > 0) {
                  return false
                }
              }
            }
          }
        }
      }
    }
    return true;
  }

  const manualStartTimeChange = (timeObj, timeStr) => {
    const userTimeOffset = store.get('user').time_offset || '+00:00';
    const _selectedDate = moment.parseZone(selectedDate).utcOffset(userTimeOffset).format('YYYY-MM-DD');
    const _startTime = _selectedDate + ' ' + timeStr;
    const _endTime = _selectedDate + ' ' + manualEndTime.timeObj.format('HH:mm');
    const isAllowed = fnCheckAvailableStartEndRange(_startTime, _endTime, _todayBusyTimes, isToday);
    setIsInvalidTimeRange(!isAllowed);
    const _busyStartMinutes = fnGetBusyStartMinutes(_startTime, busyHoursMinutes);
    setBusyStartMinutes(_busyStartMinutes);
    setBusyEndHours(fnGetBusyEndHours(_startTime, busyHoursMinutes, _busyStartMinutes));

    setManualStartTime({
      timeStr,
      timeObj,
      selected: true
    })
    handleManualFormChanged();
    !isHoursClicked && timeStr && selectTimePicker();
  };

  const selectTimePicker = () => {
    setShowFromTimer(false);
    setShowToTimer(true);
  }

  const manualEndTimeChange = (timeObj, timeStr) => {
    const userTimeOffset = store.get('user').time_offset || '+00:00';
    const _selectedDate = moment.parseZone(selectedDate).utcOffset(userTimeOffset).format('YYYY-MM-DD');
    const _endTime = _selectedDate + ' ' + timeStr;
    const _startTime = _selectedDate + ' ' + manualStartTime.timeObj.format('HH:mm');
    const isAllowed = fnCheckAvailableStartEndRange(_startTime, _endTime, _todayBusyTimes, isToday);
    setIsInvalidTimeRange(!isAllowed);
    const _busyEndMinutes = fnGetBusyEndMinutes(_startTime, _endTime, busyHoursMinutes);
    setBusyEndMinutes(_busyEndMinutes);

    setManualEndTime({
      timeStr,
      timeObj,
      selected: true
    })
    handleManualFormChanged(timeObj);
  }

  const handleSaveManualMode = (e) => {
    e.stopPropagation()
    if (isInvalidTimeRange) {
      message.error(i18n.t`Invalid Start-End time range`);
      return;
    }
    const {onStartOrPause} = props;
    const startTime = moment(manualStartTime.timeObj, 'HH:mm');
    const endTime = moment(manualEndTime.timeObj, 'HH:mm');
    const selectedTaskTimes = getSelectedTaskTimes(startTime, endTime);

    if (endTime < startTime || !validateSelectedTaskTimes(selectedTaskTimes)) {
      message.error(i18n.t`Invalid task times`);
      return;
    }

    const values = {};
    values.tagIds = activeTagsArray.map(tag => tag.id)
    values.tag_id = activeTagsArray.map(tag => tag.id)
    values.name = taskName
    values.project_id = activeProject && activeProject.id ? activeProject.id : 0;
    values.start_date_time = manualStartTime.timeStr;
    values.end_date_time = manualEndTime.timeStr;
    values.duration = moment(values.end_date_time, 'HH:mm').diff(moment(values.start_date_time, 'HH:mm')) / 1000;
    if (validateTaskName()) {
      onStartOrPause(values, 'manual');
    }
    setActiveTagsArray([])
    switchTimerManualModeAnimation("project", false)
    clearForm()
    setManualStartTime({
      timeStr: "00:00",
      timeObj: moment('00:00', 'HH:mm')
    })
    setManualEndTime({
      timeStr: "00:00",
      timeObj: moment('00:00', 'HH:mm')
    });
    resetStartEndTimeRange();
  };

  const handleEnterPress = (e) => {
    if (isProjectsDropdownOpen) setIsProjectsDropdownOpen(false)
    if (items && Array.isArray(items) && items.length > 0) {
      if (latestTask && latestTask.end_date_time) {
        if (e && e.charCode && e.charCode === 13) {
          if (taskName) {
            setIsEnterKeyPressActive(false)
            handleSave(true)
          }
        }
      }
    } else if (items && Array.isArray(items) && items.length === 0) {
      if (e && e.charCode && e.charCode === 13) {
        if (taskName) {
          setIsEnterKeyPressActive(false)
          handleSave(true)
        }
      }
    }
  }

  function onSelect(taskNameValue, tasksData, dropdownsData) {
    let tags = [];
    let work_id;
    dropdownsData.map(item => {
      if (item.name === taskNameValue) {
        work_id = item.id;
      }
    })
    tasksData.map(data => {
      if (data.work_id === work_id) {
        setActiveProject({
          name: data.project,
          id: data.project_id,
          color: data.project_color,
        })
        taskNameValue = data.name;
        foundTags.map(allWorkTimeTag => {
          if (allWorkTimeTag.work_times_tags_id === data.work_id) {
            tags.push({
              name: allWorkTimeTag.tags_name,
              id: allWorkTimeTag.tag_id,
              color: allWorkTimeTag.tags_color
            })
          }
        })
      }
    })


    tags = Array.from(new Set(tags.map(JSON.stringify))).map(JSON.parse);
    setActiveTagsArray(tags)
    setIsTaskNameValid(true);
    setTaskName(taskNameValue);
  }

  const handleSearch = (value) => {
    window.clearTimeout(timer);
    let project_name = '', project_id = '', project_color = '';
    let tag_name = [], tag_id = [], tag_color = [];
    let task_name;
    let data = [];
    timer = window.setTimeout(function () {
      const {onSearchForAutoComplete} = props;
      let foundTasksAndTags = onSearchForAutoComplete(value);
      foundTasksAndTags.then(result => {
          foundTasksTags = result.foundTasksTags;
          foundTasks = result.foundTasks;
          foundTasks && foundTasks.map((item) => {
            if (item.name && item.name.toLowerCase().includes(value.toLowerCase())) {
              project_name = item.project_name ? item.project_name : '';
              project_id = item.project_id ? item.project_id : '';
              project_color = item.project_color ? item.project_color : '';
              task_name = item.name;
              let tags_name = '';
              foundTasksTags.length ? foundTasksTags.map(tags => {
                if (item.work_time_id === tags.work_times_tags_id) {
                  tags_name += tags.tags_name + ' ';
                  tag_name.push(tags.tags_name);
                  tag_id.push(tags.tag_id);
                  tag_color.push(tags.color);
                  data.push({
                    name: item.name,
                    work_id: item.work_time_id,
                    tag_name: tag_name,
                    tag_id: tag_id,
                    tag_color: tag_color,
                    project: project_name,
                    project_id: project_id,
                    project_color: project_color,
                  });
                } else {
                  data.push({
                    name: item.name,
                    work_id: item.work_time_id,
                    project: project_name,
                    project_id: project_id,
                    project_color: project_color,
                  });
                }
              }) : data.push({
                name: item.name,
                work_id: item.work_time_id,
                project: project_name,
                project_id: project_id,
                project_color: project_color,
              });
              if (dropdownData.filter(e => e.name === item.name + ' ' + project_name + ' ' + tags_name).length === 0) {
                dropdownData.push({
                  id: item.work_time_id,
                  name: item.name + ' ' + project_name + ' ' + tags_name,
                  tasksName: item.name,
                  projectName: project_name,
                  projectColor: project_color,
                  tagsName: tags_name
                });
              }
            } else if (!item.name) {
              item.map(groupedItem => {
                if (groupedItem.name && groupedItem.name.toLowerCase().includes(value.toLowerCase())) {
                  project_name = groupedItem.project_name ? groupedItem.project_name : '';
                  project_id = groupedItem.project_id ? groupedItem.project_id : '';
                  project_color = groupedItem.color ? groupedItem.color : '';
                  task_name = groupedItem.name;
                  let tags_name = '';
                  foundTasksTags.length ? foundTasksTags.map(tags => {
                    if (groupedItem.work_time_id === tags.work_times_tags_id) {
                      tags_name += tags.tags_name + ' ';
                      tag_name.push(tags.tags_name);
                      tag_id.push(tags.tag_id);
                      tag_color.push(tags.tags_color);
                      data.push({
                        name: groupedItem.name,
                        work_id: groupedItem.work_time_id,
                        tag_name: tag_name,
                        tag_id: tag_id,
                        tag_color: tag_color,
                        project: project_name,
                        project_id: project_id,
                        project_color: project_color,
                      });
                    } else {
                      data.push({
                        name: groupedItem.name,
                        work_id: groupedItem.work_time_id,
                        project: project_name,
                        project_id: project_id,
                        project_color: project_color,
                      });
                    }
                  }) : data.push({
                    name: groupedItem.name,
                    work_id: groupedItem.work_time_id,
                    project: project_name,
                    project_id: project_id,
                    project_color: project_color,
                  });
                  if (dropdownData.filter(e => e.name === item.name + ' ' + project_name + ' ' + tags_name).length === 0) {
                    dropdownData.push({
                      id: item.work_time_id,
                      name: item.name + ' ' + project_name + ' ' + tags_name,
                      tasksName: item.name,
                      projectName: project_name,
                      projectColor: project_color,
                      tagsName: tags_name
                    });
                  }
                }
              })
            }
          });
          setDropdownsData([...dropdownData]);
          setFoundTags(foundTasksTags);
          setDataSource(dropdownData);
          setNewDataForAutoComplete(data);
        }
      ).catch(console.error);
    }, 1000);
  };

  const renderOption = (item) => {
    return (
      <AutoComplete.Option key={item.id} text={item.name} value={item.name}>
        {item?.tasksName && <span>{item?.tasksName}</span>}
        {(item?.projectName && item?.projectColor) &&
        <span className={classes.sectionWrapper}>
            <span className={classes.projectsSection}>
              <span
                className={`
                ${classes.colorIndicatorSearch}
                ${item && item?.projectColor && isColorLikeWhite(item?.projectColor) ? classes.projectBlackIndicator : null}`}
                style={{
                  backgroundColor: item &&
                  item?.projectColor
                    ? item?.projectColor
                    : "unset"
                }}/>
              <span
                tabIndex="0"
                title={item?.projectName ? item?.projectName : null}
                className={classes['project-name']}>{item?.projectName ? item?.projectName : null}
              </span>
            </span>
          </span>
        }
        {item?.tagsName && <span className={classes.sectionWrapper}>{item?.tagsName}</span>}
      </AutoComplete.Option>
    );
  }

  const onChangeActiveTaskName = (newTaskName) => {
    const {activeTask} = props;

    if (activeTask.id && activeTask.name.trim() !== newTaskName.trim()) {
      onUpdateActiveTask({
        taskName: newTaskName,
        projectId: activeTask.project_id,
        action: "changeActiveTaskName"
      })
    }

  }

  return (
    <div className={classes['add-edit-task']}>
      <Row
        type="flex"
        align="middle"
        justify="start"
        gutter={[24, 32]}
      >
        <Col className="gutter-row col-animate searchField" lg={isManualModeActive ? 9 : 7} xl={isManualModeActive ? 7 : 9}>
          <div className={classes.sectionWrapper}>
            <AutoComplete
              ref={inputRef}
              dataSource={dataSource.map(item => renderOption(item))}
              className="auto-complete-input w-100"
              onSelect={(e) => onSelect(e, newDataForAutoComplete, dropdownsData)}
              onSearch={handleSearch}
              title={taskName}
              onBlur={onChangeActiveTaskName}
              onChange={e => handleTaskNameChange(e)}
              optionLabelProp="text"
              value={taskName}
              placeholder={i18n.t`task_name`}
              children={
                <Input
                  onKeyPress={isEnterKeyPressActive ? handleEnterPress : null}
                />}
            />
            {
              <div className="error-message" style={{
                position: "absolute",
                margin: 0
              }}>{!isTaskNameMaxLengthValid && i18n.t`Task name cannot be longer than 191 characters.`}</div>
            }
          </div>
        </Col>
        <Col className={`gutter-row col-animate tasksModeSection add-project-button`} lg={6} xl={5}>
          <SwitchTransition>
            <CSSTransition
              in={isTimerModeActive}
              classNames="timerAnim0"
              key={isProjectModeActive ? 'show-project' : 'hide-project'}
              timeout={0}
            >
              {!isProjectModeActive &&
              activeTagsArray &&
              activeTagsArray.length === 0 &&
              activeProject &&
              (!activeProject.name || activeProject.name === null)
                ?
                (
                  <div
                    tabIndex="0"
                    onKeyPress={e => handleProjectsDropdownEnter(e)}
                    className={classes['task-bar-item']}
                    onClick={e => handleProjectsDropdownClick(e)}>
                      <span className={classes['icon-wrapper']}>
                        <Icons name="folders" fill="#4A54FF"/>
                      </span>
                    <span className={classes['task-bar-text']}>{i18n.t`ADD PROJECT`}</span>
                    <ProjectsDropdown {...projectDropdownProps()}/>
                  </div>
                )
                :
                (
                  <div
                    onClick={e => handleProjectsDropdownClick(e)}
                    onKeyPress={e => handleProjectsDropdownEnter(e)}
                    className={`${classes.activeProjectWrapper} ${classes.sectionWrapper}`}>
                    <div className={classes.tagsProjectsWrapper}>
                  <span className={classes.projectsSection}>
                  <span
                    className={`
                      ${classes.colorIndicator}
                      ${activeProject && activeProject.color && isColorLikeWhite(activeProject?.color) ? classes.projectBlackIndicator : null}`}
                    style={{
                      backgroundColor: activeProject &&
                      activeProject.color
                        ? activeProject.color
                        : "#B3B3B3"
                    }}/>
                    <span
                      tabIndex="0"
                      title={activeProject && activeProject.name ? activeProject.name : 'No project'}
                      className={classes.activeProjectName}
                      style={{color: !activeProject.color && "#B3B3B3"}}
                    >
                      {activeProject && activeProject.color ? activeProject.name : 'No project'}
                    </span>
                  </span>
                      <Tag activeTagsArray={activeTagsArray}/>
                    </div>
                    <ProjectsDropdown {...projectDropdownProps()}/>
                  </div>
                )
              }
            </CSSTransition>
          </SwitchTransition>
        </Col>
        <Col className={`gutter-row col-animate ${isManualModeActive ? classes['timer-mode-hide'] : ''} tasksModeSection middleButton`} lg={5}>
          <SwitchTransition>
            <CSSTransition
              in={isTimerModeActive}
              classNames="timerAnim0"
              key={isTimerModeActive ? 'show-timer' : 'hide-timer'}
              timeout={0}
            >
              <div className={classes['timer-mode-wrapper']}>
                {
                  !isTimerModeActive || enableButton ? (
                      <Button
                        tabIndex={!taskName ? "-1" : "0"}
                        className={classes['task-bar-item']}
                        title={!taskName ? i18n.t`Task name field is required` : null}
                        onClick={() => switchTimerManualModeAnimation("timer", true)}
                        disabled={!isToday || isManualModeActive || !taskName.trim().length || isDisabledManualBtn || enableButton}
                        type="link">
                          <span
                            className={classes['icon-wrapper']}>
                            <Icons name="play" fill="#4A54FF"/>
                          </span>
                        <span
                          className={classes['task-bar-text']}>
                            {i18n.t`TIMER MODE`}
                          </span>
                      </Button>
                    )
                    :
                    (
                      <div>
                        {
                          isTimerTurnedOn &&
                          latestTask &&
                          !latestTask.end_date_time &&
                          <Button
                            tabIndex={!taskName ? "-1" : "0"}
                            className={classes['task-bar-item']}
                            onKeyPress={e => e?.charCode === 13 ? handleStopTimer(e, latestTask) : null}
                            onClick={(e) => handleStopTimer(e, latestTask)}
                            type="link"
                          >
                            <span
                              className={classes['icon-wrapper']}
                            >
                              <Icons name="pause" fill="#4A54FF"/>
                            </span>
                            <span
                              className={`${classes['task-bar-text']} ${classes['task-timer']}`}>
                              {
                                timerValue ?? ''
                              }
                            </span>
                          </Button>
                        }
                      </div>
                    )
                }
              </div>
            </CSSTransition>
          </SwitchTransition>
        </Col>
        <Col className={`gutter-row col-animate ${isManualModeActive ? classes['manual-mode-active'] : ''} tasksModeSection`} lg={isManualModeActive ? 7 : 5}>
          <SwitchTransition>
            <CSSTransition
              in={isManualModeActive}
              classNames="timerAnim0"
              key={isManualModeActive ? 'show-timer' : 'hide-timer'}
              timeout={0}
            >
              {
                !isManualModeActive
                  ?
                  (
                    <Button
                      tabIndex={isTimerModeActive || !taskName ? "-1" : "0"}
                      title={!taskName ? i18n.t`Task name field is required` : null}
                      onClick={() => switchTimerManualModeAnimation("manual", true)}
                      disabled={isTimerModeActive || !taskName}
                      type="link"
                      className={classes['task-bar-item']}
                    >
                      <span
                        className={classes['icon-wrapper']}
                      >
                        <Icons name="manualEdit" fill="#4A54FF"/>
                      </span>
                      <span
                        className={classes['task-bar-text']}>
                        {i18n.t`MANUAL MODE`}
                      </span>
                    </Button>
                  )
                  :
                  (
                    <div
                      className={classes['manual-mode-wrapper']}
                    >
                      <div className={classes['manual-mode-time-pickers']}>
                        <span
                          className="app-time-picker"
                          onClick={e => e.stopPropagation()}>
                          <TimePicker
                            ref={timerFromRef}
                            open={showFromTimer}
                            placeholder={manualStartTime.timeStr ? manualStartTime.timeStr : ""}
                            defaultValue={manualStartTime.timeObj}
                            value={manualStartTime.timeObj}
                            className={isInvalidTimeRange ? `invalid-time-range` : ``}
                            popupClassName="app-time-picker-dropdown"
                            onOpenChange={(e) => setShowFromTimer(e)}
                            format={"HH:mm"}
                            disabledHours={() => busyStartHours}
                            disabledMinutes={() => busyStartMinutes}
                            onChange={(timeObj, timeStr) => manualStartTimeChange(timeObj, timeStr)}
                          />
                        </span>
                        <span
                          className="app-time-picker"
                          onClick={e => e.stopPropagation()}>
                          <TimePicker
                            onClick={selectTimePicker}
                            ref={timerToRef}
                            open={showToTimer}
                            placeholder={manualEndTime.timeStr ? manualEndTime.timeStr : ""}
                            defaultValue={manualEndTime.timeObj}
                            className={isInvalidTimeRange ? `invalid-time-range` : ``}
                            popupClassName="app-time-picker-dropdown"
                            value={manualEndTime.timeObj}
                            onOpenChange={(e) => setShowToTimer(e)}
                            format={"HH:mm"}
                            disabledHours={() => busyEndHours}
                            disabledMinutes={() => busyEndMinutes}
                            onChange={(timeObj, timeStr) => manualEndTimeChange(timeObj, timeStr)}
                          />
                        </span>
                      </div>
                      <div className={classes['manual-mode-actions']}>
                        <Button
                          disabled={isDisabledManualBtn || isInvalidTimeRange}
                          type="link"
                          className={classes['manual-mode-actions-text']}
                          onClick={e => handleSaveManualMode(e)}
                        >
                          {i18n.t`Add`}
                        </Button>
                        <Button
                          type="link"
                          className={classes['manual-mode-actions-text']}
                          onClick={() => switchTimerManualModeAnimation("manual", false)}>
                          {i18n.t`Cancel`}
                        </Button>
                      </div>
                    </div>
                  )
              }
            </CSSTransition>
          </SwitchTransition>
        </Col>
      </Row>
    </div>
  )
}

AddEditTask.propTypes = {
  onAdd: PropTypes.func,
  form: PropTypes.object,
  filter: PropTypes.object,
  onFilterChange: PropTypes.func,
  onSetEndOpen: PropTypes.func,
  onSetStartValue: PropTypes.func,
  onSetEndValue: PropTypes.func,
  onClearForm: PropTypes.func,
  onSearchForAutoComplete: PropTypes.func,
};

export default React.memo(AddEditTask)
