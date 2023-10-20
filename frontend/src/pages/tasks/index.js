import React, {PureComponent} from 'react';
import store from 'store';
import moment from 'utils/moment';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {Trans, withI18n} from '@lingui/react';
import Icons from 'icons/icon';
import {Page} from 'components';
import style from './index.less';
import ReportModal from './components/ReportModal/ReportModal';
import TodoModal from './components/TodoModal/TodoModal';
import SelectDate from '../../components/SelectDate';
import {GroupOutlined, UngroupOutlined} from '@ant-design/icons';
import {Form} from '@ant-design/compatible';
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import {START_DATE_TIME_FORMAT, DATE_FORMAT} from 'utils/constant';
import {fnDurationToHoursMinutesSecondsForReports, allTodayBusyTimes, getRunningTaskStartTime} from 'utils';
import {
  ConfigProvider,
  Button,
  Row,
  Col,
  Input,
  Radio,
  Popover,
  message
} from 'antd';
import TasksTable from "./components/TasksTable/TasksTable";
import AddEditTask from "./components/AddEditTask";

const {Search} = Input;

@withI18n()
@connect(({works, loading, projects}) => ({works, loading, projects}))
@Form.create()
class Works extends PureComponent {
  state = {
    firstLoad: true,
    showReportModal: false,
    showError: false,
    isSubmittingReport: false,
    showTagModal: false,
    color: '',
    searchValue: null,
    showClientsHours: [],
    tags: [],
    activeTask: {},
    buttonDisabled: false,
    projects: {},
    allTags: [],
    displayByGroup: false,
    activeTags: [],
    currentTags: [],
    isTaskRunning: null,
    foundTasks: [],
    foundTasksTags: [],
    latestTask: {},
    todoPageSize: 10,
    todoPage: 2,
    radioBtnValue: false
  };

