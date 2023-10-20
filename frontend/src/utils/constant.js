import { Trans } from '@lingui/react';
import React from "react";
import {value} from "lodash/seq";
export const ROLE_TYPE = {
  ADMIN: 'admin',
  DEFAULT: 'admin',
  DEVELOPER: 'developer',
};
export const CANCEL_REQUEST_MESSAGE = 'cancel request';
export const UNAUTHORIZED_REQUEST_MESSAGE = 'Unauthorized';

export const ROUTE_LIST = [
  {
    id: '1',
    icon: 'dashboard',
    name: 'Dashboard',
    hy: {
      name: 'Գլխավոր Էջ'
    },
    route: '/dashboard',
    isBottom: true
  },
  {
    id: '3',
    breadcrumbParentId: '1',
    name: 'Work',
    hy: {
      name: 'Առաջադրանքներ'
    },
    icon: 'clock-circle',
    route: '/works',
  },
  {
    id: '31',
    breadcrumbParentId: '3',
    menuParentId: '3',
    name: 'Tasks',
    hy: {
      name: 'Առաջադրանքներ'
    },
    icon: 'clock-circle',
    route: '/tasks',
  },
  {
    id: '32',
    breadcrumbParentId: '3',
    menuParentId: '3',
    name: 'Calendar',
    hy: {
      name: 'Օրացույց'
    },
    icon: 'calendar',
    route: '/calendar',
  },
  {
    id: '2',
    breadcrumbParentId: '1',
    name: 'Users',
    hy: {
      name: 'Աշխատակիցներ'
    },
    icon: 'user',
    route: '/users',
  },
  {
    id: '21',
    menuParentId: '-1',
    breadcrumbParentId: '2',
    name: 'User Detail',
    hy: {
      name: 'Աշխատակցի տվյալներ'
    },
    route: '/users/:id',
  },
  {
    id: '10',
    breadcrumbParentId: '10',
    name: 'User Roles',
    hy: {
      name: 'Աշխատակիցների ռոլերը'
    },
    icon: 'user',
    route: '/userRoles',
  },
  {
    id: '10',
    menuParentId: '-1',
    breadcrumbParentId: '10',
    name: 'User Role',
    hy: {
      name: 'Աշխատակիցների ռոլեր'
    },
    icon: 'user',
    route: '/userRoles/:id',
  },

  {
    id: '4',
    breadcrumbParentId: '1',
    name: 'Projects',
    hy: {
      name: 'Նախագծեր'
    },
    icon: 'project',
    route: '/projects',
  },
  {
    id: '41',
    menuParentId: '-1',
    breadcrumbParentId: '4',
    name: 'Project Detail',
    hy: {
      name: 'Նախագծի տվյալներ'
    },
    route: '/projects/:id',
  },
  {
    id: '5',
    breadcrumbParentId: '1',
    name: 'Teams',
    hy: {
      name: 'Թիմեր'
    },
    icon: 'team',
    route: '/teams',
  },

  {
    id: '51',
    menuParentId: '-1',
    breadcrumbParentId: '5',
    name: 'Teams Detail',
    hy: {
      name: 'Թիմերի տվյալներ'
    },
    route: '/teams/:id',
  },
  {
    id: '6',
    breadcrumbParentId: '1',
    name: 'Reports',
    hy: {
      name: 'Զեկույցներ'
    },
    icon: 'area-chart',
    route: '/reports',
  },
  {
    id: '61',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Summary',
    hy: {
      name: 'Զեկույցների ամփոփում'
    },
    icon: 'bar-chart',
    route: '/reports/summary',
  },
  {
    id: '62',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Details',
    hy: {
      name: 'Զեկույցների մանրամասներ'
    },
    icon: 'pie-chart',
    route: '/reports/details',
  },
  {
    id: '63',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Finance',
    hy: {
      name: 'ֆինանսական Զեկույցներ'
    },
    icon: 'pie-chart',
    route: '/reports/financial',
  },
  {
    id: '64',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Per Project',
    hy: {
      name: 'Նախագծերի ամփոփում'
    },
    icon: 'bar-chart',
    route: '/reports/ProjectReport',
  },
  {
    id: '65',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Per User',
    hy: {
      name: 'Օգտատերերի ամփոփում'
    },
    icon: 'pie-chart',
    route: '/reports/userReport',
  },
  {
    id: '66',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Efforts',
    hy: {
      name: 'Ջանքեր'
    },
    icon: 'pie-chart',
    route: '/reports/efforts',
  },
  {
    id: '67',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Project Time',
    hy: {
      name: 'Պրոեկտների ժամային ամփոփում'
    },
    icon: 'pie-chart',
    route: '/reports/projectTimeReport',
  },
  {
    id: '68',
    breadcrumbParentId: '6',
    menuParentId: '6',
    name: 'Now Working',
    hy: {
      name: 'Հիմա աշխատում են'
    },
    icon: 'pie-chart',
    route: '/reports/nowWorkingOnTasks',
  },
  {
    id: '7',
    breadcrumbParentId: '7',
    menuParentId: '7',
    name: 'Profile',
    hy: {
      name: 'Իմ հաշիվը'
    },
    icon: 'user֊dashboard',
    route: '/profile',
    isBottom: true
  },
  {
    id: '8',
    breadcrumbParentId: '8',
    menuParentId: '8',
    name: 'Settings ',
    hy: {
      name: 'Կարգավորումներ'
    },
    icon: 'settings',
    route: '',
    isBottom: true
  },
  {
    id: '9',
    breadcrumbParentId: '9',
    menuParentId: '9',
    name: 'Log out',
    hy: {
      name: 'Ելք'
    },
    icon: 'logout',
    route: '/logout',
    isBottom: true
  },
  {
    id: '100',
    icon: 'dashboard',
    name: 'Email Verify',
    breadcrumbParentId: '-1',
    menuParentId: '-1',
    hy: {
      name: 'Էլփոստի ստուգում'
    },
    route: '/email/verify/:id/:hash',
    isBottom: true
  },
];

