import React from 'react';
import {Modal, Button, Checkbox, Row, Col, Input, Radio, message, Form, Tooltip} from 'antd';
import Icons from 'icons/icon'
import {withI18n, Trans} from "@lingui/react";
import PropTypes from 'prop-types';
import store from 'store';
import SelectDate from 'components/SelectDate';
import styles from "./style.less";
import moment from 'utils/moment';
import {
  CALENDAR_TASKS_COLOR,
  CALENDAR_TODOS_COLOR,
  CALENDAR_GOOGLE_COLOR,
  CALENDAR_PROJECT_COLOR,
  CALENDAR_TAGS_COLOR,
  FULL_DATE_TIME_FORMAT,
  DATE_MONTH_FORMAT,
  FULL_DATE_MONTH_FORMAT,
} from 'utils/constant';
import enGBLocale from '@fullcalendar/core/locales/en-gb';
import hyAMLocale from '@fullcalendar/core/locales/hy-am';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Tag from 'components/Tag';

@withI18n()
class UserFullCalendar extends React.Component {
  state = {
    eventItem: {
      name: null,
      info: null,
      eventType: 'todos',
    },
    selectedDate: null,
    isEventModalVisible: false,
    isAddEventModalVisible: false,
    selectedEvent: null,
    oldDateRange: '',
    filterCheckboxes: {
      Todos: {label: 'Todos', color: CALENDAR_TODOS_COLOR, checked: true},
      Tasks: {label: 'Tasks', color: CALENDAR_TASKS_COLOR, checked: true},
      Google: {label: 'Google', color: CALENDAR_GOOGLE_COLOR, checked: true},
      Projects: {label: 'Projects', color: CALENDAR_PROJECT_COLOR, checked: false},
      Tags: {label: 'Tags', color: CALENDAR_TAGS_COLOR, checked: false},
    }
  };

  constructor() {
    super();
    this.cacheData = new Map();
    this.calendarRef = React.createRef();
  }

  componentDidMount() {
    if (this.state.selectedDate === null) {
      const user = store.get('user');
      this.setState({
        selectedDate: moment().utcOffset(user.time_offset)
      });
    }
  }

  handleEventClick = (info) => {
    this.setState({
      selectedEvent: info.event,
      isEventModalVisible: true,
    });
  }

  handleDateClick = (info) => {
    this.setState({
      isAddEventModalVisible: true,
      eventItem: {
        name: null,
        info: info,
        eventType: 'todos',
      },
    });
  }

  handleAddEvent = (e) => {
    e.preventDefault();
    const {details} = this.props;
    const {eventItem: {name, info, eventType}} = this.state;
    if (!name) return;
    details.onAddEvent({
      name: name,
      allDay: info.allDay,
      startDateTime: moment(info.date).format(FULL_DATE_TIME_FORMAT),
      eventType: eventType,
    })
      .then((resp) => {
        if (resp.status) {
          // Here need to add new event or query get all items
          this.setState({
            oldDateRange: '',
            isAddEventModalVisible: false,
            eventItem: {
              name: null,
              info: null,
              eventType: 'todos',
            }
          });
          if (eventType === 'todos') {
            // Adding todo_item into list
            details.addTodo(resp?.data);
          }
        }
      })
      .catch(console.error);
  }

  handleDatesSet = (info) => {
    const {startStr, endStr, view} = info;
    const key = `${startStr}_${endStr}`;

    const {oldDateRange, filterCheckboxes} = this.state;
    const viewItems = [];
    Object.keys(filterCheckboxes).map(key => {
      if (filterCheckboxes[key].checked === true) {
        viewItems.push(key.toString().toLowerCase());
      }
    });
    if (key === oldDateRange) return; // Important to avoid many ajax request in the same view
    const cachedEvents = this.cacheData.get(key);
    if (cachedEvents === undefined) {
      const {details} = this.props;
      details.onChangeStartEndTime(startStr, endStr, viewItems)
        .finally(() => {
          this.cacheData.delete(key);
          this.setState({
            oldDateRange: key,
          });
          if (view.type === 'timeGridDay') {
            this.setState({
              selectedDate: startStr
            });
          }
        });
    } else {
      return;
    }
    this.cacheData.set(key, true);
  }

  handleStartTask = () => {
    const {details} = this.props;
    const {selectedEvent} = this.state;
    const {extendedProps} = selectedEvent;
    details.onStartWork({
      event_type: extendedProps?.event_type,
      project_id: extendedProps?.project_id,
      item_id: extendedProps?.work_id,
      item_name: extendedProps?.work_name,
      user_id: extendedProps?.work_user_id,
      work_time_id: extendedProps?.work_time_id,
    }).then((resp) => {
      if (resp.status) {
        // close modal and reload calendar
        this.setState({
          oldDateRange: '',
          isEventModalVisible: !this.state.isEventModalVisible,
          selectedEvent: null
        });
      }
    }).catch(console.error);
  }

