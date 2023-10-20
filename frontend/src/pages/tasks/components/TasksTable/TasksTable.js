import React from "react";
import {
  Table,
  Button,
  message,
  Form,
  Modal,
  Pagination
} from 'antd';
import {EditItemBtn, InfoItemBtn, PlayBtn} from './TaskActionsBtns'
import {Trans, withI18n} from "@lingui/react";
import PropTypes from "prop-types";
import {connect} from "dva";
import store from "store";
import {stringify} from "qs";
import UpdateWorkModal from "../UpdateWorkModal/UpdateWorkModal";
import {
  router,
  fnEndTimeText,
  fnDurationToHoursMinutesSecondsText,
} from 'utils';
import {TIME_UNITS} from 'utils/constant';
import moment from 'utils/moment';
import {isColorLikeWhite} from 'utils/theme';
import Spin from "antd/es/spin";
import {sortBy, groupBy} from 'lodash';
import Icons from 'icons/icon';
import Tag from 'components/Tag';
import styles from './TasksTable.less';

const {START_SECONDS_TIME} = TIME_UNITS
const timeFormat = 'HH:mm';
const dbDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

@connect(({works, workList, loading}) => ({works, workList, loading}))
@withI18n()
@Form.create()
class TasksTable extends React.Component {

  state = {
    isModalVisible: false,
    isDeleteModalVisible: false,
    deleteWorkItem: {},
    activeProject: {},
    activeTagsArray: [],
    activeWork: {},
    showProjectsDropdown: false,
    loading: false,
    user: store.get('user'),
    addCommentText: "",
    editCommentText: "",
    repliedText: "",
    enableButton: false,
    repliedCommentText: "",
    tableData: null,
    showMainTxt: null,
    isTableExpandable: false,
    tasksCurPage: 1
  };

  userTimeOffset = store.get('user')?.time_offset || '+00:00';

