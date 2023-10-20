import store from 'store';
import {cloneDeep, curry, each, flow, groupBy, isArray, isString} from 'lodash';
import umiRouter from 'umi/router';
import pathToRegexp from 'path-to-regexp';
import {i18n} from './config';
// import 'moment/locale/zh-cn';
import {
  DEFAULT_DATE_TIME_HUMANIZER_OPTIONS,
  END_DATE_TIME_FORMAT,
  PERMISSIONS,
  ROLES,
  START_DATE_TIME_FORMAT,
  STATUSES,
  TEAM_USER_STATUSES,
  TYPE,
} from "./constant";
import humanizeDuration from 'humanize-duration';
import * as momentLocale from "moment"
import moment from 'utils/moment';

export classnames from 'classnames';
export config from './config';
export request from './request';
export { Color } from './theme';


// export const { defaultLanguage } = i18n
// export const languages = i18n.languages.map(item => item.key)
export const languages = i18n ? i18n.languages.map(item => item.key) : [];
export const defaultLanguage = i18n ? i18n.defaultLanguage : '';

/**
 * Query objects that specify keys and values in an array where all values are objects.
 * @param   {array}         array   An array where all values are objects, like [{key:1},{key:2}].
 * @param   {string}        key     The key of the object that needs to be queried.
 * @param   {string}        value   The value of the object that needs to be queried.
 * @return  {object|undefined}   Return frist object when query success.
 */
export function queryArray(array, key, value) {
  if (!Array.isArray(array)) {
    return
  }
  return array.find(_ => _[key] === value)
}

/**
 * Convert an array to a tree-structured array.
 * @param   {array}     array     The Array need to Converted.
 * @param   {string}    id        The alias of the unique ID of the object in the array.
 * @param   {string}    parentId       The alias of the parent ID of the object in the array.
 * @param   {string}    children  The alias of children of the object in the array.
 * @return  {array}    Return a tree-structured array.
 */
export function arrayToTree(
  array,
  id = 'id',
  parentId = 'pid',
  children = 'children'
) {
  const result = [];
  const hash = {};
  const data = cloneDeep(array);

  data.forEach((item, index) => {
    hash[data[index][id]] = data[index]
  });

  data.forEach(item => {
    const hashParent = hash[item[parentId]];
    if (hashParent) {
      !hashParent[children] && (hashParent[children] = []);
      hashParent[children].push(item)
    } else {
      result.push(item)
    }
  });
  return result
}

// export const langFromPath = curry(
//   /**
//    * Query language from pathname.
//    * @param   {array}     languages         Specify which languages are currently available.
//    * @param   {string}    defaultLanguage   Specify the default language.
//    * @param   {string}    pathname          Pathname to be queried.
//    * @return  {string}    Return the queryed language.
//    */
//   (languages, defaultLanguage, pathname) => {
//     for (const item of languages) {
//       if (pathname.startsWith(`/${item}/`)) {
//         return item
//       }
//     }
//     return defaultLanguage
//   }
// )(languages)(defaultLanguage)

export const langFromPath = pathname => {
  for (const item of languages) {
    if (pathname.startsWith(`/${item}/`)) {
      return item
    }
  }
  return defaultLanguage
};

export const deLangPrefix = curry(
  /**
   * Remove the language prefix in pathname.
   * @param   {array}     languages  Specify which languages are currently available.
   * @param   {string}    pathname   Remove the language prefix in the pathname.
   * @return  {string}    Return the pathname after removing the language prefix.
   */
  (languages, pathname) => {
    if (!pathname) {
      return
    }
    for (const item of languages) {
      if (pathname.startsWith(`/${item}/`)) {
        return pathname.replace(`/${item}/`, '/')
      }
    }

    return pathname
  }
)(languages);

/**
 * Add the language prefix in pathname.
 * @param   {string}    pathname   Add the language prefix in the pathname.
 * @return  {string}    Return the pathname after adding the language prefix.
 */
export function addLangPrefix(pathname) {
  if (!i18n) {
    return pathname
  }

  const prefix = langFromPath(window.location.pathname);
  return `/${prefix}${deLangPrefix(pathname)}`
}

const routerAddLangPrefix = params => {
  if (!i18n) {
    return params
  }
  if (isString(params)) {
    params = addLangPrefix(params)
  } else {
    params.pathname = addLangPrefix(params.pathname)
  }
  return params
};

/**
 * Adjust the router to automatically add the current language prefix before the pathname in push and replace.
 */
const myRouter = { ...umiRouter };

myRouter.push = flow(
  routerAddLangPrefix,
  umiRouter.push
);

myRouter.replace = flow(
  routerAddLangPrefix,
  myRouter.replace
);

export const router = myRouter;

/**
 * Whether the path matches the regexp if the language prefix is ignored, https://github.com/pillarjs/path-to-regexp.
 * @param   {string|regexp|array}     regexp     Specify a string, array of strings, or a regular expression.
 * @param   {string}                  pathname   Specify the pathname to match.
 * @return  {array|null}              Return the result of the match or null.
 */
export function pathMatchRegexp(regexp, pathname) {
  return pathToRegexp(regexp).exec(deLangPrefix(pathname))
}

/**
 * In an array object, traverse all parent IDs based on the value of an object.
 * @param   {array}     array     The Array need to Converted.
 * @param   {string}    current   Specify the value of the object that needs to be queried.
 * @param   {string}    parentId  The alias of the parent ID of the object in the array.
 * @param   {string}    id        The alias of the unique ID of the object in the array.
 * @return  {array}    Return a key array.
 */
export function queryPathKeys(array, current, parentId, id = 'id') {
  const result = [current];
  const hashMap = new Map();
  array.forEach(item => hashMap.set(item[id], item));

  const getPath = current => {
    const currentParentId = hashMap.get(current)[parentId];
    if (currentParentId) {
      result.push(currentParentId);
      getPath(currentParentId)
    }
  };

  getPath(current);
  return result
}

