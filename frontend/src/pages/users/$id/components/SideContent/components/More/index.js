import React, {PureComponent} from 'react';
import {Trans, withI18n} from "@lingui/react";
import {Calendar, Badge, Select, Input, Button, DatePicker, message, Row, Col, ConfigProvider, Popconfirm} from 'antd';
import moment from 'utils/moment';
import {checkLoggedUserPermission} from 'utils';
import styles from './style.less';
import {Form} from "@ant-design/compatible";
import Icons from 'icons/icon';
import {connect} from "dva";
import {
  PERMISSIONS,
  USER_DYNAMIC_COMPONENTS,
  USER_WORK_HISTORY_TYPES,
  VACATION_TYPES,
  VACATION_STATUSES,
  DATE_FORMAT
} from 'utils/constant';
import store from "store";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";

const {TextArea} = Input;
const FormItem = Form.Item;

@withI18n()
@Form.create()
@connect(({userDetail}) => ({userDetail}))
class More extends PureComponent {

  #dateFormat = 'YYYY/MM/DD';

  state = {
    value: moment(),
    selectedValue: moment(),
    showAddNote: false,
    showVacationsForm: false,
    editVacationData: null,
    dayNote: null,
    monthNotes: null,
    vacations: null,
    workedDaysAnalysis: null,
    isSubmittedLoading: false,
  };