  columns = [
    {
      title: <Trans>Task Name</Trans>,
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
      render: (taskName, row, index) => {
        const _taskName = (row?.children && row.children.length > 0) ? row.children[0]?.name : row.name;
        return (
          <div className={styles['task-name-block']}>
            {!row?.children && row.submitted === 1 &&
            <span className={styles['task-name-tick']}>
                <Icons name="tick"/>
            </span>}
            <span
              tabIndex={"0"}
              title={_taskName}
              className={styles['task-name']}
              onClick={(e) => this.handleEditWork(e, row)}
            >
              {_taskName}
            </span>
          </div>
        )
      }
    },
    {
      title: <Trans>Project</Trans>,
      dataIndex: 'project_name',
      key: 'projectName',
      width: 200,
      render: (item, row, index) => {
        const {items: list, workTimeTags} = this.props
        let currentTasksTags;
        currentTasksTags = workTimeTags?.filter(workTimeTag => row.work_time_id === workTimeTag.work_time_id);

        return (
          row && Object.values(row).length > 0 &&
          <div className={styles['project-wrapper']}>
            {
              item ? <div
                title={item}
                className={`${styles['project-name']}
                ${row && row.project_color && isColorLikeWhite(row.project_color) ?
                  styles['projectBlackIndicator'] : ''}`}
                style={{backgroundColor: row.project_color}}>
                {item}
              </div> : <Button
                tabIndex={"-1"}
                className={styles['reppyBtn']}
              >
                <Trans>No Project</Trans>
              </Button>
            }

            <Tag activeTagsArray={currentTasksTags}/>
          </div>
        )
      }
    },
    {
      title: <Trans>Time</Trans>,
      key: 'startTime',
      width: 100,
      render: (item, row) => {
        const {i18n} = this.props;
        const startDate = row.id ? moment.parseZone(item.start_date_time).utcOffset(this.userTimeOffset).format(timeFormat) : moment(item.start_date_time).format(timeFormat)
        let endDateTime = item.end_date_time ? moment(moment.parseZone(item.end_date_time).utcOffset(this.userTimeOffset).format(dbDateTimeFormat)) : null;
        return (
          <>
            {
              startDate
              + ' - ' +
              fnEndTimeText(moment(moment.parseZone(item.start_date_time).utcOffset(this.userTimeOffset).format(dbDateTimeFormat)), endDateTime, i18n.t`in process`)}
          </>
        )
      }
    },
    {
      title: <Trans>Duration</Trans>,
      key: 'startTimeTotal',
      width: 110,
      render: (item, row, index) => {
        let currentTrackedTime = Math.floor(moment.duration(moment.parseZone().diff(moment.parseZone(item.start_date_time).utcOffset(this.userTimeOffset))).asSeconds());
        currentTrackedTime = currentTrackedTime < 0 ? 0 : currentTrackedTime;
        const {i18n, works: {latestTask}} = this.props;
        let duration;
        if (latestTask.id === item.id && index === 0 && this.props.isTaskRunning) {
          duration = '-'
        } else {
          duration = item && item.duration
            ? fnDurationToHoursMinutesSecondsText(item.duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)
            : fnDurationToHoursMinutesSecondsText(START_SECONDS_TIME, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)
        }
        return (
          <div>
            {duration}
          </div>
        )
      }
    },
    {
      title: <Trans>Process</Trans>,
      key: 'process',
      width: 120,
      render: (item, row, index) => {
        const {i18n} = this.props;
        const workDays = [];
        const start = item.start_date_time ? moment(item.start_date_time) : null;
        const startDate = start ? start.format('YYYY-MM-DD') : null;

        if (start) {
          if (!workDays.includes(startDate)) {
            workDays.push(startDate);
          }
        }
        const primaryActions = PlayBtn(item, this.handleStartOrPause, this.state.enableButton, i18n);
        let secondaryActions;
        if (item.submitted === 0 && !item?.children) {
          secondaryActions = <>
            {EditItemBtn(item, this.handleEditWork, i18n)}
            <span className="icon-with-bg"
                  onClick={(e) => this.showDeleteModal(item)}>
              <Icons name="delete"/>
            </span>
          </>
        } else if (item.submitted === 1) {
          secondaryActions = InfoItemBtn(item, i18n);
        }
        return (
          <div className="row-actions">
            <div className="play-task-icon">{!item.children && item.end_date_time && primaryActions}</div>
            <div className="action-icons" tabIndex={"0"}>{!item?.children && secondaryActions}</div>
          </div>
        )
      },
    },
  ]

  /**
   * @method_componentDidUpdate By checking the displayByGroup prop, to force re-render component
   */

  componentDidUpdate(prevProps, prevState) {
    if (this.props.displayByGroup !== prevProps.displayByGroup) {
      this.setState({
        tableData: null
      })
      if (this.props.displayByGroup) {
        this.setState({
          isTableExpandable: false
        })
      }
    }
    if (this.props.items !== prevProps.items) {
      this.props.items && this.setState({
        tableData: this.getDataSource(this.props.items),
      })
    }
    if (this.props.items.length !== 0 && this.props.workCount !== prevProps.workCount) {
      this.setState(() => {
        return {tasksCurPage: 1};
      });
    }
  }