/**
 * In an array of objects, specify an object that traverses the objects whose parent ID matches.
 * @param   {array}     array     The Array need to Converted.
 * @param   {string}    current   Specify the object that needs to be queried.
 * @param   {string}    parentId  The alias of the parent ID of the object in the array.
 * @param   {string}    id        The alias of the unique ID of the object in the array.
 * @return  {array}    Return a key array.
 */
export function queryAncestors(array, current, parentId, id = 'id') {
  const result = [current];
  const hashMap = new Map();
  array.forEach(item => hashMap.set(item[id], item));

  const getPath = current => {
    const currentParentId = hashMap.get(current[id])[parentId];
    if (currentParentId) {
      result.push(hashMap.get(currentParentId));
      getPath(hashMap.get(currentParentId))
    }
  };
  // console.log('getPath', current)
  getPath(current);
  return result
}

/**
 * Query which layout should be used for the current path based on the configuration.
 * @param   {layouts}     layouts   Layout configuration.
 * @param   {pathname}    pathname  Path name to be queried.
 * @return  {string}   Return frist object when query success.
 */
export function queryLayout(layouts, pathname) {
  let result = 'public';
  const isMatch = regepx => {
    return regepx instanceof RegExp
      ? regepx.test(pathname)
      : pathMatchRegexp(regepx, pathname)
  };

  for (const item of layouts) {
    let include = false;
    let exclude = false;
    if (item.include) {
      for (const regepx of item.include) {
        if (isMatch(regepx)) {
          include = true;
          break
        }
      }
    }

    if (include && item.exclude) {
      for (const regepx of item.exclude) {
        if (isMatch(regepx)) {
          exclude = true;
          break
        }
      }
    }

    if (include && !exclude) {
      result = item.name;
      break
    }
  }

  return result
}

export function getLocale() {
  return langFromPath(window.location.pathname)
}

export function setLocale(language) {
  if (getLocale() !== language) {
    moment.locale(language === 'en' ? 'en-gb' : language);
    store.set('lang', language);
    umiRouter.push({
      pathname: `/${language}${deLangPrefix(window.location.pathname)}`,
      search: window.location.search,
    })
  }
}

export const getPercent = (part, total) => {
  if (part && total) {
    return Math.round((parseInt(part)/parseInt(total))*100) + '%';
  }
  return 0 + '%';
}

export const getColorByRole = (role) => {
  let color = 'green';
  switch (role) {
    case ROLES.ADMINISTRATOR:
      color = 'geekblue';
      break;
    case ROLES.MANAGER:
      color = 'volcano';
      break;
    case ROLES.STAFF:
      color = 'green';
      break;
  }
  return color;
};

export const getStatusTextColor = (status) => {
  let statusText = '';
  let statusColor = '';
  switch (status) {
    case STATUSES.ACTIVE.value:
      statusText = STATUSES.ACTIVE.text;
      statusColor = STATUSES.ACTIVE.color;
      break;
    case STATUSES.INACTIVE.value:
      statusText = STATUSES.INACTIVE.text;
      statusColor = STATUSES.INACTIVE.color;
      break;
  }
  return {text: statusText, color: statusColor};
};
export const getTypeTextColor = (type) => {
  let typeText = '';
  let typeColor = '';
  switch (type) {
    case TYPE.FULLTIME.value:
      typeText = TYPE.FULLTIME.text;
      typeColor = TYPE.FULLTIME.color;
      break;
    case TYPE.PARTTIME.value:
      typeText = TYPE.PARTTIME.text;
      typeColor = TYPE.PARTTIME.color;
      break;
    case TYPE.HOURLY.value:
      typeText = TYPE.HOURLY.text;
      typeColor = TYPE.HOURLY.color;
      break;
  }
  return {text: typeText, color: typeColor};
};
export const getTeamMemberStatusText = (status) => {
  let statusText = '';
  let statusColor = '';
  switch (status) {
    case TEAM_USER_STATUSES.DEVELOPER.value:
      statusText = TEAM_USER_STATUSES.DEVELOPER.text;
      statusColor = TEAM_USER_STATUSES.DEVELOPER.color;
      break;
    case TEAM_USER_STATUSES.PRODUCT_MANAGER.value:
      statusText = TEAM_USER_STATUSES.PRODUCT_MANAGER.text;
      statusColor = TEAM_USER_STATUSES.PRODUCT_MANAGER.color;
      break;
    case TEAM_USER_STATUSES.TEAM_LEAD.value:
      statusText = TEAM_USER_STATUSES.TEAM_LEAD.text;
      statusColor = TEAM_USER_STATUSES.TEAM_LEAD.color;
      break;
  }
  return {text: statusText, color: statusColor};
};


const timeFormat = 'HH:mm';

export const fnEndTimeText = (start_date_time, end_date_time, endTimeText = 'in process') =>{
  if(end_date_time){
    const endTime = moment(end_date_time);
    const diffDays = moment().diff(endTime, 'days');

    if(diffDays !== 0) {
      endTimeText = endTime.format(timeFormat);
    } else {
      if (moment().isSame(endTime, 'day')) {
        const startTime = moment(start_date_time);
        if (moment().isSame(startTime, 'day')) {
          endTimeText = endTime.format(timeFormat);
        } else {
          endTimeText = endTime.format(timeFormat) + ' Today';
        }
      } else {
        endTimeText = endTime.format(timeFormat);
      }
    }
  }
  return endTimeText;
};