export const FAMILY_STATUSES = [
  {text: <Trans>Single</Trans>, value: 0},
  {text: <Trans>Married</Trans>, value: 1},
];

export const STATUSES = {
  ACTIVE: {text:'Active', value: 1, color: '#2EB13B'},
  INACTIVE: {text: 'Inactive', value: 0, color: '#DB4D4D'},
};
export const GENDER = {
  MALE: {text: <Trans>Male</Trans>, value: 0},
  FEMALE: {text: <Trans>Female</Trans>, value: 1},
  // OTHER: {text: <Trans>Other</Trans>, value: 2},
};

export const TYPE = {
  FULLTIME: {text: <Trans>Full Time</Trans>, value: 0, color: 'blue'},
  PARTTIME: {text: <Trans>Part Time</Trans>, value: 1, color: 'grey'},
  HOURLY: {text: <Trans>Hourly</Trans>, value: 2, color: 'orange'},
};

export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  HUMAN_RESOURCES_MANAGER: 'Human Resources Manager',
};
export const PROJECT_STATUSES = {
  ACTIVE: {text: 'Active', value: 1, color: 'blue'},
  INACTIVE: {text: 'Inactive', value: 0, color: 'grey'},
  ARCHIVED: {text: 'Archived', value: 2, color: 'orange'},
};

export const PROJECT_TYPES = {
  FIXED: {text: 'Fixed', value: 'fixed'},
  HOURLY: {text: 'Hourly', value: 'hourly'}
};

export const START_DATE_TIME_FORMAT = 'YYYY-MM-DD 00:00:00';
export const END_DATE_TIME_FORMAT = 'YYYY-MM-DD 23:59:59';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_MONTH_FORMAT = 'LL';
export const FULL_DATE_MONTH_FORMAT = 'LL HH:mm';
export const FULL_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const dateFormats = {
  tasksPageCalendarFormat: 'DD-MM-YY',
  userDetailsPageDateFormat: 'DD MMM, Y',
}

export const DEFAULT_DATE_TIME_FORMAT = 'HH:mm DD-MM-YYYY';
export const DEFAULT_WORK_TIME_FORMAT = 'HH:mm DD/MM';
export const DEFAULT_PROJECT_COLOR = {
  HEX: '#ebb424',
  RGB: {
    r: '241',
    g: '112',
    b: '19',
    a: '1',
  }
};

export const TEAM_USER_STATUSES = {
  DEVELOPER: {text: 'Developer', value: 0, color: 'blue'},
  PRODUCT_MANAGER: {text: 'Product Manager', value: 1, color: 'grey'},
  TEAM_LEAD: {text: 'Team Lead', value: 2, color: 'orange'},
};

export const DEFAULT_DATE_TIME_HUMANIZER_OPTIONS = {
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    }
  }
};

const PERMISSION_GROUPS = {
  USERS: 'Users',
  PROJECTS: 'Projects',
  TASKS: 'Tasks',
  TAGS: 'Tags',
  TODOS: 'Todos',
  TEAMS: 'Teams',
  REPORTS: 'Reports',
  SALARY: 'Salary',
  BONUS: 'Bonus',
  OTHER_SPENDS: 'Other Spends',
  DOCUMENTS: 'Documents',
  CONTACTS: 'Contacts',
  JOB_INFORMATION: 'Job Information',
  FAMILY_INFORMATION: 'Family Information',
  NOTE: 'Note',
  RELATIVES: 'Relatives',
  REMUNERATION: 'Remuneration',
  JOB_TYPE: 'Job Type',
  VACATION: 'Vacation',
  EDUCATION: 'Education',
  LANGUAGE: 'Language',
  DAY_NOTE: 'Day Note',
  MORE_INFO: 'More Info',
  CASUAL_INFORMATION: 'Casual Information',
  AVATAR: 'Avatar',
  WEEKLY_ACTIVITY: 'Weekly Activity',
  CALENDAR: 'Calendar',
  ADMINISTRATORS: 'Administrators',
  ROLES_PERMISSIONS: 'Roles Permissions',
};

