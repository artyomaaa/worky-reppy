import styles from "./UpdateWorkModal.less";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, Form, Input, Modal, Popover, TimePicker} from "antd";
import FormItem from "antd/es/form/FormItem";
import moment from 'utils/moment';
import store from 'store';
import {appUrl} from 'utils/config';
import {isColorLikeWhite} from 'utils/theme';
import ProjectsDropdown from "../ProjectsDropdown/ProjectsDropdown";
import {EditCalendarIcon, EditClockIcon} from 'icons/antd';
import {ClockCircleOutlined} from "@ant-design/icons";
import {Trans} from "@lingui/react";
import CommentView from "./CommentView";
import {
  fnDurationToHoursMinutesSecondsText, allTodayBusyTimes,
  fnIsDateToday,
  fnGetBusyHoursMinutes,
  fnGetBusyStartHours,
  fnGetBusyStartMinutes,
  fnGetBusyEndHours,
  fnGetBusyEndMinutes,
  fnCheckAvailableStartEndRange,
  getResizedImage,
} from 'utils';
import {TIME_UNITS} from 'utils/constant';
import classnames from "classnames";
import useTypeOnTimer from 'components/Hooks/useTypeOnTimer';
import Icons from 'icons/icon';
import Tag from 'components/Tag';
import classes from "../AddEditTask/AddEditTask.less";

const {TextArea} = Input;
const timeFormat = 'HH:mm';
const {END_HOUR_TIME} = TIME_UNITS;