export const fnStartDateTextColor = (start_date_time) =>{
  const start = start_date_time ? moment(start_date_time) : null;
  let startDateText = '';
  let startDateColor = '#d0740a';
  if (start) {
    const startDate = start ? start.format('DD-MM-YYYY') : null;
    const diffDays = moment().diff(startDate, 'days');

    if (diffDays === 0) { // Today
      if (moment().isSame(startDate, 'day')) {
        startDateText = 'Today';
        startDateColor = '#f50';
      } else {
        startDateText = 'Yesterday';
        startDateColor = '#108ee9';
      }
    } else if(diffDays === 1) { // Yesterday
      startDateText = 'Yesterday';
      startDateColor = '#108ee9';
    } else {
      startDateText = start.format('ddd, D MMM');
    }
  }
  return {text: startDateText, color: startDateColor};
};

export const fnDurationHumanizeText = (start_date_time, duration) => {
  let durationText;
  if (duration === 0) {
    const diffDuration = moment().diff(start_date_time, 'milliseconds');
    durationText = humanizeDuration.humanizer(DEFAULT_DATE_TIME_HUMANIZER_OPTIONS)(diffDuration);
  } else {
    durationText = humanizeDuration.humanizer(DEFAULT_DATE_TIME_HUMANIZER_OPTIONS)(duration * 1000);
  }
  return durationText;
};

export const fnDurationToHoursMinutesSeconds = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return {hours, minutes, seconds};
};
export const fnDurationToYearMonthDayHoursMinutesSeconds = (totalSeconds) => {
  //261- working days in 1 year
  // 21.74 - working days in 1 month
  // 8 - working hours in 1 day
  const years = Math.floor(totalSeconds / (60 * 60 * 8 * 261));
  totalSeconds %= 60 * 60 * 8 * 261;
  const months = Math.floor(totalSeconds / (8 * 60 * 60) / 21.74);
  if (months !== 0) {
    totalSeconds %= (8 * 60 * 60) / 21.74;
  }
  const days = Math.floor(totalSeconds / (8 * 60 * 60));
  if (days !== 0) {
    totalSeconds %= (8 * 60 * 60);
  }
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= (3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return {years, months, days, hours, minutes, seconds};
};
export const fnDurationToHoursText = (totalSeconds, langHour, resetTimer = false) => {
  const {hours} = fnDurationToHoursMinutesSeconds(totalSeconds);
  let durationText = '0h';
  if (hours !== 0) {
    durationText = `${hours + langHour}`;
  }
  return resetTimer ? "0h" : durationText;
};
export const fnDurationToHoursMinutesSecondsText = (totalSeconds, langHour, langMinute, langSecond, resetTimer = false) => {
  const {hours, minutes, seconds} = fnDurationToHoursMinutesSeconds(totalSeconds);
  let durationText = '';
  if (hours !== 0) {
    durationText = `${hours + langHour + ':' + minutes + langMinute + ':' + seconds + langSecond}`;
  } else{
    if (minutes === 0) {
      durationText = `${seconds + langSecond}`;
    } else {
      if (seconds === 0) {
        durationText = `${minutes + langMinute}`;
      } else {
        durationText = `${minutes + langMinute +  ':' + seconds + langSecond}`;
      }
    }
  }
  return resetTimer ? "0s" : durationText;
};
export const fnDurationToYearMonthDayHoursMinutesSecondstext = (totalSeconds, langyear, langMonth, langDay, langHour, langMinute, langSecond) => {
  const {years, months, days, hours, minutes, seconds} = fnDurationToYearMonthDayHoursMinutesSeconds(totalSeconds);
  let durationText = '';
  if (years !== 0) {
    durationText = `${years + langyear + ':' + months + langMonth + ':' + days + langDay + ':' + hours + langHour + ':' + minutes + langMinute + ':' + seconds + langSecond}`;
  } else {
    if (months !== 0) {
      durationText = `${months + langMonth + ':' + days + langDay + ':' + hours + langHour + ':' + minutes + langMinute + ':' + seconds + langSecond}`;
    } else {
      if (days !== 0) {
        durationText = `${days + langDay + ':' + hours + langHour + ':' + minutes + langMinute + ':' + seconds + langSecond}`;
      } else {
        if (hours !== 0) {
          durationText = `${ hours + langHour + ':' + minutes + langMinute + ':' + seconds + langSecond}`;
        }else {
          if (seconds === 0) {
            durationText = `${minutes + langMinute}`;
          } else {
            durationText = `${minutes + langMinute + ':' + seconds + langSecond}`;
          }
        }
      }
    }
  }
  return durationText;
};
export const fnDurationPercent = (duration, TotalDuration) => {
  return ((duration / TotalDuration) * 100).toFixed(3);
};

export const fnDurationToHoursMinutesSecondsForReports = (totalSeconds) => {
  let {hours, minutes, seconds} = fnDurationToHoursMinutesSeconds(totalSeconds);
  return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
};

export const fnDurationHoursMinutes = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds % 3600 / 60);
  const hDisplay = h;
  const mDisplay = m < 10 ? '0' + m : m;
  return hDisplay + ':' + mDisplay ;
}

export const fnConvertSecondsAsHours = (totalSeconds) => {
  return moment.duration(totalSeconds, 'seconds').asHours();
}

export const fnCompareLastAndThisWeek = (lastWeekWorkedTime, thisWeekWorkedTime) => {

  return fnDurationToHoursMinutesSeconds((lastWeekWorkedTime - thisWeekWorkedTime));
}

export const checkDateTimeFormat = (checked_date_time, dateFormat) => {
  return moment(checked_date_time, dateFormat).format(dateFormat) === checked_date_time;
};

export const disabledDate = (current) => {
  const user = store.get('user');
  const userTimeOffset = user.time_offset;
  return current && current > moment().utcOffset(userTimeOffset).endOf('day');
};