export const PERMISSIONS = {
  VIEW_USERS: {name: 'view users', guard_name: 'api', description: 'view users', group: PERMISSION_GROUPS.USERS},
  VIEW_USER_DETAILS: {name: 'view user details', guard_name: 'api', description: 'view user details', group: PERMISSION_GROUPS.USERS},
  VIEW_USER_SELF_DETAILS: {name: 'view self details', guard_name: 'api', description: 'view self details', group: PERMISSION_GROUPS.USERS},
  ADD_USERS: {name: 'add users', guard_name: 'api', description: 'add users', group: PERMISSION_GROUPS.USERS},
  EDIT_USERS: {name: 'edit users', guard_name: 'api', description: 'edit users', group: PERMISSION_GROUPS.USERS},
  EDIT_SELF_USERS: {name: 'edit self users', guard_name: 'api', description: 'edit self users', group: PERMISSION_GROUPS.USERS},
  DELETE_USERS: {name: 'delete users', guard_name: 'api', description: 'delete users', group: PERMISSION_GROUPS.USERS},
  EXPORT_USERS_DATA: {name: 'export user data', guard_name: 'api', description: 'export user data', group: PERMISSION_GROUPS.USERS},

  VIEW_ADMINISTRATORS: {name: 'view administrators', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ADMINISTRATORS},
  ADD_ADMINISTRATORS: {name: 'add administrators', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ADMINISTRATORS},
  EDIT_ADMINISTRATORS: {name: 'edit administrators', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ADMINISTRATORS},
  DELETE_ADMINISTRATORS: {name: 'delete administrators', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ADMINISTRATORS},

  VIEW_PROJECTS: {name: 'view projects', guard_name: 'api', description: '', group: PERMISSION_GROUPS.PROJECTS},
  VIEW_SELF_PROJECTS: {name: 'view self projects', guard_name: 'api', description: '', group: PERMISSION_GROUPS.PROJECTS},
  ADD_PROJECTS: {name: 'add projects', guard_name: 'api', description: '', group: PERMISSION_GROUPS.PROJECTS},
  EDIT_PROJECTS: {name: 'edit projects', guard_name: 'api', description: '', group: PERMISSION_GROUPS.PROJECTS},
  DELETE_PROJECTS: {name: 'delete projects', guard_name: 'api', description: '', group: PERMISSION_GROUPS.PROJECTS},
  VIEW_PROJECT_RATE: {name: 'view project rate', guard_name: 'api', description: '', group: PERMISSION_GROUPS.PROJECTS},

  VIEW_WORKS: {name: 'view works', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TASKS},
  ADD_WORKS: {name: 'add works', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TASKS},
  EDIT_WORKS: {name: 'edit works', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TASKS},
  DELETE_WORKS: {name: 'delete works', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TASKS},

  VIEW_TAGS: {name: 'view tags', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TAGS},
  ADD_TAGS: {name: 'add tags', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TAGS},
  EDIT_TAGS: {name: 'edit tags', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TAGS},
  DELETE_TAGS: {name: 'delete tags', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TAGS},

  VIEW_TODOS: {name: 'view todos', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TODOS},
  ADD_TODOS: {name: 'add todos', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TODOS},
  EDIT_TODOS: {name: 'edit todos', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TODOS},
  DELETE_TODOS: {name: 'delete todos', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TODOS},

  VIEW_TEAMS: {name: 'view teams', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  VIEW_SELF_TEAMS:{name:'view self teams',guard_name:'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  ADD_TEAMS: {name: 'add teams', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  EDIT_TEAMS: {name: 'edit teams', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  EDIT_SELF_TEAMS: {name: 'edit self teams', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  DELETE_TEAMS: {name: 'delete teams', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  DELETE_SELF_TEAMS: {name: 'delete self teams', guard_name: 'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  VIEW_TEAM_DETAILS:{name:'view team details',guard_name:'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  VIEW_SELF_TEAM_DETAILS:{name:'view self team details',guard_name:'api', description: '', group: PERMISSION_GROUPS.TEAMS},
  VIEW_SPECIFIC_TEAM_DETAILS:{name:'view specific team details',guard_name:'api', description: '', group: PERMISSION_GROUPS.TEAMS},

  VIEW_REPORTS: {name: 'view reports', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_FINANCIAL_LIST: {name: 'view financial list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_EFFORTS: {name: 'view efforts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_PROJECT_MEMBER_LIST: {name: 'view project member list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_PROJECTS_LIST: {name: 'view projects list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_TEAM_PROJECT_MEMBER_LIST: {name: 'view team project member list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_SELF_PROJECT_MEMBER_LIST: {name: 'view self project member list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_PROJECT_TIME_REPORTS: {name: 'view project time reports', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  EXPORT_PROJECT_TIME_REPORTS: {name: 'export project time reports', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_NOW_WORKING_ON_TASKS: {name: 'view now working on tasks', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_TEAM_USER_REPORT_LIST: {name: 'view team user report list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_TEAM_USER_REPORT_FULL_LIST: {name: 'view team user report full list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_USER_REPORT_FULL_LIST: {name: 'view user report full list', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_USERS_FOR_FILTER_REPORTS: {name: 'view users for filter reports', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_TEAMS_FOR_FILTER_REPORTS: {name: 'view teams for filter reports', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},
  VIEW_PROJECTS_FOR_FILTER_REPORTS: {name: 'view projects for filter reports', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REPORTS},

  VIEW_SALARY: {name: 'view salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},
  ADD_SALARY: {name: 'add salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},
  ADD_SELF_SALARY: {name: 'add self salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},
  EDIT_SALARY: {name: 'edit salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},
  EDIT_SELF_SALARY: {name: 'edit self salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},
  DELETE_SALARY: {name: 'delete salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},
  DELETE_SELF_SALARY: {name: 'delete self salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},
  VIEW_SELF_SALARY: {name: 'view self salary', guard_name: 'api', description: '', group: PERMISSION_GROUPS.SALARY},

  VIEW_BONUS: {name: 'view bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},
  ADD_BONUS: {name: 'add bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},
  ADD_SELF_BONUS: {name: 'add self bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},
  EDIT_BONUS: {name: 'edit bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},
  EDIT_SELF_BONUS: {name: 'edit self bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},
  DELETE_BONUS: {name: 'delete bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},
  DELETE_SELF_BONUS: {name: 'delete self bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},
  VIEW_SELF_BONUS: {name: 'view self bonus', guard_name: 'api', description: '', group: PERMISSION_GROUPS.BONUS},

  VIEW_OTHER_SPENDS: {name: 'view other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},
  ADD_OTHER_SPENDS: {name: 'add other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},
  ADD_SELF_OTHER_SPENDS: {name: 'add self other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},
  EDIT_OTHER_SPENDS: {name: 'edit other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},
  EDIT_SELF_OTHER_SPENDS: {name: 'edit self other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},
  DELETE_OTHER_SPENDS: {name: 'delete other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},
  DELETE_SELF_OTHER_SPENDS: {name: 'delete self other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},
  VIEW_SELF_OTHER_SPENDS: {name: 'view self other spends', guard_name: 'api', description: '', group: PERMISSION_GROUPS.OTHER_SPENDS},

  VIEW_DOCUMENTS: {name: 'view documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},
  ADD_DOCUMENTS: {name: 'add documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},
  EDIT_DOCUMENTS: {name: 'edit documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},
  DELETE_DOCUMENTS: {name: 'delete documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},
  VIEW_SELF_DOCUMENTS: {name: 'view self documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},
  ADD_SELF_DOCUMENTS: {name: 'add self documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},
  EDIT_SELF_DOCUMENTS: {name: 'edit self documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},
  DELETE_SELF_DOCUMENTS: {name: 'delete self documents', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DOCUMENTS},

  VIEW_CONTACTS: {name: 'view contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},
  ADD_CONTACTS: {name: 'add contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},
  EDIT_CONTACTS: {name: 'edit contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},
  DELETE_CONTACTS: {name: 'delete contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},
  VIEW_SELF_CONTACTS: {name: 'view self contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},
  ADD_SELF_CONTACTS: {name: 'add self contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},
  EDIT_SELF_CONTACTS: {name: 'edit self contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},
  DELETE_SELF_CONTACTS: {name: 'delete self contacts', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CONTACTS},

  //job information
  VIEW_JOB_INFORMATION: {name: 'view job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  EDIT_JOB_INFORMATION: {name: 'edit job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  ADD_JOB_INFORMATION: {name: 'add job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  DELETE_JOB_INFORMATION: {name: 'delete job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  VIEW_SELF_JOB_INFORMATION: {name: 'view self job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  ADD_SELF_JOB_INFORMATION: {name: 'add self job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  EDIT_SELF_JOB_INFORMATION: {name: 'edit self job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  DELETE_SELF_JOB_INFORMATION: {name: 'delete self job information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_INFORMATION},
  //family information
  VIEW_FAMILY_INFORMATION: {name: 'view family information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.FAMILY_INFORMATION},
  EDIT_FAMILY_INFORMATION: {name: 'edit family information', guard_name: 'api', description: '', group: PERMISSION_GROUPS.FAMILY_INFORMATION},

  // user Notes Permissions
  ADD_NOTE: {name: 'add note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.NOTE},
  EDIT_NOTE: {name: 'edit note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.NOTE},
  DELETE_NOTE: {name: 'delete note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.NOTE},

  // user relatives
  VIEW_RELATIVES:{name: 'view relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  ADD_RELATIVES:{name: 'add relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  EDIT_RELATIVES:{name: 'edit relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  DELETE_RELATIVES:{name: 'delete relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  VIEW_SELF_RELATIVES:{name: 'view self relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  ADD_SELF_RELATIVES:{name: 'add self relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  EDIT_SELF_RELATIVES:{name: 'edit self relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  DELETE_SELF_RELATIVES: {name: 'delete self relative', guard_name: 'api', description: '', group: PERMISSION_GROUPS.RELATIVES},
  //remuneration
  VIEW_REMUNERATION: {name: 'view remuneration', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REMUNERATION},
  VIEW_SELF_REMUNERATION: {name: 'view self remuneration', guard_name: 'api', description: '', group: PERMISSION_GROUPS.REMUNERATION},

  //job type
  EDIT_JOB_TYPE: {name: 'edit job type', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_TYPE},
  EDIT_SELF_JOB_TYPE: {name: 'edit self job type', guard_name: 'api', description: '', group: PERMISSION_GROUPS.JOB_TYPE},

  // user vacation
  VIEW_VACATION:{name: 'view vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},
  ADD_VACATION:{name: 'add vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},
  EDIT_VACATION:{name: 'edit vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},
  DELETE_VACATION:{name: 'delete vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},
  VIEW_SELF_VACATION:{name: 'view self vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},
  ADD_SELF_VACATION:{name: 'add self vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},
  EDIT_SELF_VACATION:{name: 'edit self vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},
  DELETE_SELF_VACATION:{name: 'delete self vacation', guard_name: 'api', description: '', group: PERMISSION_GROUPS.VACATION},

  // user education
  VIEW_EDUCATION:{name: 'view education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},
  ADD_EDUCATION:{name: 'add education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},
  EDIT_EDUCATION:{name: 'edit education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},
  DELETE_EDUCATION:{name: 'delete education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},
  VIEW_SELF_EDUCATION:{name: 'view self education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},
  ADD_SELF_EDUCATION:{name: 'add self education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},
  EDIT_SELF_EDUCATION:{name: 'edit self education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},
  DELETE_SELF_EDUCATION:{name: 'delete self education', guard_name: 'api', description: '', group: PERMISSION_GROUPS.EDUCATION},

  // user language
  VIEW_LANGUAGE:{name: 'view language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},
  ADD_LANGUAGE:{name: 'add language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},
  EDIT_LANGUAGE:{name: 'edit language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},
  DELETE_LANGUAGE:{name: 'delete language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},
  VIEW_SELF_LANGUAGE:{name: 'view self language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},
  ADD_SELF_LANGUAGE:{name: 'add self language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},
  EDIT_SELF_LANGUAGE:{name: 'edit self language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},
  DELETE_SELF_LANGUAGE:{name: 'delete self language', guard_name: 'api', description: '', group: PERMISSION_GROUPS.LANGUAGE},

  // user day note
  VIEW_DAY_NOTE:{name: 'view day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},
  ADD_DAY_NOTE:{name: 'add day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},
  EDIT_DAY_NOTE:{name: 'edit day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},
  DELETE_DAY_NOTE:{name: 'delete day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},
  VIEW_SELF_DAY_NOTE:{name: 'view self day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},
  ADD_SELF_DAY_NOTE:{name: 'add self day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},
  EDIT_SELF_DAY_NOTE:{name: 'edit self day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},
  DELETE_SELF_DAY_NOTE:{name: 'delete self day note', guard_name: 'api', description: '', group: PERMISSION_GROUPS.DAY_NOTE},

  VIEW_MORE_INFO:{name: 'view more info', guard_name: 'api', description: '', group: PERMISSION_GROUPS.MORE_INFO},
  VIEW_SELF_MORE_INFO:{name: 'view self more info', guard_name: 'api', description: '', group: PERMISSION_GROUPS.MORE_INFO},

  VIEW_USER_CASUAL:{name: 'view user casual', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CASUAL_INFORMATION},
  ADD_USER_CASUAL:{name: 'add user casual', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CASUAL_INFORMATION},
  EDIT_USER_CASUAL:{name: 'edit user casual', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CASUAL_INFORMATION},
  DELETE_USER_CASUAL:{name: 'delete user casual', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CASUAL_INFORMATION},

  ASSIGN_USER: {name: 'assign user to project', guard_name: 'api', description: 'assign user to project', group: PERMISSION_GROUPS.PROJECTS},

  UPLOAD_AVATAR: {name: 'upload avatar', guard_name: 'api', description: '', group: PERMISSION_GROUPS.AVATAR},
  UPLOAD_SELF_AVATAR: {name: 'upload self avatar', guard_name: 'api', description: '', group: PERMISSION_GROUPS.AVATAR},

  VIEW_SELF_WEEKLY_ACTIVITY: {name: 'view self weekly activity', guard_name: 'api', description: '', group: PERMISSION_GROUPS.WEEKLY_ACTIVITY},

  VIEW_OTHERS_FULL_CALENDAR: {name: 'view others full calendar', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CALENDAR},
  VIEW_OTHERS_GOOGLE_CALENDAR_CONNECTION: {name: 'view others google calendar connection', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CALENDAR},
  VIEW_OTHERS_GOOGLE_AUTH_URL: {name: 'view others google auth url', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CALENDAR},
  ADD_OTHERS_GOOGLE_CALENDAR_TOKEN: {name: 'add others google calendar token', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CALENDAR},
  REMOVE_OTHERS_GOOGLE_CALENDAR_TOKEN: {name: 'remove others google calendar token', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CALENDAR},
  ADD_GOOGLE_CALENDAR_EVENTS: {name: 'add google calendar events', guard_name: 'api', description: '', group: PERMISSION_GROUPS.CALENDAR},

  // now only administrator can do this
  VIEW_ROLES_PERMISSIONS: {name: 'view roles permissions', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ROLES_PERMISSIONS},
  ADD_ROLES_PERMISSIONS: {name: 'add roles permissions', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ROLES_PERMISSIONS},
  EDIT_ROLES_PERMISSIONS: {name: 'edit roles permissions', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ROLES_PERMISSIONS},
  DELETE_ROLES_PERMISSIONS: {name: 'delete roles permissions', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ROLES_PERMISSIONS},
  ADD_PERMISSION_TO_ROLE: {name: 'add permission to role', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ROLES_PERMISSIONS},
  REMOVE_PERMISSION_FROM_ROLE: {name: 'remove permission from role', guard_name: 'api', description: '', group: PERMISSION_GROUPS.ROLES_PERMISSIONS},
};

export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/png',
    'image/jpg',
    'image/jpeg'
];
export const TIME_UNITS = {
  START_SECONDS_TIME: 0,
  END_HOUR_TIME: 24,
  END_MINUTE_TIME: 60
}

export const CONTACT_TYPES = {
  email: {
    workedEmail: {
      type: "email",
      name: "workEmail"
    },
    personalEmail: {
      type: "personalEmail",
      name: "personalEmail"
    },
    workEmail: {
      type: 'workEmail',
      name: 'workEmail'
    }
  },
  phone: {
    phoneNumber: {
      type: "mobile",
      name: "phoneNumber"
    },
    homeNumber: {
      type: "homeMobile",
      name: "homeNumber"
    },
    workedNumber: {
      type: "mobile",
      name: "workedNumber"
    },
    personalNumber: {
      type: "personalMobile",
      name: "personalNumber"
    },
    otherPhoneNumber: {
      type: "otherMobile",
      name: "otherPhoneNumber"
    },
    extraNumber: {
      type: "extraMobile",
      name: "extraNumber"
    }
  },
  website: {
    type: "webSite",
  },
  address: {
    type: "address",
    names: {
      city: "city",
      country: "country",
      address1: "address1",
      address2: "address2",
      zipCode: "zipCode",
    }
  },
  social: {
    type: "social",
    names: {
      Web: "web",
      Facebook: "facebook",
      Instagram: "instagram",
      Linkedin: "linkedin",
      Skype: "skype",
      Twitter: "twitter",
    }
  },
  extraName:{
    type: "extraNameType",
    name: "extraName",
  },
}

export const CONTACT_TYPES_AND_LABELS = {
  email: ['Primary Email', 'Work Email'],
  phone: ['Mobile Number', 'Home Number'],
  social: ['Web', 'Facebook', 'Linkedin', 'Gitlab', 'Skype'],
};

export const Countries = [
  {
    "name" : "Armenia",
    "code": "AM"
  },
  {
    "name" : "France",
    "code": "FR"
  }
];
export const LANGUAGES_PROFICIENCY = {
  ELEMENTARY:{value:0,name: 'Elementary'},
  LIMITED:{value:1,name:'Limited Working'},
  PROFESSIONAL_WORKING:{value:2, name: 'Professional Working'},
  FULL_PROFESSIONAL:{value: 3, name: 'Full Professional'},
  NATIVE: {value:4, name: 'Native / Bilingual'}

}
export const NOTES = {
  PRIVATE: {text: 'Private', value: 0, color: '#f70505', icon: 'private'},
  SHARED: {text:'Shared', value: 1, color: '#0d5403', icon: 'shared'},
};
export const LANGUAGES_LIST = [
  "Abkhazian",
  "Afar",
  "Afrikaans",
  "Akan",
  "Albanian",
  "Amharic",
  "Arabic",
  "Aragonese",
  "Armenian",
  "Assamese",
  "Avaric",
  "Avestan",
  "Aymara",
  "Azerbaijani",
  "Bambara",
  "Bashkir",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bihari languages",
  "Bislama",
  "Bokml, Norwegian; Norwegian Bokml",
  "Bosnian",
  "Breton",
  "Bulgarian",
  "Burmese",
  "Catalan; Valencian",
  "Central Khmer",
  "Chamorro",
  "Chechen",
  "Chichewa; Chewa; Nyanja",
  "Chinese",
  "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
  "Chuvash",
  "Cornish",
  "Corsican",
  "Cree",
  "Croatian",
  "Czech",
  "Danish",
  "Divehi; Dhivehi; Maldivian",
  "Dutch; Flemish",
  "Dzongkha",
  "English",
  "Esperanto",
  "Estonian",
  "Ewe",
  "Faroese",
  "Fijian",
  "Finnish",
  "French",
  "Fulah",
  "Gaelic; Scottish Gaelic",
  "Galician",
  "Ganda",
  "Georgian",
  "German",
  "Greek, Modern",
  "Guarani",
  "Gujarati",
  "Haitian; Haitian Creole",
  "Hausa",
  "Hebrew",
  "Herero",
  "Hindi",
  "Hiri Motu",
  "Hungarian",
  "Icelandic",
  "Ido",
  "Igbo",
  "Indonesian",
  "Interlingua (International Auxiliary Language Association)",
  "Interlingue; Occidental",
  "Inuktitut",
  "Inupiaq",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kalaallisut; Greenlandic",
  "Kannada",
  "Kanuri",
  "Kashmiri",
  "Kazakh",
  "Kikuyu; Gikuyu",
  "Kinyarwanda",
  "Kirghiz; Kyrgyz",
  "Komi",
  "Kongo",
  "Korean",
  "Kuanyama; Kwanyama",
  "Kurdish",
  "Lao",
  "Latin",
  "Latvian",
  "Limburgan; Limburger; Limburgish",
  "Lingala",
  "Lithuanian",
  "Luba-Katanga",
  "Luxembourgish; Letzeburgesch",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Manx",
  "Maori",
  "Marathi",
  "Marshallese",
  "Mongolian",
  "Nauru",
  "Navajo; Navaho",
  "Ndebele, North; North Ndebele",
  "Ndebele, South; South Ndebele",
  "Ndonga",
  "Nepali",
  "Northern Sami",
  "Norwegian",
  "Norwegian Nynorsk; Nynorsk, Norwegian",
  "Occitan",
  "Ojibwa",
  "Oriya",
  "Oromo",
  "Ossetian; Ossetic",
  "Pali",
  "Panjabi; Punjabi",
  "Persian",
  "Polish",
  "Portuguese",
  "Pushto; Pashto",
  "Quechua",
  "Romanian; Moldavian; Moldovan",
  "Romansh",
  "Rundi",
  "Russian",
  "Samoan",
  "Sango",
  "Sanskrit",
  "Sardinian",
  "Serbian",
  "Shona",
  "Sichuan Yi; Nuosu",
  "Sindhi",
  "Sinhala; Sinhalese",
  "Slovak",
  "Slovenian",
  "Somali",
  "Sotho, Southern",
  "Spanish; Castilian",
  "Sundanese",
  "Swahili",
  "Swati",
  "Swedish",
  "Tagalog",
  "Tahitian",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Tibetan",
  "Tigrinya",
  "Tonga (Tonga Islands)",
  "Tsonga",
  "Tswana",
  "Turkish",
  "Turkmen",
  "Twi",
  "Uighur; Uyghur",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Venda",
  "Vietnamese",
  "Volapk",
  "Walloon",
  "Welsh",
  "Western Frisian",
  "Wolof",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zhuang; Chuang",
  "Zulu"
];

export const POLICIES = [
  {
    heading: '1. Information We Collect',
    list: [
      {
        heading: '1.1. Information Collected Automatically',
        text: 'When you visit our website, the log data ( IP address, geolocation, language of use, data usage, browser type, operating system version, network type, GPS, number and duration of visits) will be automatically collected from your browser.'
      },
      {
        heading: '1.2. Information You Provide',
        text: 'We also collect the information you directly provide to us while using our website. This includes your full name, email address, phone number and any other document you may attach throughout your activity on our website. You provide us with this information through applying to our openings and “Contact Us” section.'
      }
    ]
  },
  {
    heading: '2. Cookie Policy',
    text: 'We use cookies, small pieces of data that record user’s activity on the website, which are used to optimize the user experience on the website. You are warned about cookies once you have accessed our website.'
  },
  {
    heading: '3. How We May Use Your Information',
    text: 'Please read point by point how we may use your personal information:',
    list: [
      {
        heading: '3.1. Notify about updates on our website and services, special offers'
      },
      {
        heading: '3.2. Understand and analyze your activity on our website'
      },
      {
        heading: '3.3. Improve our website and services'
      },
      {
        heading: '3.4. Provide technical and services support'
      },
      {
        heading: '3.5 Verify the identification of our users'
      }
    ]
  },
  {
    heading: '4. Confidentiality of Your Information',
    text: 'We ensure the confidentiality of sensitive information through various confidentiality systems. Please also note that your personal data is collected only after your consent to the Privacy Policy and will be used only within the criteria set in point 3.'
  },
  {
    heading: '5. Children\'s Information Confidentiality',
    text: 'Our services are not meant for the use of children under the age of 13. Thus, parents are highly encouraged to contact us at info@esterox.am if their children are providing personal information on any of the websites controlled by Worky-Reppy.'
  },
  {
    heading: '6. Disclosure of your personal information',
    text: 'We will not disclose any personal information outside the website administration and the business staff unless the disclosure is required by the law.'
  },
  {
    heading: '7. Third-party sites and services',
    text: 'Our websites and services contain links to other third-party services and websites, which are regulated by their Privacy Policies and we do not take the responsibility for any personal information disclosed by them. Thus, we strongly recommend you to review privacy policies of third-party services.'
  },
  {
    heading: '8. Your Data Protection Rights',
    text: '*Please note that you are reminded about Privacy Policy  before accessing the website and the Privacy Policy applies only after your consent (see 4).',
    list: [
      {
        heading: '8.1. Add, change or delete any personal information'
      },
      {
        heading: '8.2. Object to the  processing of your personal information'
      },
      {
        heading: '8.3. Request for Data Portability'
      }
    ]
  }
];

export const DEGREES = {
  ASSOCIATE_DEGREE: {value: 0, name: 'Associate degree'},
  BACHELOR_DEGREE: {value: 1, name: 'Bachelor\'s degree'},
  MASTERS_DEGREE: {value: 2, name: 'Master\'s degree'},
  DOCTORAL_DEGREE: {value: 3, name: 'Doctoral degree'},
}
export const FILE_LIMITS = {
  IMG_MAX_SIZE: 10048576
};

export const USER_DYNAMIC_COMPONENTS = {
    PERSONAL_INFO: 'personal_info',
    JOB_INFO: 'job_info',
    REMUNERATION: 'remuneration',
    CONTACT_INFO: 'contact_info',
    FILE: 'file',
    EDU: 'edu',
    PERMISSION: 'permission',
    NOTES: 'notes',
    MORE: 'more',
    CASUAL_INFO: 'casual_info',
    CALENDAR: 'calendar',
};

export const USER_WORK_HISTORY_TYPES = [
  {class: 'not_working', name: 'Not Working', value: 'not_working', key: 'not_working_type'},
  {class: 'additional', name:'Additional', value: 'additional', key: 'additional_type'}
];

export const VACATION_TYPES = [
  {name: 'Basic Vacation', key: 'basic_vacation_type', value: 'basic_vacation'},
  {name: 'Other Vacation', key: 'other_vacation_type', value: 'other_vacation'},
];

export const VACATION_STATUSES = [
  {name: 'Approved', key: 'approved_status', value: 'approved'},
  {name: 'Not Approved', key: 'not_approved_status', value: 'not_approved'},
];

export const CALENDAR_GOOGLE_COLOR = '#EBB877';
export const CALENDAR_TASKS_COLOR = '#FE8D00';
export const CALENDAR_TODOS_COLOR = '#00115B';
export const CALENDAR_PROJECT_COLOR = '#31B3B5';
export const CALENDAR_TAGS_COLOR = '#2A6380';

export const ROLE_TYPES = ['company', 'team', 'project'];

export const SYSTEM_CURRENCIES = ['USD', 'EUR', 'AMD', 'RUB'];
export const DEFAULT_CURRENCY = 'USD';

export const CURRENCY_SYMBOLS = {
  'USD': '$', // US Dollar
  'EUR': '€', // Euro
  'GBP': '£', // British Pound Sterling
  'RUB': '₽', // Russian
  'AMD': '֏', // Armenian
};