  componentDidMount() {
    const {dispatch} = this.props;
    const user = store.get('user');
    this.setState({
      selectedDate: moment().utcOffset(user.time_offset).format(START_DATE_TIME_FORMAT),
    });
    dispatch({
      type: `works/projectsAndTags`,
      payload: {}
    })
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.state.firstLoad && this.props.works.list !== nextProps.works.list) {
      this.setState({
        firstLoad: false,
      });
    }
  };

  /**
   * @method_componentDidUpdate By checking prev props and this props,
   * to determine latest task. If latest task don't have end_date_time prop,
   * set in state latest task status to ongoing.
   */

  componentDidUpdate(prevProps, prevState, snapshot) {
    const user = store.get('user');
    if (this.props.works.items !== prevProps.works.items) {
      const {items} = this.props.works;
      const latestTask = this.props.works.latestTask;
      if (Array.isArray(items)) {
        this.setState({
          radioBtnValue: false
        })
      } else {
        this.setState({
          radioBtnValue: true
        })
      }
      if (!latestTask.end_date_time) {
        this.setState({
          isTaskRunning: true,
          latestTask: {...latestTask}
        })
      } else {
        this.setState({
          isTaskRunning: false,
          latestTask: {...latestTask}
        })
      }

      if (!latestTask.end_date_time && this.props.works.workTimeTags) {
        this.setState({
          currentTags: this.props.works.workTimeTags.filter(workTimeTag => workTimeTag.work_time_id === latestTask.work_time_id)
        })
      }

    }
  }

  get listProps() {
    const {dispatch, works, loading, form} = this.props;

    const {
      projects,
      pagination,
      list,
      items,
      canLoadNextItems,
      loadingItems,
      page,
      loadedPages,
      currentItem,
      commentStoreResponse,
      comments,
      commentSuccessDeleted,
      commentSuccessEdited,
      totalDuration,
      workedToday,
      workTimeTags,
      todayBusyTimes,
      workCount,
      selectedDate,
    } = works;
    return {
      buttonDisabled: this.state.buttonDisabled,
      list,
      totalDuration,
      loading: loading.effects['tasks/query'],
      pagination,
      canLoadNextItems,
      loadingItems,
      items,
      page,
      currentItem,
      commentStoreResponse,
      comments,
      commentSuccessDeleted,
      commentSuccessEdited,
      workedToday,
      workTimeTags,
      workCount,
      selectedDate,
      isTaskRunning: this.state.isTaskRunning,
      allTags: this.state.allTags,
      projects,
      displayByGroup: this.state.displayByGroup,
      activeTask: this.state.activeTask,
      activeTagsArray: this.state.activeTags,
      _todayBusyTimes: todayBusyTimes,
      todayBusyTimes: allTodayBusyTimes(todayBusyTimes),
      runningTaskStartTime: getRunningTaskStartTime(todayBusyTimes),
      onProjectReset: this.onProjectReset,
      onSetSelectedWork: (work) => {
        let startValue, endValue, formSubmitBtnIcon, formSubmitBtnColor, disableEndDateTime;

        if (work) {
          if (work.start_date_time) startValue = moment(work.start_date_time);

          if (work.end_date_time) {
            endValue = moment(work.end_date_time);
            formSubmitBtnIcon = 'edit';
            formSubmitBtnColor = 'blue';
          } else {
            endValue = null;
            formSubmitBtnIcon = 'pause-circle';
            formSubmitBtnColor = 'red';
            disableEndDateTime = true;
          }
        } else {
          formSubmitBtnIcon = 'play-circle';
          formSubmitBtnColor = 'green';
        }
        dispatch({
          type: 'works/updateState',
          payload: {
            currentItem: work,
            startValue: startValue,
            endValue: endValue,
            formSubmitBtnIcon: formSubmitBtnIcon,
            formSubmitBtnColor: formSubmitBtnColor,
            disableEndDateTime: disableEndDateTime,
          },
        });
      },
      onGetWorkList: (_page) => {
        if (!loadedPages.includes(_page)) {
          if (this.state.searchValue) {
            dispatch({
              type: 'works/search',
              payload: {
                searchValue: this.state.searchValue,
                start_date_time: selectedDate,
                displayByGroup: this.state.displayByGroup,
                page: _page,
                resetList: true
              },
            })
          } else {
            dispatch({
              type: 'works/query',
              payload: {
                start_date_time: selectedDate,
                displayByGroup: this.state.displayByGroup,
                page: _page
              },
            });
          }
        }
      },
      onRemoveWorkTime: (work_id, work_time_id) => {
        const {displayByGroup} = this.state;

        dispatch({
          type: `works/removeWorkTime`,
          payload: {work_id: work_id, work_time_id: work_time_id, displayByGroup}
        }).then(() => {
          dispatch({
            type: 'works/query',
            payload: {
              start_date_time: selectedDate,
              displayByGroup: this.state.displayByGroup,
              resetList: true
            },
          })
        }).catch(console.error);
      },
      onStartOrPause: (item, createdMode = "timer") => {
        const user = store.get('user');
        const userTimeOffset = user.time_offset;
        form.resetFields();
        let action, payload;
        if (!item.end_date_time && createdMode === "timer") { // stop work
          this.setState({
            activeTask: {},
            currentTags: []
          })
          action = 'stop';
          payload = {
            queryData: {
              work_id: item.id,
              duration: item.duration,
              work_time_id: item.work_time_id,
              project_id: item?.project_id ? item?.project_id : 0,
              tagIds: item?.tagIds ? item?.tagIds : [],
              work_name: item.name ? item.name : '',
            }
          };
        } else if (item.start_date_time && item.end_date_time && createdMode === "manual") {
          //manual mode create
          this.setState({
            activeTask: {},
            currentTags: [],
          });
          action = 'create';
          payload = {
            ...item
          };
        } else { // start new work
          const {works} = this.props;
          const {workTimeTags, startValue} = works;
          const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
          let tagIds = workTimeTags.filter(tagObject => {
            return tagObject.work_time_id === item.work_time_id
          }).map(tag => {
            return tag.tag_id;
          });

          this.setState({
            activeTask: item,
            currentTags: workTimeTags.filter(workTimeTag => workTimeTag.work_time_id === item.work_time_id)
          })
          action = 'start';
          payload = {
            id: null,
            duration: null,
            end_date_time: null,
            start_date_time: moment().utcOffset(user.time_offset).format(dbDateTimeFormat),
            name: item.name,
            work_id: item.id,
            work_time_id: item.work_time_id,
            tagIds: tagIds
          };
        }
        this.setState({
          // selectedDate: moment().utcOffset(userTimeOffset).format(START_DATE_TIME_FORMAT),
          tags: []
        }, () => {
          payload.dates = selectedDate;
          payload.displayByGroup = this.state.displayByGroup;
          payload.selectedDate = selectedDate;
          dispatch({
            type: `works/${action}`,
            payload: payload,
          }).then(() => {
            this.setState({buttonDisabled: false})
          }).catch(console.error);
        })
      },
      onClearForm() {
        dispatch({
          type: 'works/updateState',
          payload: {
            currentItem: {},
            startValue: null,
            endValue: null,
            disableEndDateTime: false,
            endOpen: false,
            formSubmitBtnIcon: 'play-circle',
            formSubmitBtnColor: 'green',
          },
        });
      },
    }
  };

  get addEditProps() {
    const {dispatch, works, i18n} = this.props;
    const {
      projects,
      items,
      startValue,
      endValue,
      disabledEndDateTime,
      currentItem,
      endOpen,
      formSubmitBtnIcon,
      formSubmitBtnColor,
      allTags,
      workTimeTags,
      todayBusyTimes,
      selectedDate,
      latestTask,
    } = works;
    // this.setState({allTags: allTags});
    // this.setState({projects: projects});
    return {
      i18n,
      workTimeTags,
      buttonDisabled: this.state.buttonDisabled,
      activeTask: !latestTask.end_date_time ? latestTask : this.state.activeTask,
      projects,
      startValue,
      endValue,
      items,
      latestTask,
      disabledEndDateTime,
      currentItem,
      endOpen,
      formSubmitBtnIcon,
      formSubmitBtnColor,
      selectedDate,
      foundTasks: this.state.foundTasks,
      foundTasksTags: this.state.foundTasksTags,
      tags: this.state.tags,
      allTags,
      _todayBusyTimes: todayBusyTimes,
      todayBusyTimes: allTodayBusyTimes(todayBusyTimes),
      onProjectReset: this.onProjectReset,
      currentTags: this.state.currentTags,
      onHandleSelectedTags: this.setCurrentTags,
      onHandleTagClick: this.handleTagClick,
      handleTagDelete: this.handleTagDelete,
      onSearchForAutoComplete: value => this.onSearchForAutoComplete(value),
      onUpdateActiveTask: this.onHandelUpdateActiveTask,
      onSetEndOpen(endOpen) {
        dispatch({
          type: 'works/updateState',
          payload: {endOpen: endOpen},
        });
      },
      onSetStartValue(startValue) {
        dispatch({
          type: 'works/updateState',
          payload: {startValue: startValue},
        });
      },
      onSetEndValue(endValue) {
        dispatch({
          type: 'works/updateState',
          payload: {endValue: endValue},
        });
      },
      onClearForm() {
        dispatch({
          type: 'works/updateState',
          payload: {
            currentItem: {},
            startValue: null,
            endValue: null,
            disableEndDateTime: false,
            endOpen: false,
            formSubmitBtnIcon: 'play-circle',
            formSubmitBtnColor: 'green',
          },
        });
      },
      onSave: (item, timerMode = false) => {
        item.tagIds = this.state.tags && this.state.tags.length ? this.state.tags.map(item => item.id) : item.tag_id;
        item.displayByGroup = this.state.displayByGroup;
        this.setState({buttonDisabled: true});
        dispatch({
          type: 'works/' + (timerMode ? 'start' : 'addEditWorkTime'),
          payload: item,
        }).catch(console.error).finally(() => {
          this.setState({buttonDisabled: false});
        })
      },
      getActiveTags: activeTags => {
        this.setState({
          activeTags: [...activeTags]
        })
      }
    }
  };

  onHandelUpdateActiveTask = (tagsOrProjects) => {
    const {dispatch} = this.props;


    dispatch({
      type: 'works/UPDATE_ACTIVE_TASK',
      payload: {...tagsOrProjects},
    })
  }

  get reportProps() {
    const {works} = this.props;
    const {toSubmitWorks, projects, tags, totalDuration, selectedDate} = works;
    return {
      selectedDate: moment(selectedDate).format(DATE_FORMAT),
      show: this.state.showReportModal,
      showError: this.state.showError,
      toSubmitTasks: toSubmitWorks,
      todayTotalDuration: totalDuration,
      isSubmittingReport: this.state.isSubmittingReport,
      onClose: () => this.toggleReportModal(false),
      onSubmit: this.handleSubmitOrResetDayReports,
      projects: projects,
      allTags: tags
    }
  };

  toggleTodoModal = () => {
    const {dispatch, works: {showTodoModal}} = this.props;

    dispatch({
      type: 'works/openModalToDoList',
      payload: {showTodoModal: !showTodoModal}
    })
  };

  addTodo = (value) => {
    const {dispatch} = this.props;

    dispatch({
      type: 'works/addTodo',
      payload: {name: value}
    })
      .then(res => {
        if (!res.status) {
          message.error(res.message);
        }
      })
      .catch(console.error);
  };

  updateTodo = (id, name) => {
    const {dispatch} = this.props;

    dispatch({
      type: 'works/updateTodo',
      payload: {id: id, name: name}
    })
      .then(res => {
        if (!res.status) {
          message.error(res.message);
        }
      })
      .catch(console.error);
  };

  deleteTodo = (value) => {
    const {dispatch} = this.props;

    dispatch({
      type: 'works/deleteTodo',
      payload: {id: value}
    })
      .then(res => {
        if (!res.status) {
          message.error(res.message);
        }
      })
      .catch(console.error);
  };


  fetchMoreTodos = () => {
    const {dispatch} = this.props;

    dispatch({
      type: 'works/fetchMoreTodos',
      payload: {
        page: this.state.todoPage,
        pageSize: this.state.todoPageSize,
      }
    })
      .then(res => {
        this.setState({
          todoPage: this.state.todoPage + 1
        })
      })
  };

  startTodo = (id) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'works/startWorkFromTodo',
      payload: {
        todo_id: id,
        user_id: store?.get('user')?.id
      }
    })
      .then(res => {
        if (!res.status) {
          message.error(res.message);
        }
      })
      .catch(console.error);
  }

  get todoProps() {
    const {
      works: {
        showTodoModal,
        toDoList,
        todoPage,
        todoPageSize,
        showTodoMore,
        toDoTotal,
        addResponse,
        todoLoading
      }
    } = this.props;
    return {
      show: showTodoModal,
      showTodoMore: showTodoMore,
      showError: this.state.showError,
      toDoList: toDoList,
      todoPage: todoPage,
      todoPageSize: todoPageSize,
      toDoTotal: toDoTotal,
      addResponse: addResponse,
      todoLoading: todoLoading,
      addTodo: (value) => this.addTodo(value),
      deleteTodo: (value) => this.deleteTodo(value),
      updateTodo: (id, name) => this.updateTodo(id, name),
      startTodo: (id) => this.startTodo(id),
      fetchMoreTodos: () => this.fetchMoreTodos(),
      isSubmittingReport: this.state.isSubmittingReport,
      onClose: () => this.toggleTodoModal(),
      onSubmit: this.handleSubmitOrResetDayReports,
    }
  };

  get tagsProps() {
    const {dispatch, works} = this.props;
    const {tags, allTags, workTimeTags} = works;

    const deleteTagFromCurrentTags = (id) => {
      let initialArr = this.state.currentTags;
      this.setState({showTagModal: true});
      !!initialArr.length && this.setState({currentTags: initialArr.filter(tag => tag.id !== id)});
    };

    return {
      dispatch,
      allTags,
      tags,
      workTimeTags,
      createTagRequest(fields) {
        dispatch({
          type: 'works/createTag',
          payload: fields,
        })
      },
      deleteTag(tagId) {
        deleteTagFromCurrentTags(tagId);
        dispatch({
          type: 'works/deleteTag',
          payload: tagId,
        });
      },
      editTagRequest(fields) {
        dispatch({
          type: 'works/updateTag',
          payload: fields,
        })
      },
      confirmSelectedTags: tagsArray => {
        this.setState({tags: tagsArray});
      }
    }
  };

  get selectDateProps() {
    const {dispatch, works} = this.props;

    return {
      selectedDate: works.selectedDate,
      buttonDisabled: this.state.buttonDisabled,
      i18n: this.props.i18n,
      onDateChange: (value) => {
        if (this.state.searchValue) {
          dispatch({
            type: 'works/search',
            payload: {
              searchValue: this.state.searchValue,
              start_date_time: value,
              displayByGroup: this.state.displayByGroup,
              selectedDate: value,
            },
          })
        } else {
          dispatch({
            type: 'works/query',
            payload: {
              start_date_time: value,
              displayByGroup: this.state.displayByGroup,
              resetList: true,
              selectedDate: value,
            },
          });
        }
      }
    }
  };

  setCurrentTags = tags => this.setState({
    currentTags: tags
  })

  compareTags = (data, projectId, taskName) => {
    const {dispatch} = this.props,
      {latestTask} = this.state,
      tags = data.map((item) => {
        let currentTagKey = !item.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
        return item[currentTagKey];
      });

    if (Object.keys(latestTask).length > 0 && !latestTask.end_date_time) {
      dispatch({
        type: 'works/UPDATE_ACTIVE_TASK',
        payload: {action: "changeActiveTags", tags, projectId, taskName},
      })
    }
  }

  handleTagClick = (tag, projectId, taskName) => {
    if (!(this.state.currentTags.filter(activeTag => {
      let currentTagKey = !activeTag.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
      return tag.id === activeTag[currentTagKey];
    }).length > 0)) {
      this.setState({
        currentTags: [
          ...this.state.currentTags, {
            name: tag.name,
            id: tag.id,
            color: tag.color
          }]
      }, () => this.compareTags(this.state.currentTags, projectId, taskName))
    } else {
      this.setState({
        currentTags: [...this.state.currentTags.filter(activeTag => {
          let currentTagKey = !activeTag.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
          return tag.id !== activeTag[currentTagKey]
        })]
      }, () => this.compareTags(this.state.currentTags, projectId, taskName))
    }
  }

  handleTagDelete = (tagId) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'works/deleteTag',
      payload: tagId
    });
  }

  onSearchForAutoComplete = (value) => {
    const {dispatch} = this.props;
    let searchedData = dispatch({
      type: `works/searchTask`,
      payload: {value: value},
    })
    return searchedData;
  }

  onProjectReset = () => {
    this.setState({
      activeTask: {}
    })
  };

  toggleReportModal = (e) => {
    const {dispatch, works} = this.props;

    if (e) {
      dispatch({
        type: 'works/getWorks',
        payload: {date_time: works.selectedDate}
      }).then(() => {
        this.setState({showReportModal: e})
      }).catch(console.error)
    } else {
      this.setState({showReportModal: e})
    }
  };

  handleSubmitOrResetDayReports = (submitted, inputData) => {
    this.setState({isSubmittingReport: true})
    const {dispatch, works, i18n} = this.props;
    let hours = [];
    let minutes = [];
    let project_ids = [];

    if (inputData) {
      for (let i = 0; i < inputData.length; i++) {
        let project_id = inputData[i].project ? inputData[i].project : 0;
        let hoursValue = inputData[i].hours && parseInt(inputData[i].hours);
        let momentValue = inputData[i].minutes && parseInt(inputData[i].minutes);
        if (hoursValue && !momentValue) {
          momentValue = 0
        } else if (!hoursValue && momentValue) {
          hoursValue = 0;
        }
        if (hoursValue === 0 && momentValue === 0) {
          return
        }
        hours.push(hoursValue);
        minutes.push(momentValue);
        project_ids.push(project_id);
      }
    }
    dispatch({
      type: 'works/submitOrResetDayReports',
      payload: {
        submitted: submitted,
        project_ids: project_ids,
        hours: hours,
        minutes: minutes,
        date: works.selectedDate,
        displayByGroup: this.state.displayByGroup
      },
    }).then(() => {
      this.setState({canSubmitDayReport: !submitted});
      this.toggleReportModal(false);
    }).catch(console.error)
      .finally(() => {
        this.setState({isSubmittingReport: false});
      });
  };

  startToSearch = (value) => {
    const {dispatch, works} = this.props;
    let limitValue = value.substring(0, 200);
    if (limitValue.trim()) {
      this.setState({
        searchValue: limitValue.trim(),
      });
      dispatch({
        type: 'works/search',
        payload: {
          searchValue: limitValue.trim(),
          start_date_time: works.selectedDate,
          displayByGroup: this.state.displayByGroup
        },
      })
    } else {
      this.setState({
        searchValue: null,
      });
      dispatch({
        type: 'works/query',
        payload: {
          start_date_time: works.selectedDate,
          displayByGroup: this.state.displayByGroup,
          resetList: true
        },
      })
    }
  };

  handleDisplayTypeChange = (value) => {
    this.setState({
      radioBtnValue: value
    })
    const {dispatch, works} = this.props;
    const displayByGroup = value;
    this.setState({
      displayByGroup
    }, () => {
      dispatch({
        type: `works/query`,
        payload: {
          displayByGroup,
          start_date_time: works.selectedDate,
          resetList: true
        },
      });
    })
  }

  render() {
    const {works, i18n} = this.props;
    const {displayByGroup} = this.state;
    const {workedToday, totalDuration, items, isAnySubmittedItem} = works;
    const onGoingTaskTxt = (
      <span>{i18n.t`Please, stop the ongoing task to submit the daily report.`}</span>
    );
    const isSubmitted = isAnySubmittedItem && Object.keys(items).length > 0;
    return (
      <Page inner>
        <div className={style['tasks-page']}>
          <div className={style['tasks-page_header']}>
            <div className={style['tasks-page_header-row']}>
              <AddEditTask
                {...this.addEditProps}
                onStartOrPause={this.listProps.onStartOrPause}
                tagsProps={this.tagsProps}
              />
            </div>
            <div className="separator"/>
            <div className={style['tasks-page_header-row']}>
              <Row
                type="flex"
                justify="space-between"
                align="middle"
                gutter={[0, 24]}
              >
                <Col
                  lg={16}
                  className="d-flex"
                >
                  <SelectDate {...this.selectDateProps} />
                  <Search
                    className="app-search-input"
                    placeholder={i18n.t`Search`}
                    onSearch={this.startToSearch}
                    suffix={<span>
                      <Icons name="search"/>
                    </span>}
                    allowClear={false}
                  />
                  <div className={style['tasks-page_report-btn']}>
                    {
                    this.state.isTaskRunning && !isSubmitted &&
                    <Popover placement="topLeft" content={onGoingTaskTxt}>
                      <span className="app-btn md cursor-disable">
                         <button
                           tabIndex={"-1"}
                           className={style['cursor-disable-btn']}
                           disabled={this.state.isTaskRunning}
                         >
                        <Icons name="success" fill="#FFFFFF"/>
                        <Trans>DAILY REPORT</Trans>
                      </button>
                      </span>
                    </Popover>
                    }
                    {
                      (workedToday || workedToday == null) && !this.state.isTaskRunning && !isSubmitted
                      &&
                      <Button
                        tabIndex={this.state.isTaskRunning ? "-1" : "0"}
                        disabled={this.state.isTaskRunning}
                        className="app-btn primary-btn-outline md"
                        onClick={() => this.toggleReportModal(true)}
                      >
                        <Icons name="success" fill="#4A54FF"/>
                        <Trans>DAILY REPORT</Trans>
                      </Button>
                    }
                    {(!workedToday && isSubmitted) &&
                    <Button
                      tabIndex={"0"}
                      className="app-btn primary-btn-outline md"
                      onClick={() => this.handleSubmitOrResetDayReports(0)}
                    >
                      <Icons name="success" fill="#4A54FF"/>
                      <Trans>RESET DAILY REPORT</Trans>
                    </Button>
                    }
                    {(!!workedToday && isSubmitted) &&
                    <Button
                      tabIndex={"0"}
                      className="app-btn primary-btn-outline md"
                      onClick={() => this.handleSubmitOrResetDayReports(0)}
                    >
                      <Icons name="success" fill="#4A54FF"/>
                      <Trans>RESET DAILY REPORT</Trans>
                    </Button>
                    }
                    <ReportModal {...this.reportProps} />
                    <TodoModal {...this.todoProps} />
                  </div>
                </Col>
                <Col>
                  <div className={style['tasks-page_header-row_right']}>
                    <div className={style['tasks-page_total']}>
                      <Trans>Total</Trans>
                      <span
                        className={style['total-duration']}>
                      {
                        totalDuration
                          ?
                          fnDurationToHoursMinutesSecondsForReports(totalDuration)
                          : "00:00:00"
                      }
                    </span>
                    </div>
                    <Radio.Group
                      onChange={(e) => this.handleDisplayTypeChange(e.target.value)}
                      value={this.state.radioBtnValue}
                      className={style['tasks-page-header-row-right_filter']}
                    >
                      <Radio.Button tabIndex="0" value={true}><GroupOutlined/></Radio.Button>
                      <Radio.Button tabIndex="0" value={false}><UngroupOutlined/></Radio.Button>
                    </Radio.Group>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <TasksTable {...this.listProps} tagsProps={this.tagsProps}/>
        </div>
      </Page>
    )
  }
}

Works.propTypes = {
  works: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default Works