export const fnReportsGroupByWorks = (reports) => {
  const works = groupBy(reports, 'work_id');

  let items = [];
  for (const workId in works) {
    if (!works.hasOwnProperty(workId)) {
      continue;
    }
    const workTimes = works[workId];
    let work = {};
    for(let j = 0; j < workTimes.length; j++){
      const item = workTimes[j];

      let duration = item.duration;
      if (item.duration === 0 && item.start_date_time && item.end_date_time === null) {
        duration = moment.duration(moment().diff(moment(item.start_date_time))).asSeconds();
      }

      if (j === 0) { // first item
        work = {
          ...item,
          key: 'w' + '_' + workId + '_' +  j,
          title: item.work_name + ' - ' + item.work_user_name,
          color: '',
          duration: duration,
        };
      } else {
        work.duration += duration;
      }
    }
    items.push(work);
  }
  return items;
};

export const getDateRanges = (withoutYears = false) => {
  const now = moment();

  if(withoutYears) {
    return {
      'Today': [now, now],
      'Yesterday': [now.subtract(1, 'days'), now.subtract(1, 'days')],
      'This Week': [now.startOf('week'), now.endOf('week')],
      'Last Week': [now.subtract(1, 'weeks').startOf('week'), now.subtract(1, 'weeks').endOf('week')],
      'This Month': [now.startOf('month'), now.endOf('month')],
      'Last Month': [now.subtract(1, 'months').startOf('month'), now.subtract(1, 'months').endOf('month')],
    };
  }

  return {
    'Today': [now, now],
    'Yesterday': [now.subtract(1, 'days'), now.subtract(1, 'days')],
    'This Week': [now.startOf('week'), now.endOf('week')],
    'Last Week': [now.subtract(1, 'weeks').startOf('week'), now.subtract(1, 'weeks').endOf('week')],
    'This Month': [now.startOf('month'), now.endOf('month')],
    'Last Month': [now.subtract(1, 'months').startOf('month'), now.subtract(1, 'months').endOf('month')],
    'This Year': [now.startOf('year'), now.endOf('year')],
    'Last Year': [now.subtract(1, 'years').startOf('year'), now.subtract(1, 'years').endOf('year')]
  };
};

export const getDateRangesTranslated = (i18n, withoutYears = false) => {
  const now = moment();

  if(withoutYears) {
    return {
      [i18n.t`Today`]: [now, now],
      [i18n.t`Yesterday`]: [now.subtract(1, 'days'), now.subtract(1, 'days')],
      [i18n.t`This Week`]: [now.startOf('week'), now.endOf('week')],
      [i18n.t`Last Week`]: [now.subtract(1, 'weeks').startOf('week'), now.subtract(1, 'weeks').endOf('week')],
      [i18n.t`This Month`]: [now.startOf('month'), now.endOf('month')],
      [i18n.t`Last Month`]: [now.subtract(1, 'months').startOf('month'), now.subtract(1, 'months').endOf('month')],
    };
  }

  return {
    [i18n.t`Today`]: [now, now],
    [i18n.t`Yesterday`]: [now.subtract(1, 'days'), now.subtract(1, 'days')],
    [i18n.t`This Week`]: [now.startOf('week'), now.endOf('week')],
    [i18n.t`Last Week`]: [now.subtract(1, 'weeks').startOf('week'), now.subtract(1, 'weeks').endOf('week')],
    [i18n.t`This Month`]: [now.startOf('month'), now.endOf('month')],
    [i18n.t`Last Month`]: [now.subtract(1, 'months').startOf('month'), now.subtract(1, 'months').endOf('month')],
    [i18n.t`This Year`]: [now.startOf('year'), now.endOf('year')],
    [i18n.t`Last Year`]: [now.subtract(1, 'years').startOf('year'), now.subtract(1, 'years').endOf('year')]
  };
};

export const fnReportsGroupByProjects = (reports) => {
  const projects = groupBy(reports, 'project_id');
  let items = [];
  for (const projectId in projects) {
    if (!projects.hasOwnProperty(projectId)) {
      continue;
    }
    const works = projects[projectId];
    let children = [];
    let project = {};
    for(let j = 0; j < works.length; j++){
      const item = works[j];
      let duration = item.duration;
      if (item.duration === 0 && item.start_date_time && item.end_date_time === null) {
        duration = moment.duration(moment().diff(moment(item.start_date_time))).asSeconds();
      }
      item.key = 'p' + '_' + projectId + '_' +  j;
      if (j === 0) { // first item
        project = {
          ...item,
          // key: 'p' + '_' + projectId + '_' +  j,
          title: item.project_name !== null ? item.project_name : i18n.t('No Project'),
          color: item.project_color ? item.project_color : '#212121',
          duration: duration,
          children: [],
        };
      } else {
        project.duration += duration;
      }
      children.push(item);
    }
    project.children = fnReportsGroupByWorks(children);
    items.push(project);
  }
  return items;
};

export const fnReportsProjectsNormalize = (reports) => {
  return reports.map((report, i) => {
    report.key = 'p' + '_' + report.project_id + '_' +  i;
    return {
      ...report,
      title: report.project_name !== null ? report.project_name : 'No Project',
      color: report.project_color ? report.project_color : '#212121',
      duration: report.total_duration,
      children: [],
    }
  });
};
export const fnReportsWorksNormalize = (reports) => {
  return reports.map((report, i) => {
    return {
      ...report,
      key: 'w' + '_' + report.work_id + '_' +  i,
      title: report.work_name + ' - ' + report.work_user_name,
      color: '',
      duration: report.total_duration,
    }
  });
};

export const fnReportsGroupByStartDate = (reports) => {
  return groupBy(reports, 'start_date');
};

export const fnReportsGroupByProjectId = (reports) => {
  return groupBy(reports, 'project_id');
};

export const fnGetSumOfAllDurations = (reports) => {
  return reports.reduce((sum, current) => {
    if(current.duration) {
      return sum + current.duration;
    }

    return 0;
  }, 0);
}

