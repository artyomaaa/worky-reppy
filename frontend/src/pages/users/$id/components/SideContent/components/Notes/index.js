import React from 'react';
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import styles from "../Notes/style.less";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Input,
  message,
  Popconfirm,
  Row,
  Col,
  Radio,
  DatePicker,
  TimePicker,
  Tooltip
} from "antd";
import {Form} from "@ant-design/compatible";
import {withRouter} from "dva/router";
import {withI18n} from "@lingui/react";
import {connect} from "dva";
import {NOTES, PERMISSIONS, USER_DYNAMIC_COMPONENTS} from 'utils/constant';
import userAvatar from "img/avatar.png";
import {appUrl} from 'utils/config';
import store from "store";
import {checkLoggedUserPermission, getResizedImage, getUserFullName} from 'utils';
import moment from 'moment';
import Icons from 'icons/icon';
import NotesUsersDropdown from './NotesUsersDropdown';

const loggedUser = store.get('user');
const FormItem = Form.Item;

const {TextArea} = Input;
const mapStateToProps = ({userDetail}) => ({userDetail});


@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)
class Notes extends React.Component {
  state = {
    matches: window.matchMedia("(min-width: 768px)").matches,
    notesData: {
      note: {},
      deletedIds: [],
      actionType: '',
      editDisplay: true,
      from: null,
      to: null,
    },
    show: true,
    showForm: false,
    currentEditNoteData: null,
    radioOption: 0,
    reminderOption: false,
    timeValue: moment().format('HH:mm'),
    showNotesUsersDropdown: false,
    editValue: '',
  };

