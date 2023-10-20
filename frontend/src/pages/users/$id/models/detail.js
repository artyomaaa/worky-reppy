import {pathMatchRegexp} from 'utils';
import api from 'api';
import store from "store";
import moment from 'utils/moment';
import {DATE_FORMAT, USER_DYNAMIC_COMPONENTS} from 'utils/constant';
import {message} from "antd";

const {
  queryUserDetailsHeaderInfo,
  queryUserPersonalInformation,
  queryUserEducationInformation,
  queryUserNotesInformation,
  queryUserJobInformation,
  queryUserRemuneration,
  queryUserFiles,
  queryMoreInfo,
  queryRoles,
  queryUserSkills,
  queryUserSoftSkills,
  queryTeamIds,
  querySelectedDayNote,
  querySelectedMonthNotes,
  updateUserPersonalInformation,
  updateJobInformation,
  removeJobInformation,
  queryUserPositions,
  removeEducation,
  updateOrCreateNotesInformation,
  queryForNoteActiveUsers,
  removeNote,
  removeDocument,
  updateFiles,
  queryUserContactInformation,
  addSocialNetwork,
  addWebSite,
  updateUserContactInformation,
  deleteItemContactInfo,
  updateRemuneration,
  deleteUserBonus,
  deleteUserSalary,
  createVacation,
  updateVacation,
  removeVacation,
  createWorkHistory,
  createOrUpdateUniversityInformation,
  createOrUpdateCollegeInformation,
  createOrUpdateSchoolInformation,
  updateLanguageInformation,
  createOrUpdateMilitaryInformation,
  uploadAvatar,
  getCasualInformation,
  createOrUpdateCasualInformation,
  removeCasualInformation,
  updateUserEmail,
  updateEmailResend,
  checkGoogleCalendarConnection,
} = api;