export const checkCanSubmitDayReport = (works) => {
  let objectToCheck;
  let tasksSubmitted = [];
  if (works instanceof Object) {
    //if works display apart
    if (works instanceof Array) {
      objectToCheck = works[0];

      for (let workIndex in works) {
        let currentTask = works[workIndex];
        tasksSubmitted.push(currentTask.submitted);
      }
    }
    //if works display by group
    for (let [workName, workArray] of Object.entries(works)) {
      if (workArray instanceof Array) {
        objectToCheck = workArray[0];
        for (let workIndex in workArray) {
          let currentTask = workArray[workIndex];
          tasksSubmitted.push(currentTask.submitted);
        }
      }
    }
  }

  if (objectToCheck instanceof Object) {
    const user = store.get('user');
    const userTimeOffset = user.time_offset;
    let today     = moment().utcOffset(userTimeOffset);
    let yesterday = moment().utcOffset(userTimeOffset).add(-1, 'days');
    let toCheckDate = moment.parseZone(objectToCheck.start_date_time).utcOffset(userTimeOffset);
    let firstItemDays = null;

    if (moment(today).isSame(toCheckDate, 'day') || moment(yesterday).isSame(toCheckDate, 'day')) {
      firstItemDays = 0;
    } else {
      return firstItemDays;
    }

    const checkSubmitted = tasksSubmitted.filter(el => el === 0)
    return checkSubmitted.length > 0
  }
  return null;
};

export const checkLoggedUserPermission = (name, guard_name, teamIds = [], projectIds = []) => {
  const permissions = store.get('permissions');
  if (!permissions || !permissions.actions) return false;
  const firstCheck = !!permissions.actions[name + '_' + guard_name];
  if (firstCheck) return true;

  for (let i = 0; i < teamIds.length; i++) {
    if (permissions.actions['team_' + teamIds[i]] !== undefined
      && (permissions.actions['team_' + teamIds[i]].includes(name))) {
      return true;
    }
  }

  for (let i = 0; i < projectIds.length; i++) {
    if (permissions.actions['project_' + projectIds[i]] !== undefined
      && (permissions.actions['project_' + projectIds[i]].includes(name))) {
      return true;
    }
  }

  for (const key in permissions.actions) {
    if (permissions.actions.hasOwnProperty(key)) {
      if (key.startsWith('team_') || key.startsWith('project_')) {
        if (permissions.actions[key].includes(name)) {
          return true; // true for all teams or projects should be checked
        }
      }
    }
  }

  return firstCheck;
};

export const getLoggedUserPermissions = (_user = null) => {
  const user = _user !== null ? _user : store.get('user');
  if (!user || !user.id) return [];

  let allPermissions = {};
  if (isArray(user.roles)) {
    each(user.roles, function (role, i) {
      if (isArray(role.permissions)) {
        for(const role_permission of role.permissions){
          Object.keys(PERMISSIONS).map(key => {
            if (PERMISSIONS.hasOwnProperty(key)){
              const perm = PERMISSIONS[key];
              if(role_permission.name === perm.name && role_permission.guard_name === perm.guard_name){
                allPermissions[perm.name + '_' + perm.guard_name] = true;
              }
            }
          });
        }
      }
    });
    each(user.team_members_role_permissions, function (permissions, teamId){
      allPermissions['team_' + teamId] = permissions;
    });
    each(user.user_projects_role_permissions, function (permissions, projectId){
      allPermissions['project_' + projectId] = permissions;
    });
  }
  return allPermissions;
};

export const calculateUserRate = (userSalary, workType) => {
  if (userSalary === null || workType === null) {
    return 0;
  }
  // 8 -> hours per day
  // 5 -> days per week
  // 52 -> weeks per year
  // 12 -> months in a year
  const hoursPerMonthForFullTime = (8 * 5 * 52) / 12; // 173.33 hours per month for FullTime
  const hoursPerMonthForPartTime = (4 * 5 * 52) / 12;  // 86.66 hours per month for PartTime
  const monthlyWorkingDaysCountForFullTime = hoursPerMonthForFullTime / 8; // 21.67 days in a month for FullTime
  const monthlyWorkingDaysCountForPartTime = hoursPerMonthForPartTime / 4; // 21.67 days in a month for PartTime
  if (workType === TYPE.FULLTIME['value']) {
    const rateForFullTime = userSalary / monthlyWorkingDaysCountForPartTime / 8
    return rateForFullTime >= 1 ? Math.round(rateForFullTime) : rateForFullTime.toFixed(3);
  } else if (workType === TYPE.PARTTIME['value']) {
    const rateForPartTime = userSalary / monthlyWorkingDaysCountForPartTime / 4
    return rateForPartTime >= 1 ? Math.round(rateForPartTime) : rateForPartTime.toFixed(3) ;
  } else if (workType === TYPE.HOURLY['value']) {
    const salaryForFullTime = Math.round(userSalary * 8 * monthlyWorkingDaysCountForFullTime)
    const salaryForPartTime = Math.round(userSalary * 4 * monthlyWorkingDaysCountForPartTime)
    return {'salaryForFullTime': salaryForFullTime, 'salaryForPartTime': salaryForPartTime};
  }
};

export const calculateProjectRate = (rate, type, duration) => {
  if(rate && type && duration) {
    const hoursPerMonthTime = (8 * 5 * 52) / 12;
    const hoursDaily = 8;
    const hourlyDuration = duration / 3600;
    if (type === 'hourly') {
      return (rate * hourlyDuration).toFixed(2);
    } else if (type === 'daily') {
      return ((rate / hoursDaily) * hourlyDuration).toFixed(2);
    } else if (type === 'monthly') {
      return ((rate / hoursPerMonthTime) * hourlyDuration).toFixed(2);
    }
  }
  return null
}