  handleStopTask = () => {
    const {details} = this.props;
    const {selectedEvent} = this.state;
    const {extendedProps} = selectedEvent;
    details.onStopWork({
      work_id: extendedProps?.work_id,
      work_time_id: extendedProps?.work_time_id,
      user_id: extendedProps?.work_user_id,
    }).then((resp) => {
      if (resp.status) {
        // close modal and reload calendar
        this.setState({
          oldDateRange: '',
          isEventModalVisible: !this.state.isEventModalVisible,
          selectedEvent: null
        });
      }
    }).catch(console.error);
  }

  get eventList() {
    const {details} = this.props;
    return details.events;
  }

  get selectDateProps() {
    const {i18n} = this.props;
    const {selectedDate} = this.state;
    return {
      selectedDate: selectedDate,
      notDisableFutureDates: true,
      i18n: i18n,
      onDateChange: (value) => {
        this.setState({selectedDate: value}, () => {
          const calendarApi = this.calendarRef.current.getApi();
          calendarApi.changeView('timeGridDay', value);
          // calendarApi.refetchEvents();
        });
      }
    }
  };

  handleChangeFilter(eventType) {
    const {filterCheckboxes} = this.state;
    const _items = {...filterCheckboxes};
    _items[eventType].checked = !_items[eventType].checked;
    this.setState({
      filterCheckboxes: _items,
      oldDateRange: ''
    });
  }

  handleEventDrop(info) {
    const {details} = this.props;
    details.onEventDrop({
      allDay: info?.event?.allDay,
      endDateTime: info?.event?.end,
      startDateTime: info?.event?.start,
      itemId: info?.event?.extendedProps?.work_id,
      eventType: info?.event?.extendedProps?.event_type,
    })
      .then(res => {
        if (!res.status) {
          message.error(res.message);
          info.revert();
        }
      })
      .catch(console.error);
  }

  handleEventResize(info) {
    const {details} = this.props;
    details.onEventResize({
      allDay: info?.event?.allDay,
      endDateTime: info?.event?.end,
      startDateTime: info?.event?.start,
      itemId: info?.event?.extendedProps?.work_id,
      eventType: info?.event?.extendedProps?.event_type,
    })
      .then(res => {
        if (!res.status) {
          message.error(res.message);
          info.revert();
        }
      })
      .catch(console.error);
  }