export default {
  namespace: 'userDetail',

  state: {
    data: {},
    modalVisible: false,
    modalType: 'create',
    currentItem: {},
    isSubmittedLoading: false,
    isLoading: false,
    headerData: {},
    [USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]: {},
    [USER_DYNAMIC_COMPONENTS.JOB_INFO]: {},
    [USER_DYNAMIC_COMPONENTS.REMUNERATION]: {},
    [USER_DYNAMIC_COMPONENTS.FILE]: {},
    [USER_DYNAMIC_COMPONENTS.EDU]: {},
    [USER_DYNAMIC_COMPONENTS.CONTACT_INFO]: {},
    [USER_DYNAMIC_COMPONENTS.NOTES]: {},
    [USER_DYNAMIC_COMPONENTS.MORE]: {},
    [USER_DYNAMIC_COMPONENTS.CASUAL_INFO]: {},
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/users/:id', location.pathname);
        if (match) {
          dispatch({ type: 'query', payload: { id: match[1], ...location.query } })
        }
      })
    },
  },

  effects: {
    * query({payload}, {call, put, select}) {
      const {tab, id} = payload;
      const thisState = yield select(({userDetail}) => userDetail);
      let userRoles = {};
      let userSkills = {};
      let userSoftSkills = {};
      let userPositions = {};
      let noteUsers = {};

      let personalInfo = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.PERSONAL_INFO] : {};
      let jobInfo = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.JOB_INFO]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.JOB_INFO]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.JOB_INFO] : {};
      let remuneration = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.REMUNERATION]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.REMUNERATION]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.REMUNERATION] : {};
      let eduInfo = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.EDU]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.EDU]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.EDU] : {};
      let file = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.FILE]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.FILE]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.FILE] : {};
      let contactInfo = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.CONTACT_INFO]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.CONTACT_INFO]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.CONTACT_INFO]
        : {};
      let notesInfo = (Object.keys(thisState[USER_DYNAMIC_COMPONENTS.NOTES]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.NOTES]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.NOTES]
        : {};
      let moreInfo = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.MORE]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.MORE]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.MORE]
        : {};
      let casualInfo = (
        Object.keys(thisState[USER_DYNAMIC_COMPONENTS.CASUAL_INFO]).length > 0 &&
        parseInt(thisState[USER_DYNAMIC_COMPONENTS.CASUAL_INFO]?.id) === parseInt(id))
        ? thisState[USER_DYNAMIC_COMPONENTS.CASUAL_INFO]
        : {};

      yield put({
        type: 'querySuccess',
        payload: {
          isLoading: true,
        },
      });

      const teamIds = yield call(queryTeamIds, {});
      const headerData = yield call(queryUserDetailsHeaderInfo, {id});

      switch (tab) {
        case USER_DYNAMIC_COMPONENTS.PERSONAL_INFO:
          if (Object.keys(personalInfo).length === 0) {
            personalInfo = yield call(queryUserPersonalInformation, payload);
            if (Object.keys(personalInfo).length > 0) {
              const {statusCode} = personalInfo;

              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    [USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]: (personalInfo && personalInfo?.data) ? personalInfo?.data : {}
                  },
                })
              } else {
                throw personalInfo
              }
            } else {
              yield put({
                type: 'querySuccess',
                payload: {},
              })
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.JOB_INFO:
          if (Object.keys(jobInfo).length === 0) {
            jobInfo = yield call(queryUserJobInformation, payload);
            if (Object.keys(jobInfo).length > 0) {
              userRoles = yield call(queryRoles, {});
              userSkills = yield call(queryUserSkills, {});
              userSoftSkills = yield call(queryUserSoftSkills, {});
              userPositions = yield call(queryUserPositions, {});
              eduInfo = yield call(queryUserEducationInformation, payload);

              const {statusCode} = jobInfo;

              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    allRoles: userRoles.success ? userRoles.roles : [],
                    allSkills: userSkills.success ? userSkills.skills : [],
                    allSoftSkills: userSoftSkills.success ? userSoftSkills.softSkills : [],
                    allPositions: userPositions.status ? userPositions.positions : [],
                    [USER_DYNAMIC_COMPONENTS.JOB_INFO]: (jobInfo && jobInfo?.data) ? jobInfo?.data : {},
                    [USER_DYNAMIC_COMPONENTS.EDU]: (eduInfo && eduInfo?.data) ? eduInfo?.data : {}
              },
                })
              } else {
                throw jobInfo
              }
            } else {
              yield put({
                type: 'querySuccess',
                payload: {},
              })
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.REMUNERATION:
          if (Object.keys(remuneration).length === 0) {
            remuneration = yield call(queryUserRemuneration, payload);
            if (Object.keys(remuneration).length > 0) {
              const {statusCode} = remuneration;

              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    [USER_DYNAMIC_COMPONENTS.REMUNERATION]: (remuneration && remuneration?.data) ? remuneration?.data : {}
                  },
                })
              } else {
                throw remuneration
              }
            } else {
              yield put({
                type: 'querySuccess',
                payload: {},
              })
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.EDU:
          if (Object.keys(eduInfo).length === 0) {
            eduInfo = yield call(queryUserEducationInformation, payload);
            if (Object.keys(eduInfo).length > 0) {
              const {statusCode} = eduInfo;
              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    [USER_DYNAMIC_COMPONENTS.EDU]: (eduInfo && eduInfo?.data) ? eduInfo?.data : {}
                  },
                })
              } else {
                throw eduInfo
              }
            } else {
              yield put({
                type: 'querySuccess',
                payload: {},
              })
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.NOTES:
          if (Object.keys(notesInfo).length === 0) {
            notesInfo = yield call(queryUserNotesInformation, payload);
            noteUsers = yield call(queryForNoteActiveUsers, {});
            // console.log(+window.location.pathname.split('').pop());
            const user = store.get('user');
            const checkGoogleCalendar = yield call(checkGoogleCalendarConnection, {id: user?.id});
            // todo: problem with id if you enter to other user page

            if (Object.keys(notesInfo).length > 0) {
              const {statusCode} = notesInfo;
              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    users: noteUsers ? noteUsers : [],
                    googleCalendarConnected: checkGoogleCalendar.success ? checkGoogleCalendar.googleCalendarConnected : false,
                    [USER_DYNAMIC_COMPONENTS.NOTES]: notesInfo?.data ? notesInfo.data : {},
                  },
                })
              } else {
                throw notesInfo
              }
            } else {
              yield put({
                type: 'querySuccess',
                payload: {},
              })
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.CONTACT_INFO:
          if (Object.keys(contactInfo).length === 0) {
            contactInfo = yield call(queryUserContactInformation, payload);
            if (Object.keys(contactInfo).length > 0) {
              const {statusCode} = contactInfo;
              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    [USER_DYNAMIC_COMPONENTS.CONTACT_INFO]: (contactInfo && contactInfo?.data) ? contactInfo?.data : {}
                  },
                })
              } else {
                throw contactInfo
              }
            } else {
              yield put({
                type: 'querySuccess',
                payload: {},
              })
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.FILE:
          if (Object.keys(file).length === 0) {
            file = yield call(queryUserFiles, payload);
            if (Object.keys(file).length > 0) {
              const {statusCode} = file;

              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    [USER_DYNAMIC_COMPONENTS.FILE]: (file && file?.data) ? file?.data : {}
                  },
                })
              } else {
                throw file
              }
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.MORE:
          if (Object.keys(moreInfo).length === 0) {
            moreInfo = yield call(queryMoreInfo, payload);
            if (Object.keys(moreInfo).length > 0) {
              const {statusCode} = moreInfo;

              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    [USER_DYNAMIC_COMPONENTS.MORE]: (moreInfo && moreInfo?.data) ? moreInfo?.data : {},
                  },
                })
              } else {
                throw moreInfo
              }
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.CASUAL_INFO:
          if (Object.keys(casualInfo).length === 0) {
            casualInfo = yield call(getCasualInformation, payload);
            if (Object.keys(casualInfo).length > 0) {
              const {statusCode} = casualInfo;

              if (statusCode === 200) {
                yield put({
                  type: 'querySuccess',
                  payload: {
                    [USER_DYNAMIC_COMPONENTS.CASUAL_INFO]: (casualInfo && casualInfo?.data) ? casualInfo?.data : {},
                  },
                })
              } else {
                throw casualInfo
              }
            }
          }
          break;
        default:
          if (tab === undefined) {
            if (Object.keys(personalInfo).length === 0) {
              personalInfo = yield call(queryUserPersonalInformation, payload);
              if (Object.keys(personalInfo).length > 0) {
                const {statusCode} = personalInfo;

                if (statusCode === 200) {
                  yield put({
                    type: 'querySuccess',
                    payload: {
                      [USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]: (personalInfo && personalInfo?.data) ? personalInfo?.data : {}
                    },
                  })
                } else {
                  throw personalInfo
                }
              } else {
                yield put({
                  type: 'querySuccess',
                  payload: {},
                })
              }
            }
          }
      }

      yield put({
        type: 'querySuccess',
        payload: {
          isLoading: false,
          headerData: headerData.data ? headerData.data : null,
          teamIds: teamIds.success ? teamIds.teamIds : []
        }
      });
    },
    * querySelectedDayNote({payload}, {call, put, select}) {
      const thisState = yield select(({userDetail}) => userDetail);
      const dayNote = yield call(querySelectedDayNote, payload);

      if (dayNote.success) {
        let moreCopy = {
          ...thisState[USER_DYNAMIC_COMPONENTS.MORE],
          dayNote: dayNote.data,
          workedDaysAnalysis: dayNote.workedDaysAnalysis
        };

        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.MORE]: moreCopy
          },
        });
      } else {
        throw dayNote;
      }
    },
    * querySelectedMonthNotes({payload}, {call, put, select}) {
      const thisState = yield select(({userDetail}) => userDetail);
      const monthNotes = yield call(querySelectedMonthNotes, payload);

      if (monthNotes.success) {
        let moreCopy = {
          ...thisState[USER_DYNAMIC_COMPONENTS.MORE],
          selectedMonthNotes: monthNotes.data,
          workedDaysAnalysis: monthNotes.workedDaysAnalysis
        };

        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.MORE]: moreCopy
          },
        });
      } else {
        throw monthNotes;
      }
    },

    * emptyJobData({payload, config}, {call, put, select}) {
      yield put({
        type: 'querySuccess',
        payload: {
          [USER_DYNAMIC_COMPONENTS.JOB_INFO]: {}
        },
      });
    },

    * emptyNoteData({payload, config}, {call, put, select}) {
      yield put({
        type: 'querySuccess',
        payload: {
          [USER_DYNAMIC_COMPONENTS.NOTES]: {}
        },
      });
    },

    * update({payload, config}, {call, put, select}) {
      let editUser;
      let apiLink;
      const {tab, id, user_id} = payload;
      yield put({
        type: 'querySuccess',
        payload: {
          isSubmittedLoading: true,
        },
      });

      switch (tab) {
        case USER_DYNAMIC_COMPONENTS.PERSONAL_INFO:
          editUser = yield call(updateUserPersonalInformation, payload);
          if (editUser.success) {
            yield put({
              type: 'querySuccess',
              payload: {
                [USER_DYNAMIC_COMPONENTS.PERSONAL_INFO]: editUser?.data ? editUser?.data : {}
              },
            });
          }
          break;
        case USER_DYNAMIC_COMPONENTS.REMUNERATION:
          editUser = yield call(updateRemuneration, payload);
          if (editUser.success) {
            yield put({
              type: 'querySuccess',
              payload: {
                [USER_DYNAMIC_COMPONENTS.REMUNERATION]: editUser?.data ? editUser?.data : {}
              },
            });
          }
          break;
        case USER_DYNAMIC_COMPONENTS.JOB_INFO:
          if (payload.jobs) {
            payload.jobs = payload.jobs.map(job => {

              if (job.experimental_period_start_date) {
                job.experimental_period_start_date = job.experimental_period_start_date.format(DATE_FORMAT);
              }

              if (job.experimental_period_end_date) {
                job.experimental_period_end_date = job.experimental_period_end_date.format(DATE_FORMAT);
              }

              if (job.interview) {
                job.interview = job.interview.format(DATE_FORMAT);
              }

              if (job.work_contract) {
                job.work_contract = job.work_contract.format(DATE_FORMAT);
              }

              if (job.work_contract_start_date) {
                job.work_contract_start_date = job.work_contract_start_date.format(DATE_FORMAT);
              }

              if (job.work_contract_end_date) {
                job.work_contract_end_date = job.work_contract_end_date.format(DATE_FORMAT);
              }
              return job;
            })
          }

          editUser = yield call(updateJobInformation, payload);

          if (editUser.success) {
            yield put({
              type: 'querySuccess',
              payload: {
                [USER_DYNAMIC_COMPONENTS.JOB_INFO]: editUser?.data ? editUser?.data : {}
              },
            });
          }
          break;
        case USER_DYNAMIC_COMPONENTS.CONTACT_INFO:
          if (payload.actionName === "SocialNetwork") {
            apiLink = addSocialNetwork;
          } else if (payload.actionName === "WebSite") {
            apiLink = addWebSite;
          } else if (payload.actionName === "timeAndEmail") {
            apiLink = updateUserContactInformation;
          } else if (payload.actionName === "deleteItem") {
            apiLink = deleteItemContactInfo;
          }
          editUser = yield call(apiLink, payload);
          if (editUser.success) {
            yield put({
              type: 'querySuccess',
              payload: {
                [USER_DYNAMIC_COMPONENTS.CONTACT_INFO]: editUser?.data ? editUser?.data : {}
              },
            });
          }
          break;
        case USER_DYNAMIC_COMPONENTS.EDU:
          const {type} = payload;
          let action = null;
          if (type === 'university') {
            action = createOrUpdateUniversityInformation;
          } else  if (type === 'college') {
            action = createOrUpdateCollegeInformation;
          } else if (type === 'school') {
            action = createOrUpdateSchoolInformation;
          } else if (type === 'language') {
            action = updateLanguageInformation;
          } else if (type === 'military') {
            action = createOrUpdateMilitaryInformation;
          }

          if (action) {
            editUser = yield call(action, payload);
            if (editUser.success) {
              yield put({
                type: 'querySuccess',
                payload: {
                  [USER_DYNAMIC_COMPONENTS.EDU]: editUser?.data ? editUser?.data : {}
                },
              });
            }
          }
          break;
        case USER_DYNAMIC_COMPONENTS.NOTES:
          editUser = yield call(updateOrCreateNotesInformation, payload);
          if (editUser.success) {
            yield put({
              type: 'querySuccess',
              payload: {
                [USER_DYNAMIC_COMPONENTS.NOTES]: editUser?.data ? editUser?.data : {}
              },
            });
          }
          break;
        case USER_DYNAMIC_COMPONENTS.FILE:
          const formData = new FormData();
          formData.append('document', payload.file);
          formData.append('type', payload.type);
          formData.append('size', payload.size);
          formData.append('name', payload.name);
          formData.append('file_type', payload.file_type);
          formData.append('user_id', payload.id);
          try {
            editUser = yield call(updateFiles, formData, config);
            if (editUser.success) {
              yield put({
                type: 'querySuccess',
                payload: {
                  [USER_DYNAMIC_COMPONENTS.FILE]: editUser?.data ? editUser?.data : {}
                },
              });
            }
          } catch (e) {
            return e;
          }
          break;
        case USER_DYNAMIC_COMPONENTS.CASUAL_INFO:
          editUser = yield call(createOrUpdateCasualInformation, payload);
          if (editUser.success) {
            yield put({
              type: 'querySuccess',
              payload: {
                [USER_DYNAMIC_COMPONENTS.CASUAL_INFO]: editUser?.data ? editUser?.data : {}
              },
            });
          }
          break;
        default:
          console.log("default")
      }

      yield put({
        type: 'querySuccess',
        payload: {
          isSubmittedLoading: false,
        },
      });

      if (!editUser.success) {
        if (tab === USER_DYNAMIC_COMPONENTS.FILE) return editUser
        throw editUser
      } else {
        const headerData = yield call(queryUserDetailsHeaderInfo, {id: user_id ?? id});
        yield put({
          type: 'querySuccess',
          payload: {
            headerData: headerData?.data ? headerData?.data : {}
          },
        });

        if (editUser.data.id === store.get('user').id) {
          const updatedUser = {...editUser.data}
          store.set('user', updatedUser);
        }
        return editUser;
      }
    },
    * saveVacation({payload, action}, {call, put, select}) {
      if (payload.start_date) {
        payload.start_date = moment(payload.start_date).format(DATE_FORMAT);
      }
      if (payload.end_date) {
        payload.end_date = moment(payload.end_date).format(DATE_FORMAT);
      }
      const thisState = yield select(({userDetail}) => userDetail);
      let moreCopy = {};
      let queryFunction = '';
      if (action === 'edit') {
        queryFunction = updateVacation;
      } else if (action === 'create') {
        queryFunction = createVacation;
      }

      const vacations = yield call(queryFunction, payload);

      if (vacations.success) {
        moreCopy = {...thisState[USER_DYNAMIC_COMPONENTS.MORE], vacations: vacations.data};
      } else {
        throw vacations;
      }

      if (Object.keys(moreCopy).length > 0) {
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.MORE]: moreCopy
          },
        })
      }
    },
    * uploadAvatar({payload}, {call, put, select}) {
      const formData = new FormData();
      formData.append('avatar', payload.avatar);
      formData.append('id', payload.id);
      const updateAvatar = yield call(uploadAvatar, formData)
      if (updateAvatar.data !== null) {
        const user = store.get('user');
        user.avatar = updateAvatar.data;
        store.set('user', user);
      }
      return updateAvatar
    },
    * createNote({payload}, {call, put, select}) {
      let moreCopy = {};
      const thisState = yield select(({userDetail}) => userDetail);
      const workHistory = yield call(createWorkHistory, payload);

      if (workHistory.success) {
        moreCopy = {
          ...thisState[USER_DYNAMIC_COMPONENTS.MORE],
          dayNote: workHistory.data,
          workedDaysAnalysis: workHistory.workedDaysAnalysis
        };
      } else {
        throw workHistory;
      }

      if (Object.keys(moreCopy).length > 0) {
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.MORE]: moreCopy
          },
        })
      }
    },
    * delete({payload}, {call, put}) {
      const data = yield call(removeEducation, {edu_id: payload.edu_id, user_id: payload.user_id, type: payload.type});
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.EDU]: (data && data?.data) ? data?.data : {}
          },
        })
      } else {
        yield put({
          type: 'querySuccess',
          payload: {},
        })
      }
    },
    * deleteUserBonusAndOtherSpends({payload}, {call, put}) {
      const data = yield call(deleteUserBonus, {id: payload.id, user_id: payload.user_id, type: payload.type});
      if (data.success) {
        message.success(data.message);
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.REMUNERATION]: (data && data?.data) ? data?.data : {},
          },
        })
      } else {
        yield put({
          type: 'querySuccess',
          payload: {},
        })
      }
    },
    * deleteUserSalary({payload}, {call, put}) {
      const data = yield call(deleteUserSalary, {id: payload.id, user_id: payload.user_id, type: payload.type});
      if (data.success) {
        message.success(data.message);
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.REMUNERATION]: (data && data?.data) ? data?.data : {}
          },
        })
      } else {
        yield put({
          type: 'querySuccess',
          payload: {},
        })
      }
    },

    * deleteDocument({payload}, {call, put}) {
      const data = yield call(removeDocument, payload);
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.FILE]: (data && data?.data) ? data?.data : {}
          },
        })
      } else {
        yield put({
          type: 'querySuccess',
          payload: {},
        })
      }
    },
    * deleteNote({payload}, {call, put}) {
      const data = yield call(removeNote, {
        note_id: payload.note_id,
        id: payload.user_id,
        type: payload.type,
        uuid: payload.uuid,
        google_event_id: payload.google_event_id
      });
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.NOTES]: (data && data?.data) ? data?.data : {}
          },
        })
      } else {
        throw data;
      }
      return data;
    },
    * deleteVacation({payload}, {call, put, select}) {
      const thisState = yield select(({userDetail}) => userDetail);
      const data = yield call(removeVacation, payload);
      let moreCopy = {};

      if (data.success) {
        moreCopy = {...thisState[USER_DYNAMIC_COMPONENTS.MORE], vacations: data.data};
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.MORE]: moreCopy
          },
        })
      } else {
        throw data;
      }
    },
    * deleteCasual({payload}, {call, put}) {
      const data = yield call(removeCasualInformation,  payload);
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.CASUAL_INFO]: (data && data?.data) ? data?.data : {}
          },
        })
      } else {
        yield put({
          type: 'querySuccess',
          payload: {},
        })
      }
    },
    * removeJobInformation({payload}, {call, put, select}) {
      const thisState = yield select(({userDetail}) => userDetail);
      const data = yield call(removeJobInformation,  payload);
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            [USER_DYNAMIC_COMPONENTS.JOB_INFO]: {
              ...thisState[USER_DYNAMIC_COMPONENTS.JOB_INFO],
              user_job_information: thisState[USER_DYNAMIC_COMPONENTS.JOB_INFO].user_job_information.filter(item => item.id !== payload.id)
            }
          },
        })
      } else {
        yield put({
          type: 'querySuccess',
          payload: {},
        })
      }
    },
    * updateUserEmail({payload}, {call, put, select}) {
      const data = yield call(updateUserEmail,  payload);
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            data: (data && data?.data) ? data?.data : {}
          },
        })
      }
    },
    * updateEmailVerifyResend({payload}, {call}) {
      const data = yield call(updateEmailResend,  payload);
      if (!data?.status) {
        throw data;
      }
    },
  },

  reducers: {
    querySuccess(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
  },
}