export const allFutureHours = () => {
  const user = store.get('user');
  let currentTime  = moment().utcOffset(user.time_offset).format('HH');
  let futureHours = [];
  for(let hoursDecrement = 23; hoursDecrement > currentTime; hoursDecrement--){
    futureHours.push(hoursDecrement);
  }
  return futureHours;
}

export const allFutureMinutes = (hour) => {
  const user = store.get('user');
  let currentHour = moment().utcOffset(user.time_offset).format('HH');
  let futureMinutes = [];
  if(+currentHour === +hour){
    let currentMinute = moment().utcOffset(user.time_offset).format('mm');
    for(let minutesIncrement = currentMinute; minutesIncrement <= 59; minutesIncrement++){
      futureMinutes.push(minutesIncrement);
    }
  }
  return futureMinutes;
}

export const getRunningTaskStartTime = times => {
  let runningTaskStartTime = [];
  const user = store.get('user');
  if (times && times.length > 0) {
    times.forEach(timeObject => {
      if (!timeObject.end_date_time) {
        runningTaskStartTime['startHour'] = parseInt(moment.utc(timeObject.start_date_time).utcOffset(user.time_offset).format('HH'));
        runningTaskStartTime['startMinute'] = parseInt(moment.utc(timeObject.start_date_time).utcOffset(user.time_offset).format('mm'));
      }
    });
  }
  return runningTaskStartTime;
}

export const allTodayBusyTimes = times => {
  const user = store.get('user');
  let BusyHoursAndMinutes = {};
  if (times && times.length > 0) {
    times.forEach(timeObject => {
      let utcNow = moment().utc().format('YYYY-MM-DD HH:mm:ss');
      let startHour = parseInt(moment.utc(timeObject.start_date_time).utcOffset(user.time_offset).format('HH'));
      let startMinute = parseInt(moment.utc(timeObject.start_date_time).utcOffset(user.time_offset).format('mm'));
      let endHour = parseInt(moment.utc(timeObject.end_date_time ?? utcNow).utcOffset(user.time_offset).format('HH'));
      let endMinute = parseInt(moment.utc(timeObject.end_date_time ?? utcNow).utcOffset(user.time_offset).format('mm'));

      for (let hourIncrement = startHour; hourIncrement <= endHour; hourIncrement++) {
        let _minutes = [];
        let _currentStartMinute = 0;
        let _currentEndMinute = 59;
        if (startHour === endHour) {
          _currentStartMinute = startMinute;
          _currentEndMinute = endMinute;
        } else {
          if (hourIncrement === startHour) {
            _currentStartMinute = startMinute;
            _currentEndMinute = 59;
          } else if (hourIncrement === endHour) {
            _currentStartMinute = 0;
            _currentEndMinute = endMinute;
          }
        }

        for (let minuteIncrement = _currentStartMinute; minuteIncrement <= _currentEndMinute; minuteIncrement++) {
          _minutes.push(minuteIncrement);
        }

        if (BusyHoursAndMinutes[hourIncrement] === undefined) {
          BusyHoursAndMinutes[hourIncrement] = [..._minutes];
        } else {
          BusyHoursAndMinutes[hourIncrement] = [...new Set([...BusyHoursAndMinutes[hourIncrement], ..._minutes])];
        }
      }
    });
  }
  return BusyHoursAndMinutes;
}

export const fnCommentDateFormat = (commentDate, lang) => {
  if (lang === "English") {
    momentLocale.locale("en-au")
  }else {
    momentLocale.locale("hy-am")
  }
  return  momentLocale(commentDate).format(" LL HH:mm");
}

export const bytesToMB = (bytes) => {
  return (bytes/1048576).toFixed(1);
}

export const getResizedImage = (img, substr = 'avatar') => {
  return img && !img.includes(substr) ? img.replace('.', `_${substr}.`) : img;
}

export const getUserFullName = (user, patronymic = false) => {
  if (!user.name) return null;
  if (patronymic) {
    return user.surname && user.patronymic ? user.name + ' ' + user.surname + ' ' + user.patronymic : user.name;
  }
  return user.surname ? user.name + ' ' + user.surname : user.name;
}

export const fnIsDateToday = (dateTime) => {
  const user = store.get('user');
  let today = user ? moment().utcOffset(user.time_offset) : moment().utcOffset(0);
  let toCheckDate = user ? moment.parseZone(dateTime).utcOffset(user.time_offset) : moment.parseZone(dateTime).utcOffset(0);
  return moment(today).isSame(toCheckDate, 'day');
}

export const arrDiff = (a1, a2) => {

  let a = [], diff = [];

  for (let i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }

  for (let i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }

  for (let k in a) {
    diff.push(k);
  }

  return diff.sort();
}
export const getHoursRange = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    let item = '';
    if (i < 10) item = '0';
    item += i.toString();
    hours.push(item);
  }
  return hours;
}
export const getMinutesRange = () => {
  const minutes = [];
  for (let i = 0; i < 60; i++) {
    let item = '';
    if (i < 10) item = '0';
    item += i.toString();
    minutes.push(item);
  }
  return minutes;
}