  getDataSource = (data) => {
    const {activeTask, workTimeTags} = this.props;
    if (data instanceof Object) {
      if (!(data instanceof Array)) {
        let groupByResultArr = [];
        for (let [workName, workArray] of Object.entries(data)) {
          workArray.forEach(function (work) {
            let workTagIds = [];
            if (workTimeTags && workTimeTags.length > 0) {
              workTimeTags.forEach(function (workTimeTag) {
                if (workTimeTag.work_time_id === work.work_time_id) {
                  workTagIds.push(workTimeTag.tag_id);
                }
              });
            }
            work.tagIds = sortBy(workTagIds);
            work.key = Math.random().toString(32).slice(2, 10);
          });
        }
        for (let [workName, workArray] of Object.entries(data)) {
          if (workArray.length > 1) {
            let groupByProjectId = groupBy(workArray, 'project_id');
            if (Object.keys(groupByProjectId).length > 0) {
              for (let [projectId, worksByProjectId] of Object.entries(groupByProjectId)) {
                let groupByTagIds = groupBy(worksByProjectId, 'tagIds');
                if (Object.keys(groupByTagIds).length > 0) {
                  for (let [tagIds, worksByTagIds] of Object.entries(groupByTagIds)) {
                    let groupItemChildrenArray = [];
                    let groupItemStartDates = [];
                    let groupItemEndDates = [];
                    let totalDurationWork = 0;
                    let groupByDataObject = {}
                    worksByTagIds.forEach(function (work) {
                      if (work?.start_date_time) groupItemStartDates.push(moment(work?.start_date_time));
                      if (activeTask && activeTask.id !== work?.id) {
                        if (work?.end_date_time) groupItemEndDates.push(moment(work?.end_date_time));
                      }
                      totalDurationWork += work.duration;
                      groupItemChildrenArray.push(work);
                      groupByDataObject = {...work};
                    });
                    if (groupItemChildrenArray && groupItemChildrenArray.length > 1) {
                      groupByDataObject.children = groupItemChildrenArray;
                      groupByDataObject.start_date_time = moment.min(groupItemStartDates).format("YYYY-MM-DD HH:mm:ss");
                      if (groupItemEndDates.length > 0) {
                        groupByDataObject.end_date_time = moment.max(groupItemEndDates).format("YYYY-MM-DD HH:mm:ss");
                      }
                      groupByDataObject.duration = totalDurationWork;
                      groupByDataObject.project_id = parseInt(projectId) ? parseInt(projectId) : null;
                      groupByDataObject.name = workName;
                      groupByDataObject.sortDate = moment.max(groupItemStartDates).format("YYYY-MM-DD HH:mm:ss");
                      groupByResultArr.push(groupByDataObject);
                    } else {
                      groupItemChildrenArray[0]['sortDate'] = groupItemChildrenArray[0]['start_date_time'];
                      groupByResultArr.push(groupItemChildrenArray[0]);
                    }
                  }
                }
              }
            }
          } else if (workArray.length === 1) {
            workArray[0]['sortDate'] = workArray[0]['start_date_time'];
            groupByResultArr.push(workArray[0]);
          }
        }
        groupByResultArr.map(groupedTask => {
          if (groupedTask?.hasOwnProperty("children")) {
            for (let [key, value] of Object.entries(groupedTask.children)) {
              key = Math.random().toString(32).slice(2, 10);
              value.key = key;
            }
          }
          return groupedTask
        });
        return groupByResultArr.sort((a, b) => moment(b.sortDate) - moment(a.sortDate));
      }
    }
    data.forEach(dataItem => dataItem.key = Math.random().toString(32).slice(2, 10))
    return data;
  }

  get projectDropdownProps() {
    const {workedToday, tagsProps, workTimeTags, projects, displayByGroup, items, allTags} = this.props;
    let show = true;
    if (displayByGroup) {
      for (let itemKey in items) {
        if (items.hasOwnProperty(itemKey)) {
          if (items[itemKey] instanceof Array) {
            show = !items[itemKey][0]?.submitted;
            break;
          }
        }
      }
    } else {
      if (items instanceof Array) {
        show = !items[0]?.submitted;
      }
    }
    return {
      workedToday,
      tagsProps,
      show: !show ? show : this.state.showProjectsDropdown,
      onClose: this.handleProjectsDropdownClose,
      onChange: this.handleProjectClick,
      onChangeTag: this.handleTagClick,
      projects,
      workTimeTags,
      currentProject: this.state.activeProject,
      allTags: tagsProps.allTags,
      handleSelectedTags: this.selectedTagsFromAddTagModal,
    }
  };

  selectedTagsFromAddTagModal = selectedTags => {
    this.setState({
      activeTagsArray: [...selectedTags]
    })
  }

  handleRefresh = newQuery => {
    const pathname = window.location.pathname;
    router.push({
      pathname,
      search: stringify(
        {
          ...newQuery,
        },
        {arrayFormat: 'repeat'}
      ),
    });
    this.setState({
      isModalVisible: false,
    });
  };