  componentDidMount () {
    const more = this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE];
    const {dayNote, selectedMonthNotes, vacations, workedDaysAnalysis} = more;
    this.setDayNote(dayNote);
    this.setMonthNotes(selectedMonthNotes);
    this.setVacations(vacations);
    this.setWorkedDaysAnalysis(workedDaysAnalysis);
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.dayNote !== this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.dayNote) {
      this.setDayNote(this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.dayNote);
    }
    if (prevProps?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.selectedMonthNotes !== this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.selectedMonthNotes) {
      this.setMonthNotes(this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.selectedMonthNotes);
    }
    if (prevProps?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.vacations !== this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.vacations) {
      this.setVacations(this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.vacations);
    }
    if (prevProps?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.workedDaysAnalysis !== this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.workedDaysAnalysis) {
      this.setWorkedDaysAnalysis(this.props?.userDetail[USER_DYNAMIC_COMPONENTS.MORE]?.workedDaysAnalysis);
    }
  }

  setIsSubmittedLoading = (value) => {
    this.setState({
      isSubmittedLoading: value
    });
  };

  //Day note functionality
  setDayNote = (value) => {
    this.setState({
      dayNote: value
    });
  };

  setMonthNotes = (value) => {
    this.setState({
      monthNotes: value
    });
  };

  setWorkedDaysAnalysis = (value) => {
    this.setState({
      workedDaysAnalysis: value
    });
  };

  getDayNoteColorClassName = type => {
    if (!type) return '';
    const dayNoteTypeObject = USER_WORK_HISTORY_TYPES.filter(currentDayNoteType => currentDayNoteType.value === type);
    return dayNoteTypeObject[0] ? dayNoteTypeObject[0]?.class : '';
  };

  handleSaveNote = (e) => {
    e.preventDefault();
    const {form, dispatch, userDetail} = this.props;
    const more = userDetail[USER_DYNAMIC_COMPONENTS.MORE];
    const {getFieldsValue, validateFields} = form;
    const {title, type, description} = getFieldsValue();
    const {selectedValue} = this.state;

    validateFields(errors => {
      if (errors) {
        return
      }
      this.setIsSubmittedLoading(true);
      dispatch({
        type: `userDetail/createNote`,
        payload: {
          user_id: more ? more?.id : null,
          date: selectedValue,
          title,
          type,
          description
        }
      }).then(() => {
        let newNote = {
          user_id: more ? more?.id : null,
          date: selectedValue,
          title,
          type,
          description
        };
        this.addNote();
        this.setIsSubmittedLoading(false);
        this.setState({
          monthNotes: [...this.state.monthNotes, newNote]
        });
      })
    });
  }

  addNote = () => {
    this.setState((prevState) => ({ showAddNote: !prevState.showAddNote }));
  };

  onSelect = value => {
    const {dispatch, userDetail} = this.props;
    const more = userDetail[USER_DYNAMIC_COMPONENTS.MORE];
    dispatch({
      type: `userDetail/querySelectedDayNote`,
      payload: {
        id: more?.id,
        date: value.format(DATE_FORMAT),
      }
    }).then(() => {
      this.setState({
        value,
        selectedValue: value,
      });
    });
  };

  onPanelChange = (value, mode) => {
    const {dispatch, userDetail} = this.props;
    const more = userDetail[USER_DYNAMIC_COMPONENTS.MORE];

    if (mode === 'month') {
      dispatch({
        type: `userDetail/querySelectedMonthNotes`,
        payload: {
          id: more?.id,
          date: value.format(DATE_FORMAT),
        }
      }).then(() => {
        this.onSelect(value);
      });
    }
  };

  //Vacation functionality
  addVacation = () => {
    this.setState((prevState) => ({ showVacationsForm: !prevState.showVacationsForm }));
  };

  setEditVacationData = (value) => {
    this.setState({
      editVacationData: value
    });
  };

  setVacations = (value) => {
    this.setState({
      vacations: value
    });
  };

  onCancelEditForm = (e) => {
    this.setEditVacationData(null);
  }

  handleOpenEditVacationForm = (vacation) => {
    this.setEditVacationData(vacation);
  }

  handleSaveVacation = (e, action) => {
    e.preventDefault();
    const {i18n, form, dispatch, userDetail} = this.props;
    const more = userDetail[USER_DYNAMIC_COMPONENTS.MORE];
    const {editVacationData} = this.state;
    const {getFieldsValue, validateFields} = form;
    const {vacation_type, vacation_status, start_date, end_date,
      edit_vacation_type, edit_vacation_status, edit_start_date, edit_end_date
    } = getFieldsValue();

    validateFields(errors => {
      if (errors) {
        return
      }

      if (end_date < start_date || edit_end_date < edit_start_date) {
        message.error(i18n.t`Invalid selected date`);
        return;
      }

      let requestData = {
        user_id: more ? more?.id : null,
        vacation_type: (action === 'edit') ? edit_vacation_type : vacation_type,
        vacation_status: (action === 'edit') ? edit_vacation_status : vacation_status,
        start_date: (action === 'edit') ? edit_start_date : start_date,
        end_date: (action === 'edit') ? edit_end_date : end_date
      };

      if (action === 'edit') {
        requestData.id = editVacationData ? editVacationData?.id : null;
      }
      this.setIsSubmittedLoading(true);
      dispatch({
        type: `userDetail/saveVacation`,
        payload: requestData,
        action: action
      }).then(() => {
        if (action === 'edit') {
          this.onCancelEditForm();
        } else if (action === 'create') {
          this.addVacation();
        }
        this.setIsSubmittedLoading(false);
      })
    })
  }

  handleDeleteVacationPopup = _ => {
    this.spanElement.click();
  }

  handleDeleteVacation = (vacation) => {
    const {dispatch} = this.props;

    dispatch({
      type: `userDetail/deleteVacation`,
      payload: {
        id: vacation.id,
        user_id: vacation.user_id
      },
    })
  }

  getVacationForm = (vacation = null) => {
    const {i18n, form} = this.props,
      lang = i18n.language === 'en' ? en_GB : hy_AM;
    const {isSubmittedLoading} = this.state;
    const {getFieldDecorator} = form;
    const action = vacation ? 'edit' : 'create';
    const onCancel = vacation ? this.onCancelEditForm : this.addVacation;
    const typeFieldName = vacation ? 'edit_vacation_type' : 'vacation_type';
    const statusFieldName = vacation ? 'edit_vacation_status' : 'vacation_status';
    const startDateFieldName = vacation ? 'edit_start_date' : 'start_date';
    const endDateFieldName = vacation ? 'edit_end_date' : 'end_date';

    return (
      <Form hideRequiredMark onSubmit={(e) => this.handleSaveVacation(e, action)} noValidate={true}>
        <Row gutter={10}>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`Type`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(typeFieldName, {
                  initialValue: vacation ? vacation.type : 'basic_vacation',
                  rules: [
                    {
                      required: true
                    },
                  ],
                })
                (
                  <Select
                    onChange={this.handleChange}
                    suffixIcon={
                      <Icons name="arrowdown"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {VACATION_TYPES && VACATION_TYPES.map((vacationType, index) =>
                      <Select.Option key={vacationType.key} value={vacationType.value}>
                        {vacationType.name}
                      </Select.Option>
                    )}
                  </Select>
                )}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`Status`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(statusFieldName, {
                  initialValue: vacation ? vacation.status : 'not_approved',
                  rules: [
                    {
                      required: true
                    },
                  ],
                })(
                  <Select
                    onChange={this.handleChange}
                    suffixIcon={
                      <Icons name="arrowdown"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {VACATION_STATUSES && VACATION_STATUSES.map((vacationStatus, index) =>
                      <Select.Option key={vacationStatus.key} value={vacationStatus.value}>
                        {vacationStatus.name}
                      </Select.Option>
                    )}
                  </Select>
                )}
              </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`StartingFrom`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
              {getFieldDecorator(startDateFieldName, {
                initialValue: vacation ? moment(vacation.start_date) : null,
                rules: [
                  {
                    required: true
                  },
                ],
              })
              (
                <DatePicker
                  suffixIcon={
                    <Icons name="calendar"/>
                  }
                  getCalendarContainer={triggerNode => triggerNode.parentNode}
                  format={this.#dateFormat}
                  className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                  placeholder={i18n.t`DD/MM/YYYY`}/>
              )}
            </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={12}>
            <span className="label-txt">{i18n.t`EndingIn`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
              {getFieldDecorator(endDateFieldName, {
                initialValue: vacation ? moment(vacation.end_date) : null,
                rules: [
                  {
                    required: true
                  },
                ],
              })
              (
                <DatePicker
                  suffixIcon={
                    <Icons name="calendar"/>
                  }
                  getCalendarContainer={triggerNode => triggerNode.parentNode}
                  format={this.#dateFormat}
                  className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset d-inline-block w-100 color-black font-medium svg-icon"
                  placeholder={i18n.t`DD/MM/YYYY`}/>
              )}
            </FormItem>
            </ConfigProvider>
          </Col>
        </Row>
        <div className={styles['form-actions']}>
          <Button
            className="app-btn primary-btn-outline"
            onClick={onCancel}
          >
            {i18n.t`Cancel`}
          </Button>
          <Button
            className="app-btn primary-btn"
            type="submit"
            disabled={isSubmittedLoading}
          >
            {vacation ? i18n.t`Save` : i18n.t`Add`}
          </Button>
        </div>
      </Form>
    );
  }

  getVacationsList = (vacations, editVacationAccess, deleteVacationAccess) => {
    const { i18n } = this.props;
    if (vacations) {
      return vacations.map((vacation, i) => {
        return (
          <div key={i}>
            {`${vacation.start_date} - ${vacation.end_date}`}
            {editVacationAccess && (
              <Button onClick={e => this.handleOpenEditVacationForm(vacation)} type="primary" size='large' ghost>
                <Icons name='edit'/>
              </Button>
            )}
            {deleteVacationAccess && (
              <Button onClick={this.handleDeleteVacationPopup} type="primary" size='large' ghost>
                <Icons name='delete'/>
              </Button>
            )}
            <Popconfirm
              okText={i18n.t`Yes`}
              tabIndex="0"
              title={i18n.t`Are you sure delete this vacation ?`}
              placement="topRight"
              onConfirm={_ => this.handleDeleteVacation(vacation)}
            >
              <span style={{ visibility: 'hidden' }} ref={e => this.spanElement = e}><Icons name='close'/></span>
            </Popconfirm>
          </div>
        )
      })
    }
  };

  // calendar functionality for add note color in calendar
  getListData = (value, existingNotes) => {
    let listData;
    if (existingNotes) {
      for (let ix = 0; ix < existingNotes.length; ix++) {
        switch (new Date(existingNotes[ix].date).getDate()) {
          case value.date():
            listData = [
              { type: existingNotes[ix].type }
            ]
            break;
          default:
        }
      }
    }
    return listData || [];
  }

  dateCellRender = (value) => {
    const listData = this.getListData(value, this.state.monthNotes);
    return (
      <>
        {listData.map((item, index) => (
          <p key={item.type + index} className={`${item.type}`} />
        ))}
      </>
    );
  }

  render() {
    const {i18n, form, userDetail} = this.props;
    const more = userDetail[USER_DYNAMIC_COMPONENTS.MORE];
    const {
      value,
      selectedValue,
      dayNote,
      vacations,
      editVacationData,
      showVacationsForm,
      workedDaysAnalysis,
      isSubmittedLoading
    } = this.state;
    const {getFieldDecorator} = form;
    const loggedUser = store.get('user');
    let dayNoteColorClassName = '';
    if (dayNote) {
      dayNoteColorClassName = this.getDayNoteColorClassName(dayNote?.type);
    }

    // Edit access
    const isOwnerPage = loggedUser?.id === more?.id;
    const canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name);
    const canViewSelfUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name);
    const canEditUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name);
    const canEditSelfUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name);
    const canViewMoreInfo = checkLoggedUserPermission(PERMISSIONS.VIEW_MORE_INFO.name, PERMISSIONS.VIEW_MORE_INFO.guard_name);
    const canViewSelfMoreInfo = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_MORE_INFO.name, PERMISSIONS.VIEW_SELF_MORE_INFO.guard_name);
    const canViewDayNote = checkLoggedUserPermission(PERMISSIONS.VIEW_DAY_NOTE.name, PERMISSIONS.VIEW_DAY_NOTE.guard_name);
    const canViewSelfDayNote = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_DAY_NOTE.name, PERMISSIONS.VIEW_SELF_DAY_NOTE.guard_name);
    const canAddDayNote = checkLoggedUserPermission(PERMISSIONS.ADD_DAY_NOTE.name, PERMISSIONS.ADD_DAY_NOTE.guard_name);
    const canAddSelfDayNote = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_DAY_NOTE.name, PERMISSIONS.ADD_SELF_DAY_NOTE.guard_name);
    const canViewVacation = checkLoggedUserPermission(PERMISSIONS.VIEW_VACATION.name, PERMISSIONS.VIEW_VACATION.guard_name);
    const canViewSelfVacation = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_VACATION.name, PERMISSIONS.VIEW_SELF_VACATION.guard_name);
    const canAddVacation = checkLoggedUserPermission(PERMISSIONS.ADD_VACATION.name, PERMISSIONS.ADD_VACATION.guard_name);
    const canAddSelfVacation = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_VACATION.name, PERMISSIONS.ADD_SELF_VACATION.guard_name);
    const canEditVacation = checkLoggedUserPermission(PERMISSIONS.EDIT_VACATION.name, PERMISSIONS.EDIT_VACATION.guard_name);
    const canEditSelfVacation = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_VACATION.name, PERMISSIONS.EDIT_SELF_VACATION.guard_name);
    const canDeleteVacation = checkLoggedUserPermission(PERMISSIONS.DELETE_VACATION.name, PERMISSIONS.DELETE_VACATION.guard_name);
    const canDeleteSelfVacation = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_VACATION.name, PERMISSIONS.DELETE_SELF_VACATION.guard_name);

    let viewMoreInfoAccess = false;
    let viewDayNoteAccess = false;
    let addDayNoteAccess = false;
    let viewVacationAccess = false;
    let addVacationAccess = false;
    let editVacationAccess = false;
    let deleteVacationAccess = false;

    if (canViewUserDetails || (isOwnerPage && canViewSelfUserDetails)) {
      if (canViewMoreInfo || (isOwnerPage && canViewSelfMoreInfo)) {
        viewMoreInfoAccess = true;
      }
      if (canViewDayNote || (isOwnerPage && canViewSelfDayNote)) {
        viewDayNoteAccess = true;
      }
      if (canViewVacation || (isOwnerPage && canViewSelfVacation)) {
        viewVacationAccess = true;
      }
    }

    if (canEditUsers || (isOwnerPage && canEditSelfUsers)) {
      if (canAddDayNote || (isOwnerPage && canAddSelfDayNote)) {
        addDayNoteAccess = true;
      }
      if (canAddVacation || (isOwnerPage && canAddSelfVacation)) {
        addVacationAccess = true;
      }
      if (canEditVacation || (isOwnerPage && canEditSelfVacation)) {
        editVacationAccess = true;
      }
      if (canDeleteVacation || (isOwnerPage && canDeleteSelfVacation)) {
        deleteVacationAccess = true;
      }
    }

    return (
      <>
      {viewMoreInfoAccess &&
        (<div>
          <h3 className={styles['content-title']}>{i18n.t`WorkingDays`}</h3>
          <div className={styles["working-days-block"]}>
            <div className={styles["day-item"]}>
              <p>{i18n.t`WorkingDays`}</p>
              <h3>{workedDaysAnalysis ? workedDaysAnalysis.workingDays : 0}</h3>
            </div>
            <div className={styles["day-item"]}>
              <p>{i18n.t`NotWorkingDays`}</p>
              <h3>{workedDaysAnalysis ? workedDaysAnalysis.notWorkingDays : 0}</h3>
            </div>
            <div className={styles["day-item"]}>
              <p>{i18n._(`AdditionalWorkingDays`)}</p>
              <h3>{workedDaysAnalysis ? workedDaysAnalysis.additionalWorkingDays : 0}</h3>
            </div>
          </div>
          <div className={styles["calendar-block"]}>
            <div className={styles["calendar-with-notes"]}>
              <div className={styles["calendar"]}>
                <Calendar
                  value={value}
                  onSelect={this.onSelect}
                  onPanelChange={this.onPanelChange}
                  className="custom-calendar"
                  dateCellRender={this.dateCellRender}
                />
              </div>
              <div className={styles["notes"]}>
                <div className={styles["notes-list-content"]}>
                  <div className={styles["header"]}>
                    <h4>{selectedValue && selectedValue.format('dddd')}</h4>
                    <span> {selectedValue && selectedValue.format('YYYY-MM-DD')} </span>
                  </div>
                  {viewDayNoteAccess && dayNote ?
                  (
                    <div className={styles["note-item"]}>
                      <span className={`note-color ${dayNoteColorClassName}`}/>
                      <div>
                        <h5>{dayNote?.title}</h5>
                        <p>{dayNote?.description}</p>
                      </div>
                    </div>
                  ) : (<div className={styles["note-item"]}>
                      <span className="note-color"/>
                      <div>
                        <h5>Title</h5>
                        <p>Description</p>
                      </div>
                    </div>) }

                </div>
                {(addDayNoteAccess && !dayNote) && (
                  <div className={styles["add-note"]}>
                        <span className="add-btn" onClick={this.addNote}>
                          <Trans>+ Add Note</Trans>
                        </span>
                  </div>
                )}
              </div>
              {
                this.state.showAddNote &&
                <div className={styles["add-note-popup"]}>
                  <Form onSubmit={this.handleSaveNote}>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('type', {
                        initialValue: "not_working",
                        rules: [
                          {
                            required: true
                          },
                        ],
                      })(
                        <Select onChange={this.handleChange}
                                suffixIcon={
                                  <Icons name="arrowdown"/>
                                }
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                className="no-border-select">
                          {USER_WORK_HISTORY_TYPES && USER_WORK_HISTORY_TYPES.map((workHistoryType, index) =>
                            <Select.Option key={workHistoryType.key} value={workHistoryType.value}>
                              <span className={`note-color ${workHistoryType.class}`}/>
                              {workHistoryType.name}
                            </Select.Option>
                          )}
                        </Select>
                      )}
                    </FormItem>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('title', {
                        rules: [
                          {
                            required: true
                          },
                        ],
                      })
                      (
                        <Input
                          placeholder="Add title..."
                        />
                      )}
                    </FormItem>
                    <FormItem  className="no-icons-form-filed">
                      {getFieldDecorator('description', {
                        rules: [
                          {
                            required: true
                          },
                        ],
                      })
                      (
                        <TextArea
                          placeholder="Add your description..."
                          className="note-textArea"
                        />
                      )}
                    </FormItem>

                    <div className={styles["add-note-actions"]}>
                      <Button
                        htmlType="submit"
                        className="add-btn"
                        type="link"
                        disabled={isSubmittedLoading}
                      >
                        <span>{i18n.t`Add`}</span>
                      </Button>
                      <Button
                        className="add-btn default"
                        type="link"
                        onClick={this.addNote}
                      >
                        {i18n.t`Cancel`}
                      </Button>
                    </div>
                  </Form>
                </div>
              }
            </div>
          </div>
          {viewVacationAccess && (
            <div className={styles["vacations-block"]}>
              <div className={styles["vacations-header"]}>
                <h3 className={styles['content-title']}>{i18n.t`Vacations`}</h3>
                {addVacationAccess && (
                  <span className="add-btn" onClick={this.addVacation}>+ {i18n.t`AddVacation`}</span>
                )}
              </div>
              {showVacationsForm && this.getVacationForm()}
              {editVacationData && this.getVacationForm(editVacationData)}
              {vacations && this.getVacationsList(vacations, editVacationAccess, deleteVacationAccess)}
            </div>
          )}
        </div>)
      }
      </>
    );
  }
}

More.propTypes = {};
export default More;