  render() {
    const {i18n, isLoggedUser} = this.props;
    const {selectedEvent, isEventModalVisible, isAddEventModalVisible, filterCheckboxes, eventItem} = this.state;
    const tags = selectedEvent?.extendedProps?.tags;
    return (
      <div className={styles['user-fullcalendar']}>
        <div className={styles['user-fullcalendar-header']}>
          <div className={styles['user-fullcalendar-header-checkboxes']}>
            {Object.keys(filterCheckboxes).map(key => (
              <Checkbox
                className={`calendar-checkbox ${filterCheckboxes[key].label}`}
                style={{color: filterCheckboxes[key].color}}
                key={filterCheckboxes[key].label}
                label={filterCheckboxes[key].label}
                checked={filterCheckboxes[key].checked}
                onChange={() => this.handleChangeFilter(filterCheckboxes[key].label)}
              >
                {filterCheckboxes[key].label === "Todos" ? i18n._('To do list') :
                  filterCheckboxes[key].label === "Google" ? i18n._('Google Calendar') :
                    filterCheckboxes[key].label}
              </Checkbox>
            ))}
          </div>
          <SelectDate {...this.selectDateProps} />
        </div>
        <FullCalendar
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false
          }}
          ref={this.calendarRef}
          locales={[enGBLocale, hyAMLocale]}
          locale={i18n._language === 'hy' ? 'hy-am' : 'en-gb'}
          plugins={[
            dayGridPlugin,
            listPlugin,
            timeGridPlugin,
            interactionPlugin
          ]}
          headerToolbar={{
            left: 'prev,next,today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          handleWindowResize={true}
          stickyHeaderDates={true}
          dayMaxEvents={true}
          editable={true}
          eventAllow={(dropInfo, draggedEvent) => {
            return !['tasks', 'projects', 'tags'].includes(draggedEvent?.extendedProps?.event_type); // Do not allow already tracked tasks change from calendar page
          }}
          eventResize={(info) => this.handleEventResize(info)}
          eventDrop={(info) => this.handleEventDrop(info)}
          nowIndicator={true}
          now={moment.now()}
          firstDay={1}
          initialView="dayGridMonth"
          events={this.eventList}
          eventClick={this.handleEventClick}
          datesSet={this.handleDatesSet}
          dateClick={this.handleDateClick}
        />
        <Modal
          closeIcon={
            <span className="close-icon"
                  onClick={() => this.setState({isEventModalVisible: false, selectedEvent: null})}>
              <Icons name="close"/>
            </span>
          }
          title={
            <Tooltip placement="top"
                     overlayClassName="custom-tooltip"
                     title={selectedEvent?.title}>
              <div>{selectedEvent?.title}</div>
              {selectedEvent?.eventType === 'google' && <span className="sub-title">{i18n._('Google Event')}</span>}
            </Tooltip>
          }
          centered
          visible={isEventModalVisible}
          footer={null}
          className={styles['calendar-show-task-modal']}
          onCancel={() => this.setState({isAddEventModalVisible: false})}
          closable={true}
          maskClosable={true}
          width={492}
        >
          <p className={styles['label_first']}>{i18n._('Project Name (Tags)')}</p>
          <div className={styles['project-tag-name']}>
            <div>
                <span
                  className={styles['project-color']}
                  style={{backgroundColor: selectedEvent?.extendedProps?.project_color}}
                />
              <span className={styles['project-name']}>
                 {selectedEvent?.extendedProps?.project_name}
              </span>
            </div>
            <div>
                <span
                  className={styles['tag-name']}
                >
                  {tags && tags.length ?
                    <Tag activeTagsArray={tags}/>
                    : null}
                </span>
            </div>

          </div>
          <div className={styles['task-date']}>
            <div>
              <Icons name="calendar"/>
              <span>
                {moment(selectedEvent?.start).format(DATE_MONTH_FORMAT)}
            </span>
            </div>
            <div>
              <Icons name="clock"/>
              <span>
                {
                  selectedEvent?.allDay
                    ?
                    i18n._('All Day')
                    :
                    moment(selectedEvent?.start).format("LT") + ' - ' + (selectedEvent?.extendedProps?.isRunning ? 'in process' : moment(selectedEvent?.end).format("LT"))
                }
            </span>
            </div>
          </div>
          {
            selectedEvent?.extendedProps?.description &&
            <>
              <p className={styles['label']}>{i18n._('Description')}</p>
              <div className={styles['description']}
                   dangerouslySetInnerHTML={{__html: selectedEvent?.extendedProps?.description}}/>
            </>
          }
          <div className="separator"/>
          <div className={styles['calendar-show-tracking']}>
            {isLoggedUser &&
            <>
              {selectedEvent?.extendedProps?.isRunning
                ? <>
                  <Trans>You can stop tracking</Trans>
                  <span onClick={() => this.handleStopTask()} className={'cursor-pointer'}>
                     <Icons name="pause" fill="#4A54FF"/>
                  </span>
                </> :
                <>
                  <Trans>You can start tracking</Trans>
                  <span onClick={() => this.handleStartTask()} className={'cursor-pointer'}>
                    <Icons name="play" fill="#4A54FF"/>
                  </span>
                </>
              }
            </>
            }
          </div>
        </Modal>
        <Modal
          closeIcon={
            <span className="close-icon" onClick={() => this.setState({isAddEventModalVisible: false})}>
              <Icons name="close"/>
            </span>
          }
          title={i18n.t`ADD TASK`}
          centered
          visible={isAddEventModalVisible}
          footer={null}
          className={styles['calendar-add-task-modal']}
          onCancel={() => this.setState({isAddEventModalVisible: false})}
          closable={true}
          maskClosable={true}
          width={492}
        >
          <div className={styles['task-date']}>
            <Icons name="calendar"/>
            <span>
              {!!eventItem?.info?.allDay ? moment(eventItem.info?.date).format(DATE_MONTH_FORMAT)
                : moment(eventItem.info?.date).format(FULL_DATE_MONTH_FORMAT)}
            </span>
          </div>
          <Radio.Group className="app-radio" onChange={(e) => this.setState({
            eventItem: {
              name: eventItem.name,
              info: eventItem.info,
              eventType: e.target.value,
            }
          })} value={eventItem.eventType}>
            <Radio value={'todos'}>{i18n.t`To do`}</Radio>
            <Radio value={'google'}>{i18n.t`Google`}</Radio>
          </Radio.Group>
          <Form onSubmit={this.handleAddEvent} className="add-task-form">
            <Row type="flex" justify="space-between" align="middle">
              <Col>
                <Form.Item
                  name={'name'}
                  rules={[{required: true, message: 'This field is required'}]}
                >
                  <Input
                    type="text"
                    placeholder={eventItem.eventType === "google" ? i18n.t`Add Google task` : i18n.t`Add to do task`}
                    onChange={(e) => this.setState({
                      eventItem: {
                        name: e.target.value,
                        info: eventItem.info,
                        eventType: eventItem.eventType,
                      }
                    })}
                    value={eventItem.name}
                    autoFocus={true}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Button className="app-btn primary-btn" htmlType="submit" block>
                  <span>{i18n.t`Add`}</span>
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}

UserFullCalendar.propTypes = {
  details: PropTypes.object,
};

export default UserFullCalendar;
