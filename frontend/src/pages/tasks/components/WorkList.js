import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Row,
  Col,
  List,
  Button,
  Menu,
  Dropdown,
  Tag,
  Tooltip,
  Icon,
  Popconfirm,
  Form,
  Input,
} from 'antd';
import ProjectsDropdown from "./ProjectsDropdown";
import {router, fnDurationToHoursMinutesSecondsForReports} from 'utils';
import {appUrl} from 'utils/config';
import store from 'store'
import {stringify} from "qs";
import {connect} from "dva";

import { Trans, withI18n } from '@lingui/react';
import Link from 'umi/link';
import {
  getStatusTextColor,
  fnDurationHumanizeText,
  fnEndTimeText,
  fnStartDateTextColor,
  fnDurationToHoursMinutesSecondsText
} from 'utils';
import moment from 'utils/moment';
import styles from "../../../components/Page/Page.less";
import {
  RightOutlined,
  FileDoneOutlined,
  MoreOutlined,
  EditOutlined,
  EyeFilled,
  EllipsisOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FolderAddOutlined
} from '@ant-design/icons';
import {CalendarIcon, PauseIcon} from "icons/antd";
import UpdateWorkModal from "./UpdateWorkModal/UpdateWorkModal.js";

const {TextArea} = Input;
const timeFormat = 'HH:mm';

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};

@connect(({workList, loading}) => ({workList, loading}))
@withI18n()
@Form.create()
class WorkList extends PureComponent {
  state = {
    isModalVisible: false,
    activeProject: {},
    activeTagsArray: [],
    activeWork: {},
    showProjectsDropdown: false,
    loading: false,
    user: store.get('user'),
    addCommentText: "",
    editCommentText: "",
    repliedText: ""
  };

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

  updateWork = (workedTime) => {
    const {form, dispatch} = this.props;
    const {validateFields, getFieldsValue} = form;
    validateFields(errors => {
      if (errors) {
        return
      }
      const {...formValues} = getFieldsValue();
      const updateData = {
        formValues: {...formValues, ...workedTime},
        work_id: this.state.activeWork.id,
        work_time_id: this.state.activeWork.work_time_id,
        project_id: this.state.activeProject.id,
        tagIds: this.state.activeTagsArray.map(tag => {
          return tag.id;
        })
      };
      dispatch({
        type: `works/update`,
        payload: updateData,
      }).then(() => {
        this.handleRefresh()
      }).catch(console.error);
    })
  };
  onLoadMore = () => {
    const { page, onGetWorkList } = this.props;
    onGetWorkList((page + 1));
  };

  setIsModalVisible(isModalVisible) {
    this.setState({isModalVisible});
  }
  handleRemoveWorkTime = (e, work) => {
    e.preventDefault();
    e.stopPropagation();
    const { onRemoveWorkTime, currentItem, onClearForm } = this.props;
    if(work){
      onRemoveWorkTime(work.id, work.work_time_id);
      if (work.id === currentItem.id && work.work_time_id === currentItem.work_time_id) {
        onClearForm();
      }
    }
  };