export const fnGetBusyHoursMinutes = (isToday, busyTimes, activeWorkItem) => {
  const userTimeOffset = store.get('user').time_offset || '+00:00';
  const otherBusyTimes = busyTimes.filter(item => !(item.id === activeWorkItem.id && item.work_time_id === activeWorkItem.work_time_id))
  const busyHoursMinutesArr = [];
  for (let i = 0; i < otherBusyTimes.length; i++) {
    const endDateTime = moment.parseZone(otherBusyTimes[i].end_date_time).utcOffset(userTimeOffset);
    const startDateTime = moment.parseZone(otherBusyTimes[i].start_date_time).utcOffset(userTimeOffset);
    const duration = moment.duration(endDateTime.diff(startDateTime));
    const times = duration.asMinutes();
    for (let j = 0; j < times; j++) {
      const hourMinute = moment(startDateTime)
        .utcOffset(userTimeOffset)
        .add(j, 'minutes')
        .format('HH:mm');
      busyHoursMinutesArr.push(hourMinute);
    }
  }

  if (isToday) {
    // TODO maybe here we need to check ongoing task
    const start = moment().add(1, 'minutes').utcOffset(userTimeOffset);
    const end = moment().utcOffset(userTimeOffset).endOf('day');
    const duration = moment.duration(end.diff(start));
    const times = duration.asMinutes();
    for (let j = 0; j < times; j++) {
      const hourMinute = moment(start)
        .utcOffset(userTimeOffset)
        .add(j, 'minutes')
        .format('HH:mm');
      busyHoursMinutesArr.push(hourMinute);
    }
  }
  return busyHoursMinutesArr.sort();
}

export const getBusyHoursWithMinutes = (busyHoursMinutes) => {
  let hoursWithMinutes = [];
  for (let i = 0; i < busyHoursMinutes.length; i++) {
    const busyHoursMinute = busyHoursMinutes[i];
    const busyHoursMinuteArr = busyHoursMinute.split(":");

    if (hoursWithMinutes['h_' + busyHoursMinuteArr[0]] === undefined) hoursWithMinutes['h_' + busyHoursMinuteArr[0]] = [];
    if (!hoursWithMinutes['h_' + busyHoursMinuteArr[0]].includes(busyHoursMinuteArr[1])) {
      hoursWithMinutes['h_' + busyHoursMinuteArr[0]].push(busyHoursMinuteArr[1]);
    }
  }
  return hoursWithMinutes;
}
export const extractHoursFromHoursWithMinutes = (hoursWithMinutes, hours = [], minutesRange) => {
  if (minutesRange === undefined) minutesRange = getMinutesRange();

  Object.keys(hoursWithMinutes).map(key => {
    const keyArr = key.split("_");
    const hour = keyArr[1];
    if (hoursWithMinutes[key].length < 60) {
      const diff = arrDiff(minutesRange, hoursWithMinutes[key]);

      if (diff.length > 1) {
        const diffMinutes = diff.map(m => {
          if (m.startsWith('0')) {
            return parseInt(m.substring(1));
          }
          return parseInt(m);
        });

        const normalizedMinutes = [];
        diffMinutes.forEach((num, index) => {
          let prevNum = diffMinutes[index - 1];
          let nextNum = diffMinutes[index + 1];
          if (index === 0) { // first item
            normalizedMinutes.push(num);
          } else if (index === diffMinutes.length - 1) { // last item
            if (diffMinutes[index - 1] + 1 === num) {
              normalizedMinutes.push(num);
            }
          } else {
            if (nextNum - 1 !== num && prevNum + 1 === num) {
              normalizedMinutes.push(num);
            } else if (nextNum - 1 === num) {
              normalizedMinutes.push(num);
            }
          }
        });
        if (normalizedMinutes.length < 2) {
          if(!hours.includes(hour)){
            hours.push(hour);
          }
        }
      } else {
        if(!hours.includes(hour)){
          hours.push(hour);
        }
      }
    } else {
      if(!hours.includes(hour)){
        hours.push(hour);
      }
    }
  });
  return hours;
}
export const fnGetBusyStartHours = (busyHoursMinutes) => {
  const hoursWithMinutes = getBusyHoursWithMinutes(busyHoursMinutes);
  const minutesRange = getMinutesRange();
  return extractHoursFromHoursWithMinutes(hoursWithMinutes, [], minutesRange).map(h => {
    if (!Number.isInteger(h)) {
      return parseInt(h);
    }
    return h;
  }).sort((a, b) => a - b);
}

export const fnGetBusyStartMinutes = (startTime, busyHoursMinutes) => {
  const userTimeOffset = store.get('user').time_offset || '+00:00';
  const selectedHour = moment(startTime).utcOffset(userTimeOffset).hour();

  const minutes = [];
  // const minutesRange = getMinutesRange();
  for (let i = 0; i < busyHoursMinutes.length; i++) {
    const busyHoursMinute = busyHoursMinutes[i];
    const busyHoursMinuteArr = busyHoursMinute.split(":");

    let selectedHourStr = selectedHour.toString();
    if (selectedHour < 10) selectedHourStr = '0' + selectedHour;
    if (selectedHourStr !== busyHoursMinuteArr[0]) continue;

    minutes.push(busyHoursMinuteArr[1]);
  }
  return minutes.map(m => {
    if (!Number.isInteger(m)) return parseInt(m);
    return m;
  }).sort((a, b) => a - b);
}

export const fnGetBusyEndHours = (startTime, busyHoursMinutes, busyStartMinutes) => {
  const hoursWithMinutes = getBusyHoursWithMinutes(busyHoursMinutes);
  const hours = [];
  const userTimeOffset = store.get('user').time_offset || '+00:00';
  const startHour = moment(startTime).utcOffset(userTimeOffset).hour();
  for (let h = 0; h < startHour; h++) {
    hours.push(h);
  }
  const startMinute = moment(startTime).utcOffset(userTimeOffset).minute();
  const minutesRange = getMinutesRange();

  const _startBusyMinutes = busyStartMinutes !== undefined ? busyStartMinutes : fnGetBusyStartMinutes(startHour, busyHoursMinutes);
  const diff = arrDiff(minutesRange, _startBusyMinutes).map(m => parseInt(m));
  const availableStartMinutes = [];
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] > startMinute) {
      availableStartMinutes.push(diff[i]);
    }
  }
  let isStartHourBusy = true;
  if (availableStartMinutes.length > 0) {
    for (let i = 0; i < availableStartMinutes.length; i++) {
      if (availableStartMinutes[i] + 1 === availableStartMinutes[i + 1]
        || (availableStartMinutes.length === 1 && availableStartMinutes[i] === startMinute + 1)) {
        isStartHourBusy = false;
        break;
      }
    }
  }
  if (isStartHourBusy && !hours.includes(startHour)) {
    hours.push(startHour);
  }

  return extractHoursFromHoursWithMinutes(hoursWithMinutes, hours, minutesRange).map(h => {
    if (!Number.isInteger(h)) return parseInt(h);
    return h;
  }).sort((a, b) => a - b);
}