function UpdateWorkModal(
  {
    state,
    getFieldDecorator,
    i18n,
    onClose,
    handleEditComment,
    handleEditBtnClick,
    handleDeleteComment,
    handleProjectsDropdownClick,
    projectDropdownProps,
    updateWork,
    addComment,
    handleChangeAddComment,
    loadMoreComments,
    handleReply,
    handlePostBtnClick,
    workedToday,
    form,
    onCancelEdit,
    onCancelReply,
    _todayBusyTimes,
    todayBusyTimes,
    runningTaskStartTime,
    workTimeTags,
    selectedDate
  }) {
  const userTimeOffset = store.get('user').time_offset;
  const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

  const {
    isModalVisible,
    user,
    activeProject,
    activeTagsArray,
    activeWork,
    reply,
    addCommentText,
    repliedText,
    showMainTxt,
  } = state;
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isEditBtnDisabled, setIsEditBtnDisabled] = useState(false);
  const [showFromTimer, setShowFromTimer] = useState(false);
  const [showToTimer, setShowToTimer] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);
  const addCommentRef = React.useRef();
  const timerFromRef = useRef();
  const timerToRef = useRef();
  let onGoingTask = activeWork && activeWork.end_date_time === null;
  const [isToday, setIsToday] = useState(false);
  const [isInvalidTimeRange, setIsInvalidTimeRange] = useState(false);
  const [busyHoursMinutes, setBusyHoursMinutes] = useState([]);
  const [busyStartHours, setBusyStartHours] = useState([]);
  const [busyStartMinutes, setBusyStartMinutes] = useState([]);
  const [busyEndHours, setBusyEndHours] = useState([]);
  const [busyEndMinutes, setBusyEndMinutes] = useState([]);
  const [isHoursClicked, setIsHoursClicked] = useState(false);

  useTypeOnTimer(timerFromRef, showFromTimer, setShowFromTimer, busyStartHours, busyStartMinutes);
  useTypeOnTimer(timerToRef, showToTimer, setShowToTimer, busyEndHours, busyEndMinutes);

  const resetStartEndTimeRange = () => {
    // resetting start end hours ranges
    setIsInvalidTimeRange(false);
    setBusyHoursMinutes([]);
    setBusyStartHours([]);
    setBusyStartMinutes([]);
    setBusyEndHours([]);
    setBusyEndMinutes([]);
  };

  useEffect(() => {
    setIsToday(fnIsDateToday(selectedDate));
    resetStartEndTimeRange();
  }, [selectedDate])

  useEffect(() => {
    activeTagsArray.forEach(e => {
      if (workTimeTags.find(x => x?.tag_id === e.id && x?.name !== e.name)?.name) {
        e.name = workTimeTags.find(x => x?.tag_id === e.id && x?.name !== e.name)?.name
      } else if (workTimeTags.find(x => x?.tag_id === e.id && x?.color !== e.color)?.color) {
        e.color = workTimeTags.find(x => x?.tag_id === e.id && x?.color !== e.color)?.color
      }
    })
  })

  useEffect(() => {
    form.setFieldsValue({
      name: activeWork.work_name,
      description: activeWork.description,
    });
  }, [activeWork])

  useEffect(() => {
    if (!showMainTxt && addCommentRef?.current) {
      addCommentRef.current.handleReset()
    }
  }, [showMainTxt])

  const handleTimeHourClick = (e) => {
    const selectedOptionListEl = e.target.closest(".ant-time-picker-panel-select");
    if (selectedOptionListEl) {
      const parentEL = selectedOptionListEl.parentElement;
      //antd doesnt provide with an option to work with the minute dropdown so we use this manually
      const isHoursClicked = parentEL.querySelectorAll(".ant-time-picker-panel-select")[0] === selectedOptionListEl ||
                             parentEL.querySelectorAll(".ant-time-picker-panel-select")[1] === selectedOptionListEl;
      setIsHoursClicked(isHoursClicked)
    } else {
      setIsHoursClicked(false);
    }
  }

  useEffect(() => {
    window.addEventListener('mousedown', handleTimeHourClick);
    return () => {
      window.removeEventListener('mousedown', handleTimeHourClick);
    }
  },[])

  const handleClose = () => {
    resetStartEndTimeRange();
    setStartTime(moment.utc(activeWork.start_date_time).utcOffset(userTimeOffset))
    setEndTime(activeWork.end_date_time ? moment.utc(activeWork.end_date_time).utcOffset(userTimeOffset) : moment.utc().utcOffset(userTimeOffset))
    // addCommentRef.current.handleReset();
    onClose();
  }

  const checkIsAllowedTimeRange = (start, end) => {
    if (!start || !end) return;
    const otherBusyTimes = _todayBusyTimes.filter(item => !(item.id === activeWork.id && item.work_time_id === activeWork.work_time_id));
    const isAllowed = fnCheckAvailableStartEndRange(start, end, otherBusyTimes, isToday);
    setIsInvalidTimeRange(!isAllowed);
  }

  const onStartTimeChangeChange = (timeObj, timeStr) => {
    const userTimeOffset = store.get('user').time_offset || '+00:00';
    const _selectedDate = moment.parseZone(selectedDate).utcOffset(userTimeOffset).format('YYYY-MM-DD');
    const _startTime = _selectedDate + ' ' + timeStr;
    const _endTime = _selectedDate + ' ' + endTime.format('HH:mm');

    const _busyStartMinutes = fnGetBusyStartMinutes(_startTime, busyHoursMinutes);
    setBusyStartMinutes(_busyStartMinutes);
    !isHoursClicked && startTime && selectTimePicker();
    const isAllowed = fnCheckAvailableStartEndRange(_startTime, _endTime, _todayBusyTimes, isToday) ||
      moment(timeObj).utcOffset(userTimeOffset) < moment(_endTime).utcOffset(userTimeOffset);
    setIsInvalidTimeRange(!isAllowed);

    setBusyEndHours(fnGetBusyEndHours(timeObj, busyHoursMinutes, _busyStartMinutes));
    setResetTimer(false);

    if(isAllowed) {
      setStartTime(timeObj);
    }
  }

  const selectTimePicker = () => {
    setShowFromTimer(false);
    setShowToTimer(true);
  }

  const onEndTimeChangeChange = (timeObj, timeStr) => {
    const userTimeOffset = store.get('user').time_offset || '+00:00';
    const nowTime = moment().utcOffset(userTimeOffset);
    const _selectedDate = moment.parseZone(selectedDate).utcOffset(userTimeOffset).format('YYYY-MM-DD');
    const _startTime = _selectedDate + ' ' + startTime.format('HH:mm');
    const _endTime = _selectedDate + ' ' + timeStr;
    const isAllowed = fnCheckAvailableStartEndRange(_startTime, _endTime, _todayBusyTimes, isToday);
    setIsInvalidTimeRange(!isAllowed);
    const _busyEndMinutes = fnGetBusyEndMinutes(_startTime, _endTime, busyHoursMinutes);
    setBusyEndMinutes(_busyEndMinutes);
    setResetTimer(false)

    if(isAllowed) {
      setEndTime(timeObj);
    }
  }

  const handleProjectsDropdownEnter = e => {
    e.stopPropagation()
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 13) {
      handleProjectsDropdownClick(e)
    }
  }

  const handlePostEnterPress = e => {
    e.stopPropagation()
    if (e.key === 'Enter' && e.shiftKey) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      addComment(user.id, activeWork.work_time_id, null, true, addCommentRef?.current?.state?.value)
    }
  }

  const handleAddCommentEnterPress = e => {
    if (e.key === 'Enter' && e.shiftKey) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      addComment(user.id, activeWork.work_time_id, reply)
    }
  }

  const handlePostBtnPress = e => {
    if (e.key === 'Enter' && e.shiftKey) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      handlePostBtnClick()
    }
  }

  const handleClick = (e) => {
    e.stopPropagation()
    handleProjectsDropdownClick(e)
  }

  const handleCommentChange = useCallback((e, type = null) => {
    const comment = e.target.value;
    if (type === 'add') {
      handleChangeAddComment(comment)
    } else if (type === 'reply') {
      handleEditComment(comment, type)
    } else if (type === "edit") {
      handleEditComment(comment, type)
    }
  }, [])
  const content = (
    <span>{i18n.t`Please, stop the task to edit the time.`}</span>
  );

  const handleTimePickerClick = (e) => {
    e.stopPropagation();
    if (projectDropdownProps.show) {
      projectDropdownProps.onClose();
    }
  }

  const handleUpdateWork = e => {
    e.preventDefault();
    const workedTime = {
      start_date_time: moment(startTime).format(dbDateTimeFormat),
      end_date_time: activeWork.end_date_time ? moment(endTime).format(dbDateTimeFormat) : null
    }
    updateWork(workedTime, onGoingTask)
    setIsEditBtnDisabled(true)
  }

  const resetTimerModalForBtn = (e) => {
    e.stopPropagation()
    setResetTimer(true)
    setEndTime(moment.utc().utcOffset(userTimeOffset))
    setStartTime(moment.utc().utcOffset(userTimeOffset))
  }


  const disabledBtnSaveModal = () => {
    if (!activeWork.is_editable || isInvalidTimeRange) return true;

    const {getFieldValue} = form;
    let taskNameInputValue = getFieldValue('name'),
      taskNameInputDescription = getFieldValue('description');
    if (taskNameInputDescription && taskNameInputDescription.length > 1000) {
      return true;
    }
    if (taskNameInputValue !== undefined) {
      if (taskNameInputValue.length > 191) {
        return true
      }
      return !taskNameInputValue.trim().length;
    }
  }

  const countWorkTimeSeconds = (startTime, endTime = null) => {
    if (endTime) {
      return moment.duration(moment(endTime).diff(moment(startTime))).asSeconds();
    }
    return moment.duration(moment().diff(moment(startTime))).asSeconds();
  };

  useEffect(() => {
    if (!isModalVisible) {
      setResetTimer(false);
      resetStartEndTimeRange();
    } else { // Modal opened
      const busyHoursMinutes = fnGetBusyHoursMinutes(isToday, _todayBusyTimes, activeWork);
      setBusyHoursMinutes(busyHoursMinutes);
      setBusyStartHours(fnGetBusyStartHours(busyHoursMinutes));
      setBusyEndHours(fnGetBusyEndHours(startTime, busyHoursMinutes));
      if (activeWork.id) {
        const _start = moment.utc(activeWork.start_date_time).utcOffset(userTimeOffset);
        const _end = activeWork.end_date_time
          ? moment.utc(activeWork.end_date_time).utcOffset(userTimeOffset)
          : moment.utc().utcOffset(userTimeOffset);
        setStartTime(_start);
        setEndTime(_end);
        checkIsAllowedTimeRange(_start, _end);
      }
    }
  }, [isModalVisible])

  const resetCommentText = () => {
    if (addCommentRef?.current.state.value) {
      addCommentRef.current.handleReset()
    }
  };

  return (
    <Modal
      title={i18n.t`EDIT TASK`}
      keyboard={true}
      centered
      visible={isModalVisible}
      onCancel={onClose}
      footer={false}
      closeIcon={
        <span onClick={() => onClose()} className="close-icon">
          <Icons name="close"/>
        </span>
      }
      className={styles['updateWork-modal']}
      width="initial"
    >
      <Form layout="vertical" onSubmit={handleUpdateWork}>
        <div className={styles['modal-content']}>
          <div className={styles['modal-row']}>
            <div className={styles['positionRel']}>
              <FormItem colon={false}>
                {getFieldDecorator('name', {
                  initialValue: activeWork.work_name,
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: i18n.t`The task name field is required․`,
                    },
                    {
                      max: 191,
                      message: i18n.t`Task name cannot be longer than 191 characters.`,
                    },
                  ],
                })(
                  !activeWork.is_editable ? <Input className={styles['taskInp']} disabled={true}/> :
                    <Input className={styles['taskInp']}/>
                )}
              </FormItem>
            </div>
            <div className={styles['itemSection']}>
              <div
                onClick={e => handleClick(e)}
                className={styles['modalProjectTagsWrapper']}
              >
                <div
                  tabIndex="0"
                  onKeyPress={e => handleProjectsDropdownEnter(e)}
                  className={styles['modalProjectWrapper']}
                  label={i18n.t`Project`}>
                  {getFieldDecorator('project', {
                    initialValue: activeProject.name
                  })(
                    <span
                      title={activeProject && activeProject.name ? activeProject.name : i18n.t`No project selected`}
                      style={{
                        cursor: activeWork.is_editable ? "pointer" : "not-allowed",
                        backgroundColor: activeProject && activeProject.color ? activeProject.color : "#F8F8FB",
                        color: activeProject && !activeProject.name ? "#B3B3B3" : "#fff"
                      }}
                      className={
                        classnames(styles['projectName'],
                          activeProject &&
                          activeProject.color &&
                          isColorLikeWhite(activeProject.color)
                            ? styles['projectDefaultIndicator']
                            : null
                        )
                      }
                    >
                        {activeProject.name ? activeProject.name : i18n.t`No project selected`}
                      </span>
                  )}
                </div>
                <Tag activeTagsArray={activeTagsArray} allTags={projectDropdownProps.allTags}/>
                <ProjectsDropdown {...projectDropdownProps} activeTagsArray={activeTagsArray} isModal={true}/>
              </div>
            </div>
          </div>
          <div className={styles['rowBetween']}>
            <div className={styles['dateSect']}>
              <EditCalendarIcon style={{marginRight: 16}}/>
              <span>{moment.parseZone(activeWork.start_date_time).utcOffset(userTimeOffset).format("DD-MM-YY")}</span>
            </div>
            <div className={`${classes['manual-mode-time-pickers']} ${styles['hourSect']}`}>
              <span
                className="app-time-picker"
                onClick={handleTimePickerClick}>
                <TimePicker
                  onClick={selectTimePicker}
                  ref={timerFromRef}
                  open={showFromTimer}
                  onOpenChange={(e) => setShowFromTimer(e)}
                  disabled={!activeWork.is_editable || onGoingTask}
                  value={startTime}
                  disabledHours={() => busyStartHours}
                  onChange={onStartTimeChangeChange}
                  disabledMinutes={() => busyStartMinutes}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  format={timeFormat}
                  className={isInvalidTimeRange ? `invalid-time-range` : ``}
                  popupClassName="app-time-picker-dropdown"
                />
              </span>
              <span
                className="app-time-picker"
                onClick={handleTimePickerClick}>
                <TimePicker
                  ref={timerToRef}
                  open={showToTimer}
                  onOpenChange={(e) => setShowToTimer(e)}
                  disabled={!activeWork.is_editable || onGoingTask}
                  disabledHours={() => busyEndHours}
                  disabledMinutes={() => busyEndMinutes}
                  value={endTime}
                  onChange={(timeObj, timeStr) => onEndTimeChangeChange(timeObj, timeStr)}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  format={timeFormat}
                  className={isInvalidTimeRange ? `invalid-time-range` : ``}
                  popupClassName="app-time-picker-dropdown"
                />
              </span>
            </div>
            <div className={styles['dateAllHours']}>
              {getFieldDecorator('duration', {
                initialValue: fnDurationToHoursMinutesSecondsText(countWorkTimeSeconds(startTime ? startTime : activeWork.start_date_time, endTime ? endTime : activeWork.end_date_time), i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`),
              })(
                <span>
                    {
                      activeWork.end_date_time &&
                      fnDurationToHoursMinutesSecondsText(countWorkTimeSeconds(startTime ? startTime : activeWork.start_date_time, endTime ? endTime : activeWork.end_date_time), i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`, resetTimer) ||
                      fnDurationToHoursMinutesSecondsText(startTime ? countWorkTimeSeconds(startTime) : countWorkTimeSeconds(activeWork.start_date_time), i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`, resetTimer)
                    }
                  </span>
              )}

            </div>
          </div>
          <div className={styles['positionRel']}>
            <FormItem
              label=""
            >
              {getFieldDecorator('description', {
                initialValue: activeWork.description,
                rules: [
                  {
                    max: 1000,
                    message: <Trans>Task description cannot be longer than 1000 characters.</Trans>,
                  },
                ],

              })(<TextArea
                disabled={!activeWork.is_editable}
                className={styles['textDescription']}
                placeholder={i18n.t`Tell us more`}
              />)}
            </FormItem>
          </div>
          {/*<div style={{display: "flex", flexDirection: "column"}}>*/}
          {/*  <div className={styles['commentSect']}>*/}
          {/*    <img*/}
          {/*      className={styles['avatar']}*/}
          {/*      src={user.avatar ? `${appUrl}storage/images/avatars${getResizedImage(user.avatar, 'avatar')}` : require('img/avatar.png')}/>*/}
          {/*    <TextArea*/}
          {/*      ref={addCommentRef}*/}
          {/*      className={styles['textComment']}*/}
          {/*      placeholder={i18n.t`Write a comment... `}*/}
          {/*      onKeyPress={e => handlePostEnterPress(e)}*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*</div>*/}
          {/*<div className={styles['commentSectWrapper']}>*/}
          {/*  {*/}
          {/*    activeWork &&*/}
          {/*    activeWork.comments &&*/}
          {/*    activeWork.comments.map((comment) => {*/}
          {/*      if (!comment.parent_id) {*/}
          {/*        return (*/}
          {/*          <div*/}
          {/*            key={`${comment.id + new Date(`${comment.created_at}`).getTime() / 1000}`}*/}
          {/*          >*/}
          {/*            {*/}
          {/*              activeWork.editComment === comment.id*/}
          {/*                ?*/}
          {/*                <div>*/}
          {/*                  <div className={styles['commentSect']}>*/}
          {/*                    <TextArea*/}
          {/*                      className={styles['textComment']}*/}
          {/*                      placeholder={i18n.t`Write a comment... `}*/}
          {/*                      defaultValue={comment.text}*/}
          {/*                      onChange={e => handleCommentChange(e, "edit")}*/}
          {/*                      onKeyPress={e => handlePostBtnPress(e)}*/}
          {/*                    />*/}
          {/*                  </div>*/}
          {/*                </div>*/}
          {/*                :*/}
          {/*                <>*/}
          {/*                  <CommentView*/}
          {/*                    key={`${comment.id + new Date(`${comment.created_at}`).getTime() / 1000}`}*/}
          {/*                    comment={comment}*/}
          {/*                    i18n={i18n}*/}
          {/*                    user={user}*/}
          {/*                    activeWork={activeWork}*/}
          {/*                    editCommentBtnClick={handleEditBtnClick}*/}
          {/*                    handleDeleteComment={handleDeleteComment}*/}
          {/*                    isParent={true}*/}
          {/*                    onCommentReply={commentId => handleReply(commentId)}*/}
          {/*                  />*/}
          {/*                </>*/}
          {/*            }*/}
          {/*            {*/}
          {/*              activeWork.comments.map((childComment, idx) => {*/}
          {/*                if (childComment.parent_id === comment.id) {*/}
          {/*                  return (*/}
          {/*                    activeWork.editComment === childComment.id*/}
          {/*                      ?*/}
          {/*                      <div*/}
          {/*                        key={`${comment.id + idx + new Date(`${comment.created_at}`).getTime() / 1000}`}*/}
          {/*                      >*/}
          {/*                        <div className={styles['commentSect']}>*/}
          {/*                          <TextArea*/}
          {/*                            className={styles['textComment']}*/}
          {/*                            placeholder={i18n.t`Write a comment... `}*/}
          {/*                            defaultValue={childComment.text}*/}
          {/*                            onChange={e => handleCommentChange(e, 'edit')}*/}
          {/*                            onKeyPress={e => handlePostBtnPress(e)}*/}
          {/*                          />*/}
          {/*                        </div>*/}
          {/*                      </div>*/}
          {/*                      :*/}
          {/*                      <CommentView*/}
          {/*                        key={`${comment.id + idx + new Date(`${comment.created_at}`).getTime() / 1000}`}*/}
          {/*                        comment={childComment}*/}
          {/*                        i18n={i18n}*/}
          {/*                        user={user}*/}
          {/*                        isParent={false}*/}
          {/*                        activeWork={activeWork}*/}
          {/*                        editCommentBtnClick={handleEditBtnClick}*/}
          {/*                        handleDeleteComment={handleDeleteComment}*/}
          {/*                      />*/}
          {/*                  )*/}
          {/*                }*/}
          {/*              })*/}
          {/*            }*/}
          {/*            {*/}
          {/*              reply === comment.id &&*/}
          {/*              <div>*/}
          {/*                <div className={styles['commentSect']}>*/}
          {/*                  <img className={styles['avatar']}*/}
          {/*                       src={user.avatar ? `${appUrl}storage/images/avatars${getResizedImage(user.avatar, 'avatar')}` : require('img/avatar.png')}/>*/}
          {/*                  <TextArea*/}
          {/*                    onChange={e => handleCommentChange(e, 'add')}*/}
          {/*                    className={styles['textComment']}*/}
          {/*                    placeholder={i18n.t`Write a comment... `}*/}
          {/*                    onKeyPress={e => handleAddCommentEnterPress(e)}*/}
          {/*                  />*/}
          {/*                </div>*/}
          {/*              </div>*/}
          {/*            }*/}
          {/*          </div>*/}
          {/*        )*/}
          {/*      }*/}
          {/*    })*/}
          {/*  }*/}
          {/*  {*/}
          {/*    !activeWork.loadedMoreComments &&*/}
          {/*    <div*/}
          {/*      className={styles['loadMoreSection']}>*/}
          {/*      <Button*/}
          {/*        className={styles['loadMoreCommentBtn']}*/}
          {/*        type="link"*/}
          {/*        size={'small'}*/}
          {/*        onClick={() => loadMoreComments()}>*/}
          {/*        {i18n.t`Load more comments`}*/}
          {/*      </Button>*/}
          {/*    </div>*/}
          {/*  }*/}
          {/*</div>*/}

          <div className={styles['form-action']}>
            <Button
              className="app-btn primary-btn-outline md"
              onClick={handleClose}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              className="app-btn primary-btn md"
              disabled={disabledBtnSaveModal()}
              htmlType="submit">
              <Trans>Save</Trans>
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

export default React.memo(UpdateWorkModal);