  handleEditWork = (e, work) => {
    e.preventDefault();
    e.stopPropagation();
    const {workTimeTags} = this.props;
    const tags = [];
    this.setIsModalVisible(true)
    this.setIsModalVisible(true);
    this.setState({
      activeProject: {
        id: work.project_id,
        name: work.project_name,
      }
    });
    workTimeTags.map((el) => {
      if (work.work_time_id === el.work_time_id) {

        tags.push({
          name: el.name,
          id: el.tag_id,
          color: el.color
        });
      }

    })
    this.setState({
      activeTagsArray: tags
    });
    this.setState({
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
      }
    });
  };

  handleStartOrPause = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const { onStartOrPause } = this.props;
    onStartOrPause(item);
  };

  editItemBtn = (item) => {
    return (
      <span
        className={styles.taskActionsDropdownItem}
        onClick={(e) => this.handleEditWork(e, item)}
      >
        <EyeFilled style={{color: 'rgba(0, 0, 0, 0.3)'}}/>
        <Trans>View</Trans>
      </span>);
  };

  infoItemBtn = (item) => {
    const { i18n } = this.props;
    return (
      <Tooltip placement="top"
               title={i18n.t`Already submitted`}
      >
         <Icon type="info-circle"
               size={'small'}
               style={{fontSize: '18px'}} />
      </Tooltip>
    )
  };

  removeItemBtn = (item) => {
    const { i18n } = this.props;
    return (<Popconfirm
      title={i18n.t`Are you sure delete this item?`}
      okText="Yes"
      placement="topRight"
      onConfirm={(e) => this.handleRemoveWorkTime(e, item)}
    >
      <span className={styles.taskActionsDropdownItem}>
        <DeleteOutlined style={{color: 'rgba(0, 0, 0, 0.3)'}}/>
        <Trans>Delete</Trans>
      </span>
    </Popconfirm>)
  };

  get projectDropdownProps() {
    const {workedToday} = this.props;
    return {
      workedToday,
      show: !workedToday ? workedToday : this.state.showProjectsDropdown,
      onClose: this.handleProjectsDropdownClose,
      onChange: this.handleProjectClick,
      onChangeTag: this.handleTagClick,
      projects: this.props.projects,
      workTimeTags: this.props.workTimeTags,
      currentProject: this.state.activeProject,
      allTags: this.props.allTags
    }
  };

  get updateWorkModalProps() {
    const {form, workedToday, workTimeTags} = this.props;
    return {
      form,
      workedToday,
      state: this.state,
      onClose: () => this.setState({isModalVisible :false}),
      handleDeleteComment: (commentId, workId) => this.handleDeleteComment(commentId, workId),
      handleProjectsDropdownClick: () => this.handleProjectsDropdownClick(),
      projectDropdownProps: {...this.projectDropdownProps},
      updateWork: workedTime => this.updateWork(workedTime),
      handleChangeAddComment: comment => this.setState({addCommentText: comment}),
      addComment: (userId, activeWorkId, parent_id) => this.handleAddComment(userId, activeWorkId, parent_id),
      loadMoreComments: () => this.loadMoreComments(),
      handleReply: commentId => this.setState({reply: commentId}),
      handlePostBtnClick: () => this.handleEditComment(),
      handleEditComment: (comment, type) => {
        if (type === "reply"){
          this.setState({
            repliedText: comment
          })
        }else{
          this.setState({
            activeWork: {...this.state.activeWork, editCommentText: comment}
          })
        }
      },
      handleEditBtnClick: commentId => {
        this.setState({
          activeWork: {
            ...this.state.activeWork,
                editComment: commentId,
          }})
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
        id: project.id
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

  handleAddComment = (user_id, work_id, parent_id = null) => {
    const { dispatch } = this.props;
    let text;
      if (parent_id && this.state.repliedText) {
        text = this.state.repliedText;
      }else if (this.state.addCommentText){
        text = this.state.addCommentText
      }else {
        text = ""
      }
    if(user_id && work_id && text) {
      dispatch({
        type: 'works/storeComment',
        payload: {
          user_id,
          work_id,
          text,
          parent_id
        }
      }).then(() => {
        if(this.state.activeWork.loadedMoreComments){
          this.setState({reply: null});
          this.loadMoreComments();
          return
        }
        const { commentStoreResponse } = this.props;
        this.setState({
          reply:  null,
          activeWork: {
            ...this.state.activeWork,
            comments: commentStoreResponse.list,
          },
          addCommentText: "",
          repliedText: ""
        });
      }).catch(console.error);
    }
  }
  handleEditComment(){
    const { dispatch } = this.props;
    dispatch({
      type: 'works/editComment',
      payload: {
        'id': this.state.activeWork.editComment,
        'text': this.state.activeWork.editCommentText
      }
    }).then(() => {
      const {commentSuccessEdited, comments} = this.props;
      if(commentSuccessEdited){
        this.setState({
          activeWork: {
            ...this.state.activeWork,
            editCommentText: null,
            editComment: null,
          }});
        if(this.state.activeWork.loadedMoreComments){
          this.loadMoreComments();
        } else{
          this.setState({
            activeWork: {
              ...this.state.activeWork,
              comments: comments,
            }});
        }
      }
    }).catch(console.error);
  }

  handleDeleteComment(id, work_id){
    const { dispatch } = this.props;
    dispatch({
      type: 'works/deleteComment',
      payload: {
        'id': id,
        'work_id': work_id
      }
    }).then(() => {
      const { commentSuccessDeleted, comments } = this.props;
      if(commentSuccessDeleted){
        if(this.state.activeWork.loadedMoreComments){
          this.loadMoreComments();
        } else{
          this.setState({activeWork: {
              ...this.state.activeWork,
              comments: comments,
            }});
        }
      }
    }).catch(console.error);
  }

  loadMoreComments = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'works/getComments',
      payload: {
        'work_id': this.state.activeWork.id
      }
    }).then(() => {
      const { comments } = this.props;
      this.setState({
        activeWork: {
          ...this.state.activeWork,
          comments: comments,
          loadedMoreComments: true,
        }
      })
    }).catch(console.error);
  }

  render() {
    const {i18n, loadingItems, items, canLoadNextItems, form, totalDuration, workTimeTags} = this.props;
    const {getFieldDecorator} = form;
    const loadMore =
      !loadingItems && canLoadNextItems ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px',
          }}
        >
          <Button onClick={this.onLoadMore} className={styles.loadMoreBtn}><Trans>Load More</Trans></Button>
        </div>
      ) : null;

    let workDays = [];

    return (
        <div>
          <div className={styles.taskListHeaders}>
            <div><Trans>Task Name</Trans></div>
            <div><Trans>Project</Trans></div>
            <div><Trans>Time</Trans></div>
            <div><Trans>Process</Trans></div>
          </div>
          <Row>
            <Col span={8} offset={16} className={styles.totalDurationText}>{totalDuration ? fnDurationToHoursMinutesSecondsForReports(totalDuration) : 0}</Col>
          </Row>
          <List
            className={styles.taskTable}
            loading={loadingItems}
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={items}
            renderItem={item => {
              const start = item.start_date_time ? moment(item.start_date_time) : null;
              const startDate = start ? start.format('YYYY-MM-DD') : null;

              let _avatar = null;
              if (start){
                const startDateTextColor = fnStartDateTextColor(item.start_date_time);
                let durationText = fnDurationHumanizeText(item.start_date_time, item.duration);

                if(!workDays.includes(startDate)) {
                  workDays.push(startDate);
                }
              }
              let primaryActions = [];
              let secondaryActions = [];
              primaryActions.push((<Button
                htmlType="submit"
                icon={item.end_date_time ? 'caret-right' : 'pause' }
                style={{ fontSize: '24px', color: item.end_date_time ? '#3F0F3F' : 'rgba(63, 15, 63, 0.3)' }}
                onClick={(e) => this.handleStartOrPause(e, item)}
                className={styles.playPauseBtn}
              >
              </Button>));
              if (item.submitted === 0) {
                secondaryActions.push(this.editItemBtn(item));
                secondaryActions.push(this.removeItemBtn(item));
              } else if(item.submitted === 1) {
                secondaryActions.push(this.infoItemBtn(item));
              }
              const menu = (
                <Menu className={styles.rightPoints}>
                  {secondaryActions.map((menuItem,index) => <Menu.Item key={index}>{menuItem}</Menu.Item>)}
                </Menu>
              );
              let currentTrackedTime = moment.duration(moment().diff(moment(item.start_date_time))).asSeconds()
              return (
                <List.Item
                  key={item.id}
                >
                  <List.Item.Meta
                    style={{flex: 'unset'}}
                    title={
                      <Row className={styles.taskRow}>
                        <div><RightOutlined style={{
                          marginRight: '20px',
                          fontSize: '1rem',
                          color: 'rgba(0, 0, 0, 0.3)'
                        }}/><FileDoneOutlined
                          style={{marginRight: '5px', fontSize: '1rem', color: 'rgba(0, 0, 0, 0.3)'}}/>
                          {item.description &&
                          <Button type="link"
                                  size={'small'}
                                  onClick={(e) => this.handleEditWork(e, item)}
                                  style={{color: 'black'}}>
                            <span>
                              {item.name}
                              <EllipsisOutlined style={{color: 'black', fontSize: '1.5rem', position: 'absolute'}}/>
                            </span>
                          </Button> ||
                          <Button
                            type="link"
                            size={'small'}
                            onClick={(e) => this.handleEditWork(e, item)}
                            style={{color: 'black'}}
                          >
                            {item.name}
                          </Button>}
                        </div>
                        <Col>
                          {item.project_name && <span className={styles.projectNameSect}><span
                            style={{backgroundColor: item.project_color}}>{item.project_name}</span></span>}
                          {workTimeTags.map((el, index) => {
                              if (item.work_time_id === el.work_time_id) {
                                return <span key={index} className={styles.tagNameSect}><span
                                  style={{backgroundColor: el.color}}>{el.name}</span></span>
                              }
                            }
                          )}
                        </Col>
                      </Row>
                    }
                  />
                  <div className={styles.timeIntervalSect}>
                    <div>{moment(item.start_date_time).format(timeFormat) + ' - ' + fnEndTimeText(item.start_date_time, item.end_date_time)}</div>
                  <div>
                    <span>{item.duration !== 0 ? fnDurationToHoursMinutesSecondsText(item.duration, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`) : fnDurationToHoursMinutesSecondsText(currentTrackedTime, i18n.t`shortHour`, i18n.t`shortMinute`, i18n.t`shortSecond`)}</span>
                  </div>
                  </div>
                  <div className={styles.taskActions}>
                    {
                      primaryActions.map((el,index) => <span key={index}>{el}</span>)
                    }
                    <Dropdown overlay={menu} placement="bottomRight" overlayClassName={styles.editModalIndex}>
                      <MoreOutlined style={{color: 'rgba(120, 112, 112, 0.25)', fontSize: '2.2rem'}}/>
                    </Dropdown>
                  </div>
                </List.Item>
              )
            }
            }
          />
          <UpdateWorkModal {...this.updateWorkModalProps} i18n={i18n} getFieldDecorator={getFieldDecorator} />
        </div>
    )
  }
}

WorkList.propTypes = {
  onClearForm: PropTypes.func,
  onGetWorkList: PropTypes.func,
  onStartOrPause: PropTypes.func,
  onRemoveWorkTime: PropTypes.func,
  onSetSelectedWork: PropTypes.func,
  location: PropTypes.object,
};

export default WorkList