  #dateFormat = 'DD/MM/YYYY';

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);

    const {dispatch} = this.props;
    dispatch({
      type: `userDetail/emptyNoteData`,
    })
  }

  callbackFunction = (users) => {
    this.setState({usersList: users})
    this.handleNotesUsersDropdownClose();
  }

  setCurrentEditNoteData = (data) => {
    this.setState({
      currentEditNoteData: data
    });
  }

  addNotesData = (formId = null) => {
    const {form, dispatch, userDetail, i18n} = this.props,
      notes = userDetail[USER_DYNAMIC_COMPONENTS.NOTES],
      {getFieldsValue} = form,
      {note_type, note, edit_note_type, edit_note, reminder_date, event_id} = getFieldsValue(),
      visibility_user_ids = note_type || edit_note_type ? this.state.usersList?.length ? this.state.usersList.map(({id}) => id) : JSON.parse(this.state.currentEditNoteData?.shared_users) : [notes.id],
      date = reminder_date ? moment(reminder_date).format('YYYY/MM/DD') : moment().format('YYYY/MM/DD'),
      time = this.state.timeValue ? this.state.timeValue : '00:00';
    process.nextTick(() => {
      const updateData = {
        note_type: formId ? edit_note_type : note_type,
        note: formId ? edit_note : note,
        id: notes.id,
        uuid: this.state.currentEditNoteData?.uuid,
        visibility_user_ids: [...new Set(visibility_user_ids)],
        tab: USER_DYNAMIC_COMPONENTS.NOTES,
        reminderDate: date + ' ' + time,
        user_name: userDetail.headerData.name,
        set_reminder: this.state.reminderOption,
        google_event_id: event_id
      };
      if (formId) {
        updateData.formId = formId;
      }
      dispatch({
        type: `userDetail/update`,
        payload: updateData,
      }).then(response => {
        if (response.success) {
          if (formId) {
            response.dbMessage && message.success(i18n.t`Your note has been updated successfully`);
            response.googleMessage && message.error(response.googleMessage);
            this.setCurrentEditNoteData(null);
          } else {
            response.dbMessage && message.success(i18n.t`New notes added successfully`);
            response.googleMessage && message.error(response.googleMessage);
            this.onCancelForm();
          }
        }
      })
    });

    this.setState({
      showForm: false,
    })
  }

  deleteNotes = (e, item, type) => {
    const {dispatch} = this.props,

      deleteData = {
        note_id: item.id,
        user_id: item.user_id,
        uuid: item.uuid,
        tab: "note",
        type: type,
        google_event_id: item.google_event_id
      };
    dispatch({
      type: `userDetail/deleteNote`,
      payload: deleteData,
    }).then(response => {
      if (response.status) {
        response.dbMessage &&   message.success(response.dbMessage);
        response.googleMessage && message.error(response.googleMessage);
      }
    })
  }

  onAddNote = (mode) => {
    this.setState( {
      showForm: mode,
      radioOption: 0,
      reminderOption: false,
      timeValue: null,
      usersList: [],
      editValue: '',
    });
  };

  onCancelForm = (isEdit) => {
    if (isEdit) {
      this.setCurrentEditNoteData(null);
    } else {
      this.setState({
        usersList: [],
      });
    }

    this.setState({
      showForm: false,
      editValue: '',
    });
  };

  handleChangeEditNote = ({target: {value}}) => {
    this.setState({ editValue: value });
  };

  editNote = (item, mode) => {
    this.setCurrentEditNoteData(item);
    this.setState({
      showForm: mode,
      radioOption: item.notes_type,
      reminderOption: item.reminder,
      timeValue: (item.reminder_date_time ? moment(item.reminder_date_time).format('HH:mm') : null),
      editValue: item.notes_text ? item.notes_text : '',
    });
  };

  setShowNotesUsersDropdown = () => {
    this.setState({showNotesUsersDropdown: true});
  };
  attachedUsers = (users) => {
    return users && users.map((u, index) => {
      return index < 3 ? (
        <div key={u.id} className={styles['avatar-badge']}>
          <span className={styles['users-tooltip']}>{getUserFullName(u)}</span>
          <img className={styles['avatar']}
               src={u.avatar ?
                 `${appUrl}storage/images/avatars` + getResizedImage(u.avatar)
                 : userAvatar}
          />
        </div>
      ) : '';
    })
  };
  userTooltipContent = (users) => {
    return users && users.map((user, index) => index > 2 && `${getUserFullName(user)}${users.length - 1 !== index ? ', ' : ''}`)
  }
  getAttachedUsers = (users, attachedUsers) => {
    const attachedIdUsers = JSON.parse(attachedUsers);
    return users.data.filter(person => attachedIdUsers.includes(person.id));
  }
  handleNotesUsersDropdownClose = () => {
    this.setState({showNotesUsersDropdown: false})
  };

  notesUsersDropdownProps = () => {
    const {
        showNotesUsersDropdown,
      } = this.state,
      {userDetail: {users}} = this.props;

    return {
      users: users.data,
      show: showNotesUsersDropdown,
      onClose: this.handleNotesUsersDropdownClose,
      parentCallback: this.callbackFunction,
      userDetail: this.props.userDetail.headerData,
      attachedUsers: this.state.currentEditNoteData?.shared_users ? this.getAttachedUsers(users, this.state.currentEditNoteData.shared_users) : [],
    }
  };

  onChange = e => {
    this.setState({
      radioOption: e.target.value,
    });
  };

  onChangeReminder = e => {
    const {userDetail: {googleCalendarConnected}, i18n} = this.props;
    if(googleCalendarConnected) {
      this.setState({
        reminderOption: e.target.checked,
      });
    } else {
      message.error(i18n.t`Please link a Google Calendar to add reminder`);
    }
  };

  getTimeValues = e => {
    this.setState({
      timeValue: moment(e).format('HH:mm'),
    });
  };

  disabledPastDate = (value) => {
    return value && value < moment().startOf('day').add(0, 'days');
  }

  getDisabledHours = () => {
    const hours = [];
    const {form} = this.props;
    form.getFieldValue('reminder_date')
    if (moment(form.getFieldValue('reminder_date')) <= moment())
      for (let i = 0; i < moment().hour(); i++) {
        hours.push(i);
      }
    return hours;
  }

  getDisabledMinutes = () => {
    const minutes = [];
    const {form} = this.props,
      {getFieldsValue} = form,
      {reminder_time, reminder_date} = getFieldsValue();
    const selectedHour = moment(reminder_time).hour();
    if (moment(reminder_date) <= moment() && selectedHour <= moment().hour()) {
      for (let i = 0; i < moment().minute(); i++) {
        minutes.push(i);
      }
    }
    return minutes;
  }

  toPaintNotesForm = (noteItem = null) => {
    const {notesData: {note}, usersList, editValue, showForm} = this.state,
      {i18n, form, userDetail} = this.props,
      {users} = userDetail,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM;
    let actionParameter = noteItem ? noteItem.id : null;
    let noteFieldName = noteItem ? 'edit_note' : 'note';
    let noteTypeFieldName = noteItem ? 'edit_note_type' : 'note_type';
    let isEdit = !!noteItem;
    const attachedUsersList = usersList ? usersList : this.state.currentEditNoteData?.shared_users ? this.getAttachedUsers(users, this.state.currentEditNoteData.shared_users) : [];

    return (
      <Form>
        <ConfigProvider locale={lang}>
          <Row className={`${styles['row-reminder']} ${showForm === 'add' ? styles['row-reminder-add'] : ''}`}>
            {<div className={styles['checkbox-mb']}>
              <Checkbox
                onChange={(e) => this.onChangeReminder(e)}
                checked={this.state.reminderOption}>
                {i18n.t`Set Reminder`}
              </Checkbox>
            </div>
            }
            <Row className={`${styles['add-note-form']} ${styles['radio-btn-block']}`}>
              <Col className={`${styles['radio-btn-block']} ${styles['radio-btn-block-column']}`}>
                {this.state.radioOption === 1 && <div className={`${styles['attached_users']} ${attachedUsersList.length > 0 ? styles['attached_users-media'] : ''}`}>
                  {this.attachedUsers(attachedUsersList)}
                  <Tooltip
                    placement='topRight'
                    title={this.userTooltipContent(attachedUsersList)}
                    overlayClassName='userTooltip'
                  >
                    <p className={attachedUsersList.length > 3 ? styles['more_attached_users']: ''}>
                      {attachedUsersList && attachedUsersList.length > 3 ? `+ ${attachedUsersList && attachedUsersList.length - 3} more` : ''}
                    </p>
                  </Tooltip>
                </div>}
                <FormItem>
                  {getFieldDecorator(noteTypeFieldName, {
                    initialValue: noteItem ? noteItem?.notes_type : 0,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Note Type is required!`
                      },
                    ]
                  })
                  (<Radio.Group onChange={this.onChange} setFieldsValue={this.state.radioOption}>
                    {
                      Object.keys(NOTES).map(key => (
                        <Radio
                          key={NOTES[key].value + key}
                          value={NOTES[key].value}>
                          {i18n._(NOTES[key].text)}
                        </Radio>
                      ))
                    }
                  </Radio.Group>)
                  }
                </FormItem>
              </Col>
              {
                this.state.radioOption === 1 &&
                <Col lg={4} className={styles['dropdown-btn-media-width']}>
                  <Button trigger={['click']}
                          placement="bottomRight"
                          onClick={() => this.setShowNotesUsersDropdown()}
                          className={styles['dropdown-btn']}
                  >
                    Select <Icons
                    name="arrowdown2"
                    fill="#B3B3B3"
                  />
                  </Button>
                  <NotesUsersDropdown {...this.notesUsersDropdownProps()}/>
                </Col>
              }
            </Row>
          </Row>

          {this.state.reminderOption == 1 &&
          <Row gutter={10} className={styles['date-width-row']}>
            <Col lg={24} className={styles['date-width-col']}>
              <ConfigProvider>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`reminder_date`, {
                    initialValue: noteItem ? moment(noteItem?.reminder_date_time) : null,
                    valuePropName: 'defaultValue',
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Reminder_date is required!`
                      },
                    ],

                  })(<DatePicker
                    format={this.#dateFormat}
                    className="datepicker-global-md ex_p-l-r-3 w_100 no-icon-w-reset color-black font-medium svg-icon input-from-notes"
                    placeholder={i18n.t`Set Reminder`}
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    disabledDate={this.disabledPastDate}
                    suffixIcon={<Icons name="calendar"/>}/>)}

                  {getFieldDecorator(`reminder_time`, {
                    valuePropName: 'defaultValue',
                    initialValue: noteItem?.reminder_date_time ? moment(noteItem?.reminder_date_time) : null,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Reminder_time is required!`
                      },
                    ],

                  })
                  (<span
                    className="app-time-picker"
                    onClick={e => e.stopPropagation()}>
                    <TimePicker
                      disabledHours={() => this.getDisabledHours()}
                      disabledMinutes={() => this.getDisabledMinutes()}
                      format={"HH:mm"}
                      value={this.state.timeValue ? moment(this.state.timeValue, 'HH:mm') : null}
                      className={styles['timepicker']}
                      placeholder={'00:00'}
                      popupClassName="app-time-picker-dropdown app-time-picker-dropdown-notes"
                      onChange={(e) => this.getTimeValues(e)}
                    />
                    </span>)
                  }
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>}

          {getFieldDecorator(`event_id`, {
            valuePropName: 'defaultValue',
            initialValue: noteItem ? noteItem?.google_event_id : null,

          })(<Input type="text" hidden={true}/>)}
          <Row className={`${styles['add-note-form']} ${styles['row-avatar']}`}>
            <div className={styles['user-avatar']}>
              {!noteItem &&
              <img className={styles['avatar']}
                   src={loggedUser.avatar ?
                     `${appUrl}storage/images/avatars${getResizedImage(loggedUser.avatar, 'avatar')}`
                     : userAvatar}
              />}
            </div>
            <FormItem className="no-icons-form-filed">
              {getFieldDecorator(noteFieldName, {
                initialValue: editValue,
                valuePropName: 'defaultValue',
                rules: [
                  {
                    required: true,
                    message: i18n.t`Note is required!`
                  },
                ]
              })
              (<TextArea value={editValue} onChange={this.handleChangeEditNote} className={styles['text-area']}
                         placeholder={i18n.t`Click here to add a note...`}/>
              )}
            </FormItem>
          </Row>
          <Row className={styles['add-note-actions']} style={!isEdit && {marginBottom: '60px'}}>
            <Button className="app-btn primary-btn-outline" onClick={() => this.onCancelForm(isEdit)}>
              {i18n.t`Cancel`}
            </Button>
            <Button className="app-btn primary-btn" onClick={() => this.addNotesData(actionParameter)}>
              <span>{noteItem ? i18n.t`Save` : i18n.t`Add`}</span>
            </Button>
          </Row>
        </ConfigProvider>
      </Form>
    )
  }

  render() {
    const {i18n, userDetail} = this.props,
      {notes, users} = userDetail,
      canDeleteNote = checkLoggedUserPermission(PERMISSIONS.DELETE_NOTE.name, PERMISSIONS.DELETE_NOTE.guard_name),
      canEditNote = checkLoggedUserPermission(PERMISSIONS.EDIT_NOTE.name, PERMISSIONS.EDIT_NOTE.guard_name),
      canAddNote = checkLoggedUserPermission(PERMISSIONS.ADD_NOTE.name, PERMISSIONS.ADD_NOTE.guard_name),
      total = notes.user_note && notes.user_note.length,
      {currentEditNoteData, showForm} = this.state;
    return (
      <>
        <div className={styles['note']}>
          { !this.state.matches &&
          <div className={styles['form-title']}>
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5.705C11.9922 5.6361 11.9771 5.56822 11.955 5.5025V5.435C11.9189 5.35789 11.8708 5.287 11.8125 5.225L7.3125 0.725C7.2505 0.666662 7.17961 0.618561 7.1025 0.5825H7.035C6.95881 0.538806 6.87467 0.510758 6.7875 0.5H2.25C1.65326 0.5 1.08097 0.737053 0.65901 1.15901C0.237053 1.58097 0 2.15326 0 2.75V13.25C0 13.8467 0.237053 14.419 0.65901 14.841C1.08097 15.2629 1.65326 15.5 2.25 15.5H9.75C10.3467 15.5 10.919 15.2629 11.341 14.841C11.7629 14.419 12 13.8467 12 13.25V5.75C12 5.75 12 5.75 12 5.705ZM7.5 3.0575L9.4425 5H8.25C8.05109 5 7.86032 4.92098 7.71967 4.78033C7.57902 4.63968 7.5 4.44891 7.5 4.25V3.0575ZM10.5 13.25C10.5 13.4489 10.421 13.6397 10.2803 13.7803C10.1397 13.921 9.94891 14 9.75 14H2.25C2.05109 14 1.86032 13.921 1.71967 13.7803C1.57902 13.6397 1.5 13.4489 1.5 13.25V2.75C1.5 2.55109 1.57902 2.36032 1.71967 2.21967C1.86032 2.07902 2.05109 2 2.25 2H6V4.25C6 4.84674 6.23705 5.41903 6.65901 5.84099C7.08097 6.26295 7.65326 6.5 8.25 6.5H10.5V13.25Z" fill="#4A54FF"/>
            </svg>
            <h3>Notes</h3>
          </div>
          }
          <div className={styles['note-header']}>
            <h3 className={styles['content-title']}>{i18n.t`Notes(${total})`}</h3>
            {
              canAddNote && (showForm !== 'edit' && showForm !== 'add') && <span onClick={() => this.onAddNote('add')} className="add-btn">{i18n.t`+ Add Note`}</span>
            }
          </div>
          {canAddNote && !!showForm && showForm !== 'edit' && this.toPaintNotesForm()}
          {
            notes && notes.user_note && notes.user_note.map((item, index) => {
              const isOwnerNote = item.author_of_notes === item.user_id,
                isOwnerPage = item.author_of_notes === loggedUser.id,
                noteDate = moment(item.updated_at).format('MMM DD, YYYY'),
                noteHours = moment(item.updated_at).format('HH:mm'),
                reminderDateTime = moment(item.reminder_date_time).format('MMM DD, YYYY HH:mm'),
                noteAttachedUsers = item.shared_users && this.getAttachedUsers(users, item.shared_users);
              return (
                <div key={index} className={styles['note-list-item']}>
                  <div className={styles['note-info']}>
                    <div className={styles['user-info']}>
                      <img className={styles['avatar']}
                           src={item.avatar ?
                             `${appUrl}storage/images/avatars${getResizedImage(item.avatar, 'avatar')}`
                             : userAvatar}
                      />
                      <div className={styles['user-info-details-block']}>
                        <span className={styles['user-name']}>
                          {item.surname ? (item.name + ' ' + item.surname) : item.name}
                        </span>
                        <div className={styles['note-date']}>
                          {noteHours}
                          <div/>
                          {noteDate}
                          {isOwnerPage && item.reminder == 1 && <div/>}
                          {isOwnerPage && item.reminder == 1 && i18n.t`Remind` + reminderDateTime}
                        </div>
                      </div>
                    </div>
                    {!currentEditNoteData && item.notes_type === 1 && <div className={styles['attached_users']}>
                      {this.attachedUsers(noteAttachedUsers)}
                      <Tooltip
                        placement='topRight'
                        title={this.userTooltipContent(noteAttachedUsers)}
                        overlayClassName='userTooltip'
                      >
                        <p className={styles['more_attached_users']}>{noteAttachedUsers && noteAttachedUsers.length > 3 ? `+ ${noteAttachedUsers && noteAttachedUsers.length - 3} more` : ''}</p>
                      </Tooltip>
                    </div>}

                    <div className={styles['note-type-content']}>
                      <span>
                       {Object.keys(NOTES).map(key => {
                         if (NOTES[key].value === parseInt(item.notes_type)) {
                           return (<span className={styles['note-type']} key={key}>
                             <Icons name={NOTES[key].icon}/>{i18n._(NOTES[key].text)}
                           </span>)
                         }
                       })
                       }
                    </span>
                    </div>

                  </div>
                  {(currentEditNoteData && Object.keys(currentEditNoteData).length > 0 && item.id === currentEditNoteData?.id)
                    ? this.toPaintNotesForm(currentEditNoteData)
                    :
                    <>
                      <div className={styles['note-text']}>
                        <TextArea readOnly={true}
                                  value={item.notes_text}/>
                        <div className={styles['note-list-action']}>
                          {(canEditNote && isOwnerPage || isOwnerNote) &&
                          <span onClick={(e) => (showForm !== 'add') && this.editNote(item, 'edit')}>
                          <Icons name="pencil"/>
                        </span>}
                          {(canDeleteNote && isOwnerPage || isOwnerNote) &&
                          <Popconfirm
                            disabled={(showForm === 'add') && "false"}
                            tabIndex="0"
                            title={i18n.t`Are you sure delete this note?`}
                            okText={i18n.t`Yes`}
                            onConfirm={(e) => this.deleteNotes(e, item, 'note')}
                          >
                            <span><Icons name="delete"/> </span>
                          </Popconfirm>
                          }
                        </div>
                      </div>
                    </>
                  }
                </div>
              )
            })
          }
        </div>
      </>
    );
  }
}

Notes.propTypes = {};
export default Notes;
