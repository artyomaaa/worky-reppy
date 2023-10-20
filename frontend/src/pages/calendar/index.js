import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import store from 'store';
import userAvatar from 'img/avatar.png';
import {getResizedImage, getUserFullName, checkLoggedUserPermission} from 'utils';
import {appUrl} from 'utils/config';
import {PERMISSIONS, FULL_DATE_TIME_FORMAT} from 'utils/constant';
import styles from "./index.less";
import {withI18n} from "@lingui/react";
import UserFullCalendar from './components/UserFullCalendar';
import CheckGoogleCalendar from './components/CheckGoogleCalendar';

@connect(({userFullCalendar}) => ({userFullCalendar}))
@withI18n()
class Calendar extends PureComponent {

  get detailsProps() {
    const {dispatch, userFullCalendar, location} = this.props;
    const userId = location?.query?.userId ? parseInt(location?.query?.userId) : store?.get('user')?.id;
    const contentProps = {};
    contentProps.events = userFullCalendar['calendarData'];
    contentProps.onChangeStartEndTime = (start_date_time, end_date_time, view_items = []) => {
      return dispatch({
        type: `userFullCalendar/queryFullCalendar`,
        payload: {
          userId: userId,
          start_date_time,
          end_date_time,
          view_items,
        },
      }).catch(console.error);
    };
    contentProps.onStartWork = (payload = {}) => {
      return dispatch({
        payload: payload,
        type: `userFullCalendar/startWork`,
      });
    };
    contentProps.onStopWork = (payload = {}) => {
      return dispatch({
        payload: payload,
        type: `userFullCalendar/stopWork`,
      });
    };

    contentProps.onAddEvent = (payload = {}) => {
      const {allDay, startDateTime, name, eventType} = payload;
      let endDateTime = null;
      if (!allDay) {
        endDateTime = moment(startDateTime).add(30, 'minutes').format(FULL_DATE_TIME_FORMAT); // Default 30 minutes
      }
      return dispatch({
        payload: {
          all_day: allDay,
          item_name: name,
          start_date_time: startDateTime,
          end_date_time: endDateTime,
          event_type: eventType,
          user_id: userId,
        },
        type: `userFullCalendar/addEvent`,
      });
    };

    contentProps.addTodo = (payload = {}) => {
      return dispatch({
        payload: {todo: payload},
        type: `works/addTodoFromCalendar`,
      });
    }

    const updateEvent = (payload) => {
      let {allDay, startDateTime, endDateTime, itemId, eventType} = payload;
      return dispatch({
        payload: {
          all_day: allDay,
          item_id: itemId,
          start_date_time: startDateTime ? moment(startDateTime).format(FULL_DATE_TIME_FORMAT) : null,
          end_date_time: endDateTime ? moment(endDateTime).format(FULL_DATE_TIME_FORMAT) : null,
          event_type: eventType,
          user_id: userId,
        },
        type: `userFullCalendar/updateEvent`,
      });
    }

    contentProps.onEventDrop = (payload = {}) => {
      return updateEvent(payload);
    };

    contentProps.onEventResize = (payload = {}) => {
      return updateEvent(payload);
    };

    return {
      ...contentProps,
    }
  };

  get permissions() {
    const canViewOthersFullCalendar = checkLoggedUserPermission(PERMISSIONS.VIEW_OTHERS_FULL_CALENDAR.name, PERMISSIONS.VIEW_OTHERS_FULL_CALENDAR.guard_name);

    return {
      canViewOthersFullCalendar: canViewOthersFullCalendar
    }
  }

  render() {
    const {location, userFullCalendar, i18n} = this.props;
    const userId = location?.query?.userId;
    const calendarUser = userFullCalendar['calendarUser'];
    const isLoggedUser = userId === undefined || userId.toString() === store.get('user')?.id?.toString();
    const {canViewOthersFullCalendar} = this.permissions;

    if (!isLoggedUser && !canViewOthersFullCalendar)
      return <h3 style={{textAlign: 'center'}}>{i18n.t`Access denied`}</h3>; // cannot see others calendar information

    return (
      <div className={styles["calendar-container"]}>
        {!isLoggedUser &&
        <div style={{textAlign: 'center', paddingTop: '10px'}}>
          <img className={styles['avatar']}
               src={calendarUser.avatar ? `${appUrl}storage/images/avatars${getResizedImage(calendarUser.avatar, 'avatar')}` : userAvatar}/>
          <h3 style={{display: 'inline-block', marginLeft: '10px'}}>{getUserFullName(calendarUser)}</h3>
        </div>
        }
        <CheckGoogleCalendar/>
        <div>
          <UserFullCalendar details={this.detailsProps} isLoggedUser={isLoggedUser}/>
        </div>
      </div>
    );
  }
}

export default Calendar;