  updateWork = (workedTime, ongoingTask) => {
    this.setState({
      tableData: null
    });
    const {form, dispatch, onProjectReset, displayByGroup} = this.props;
    const {validateFields, getFieldsValue} = form;
    validateFields(errors => {
      if (errors) {
        return
      }
      const {...formValues} = getFieldsValue(['description', 'duration', 'name', 'project']);
      const updateData = {
        formValues: {...formValues, ...workedTime},
        ongoingTask: ongoingTask,
        work_id: this.state.activeWork.id,
        work_time_id: this.state.activeWork.work_time_id,
        project_id: this.state.activeProject.id,
        tagIds: this.state.activeTagsArray.map(tag => {
          return tag.id;
        }),
        displayByGroup
      };
      dispatch({
        type: `works/update`,
        payload: updateData,
      }).then(() => {
        this.setState({
          isModalVisible: false,
          isTableExpandable: true
        })
        onProjectReset()
      }).catch(console.error);
    })
  };

  handlePagination = (page) => {
    const {onGetWorkList} = this.props;
    this.setState(() => {
      onGetWorkList(page);
      return {tasksCurPage: page};
    });
  }

  setIsModalVisible(isModalVisible) {
    this.setState({isModalVisible});
  };

  showDeleteModal(e) {
    this.setState(prevState => ({
      deleteWorkItem: e,
      isDeleteModalVisible: !prevState.isDeleteModalVisible
    }));
  }

  handleRemoveWorkTime = (work) => {
    const {onRemoveWorkTime, currentItem, onClearForm, onProjectReset} = this.props;
    if (work) {
      onRemoveWorkTime(work.id, work.work_time_id);
      if (work.id === currentItem.id && work.work_time_id === currentItem.work_time_id) {
        onClearForm();
      }
    }
    onProjectReset()
    this.setState(prevState => ({
      isDeleteModalVisible: !prevState.isDeleteModalVisible
    }));
  };

  handleEditWork = (e, work) => {
    e.preventDefault();
    e.stopPropagation();
    if (!work?.children) {
      const {workTimeTags} = this.props;
      const tags = [];
      workTimeTags.map((el) => {
        if (work.work_time_id === el.work_time_id) {
          tags.push({
            name: el.name,
            id: el.tag_id,
            color: el.color
          });
        }
      })
      this.setIsModalVisible(true);
      this.setState({
        activeProject: {
          id: work.project_id,
          name: work.project_name,
          color: work.project_color
        },
        activeTagsArray: tags,
        activeWork: {
          id: work.id,
          project_id: work.project_id,
          work_name: work.name,
          work_time_id: work.work_time_id,
          start_date_time: work.start_date_time,
          end_date_time: work.end_date_time,
          duration: work.duration,
          description: work.description,
          comments: work.comments,
          is_editable: !work.submitted,
        }
      });
    }
  };