export const fnGetBusyEndMinutes = (startTime, endTime, busyHoursMinutes) => {
  const userTimeOffset = store.get('user').time_offset || '+00:00';
  const startHour = moment(startTime).utcOffset(userTimeOffset).hour();
  const startMinute = moment(startTime).utcOffset(userTimeOffset).minute();
  const endHour = moment(endTime).utcOffset(userTimeOffset).hour();
  // const endMinute = moment(endTime).utcOffset(userTimeOffset).minute();

  const minutes = [];
  if (startHour === endHour) {
    for (let m = 0; m <= startMinute; m++) {
      minutes.push(m);
    }
  }
  // const minutesRange = getMinutesRange();
  for (let i = 0; i < busyHoursMinutes.length; i++) {
    const busyHoursMinute = busyHoursMinutes[i];
    const busyHoursMinuteArr = busyHoursMinute.split(":");
    let selectedHourStr = endHour.toString();
    if (endHour < 10) selectedHourStr = '0' + endHour;
    if (selectedHourStr !== busyHoursMinuteArr[0]) continue;

    if (startHour !== endHour
      || (startHour === endHour && startMinute < parseInt(busyHoursMinuteArr[1]))) {
      minutes.push(busyHoursMinuteArr[1]);
    }
  }
  return minutes.map(m => {
    if (!Number.isInteger(m)) return parseInt(m);
    return m;
  }).sort((a, b) => a - b);
}

export const fnCheckAvailableStartEndRange = (startTime, endTime, todayBusyItems, isToday) => {
  if (startTime === endTime) return false;

  const userTimeOffset = store.get('user').time_offset || '+00:00';

  const _startTime = moment(startTime).utcOffset(userTimeOffset);
  const _endTime = moment(endTime).utcOffset(userTimeOffset);
  if (_startTime > _endTime) return false;
  if (isToday) {
    const nowTime = moment().utcOffset(userTimeOffset);
    return _endTime < nowTime;
  }

  const userTimeRange = moment.range(_startTime, _endTime).snapTo('second');
  for (let i = 0; i < todayBusyItems.length; i++) {
    const startDateTime = moment.parseZone(todayBusyItems[i].start_date_time).utcOffset(userTimeOffset);
    const endDateTime = !todayBusyItems[i].end_date_time
      ? moment().utcOffset(userTimeOffset)
      : moment.parseZone(todayBusyItems[i].end_date_time).utcOffset(userTimeOffset);
    const busyRange = moment.range(startDateTime, endDateTime).snapTo('second');

    if (userTimeRange.intersect(busyRange)) return false;
  }
  return true;
}

export const getFilterInitialStatus = (filter = {}) => {
  return filter.status ? filter.status : '1';
}

export const getFilterInitialUsers = (filter = {}, users= []) => {
  let initialUsers = [];
  if (filter.users) {
    if (filter.users === "0"){
      initialUsers = [0];
    } else {
      const fItems = Array.isArray(filter.users) ? filter.users : [filter.users];
      const filterIds = fItems.map(item => parseInt(item));
      const filterItems = users.filter(item => filterIds.includes(item.id));

      initialUsers = filterItems.map(item => item.id);
    }
  }
  return initialUsers;
}

export const getFilterInitialTeams = (filter = {}, teams= []) => {
  let initialTeams = [];
  if (filter.teams) {
    const fItems = Array.isArray(filter.teams) ? filter.teams : [filter.teams];
    const filterIds = fItems.map(item => parseInt(item));
    const filterItems = teams.filter(item => filterIds.includes(item.id));
    initialTeams = filterItems.map(item => item.id);
  }
  return initialTeams;
}


export const getFilterInitialProjects = (filter = {}, projects= []) => {
  let initialProjects = [];
  if (filter.projects) {
    if (filter.projects === "0") {
      initialProjects = [0];
    } else {
      const fItems = Array.isArray(filter.projects) ? filter.projects : [filter.projects];
      const filterIds = fItems.map(item => parseInt(item));
      const filterItems = projects.filter(item => {
        return filterIds.includes(item.id)
      });
      initialProjects = filterItems.map(item => item.id);
      if (filterIds.includes(0)) initialProjects.unshift(0);
    }
  }
  return initialProjects;
}

export const getFilterInitialDateRange = (start_date_time, end_date_time) => {
  let initialDateRange = [];
  if (!start_date_time && !end_date_time) {
    initialDateRange = [moment(), moment()];
  } else {
    if (start_date_time && checkDateTimeFormat(start_date_time, START_DATE_TIME_FORMAT)) {
      initialDateRange.push(moment(start_date_time));
    } else { // invalid date time format
      initialDateRange.push(moment());
    }

    if (end_date_time && checkDateTimeFormat(end_date_time, END_DATE_TIME_FORMAT)) {
      initialDateRange.push(moment(end_date_time));
    } else { // invalid date time format
      initialDateRange.push(moment());
    }
  }
  return initialDateRange;
}

export const fnCalculateYearsAndMonths = (date) => {
  let years = 0;
  let months = 0;
  if (date) {
    const nowTime = moment();
    let contractTime = moment(date);
    years = nowTime.diff(contractTime, 'year');

    contractTime.add(years, 'years');
    months = nowTime.diff(contractTime, 'months');
  }
  return {years: years, months: months};
}