  handleStartOrPause = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const {buttonDisabled} = this.props;
    if (!buttonDisabled) {
      this.setState({enableButton: true});
      const {onStartOrPause} = this.props;
      onStartOrPause(item);
    }
    setTimeout(() => {
      this.setState({enableButton: false});
    }, 1000)
  };

  get updateWorkModalProps() {
    const {
      form,
      workedToday,
      activeTagsArray,
      todayBusyTimes,
      runningTaskStartTime,
      workTimeTags,
      selectedDate,
      _todayBusyTimes
    } = this.props;
    return {
      _todayBusyTimes,
      selectedDate,
      form,
      workedToday,
      workTimeTags,
      state: this.state,
      todayBusyTimes: todayBusyTimes,
      runningTaskStartTime: runningTaskStartTime,
      onClose: () => this.setState({isModalVisible: false}),
      handleDeleteComment: (commentId, workId) => this.handleDeleteComment(commentId, workId),
      handleProjectsDropdownClick: () => this.handleProjectsDropdownClick(),
      projectDropdownProps: {...this.projectDropdownProps, activeTagsArray},
      updateWork: (workedTime, ongoingTask) => this.updateWork(workedTime, ongoingTask),
      handleChangeAddComment: comment => this.setState({addCommentText: comment}),

      addComment: (userId, activeWorkId, parent_id, fromMain, fromMainTxt) => this.handleAddComment(userId, activeWorkId, parent_id, fromMain, fromMainTxt),
      loadMoreComments: () => this.loadMoreComments(),
      handleReply: commentId => this.setState({reply: commentId}),
      handlePostBtnClick: () => this.handlePostBtnClick(),
      onCancelEdit: () => {
        this.setState({activeWork: {...this.state.activeWork, editComment: null, editCommentText: null}})
      },
      onCancelReply: () => {
        this.setState({...this.state.activeWork, reply: null, addCommentText: null})
      },
      handleEditComment: (comment, type) => {
        if (type === "edit") {
          this.setState({activeWork: {...this.state.activeWork, editCommentText: comment}})
        }
      },
      handleEditBtnClick: (commentId, commentText) => {
        this.setState({
          activeWork: {
            ...this.state.activeWork,
            editComment: commentId,
            editCommentText: commentText
          }
        })
      },
    }
  };

  handleProjectsDropdownClick = () => {
    this.setState((prevState) => ({
      showProjectsDropdown: !prevState.showProjectsDropdown
    }));
  };

  handleProjectsDropdownClose = () => {
    this.setState({
      showProjectsDropdown: false
    });
  };

  handleProjectClick = (project) => {
    this.setState({
      activeProject: {
        name: project.name,
        id: project.id,
        color: project.color
      }
    });
  };

  handleTagClick = (tag) => {
    if (!(this.state.activeTagsArray.filter(item => tag.id === item.id).length > 0)) {
      this.setState(prevState => ({
        activeTagsArray: this.state.activeTagsArray.concat({
          name: tag.name,
          id: tag.id,
          color: tag.color
        })
      }));
    } else {
      this.setState(prevState => ({
          activeTagsArray: this.state.activeTagsArray.filter(item => tag.id !== item.id)
        })
      )
    }
  };

  handleAddComment = (user_id, work_time_id, parent_id = null, mainText = false, fromMainTxt, name, description) => {
    const {dispatch, i18n} = this.props;
    let text;
    if (mainText && fromMainTxt) {
      text = fromMainTxt;
      this.setState({showMainTxt: mainText})
    } else {
      if (this.state.addCommentText) {
        text = this.state.addCommentText
      } else if (this.state.activeWork.editCommentText) {
        text = this.state.activeWork.editCommentText;
      } else {
        text = ""
      }
    }
    if (user_id && work_time_id && text) {
      dispatch({
        type: 'works/storeComment',
        payload: {
          user_id,
          work_time_id,
          text,
          parent_id
        }
      }).then(() => {
        this.setState({
          addCommentText: '',
          showMainTxt: false
        });

        if (this.state.activeWork.loadedMoreComments) {
          this.setState({reply: null});
          this.loadMoreComments();
          return
        }
        const {commentStoreResponse} = this.props;
        this.setState({
          reply: null,
          activeWork: {
            ...this.state.activeWork,
            comments: commentStoreResponse.list,
          },
          addCommentText: "",
          repliedText: ""
        });
      }).catch(console.error);
    } else {
      message.error(i18n.t`Please fill in the comment field`);
    }
  }

  handlePostBtnClick() {
    const {dispatch} = this.props;
    dispatch({
      type: 'works/editComment',
      payload: {
        'id': this.state.activeWork.editComment,
        'text': this.state.activeWork.editCommentText
      }
    }).then(() => {
      const {commentSuccessEdited, comments} = this.props;
      if (commentSuccessEdited) {
        this.setState({
          activeWork: {
            ...this.state.activeWork,
            editCommentText: null,
            editComment: null,
          }
        });
        if (this.state.activeWork.loadedMoreComments) {
          this.loadMoreComments();
        } else {
          let _comments = [...comments];
          let prevComments = this.state.activeWork?.comments;
          if (prevComments && comments) {
            if (_comments.length > 0) {
              _comments = comments.map(comment => {
                if (prevComments.length > 0) {
                  for (let i in prevComments) {
                    if (prevComments[i].id === comment.id) {
                      comment.user_avatar = prevComments[i].user_avatar;
                      comment.username = prevComments[i].username;
                    }
                  }
                }
                return comment;
              });
            }
          }
          this.setState({
            activeWork: {
              ...this.state.activeWork,
              comments: _comments,
            }
          });
        }
      }
    }).catch(console.error);
  }

  handleDeleteComment(id, work_time_id) {
    const {dispatch} = this.props;
    dispatch({
      type: 'works/deleteComment',
      payload: {
        'id': id,
        'work_time_id': work_time_id
      }
    }).then(() => {
      const {commentSuccessDeleted, comments} = this.props;
      if (commentSuccessDeleted) {
        if (this.state.activeWork.loadedMoreComments) {
          this.loadMoreComments();
        } else {
          this.setState({
            activeWork: {
              ...this.state.activeWork,
              comments: comments,
            }
          });
        }
      }
    }).catch(console.error);
  }

  loadMoreComments = () => {
    const {dispatch} = this.props;
    this.setState({showMainTxt: true})
    dispatch({
      type: 'works/getComments',
      payload: {
        'work_time_id': this.state.activeWork.work_time_id
      }
    }).then(() => {
      const {comments} = this.props;
      this.setState({
        activeWork: {
          ...this.state.activeWork,
          comments: comments,
          loadedMoreComments: true,
        }
      })
    }).catch(console.error);
  }

  customExpandIcon(props) {
    const {expanded, onExpand, record} = props
    if (record.children) {
      return expanded ?
        <span className="expanded-icon" onClick={e => {
          onExpand(record, e);
        }}><Icons name="arrowUp"/></span> :
        <span className="expanded-icon" onClick={e => {
          onExpand(record, e);
        }}><Icons name="arrowdown"/></span>;
    }
  }

  render() {
    const {i18n, loadingItems, canLoadNextItems, form, workCount} = this.props;
    const {tableData, isTableExpandable, isDeleteModalVisible, deleteWorkItem, tasksCurPage} = this.state;
    const {getFieldDecorator} = form;

    if (!this.state.tableData) return (
      <div className={styles['loader-wrapper']}>
        <Spin/>
      </div>
    )

    return (
      <div
        tabIndex="0"
        className="data-table-wrapper">
        {tableData ?
          <Table
            columns={this.columns}
            loading={{spinning: loadingItems && !tableData?.length, indicator: (<Spin/>)}}
            defaultExpandAllRows={isTableExpandable}
            rowKey="key"
            expandIcon={(props) => this.customExpandIcon(props)}
            dataSource={tableData}
            pagination={false}
            scroll={{x: 1000}}
            className={`data-table ${styles['tasks-table']}`}
          />
          : ''}
        {
          workCount > 10 ?
            <div className={styles['paginationBlock']}>
              <Pagination
                onChange={this.handlePagination}
                current={tasksCurPage}
                total={workCount}
              />
            </div>
            : null
        }
        <UpdateWorkModal {...this.updateWorkModalProps} i18n={i18n} getFieldDecorator={getFieldDecorator}/>
        <Modal
          centered
          width={400}
          footer={null}
          title={i18n.t`DELETE TASK`}
          visible={isDeleteModalVisible}
          closeIcon={
            <span onClick={() => this.showDeleteModal()}
                  className="close-icon">
                <Icons name="close"/>
              </span>
          }
          className={styles['delete-modal']}
        >
          <div>
            <div className={styles['delete-modal-content']}>
              Are you sure you want to
              delete this task?
            </div>
            <div className="modal-footer-actions">
              <Button
                className="app-btn primary-btn-outline md"
                shape="round"
                onClick={() => this.showDeleteModal()}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                tabIndex={"0"}
                className="app-btn primary-btn md"
                shape="round"
                onClick={() => this.handleRemoveWorkTime(deleteWorkItem)}
              >
                <Trans>Yes</Trans>
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

TasksTable.propTypes = {
  onClearForm: PropTypes.func,
  onGetWorkList: PropTypes.func,
  onStartOrPause: PropTypes.func,
  onRemoveWorkTime: PropTypes.func,
  onSetSelectedWork: PropTypes.func,
  location: PropTypes.object,
};

export default TasksTable
