import React, {PureComponent} from 'react';
import reactCSS from 'reactcss';
import PropTypes from 'prop-types';
import {
  Popconfirm,
  Input,
  Select,
  Modal,
  DatePicker,
  ConfigProvider,
  AutoComplete,
  Button,
  List,
  message,
  Row,
  Col,
  Avatar, Divider
} from 'antd';
import {Form} from '@ant-design/compatible';
import {withI18n} from '@lingui/react';
import {STATUSES, PROJECT_TYPES, CURRENCY_SYMBOLS, DEFAULT_CURRENCY, SYSTEM_CURRENCIES, PERMISSIONS} from 'utils/constant';
import Icons from 'icons/icon';
import moment from 'utils/moment';
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
import {Icon} from "@ant-design/compatible";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import globalStyles from 'themes/global.less';
import ProjectColor from './projectColor';
import modalStyles from "./modal.less";
import {getResizedImage, getUserFullName, checkLoggedUserPermission} from 'utils';
import {appUrl} from 'utils/config';
import {UserOutlined} from "@ant-design/icons";

const canAssignUserToProject = checkLoggedUserPermission(PERMISSIONS.ASSIGN_USER.name, PERMISSIONS.ASSIGN_USER.guard_name);

const FormItem = Form.Item;

const defaultUserProject = {
  userId: null,
  startDate: moment(),
  endDate: null,
  rate: null,
  rateCurrency: 'USD',
  userProjectId: null,
};

@withI18n()
@Form.create()
class ProjectModal extends PureComponent {
  state = {
    currency: 'ARMENIA::AMD',
    projectPriceCurrency: DEFAULT_CURRENCY,
    removedUserProjectIds: [],
    projectMemberHistory: [],
    searchUserList: [],
    usersDataSource: [],
    selectedUsersList: [],
    selectedProjectMember: null,
    roles: [],
    errorMessages: {},
    showAddEditUserSection: false,
    showProjectUsersDropdown: false,
    userProject: defaultUserProject,
    showProjectPriceSection: false,
    isInactiveMembers: false,
  };
  #dateFormat = 'DD/MM/YYYY';

  componentDidUpdate(oldProps) {
    if (oldProps?.users !== this.props?.users) {
      this.setState({
        usersDataSource: this.props?.users || [],
        searchUserList: this.props?.users.filter(({status}) => status) || [],
      });
    }
    if (oldProps?.item?.price_currency !== this.props?.item?.price_currency
      && this.state.projectPriceCurrency !== this.props?.item?.price_currency) {
      this.setState({
        projectPriceCurrency: this.props?.item?.price_currency,
      });
    }

    if (oldProps?.item?.type !== this.props?.item?.type) {
      this.setState({
        showProjectPriceSection: this.props?.item?.type === 'fixed',
      });
    } else if (!this.state.showProjectPriceSection && this.props?.item?.type === 'fixed') {
      this.setState({
        showProjectPriceSection: true,
      });
    }

    if (oldProps?.item?.attached_users !== this.props?.item?.attached_users) {
      let setData = this.props?.item?.attached_users ? this.props?.item?.attached_users : [];
      this.onSetSelectedUserList(setData);
    }

    if (oldProps?.errorMessages !== this.props?.errorMessages) {
      this.onSetErrorMessages(this.props?.errorMessages);
    }

    if (oldProps?.visible !== this.props?.visible) {
      this.setState(prevState =>({
        ...prevState,
        showAddEditUserSection: false,
      }));
    }
  };

  handleOk = () => {
    const {item = {}, onOk, form, onFill} = this.props;
    const {selectedUsersList, userProject, removedUserProjectIds, projectPriceCurrency} = this.state;
    const {validateFields, getFieldsValue, resetFields} = form;
    const {currentSelectedUser, role, ...sendFieldsValue} = getFieldsValue();

    validateFields(async errors => {
      if (errors) {
        return
      }
      const data = {
        ...sendFieldsValue,
        id: item.id,
        color: `#${sendFieldsValue.color}`,
        selectedUsersList: selectedUsersList,
        removedUserProjectIds: removedUserProjectIds,
      };
      data.price_currency = projectPriceCurrency;

      try {
        await onOk(data);
        this.onSetSelectedUserList([]);
        this.onSetErrorMessages({});
        this.setState({
          showProjectPriceSection: false,
          projectPriceCurrency: DEFAULT_CURRENCY,
          removedUserProjectIds: [],
          projectMemberHistory: [],
          searchUserList: [],
          selectedProjectMember: null,
          showAddEditUserSection: false,
          userProject: defaultUserProject,
        });
        resetFields();
      } catch (err) {
        resetFields()
      }
    })
  };

  handleChangeRole = (data) => {
    this.setState({
      roles: data[data.length - 1]
    });
  };

  handleChangeRateCurrency = (data) => {
    this.setState({
      userProject: {
        ...this.state.userProject,
        rateCurrency: data
      }
    });
  };

  handleChangeUserProjectStartDate = (data) => {
    this.setState({
      userProject: {
        ...this.state.userProject,
        startDate: data
      }
    });
  };

  handleChangeUserProjectEndDate = (data) => {
    this.setState({
      userProject: {
        ...this.state.userProject,
        endDate: data
      }
    });
  };

  handleChangeUserProjectRate = (e) => {
    this.setState({
      userProject: {
        ...this.state.userProject,
        rate: e.target.value
      }
    });
  };

  handleClickColorBtn = () => {
    const {onShowHideColors} = this.props;
    onShowHideColors();
  };

  handleCloseColor = () => {
    const {onShowHideColors, form, itemColor} = this.props;
    onShowHideColors();

    const {setFieldsValue} = form;
    setFieldsValue({
      color: itemColor
    });
  };

  handleChangeColor = (color) => {
    const {onChangeItemColor} = this.props;
    onChangeItemColor(color.hex);
  };

  onSetErrorMessages = (data) => {
    this.setState({
      errorMessages: data,
    });
  }

  //assign projects functionality
  renderMemberOption = (item) => {
    return (
      <AutoComplete.Option key={`${item.id}${item.name}`} text={item.name} user={item}>
        <div>
          <span>
            <Avatar src={item.avatar ? `${appUrl}/storage/images/avatars${item.avatar}` : ''}
                    icon={!item.avatar ? <UserOutlined/> : ''}/>
          </span>
          <span style={{marginLeft: "15px"}}>
            {item.name}
          </span>
        </div>
      </AutoComplete.Option>
    );
  };

  handleMemberSearch = (value) => {
    const _dataSource = value ? this.searchUserResult(value) : [];
    this.setState({
      usersDataSource: _dataSource,
    });
  };

  searchUserResult = (query) => {
    const {users} = this.props;
    return users.filter(user => {
      return user.name.toLowerCase().includes(query.toLowerCase());
    }).map((user, idx) => {
      return {
        ...user,
        key: `${user.id}${idx}`
      }
    });
  };

  onSelectUser = (value, option) => {
    this.setState({
      currentSelectedUser: option?.props?.user
    });
  };

  //onSetRenderedUserList
  onSetSelectedUserList = (data) => {
    let error = false;

    data.length && data.forEach((item) => {
      if (!item.userRole || !item.userRole.length) {
        error = true;
      }
    })

    if (error) {
      message.error(i18n.t`Please choose user role.`);
      return;
    }

    this.setState({
      selectedUsersList: data,
    });
  };

  onSetCurrentSelectedUser = (data) => {
    this.setState({
      currentSelectedUser: data,
    });
  };

  onChangeUserName = (e, user) => {
    this.onSetCurrentSelectedUser(null);
  };

  handleRemoveUser = (e, user) => {
    e.preventDefault();
    this.handleRemoveProjectMemberHistory({}, {
      id: user.userProjectId,
      user_id: user.id,
      project_id: this.props.item.id
    })
      .then(() => {
        const {selectedUsersList = []} = this.state;
        const _selectedUsersList = [...selectedUsersList].filter(item => item.id !== user.id);
        this.onSetSelectedUserList(_selectedUsersList);
      })
      .catch(console.error);
  };

  handleUnassignedMember = (e, user) => {
    e.preventDefault();
      const {selectedUsersList = []} = this.state;
      const _selectedUsersList = [...selectedUsersList].filter(item => item.id !== user.id);
      this.onSetSelectedUserList(_selectedUsersList);
  };

  numberValidation = (rule, value, callback) => {
    if (!value || isNaN(value) || value < 0) {
      callback('Please enter valid price');
    } else {
      callback();
    }
  };

  isInvalidStartEndDatesRange = (projectMemberHistory, userProject) => {
    const _userProjects = projectMemberHistory.filter(item => item.id !== userProject.userProjectId);
    if (!userProject.startDate) return true; // invalid

    for (let i = 0; i < _userProjects.length; i++) {
      const startDate = _userProjects[i].startDate ? moment(_userProjects[i].startDate) : null;
      if (!startDate) return true; // invalid

      const endDate = _userProjects[i].endDate ? moment(_userProjects[i].endDate) : null;
      const busyRange = endDate
        ? moment.range(startDate, endDate).snapTo('day')
        : moment.range(startDate, moment()).snapTo('day');

      const userRange = userProject.endDate
        ? moment.range(userProject.startDate, userProject.endDate).snapTo('day')
        : moment.range(userProject.startDate, moment()).snapTo('day');

      if (userRange.intersect(busyRange)) return true; // invalid
    }
    return false;
  }

  addEditMember = (e) => {
    e.preventDefault();
    const {i18n, item} = this.props;
    const {projectMemberHistory, userProject, selectedProjectMember, roles} = this.state;
    if (!selectedProjectMember) { // todo maybe need to remove
      message.error(i18n.t`Please select the user!`);
      return;
    }
    if (!(roles && roles.length > 0)) {
      message.error(i18n.t`Please select a role`);
      return;
    }
    const isInvalidStartEndDatesRange = this.isInvalidStartEndDatesRange(projectMemberHistory, userProject);
    if (isInvalidStartEndDatesRange) {
      message.error(i18n.t`Invalid Start/End dates`);
      return;
    }

    const _userProject = {...userProject};
    const currentUserProject = projectMemberHistory.filter(item => item.status === 1);
    if (!currentUserProject[0]) {
      _userProject.status = 1; // active item
    } else { // active item exists
      if (_userProject.endDate) {
        if (moment(currentUserProject[0].startDate) > _userProject.endDate) {
          _userProject.status = 0; // old item
        }
      }
    }

    const data = {
      projectId: item.id,
      endDate: _userProject.endDate ? _userProject.endDate.format('YYYY-MM-DD') : null,
      rate: _userProject.rate,
      rateCurrency: _userProject.rateCurrency,
      startDate: _userProject.startDate.format('YYYY-MM-DD'),
      status: _userProject.status,
      id: _userProject.userId,
      userProjectId: _userProject.userProjectId,
      userRole: typeof this.state.roles !== 'string' ? this.state.roles[0] : this.state.roles,
      name: selectedProjectMember.name,
      surname: selectedProjectMember.surname
    }

    this.setState((prevState) => {
      return {
        selectedUsersList: [...prevState.selectedUsersList, data],
        showAddEditUserSection: false,
        selectedProjectMember: null,
        projectMemberHistory: [],
        roles: [],
        userProject: defaultUserProject,
      }
    });
  };

  //currency functionality
  changeCurrency = (value) => {
    this.setState({
      currency: value
    });
  };

  toggleAddUserSection = () => {
    this.setState((prevState) => ({
      showAddEditUserSection: !prevState.showAddEditUserSection
    }));
  };

  setShowProjectUsersDropdown = () =>{
    this.setState({showProjectUsersDropdown: true});
  };

  handleProjectUsersDropdownClose = () => {
    this.setState({showProjectUsersDropdown: false})
  };

  handleAddEditUsersCancel = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        selectedProjectMember: null,
        projectMemberHistory: [],
        removedUserProjectIds: [],
        roles:[],
        showAddEditUserSection: false,
        showProjectUsersDropdown: false,
        userProject: defaultUserProject,
      }
    });
  }

  disabledUserProjectStartDate = (current) => {
    const {endDate} = this.state.userProject;
    if (!current || !endDate) return false;
    return current > endDate;
  }

  disabledUserProjectEndDate = (current) => {
    const {startDate} = this.state.userProject;
    return current && current < startDate;
  }

  disabledDate = (current) => {
    return current && current > moment().startOf('day').add(1, 'days');
  }

  getProjectMemberHistoryItems = (userId) => {
    return this.props.dispatch({
      type: 'projects/projectMemberHistory',
      payload: {
        projectId: this.props.item.id,
        userId: userId,
      },
    }).then((resp) => {
      return this.setState({projectMemberHistory: resp}, () => {
        return resp;
      });
    }).catch(e => {
      return e.response;
    });
  }

  selectMemberForEdit = (e, user) => {
    if (e.target.value !== undefined) return;
    if (!canAssignUserToProject) return;
    if (user.id && user.id.toString() !== this.state.userProject.id) {
      this.getProjectMemberHistoryItems(user.id);
    }

    this.setState({
      showAddEditUserSection: true,
      roles: [user.userRole],
      selectedProjectMember: {id: user.id, avatar:user.avatar, name: getUserFullName(user)},
      userProject: {
        ...this.state.userProject,
        id: user.id ? user.id.toString() : user.userId,
        startDate: user.startDate ? moment(user.startDate) : null,
        endDate: user.endDate ? moment(user.endDate) : null,
        rate: user.rate,
        rateCurrency: user.rateCurrency,
        status: user.status,
        userProjectId: user.userProjectId,
      }
    });
  }

  handleSearchMembers(username) {
    let {usersDataSource} = this.state;

    usersDataSource = !this.state.isInactiveMembers ? usersDataSource.filter(elem => elem.status === 1) : usersDataSource
    this.setState({
      searchUserList: !username ? [...usersDataSource] : usersDataSource.filter(item => {
        const fullName = getUserFullName(item);
        return fullName.toLowerCase().includes(username.toLowerCase());
      })
    });
  }

  handleChangeSelectMember(userId) {
    const {usersDataSource, searchUserList} = this.state;
    const selectedProjectMemberArr = usersDataSource.filter(user => user.id.toString() === userId);
    this.setState({
      userProject: {
        ...defaultUserProject,
        userId: userId
      },
      roles: [],
      searchUserList: searchUserList.length !== usersDataSource.length ? [...usersDataSource] : searchUserList,
      selectedProjectMember: selectedProjectMemberArr[0] ?? null,
    });
  }

  handleRemoveProjectMemberHistory(e, pmh) {
    const {dispatch, i18n} = this.props;
    return dispatch({
      type: 'projects/removeProjectMemberHistory',
      payload: {
        projectId: pmh.project_id,
        userId: pmh.user_id,
        userProjectId: pmh.id,
      },
    }).then((resp) => {
      if (resp) {
        this.getProjectMemberHistoryItems(pmh.user_id);
        message.success(i18n.t`User project history item removed`);
      }
      return resp;
    }).catch(e => {
      return e.response;
    });
  }

  handleUnassignedMemberFromProject(e, pmh) {
    const {dispatch, i18n} = this.props;
    return dispatch({
      type: 'projects/unassignedMemberFromProject',
      payload: {
        projectId: pmh.project_id,
        userId: pmh.user_id,
        userProjectId: pmh.id,
      },
    }).then((resp) => {
      if (resp) {
        this.getProjectMemberHistoryItems(pmh.user_id);
        message.success(i18n.t`User unassigned from project`);
      }
      return resp;
    }).catch(e => {
      return e.response;
    });
  }

  handleChangeProjectPriceCurrency = (data) => {
    this.setState({
      projectPriceCurrency: data
    });
  }

  handleChangeProjectType = (data) => {
    this.setState({
      showProjectPriceSection: data === 'fixed'
    });
  }

  toggleInactiveMembers = () => {
    const { users } = this.props;
      this.setState(({isInactiveMembers}) => {
        return {
          isInactiveMembers: !isInactiveMembers,
          searchUserList: isInactiveMembers ? users.filter(({status}) => status) : users,
        }
      })
  }

  cancel = () => {
    const {...modalProps} = this.props;
    this.setState(() => {
      return {
        selectedUsersList: modalProps.item.status === 1 ? modalProps.item.attached_users : [],
        selectedProjectMember: null,
        roles: [],
        userProject: defaultUserProject,
      }
    })
    modalProps.onCancel()
  }

  render() {
    const {currency, roles, searchUserList, projectMemberHistory, isInactiveMembers} = this.state;
    const {
      item = {},
      onOk,
      form,
      i18n,
      displayColorPicker,
      itemColor,
      users,
      userProjectRoles = [],
      technologies = [],
      ...modalProps
    } = this.props;
    const {getFieldDecorator} = form;
    const status = item.status !== undefined ? item.status : 1;
    let lang = i18n.language === 'en' ? en_GB : hy_AM;
    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: itemColor,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    const locale = "en-us";

    const currencyFormatter = selectedCurrOpt => value => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: selectedCurrOpt.split("::")[1]
      }).format(value);
    };
    const currencyParser = val => {
      try {
        // for when the input gets clears
        if (typeof val === "string" && !val.length) {
          val = "0.0";
        }

        // detecting and parsing between comma and dot
        let group = new Intl.NumberFormat(locale).format(1111).replace(/1/g, "");
        let decimal = new Intl.NumberFormat(locale).format(1.1).replace(/1/g, "");
        let reversedVal = val.replace(new RegExp("\\" + group, "g"), "");
        reversedVal = reversedVal.replace(new RegExp("\\" + decimal, "g"), ".");
        //  => 1232.21 €

        // removing everything except the digits and dot
        reversedVal = reversedVal.replace(/[^0-9.]/g, "");
        //  => 1232.21

        // appending digits properly
        const digitsAfterDecimalCount = (reversedVal.split(".")[1] || []).length;
        const needsDigitsAppended = digitsAfterDecimalCount > 2;

        if (needsDigitsAppended) {
          reversedVal = reversedVal * Math.pow(10, digitsAfterDecimalCount - 2);
        }

        return Number.isNaN(reversedVal) ? 0 : reversedVal;
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <Modal
        {...modalProps}
        onOk={this.handleOk}
        className={`${modalStyles['addProjectModal']}`}
        footer={[
          <div className={`${modalStyles['footer-action-buttons']}`}>
            <button
              type='button'
              className='app-btn primary-btn-outline md'
              onClick={this.cancel}
            >
              {i18n.t`Cancel`}
            </button>
            <button
              type='button'
              className='app-btn primary-btn md'
              onClick={this.handleOk}
            >
              {i18n.t`Save`}
            </button>
          </div>
        ]}
        closeIcon={
          <span onClick={() => this.cancel()}
                className="close-icon">
                  <Icons name="close"/>
                </span>
        }
      >
        <Form layout="horizontal">
          <Row gutter={10}>
            <Col lg={12}>
              <FormItem
                label={i18n.t`Project Name`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('name', {
                  initialValue: item.name,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Name is required`
                    },
                    {
                      max: 191,
                    },
                  ],
                })(<Input className="input-global-md color-black font-medium"/>)}
                {Object.keys(this.state.errorMessages).length !== 0 &&
                 this.state.errorMessages.hasOwnProperty('name') &&
                <span style={{color: 'red'}}>{i18n._(`${this.state.errorMessages['name']}`)}</span>}
              </FormItem>
            </Col>
            <Col lg={12}>
              <ConfigProvider locale={lang}>
                <FormItem
                  label={i18n.t`Created Date`}
                  className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
                >
                  {getFieldDecorator('deadline', {
                    initialValue: item.deadline ? moment(item.deadline, 'YYYY-MM-DD') : null,
                  })(<DatePicker
                      format={this.#dateFormat}
                      className="app-datepicker-input show-icon"
                      suffixIcon={<Icons name="calendar"/>}
                      disabledDate={this.disabledDate}
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                    />
                  )}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col lg={this.state.showProjectPriceSection ? 8 : 12}>
              <FormItem
                label={i18n.t`Type`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('type', {
                  initialValue: item.type,
                })(
                  <Select
                    getPopupContainer={trigger => trigger.parentNode}
                    mode="single"
                    dropdownClassName={`${modalStyles['projects-modal-select']}`}
                    onSelect={(e) => this.handleChangeProjectType(e)}
                    suffixIcon={
                      <Icons
                        name="arrowdown2"
                        fill="#B3B3B3"
                      />
                    }
                  >
                    {Object.keys(PROJECT_TYPES).map((key, i) => {
                      if (PROJECT_TYPES.hasOwnProperty(key)) {
                        return (
                          <Select.Option
                          key={`ps-${i}-${PROJECT_TYPES[key].value}`}
                          value={PROJECT_TYPES[key].value}>
                          {i18n._(PROJECT_TYPES[key].text)}
                        </Select.Option>
                        )
                      }
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col lg={this.state.showProjectPriceSection ? 8 : 12}>
              <FormItem
                label={i18n.t`Status`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}>
                {getFieldDecorator('status', {
                  initialValue: status,
                  rules: [
                    {required: true, message: i18n.t`Assign status for this project`},
                  ],
                })(
                  <Select
                    getPopupContainer={trigger => trigger.parentNode}
                    mode="single"
                    dropdownClassName={`${modalStyles['projects-modal-select']}`}
                    suffixIcon={
                      <Icons
                        name="arrowdown2"
                        fill="#B3B3B3"
                      />
                    }
                  >
                    {Object.keys(STATUSES).map((key, i) => {
                      if (STATUSES.hasOwnProperty(key)) {
                        return (
                          <Select.Option
                            key={`s-${i}-${STATUSES[key].value}`}
                            value={STATUSES[key].value}>
                            {STATUSES[key].text}
                          </Select.Option>
                        )
                      }
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            {this.state.showProjectPriceSection ?
            <Col lg={8}>
              <FormItem label={i18n.t`Price`}
                        className={
                          `${globalStyles['input-md-ex']}
                           ${globalStyles['label-grey']}
                           ${modalStyles['rate-elements-container']}`
                        }>
                {getFieldDecorator('price', {
                  initialValue: item.price,
                  rules: [
                    {validator: this.numberValidation}
                  ],
                })(
                  <Input
                    addonBefore={<Select
                      defaultValue={item.price_currency || DEFAULT_CURRENCY}
                      className="select-before select-global-md w_100 color-black font-medium"
                      onChange={(e) => this.handleChangeProjectPriceCurrency(e)}
                      suffixIcon={
                        <Icons
                          name="arrowdown2"
                          fill="#B3B3B3"
                        />
                      }
                      getPopupContainer={triggerNode => triggerNode.parentNode}>
                      <Select.Option value="USD">USD</Select.Option>
                      <Select.Option value="EUR">EUR</Select.Option>
                      <Select.Option value="AMD">AMD</Select.Option>
                      <Select.Option value="RUB">RUB</Select.Option>
                    </Select>}
                    className='input-global-md  color-black font-medium form-control'
                  />
                )}
              </FormItem>
            </Col>: null}
          </Row>

          <Row gutter={10}>
            <Col lg={24}>
              <FormItem
                label={i18n.t`Description`}
                className={
                  `${globalStyles['input-md-ex']}
                   ${globalStyles['label-grey']}
                   ${modalStyles['description-field-container']}`}
              >
                {getFieldDecorator('description', {
                  initialValue: item.description,
                  rules: [
                    {
                      required: false,
                    },
                    {
                      max: 345,
                      message: i18n.t`Task description cannot be longer than 345 characters.`
                    },
                  ],
                })(<Input.TextArea/>)}
              </FormItem>
            </Col>
          </Row>

          <Row gutter={10}>
            <Col lg={24}>
              <Form.Item
                label={i18n.t`Technologies`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']} ${modalStyles['technology-field-container']}`}
              >
                {getFieldDecorator('project_technology', {
                  initialValue: item.project_technologies && item.project_technologies.map((technology, index) => {
                    return technology.name;
                  }),
                })(
                  <Select mode="tags"
                          placeholder={i18n.t`Add technologies for this project`}
                          maxTagTextLength={20}
                          getPopupContainer={trigger => trigger.parentNode}>
                    {technologies && technologies.map((technology, index) => {
                      return <Select.Option key={`t-${index}-${technology.id}`} value={technology.name}>{technology.name}</Select.Option>
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col lg={14} className={modalStyles['modal-column-styles']}>
              <FormItem
                label={i18n.t`Color`}
                className={
                  `${globalStyles['input-md-ex']}
                   ${globalStyles['label-grey']}
                   ${modalStyles['modal-colorPicker-section']}`}
              >
                <ProjectColor item={item} form={form}/>
              </FormItem>
            </Col>
          </Row>

          {canAssignUserToProject &&
          <Row gutter={10}>
            <Col lg={24}>
              <div className={`${modalStyles['show-add-members-row']}`}>
                <div
                  className={`${modalStyles['show-add-members-text-container']}`}
                >
                  <span className={`${modalStyles['add-members-text']}`}>{i18n.t`Team Members`}</span>
                  <span className={`${modalStyles['add-members-text__suffix']}`}>{i18n.t`Add members to your project`}</span>
                </div>
                {!this.state.showAddEditUserSection && <span
                  onClick={this.toggleAddUserSection}
                  className={`${modalStyles['add-member-section']}`}
                >
                <Icons
                  name="plus"
                  style={{
                    cursor: 'pointer'
                  }}
                />
              </span>}
              </div>
            </Col>
          </Row>
          }
          {(this.state.showAddEditUserSection && canAssignUserToProject) ?
            <Row gutter={16}
                 className={`${modalStyles['add-members-row']}`}>
              <Col lg={10} className={`${modalStyles['members-dropdown-toggle-col']}`}>
                <FormItem
                  className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']} `}
                >
                   <div className={`${modalStyles['dropdown-toggle-container']}`} >
                     <Select
                       mode="single"
                       placeholder={i18n.t`Select users`}
                       value={this.state.userProject.userId}
                       onSelect={(userId) => this.handleChangeSelectMember(userId)}
                       optionLabelProp="label"
                       filterOption={false}
                       showSearch={true}
                       onSearch={(username) => this.handleSearchMembers(username)}
                       dropdownClassName={modalStyles['users_dropdown']}
                       dropdownRender={userList => (
                         <div>
                           {userList}
                           <div
                             className={modalStyles['dropdown-render']}
                             onMouseDown={e => e.preventDefault()}
                             onClick={this.toggleInactiveMembers}
                           >
                             <span>{!isInactiveMembers ? 'Include Inactive Members' : 'Exclude Inactive Members'}</span>
                           </div>
                         </div>
                       )}
                     >
                       {searchUserList.map((userItem, i) => {
                         const fullName = getUserFullName(userItem);
                         return (
                           <Select.Option value={userItem.id.toString()} label={fullName} key={`u-${i}-${userItem.id}`}>
                             <div className="demo-option-label-item">
                              <span role="img" aria-label={fullName}>
                              <Avatar
                                key={`ua_${i}-${userItem.id}`}
                                src={userItem.avatar ? `${appUrl}/storage/images/avatars${userItem.avatar}` : ``}
                                icon={!userItem.avatar ? <UserOutlined/> : ``}
                                alt={fullName}
                              />
                              </span>
                               <span style={{marginLeft: '5px'}}>
                                 {fullName}
                               </span>
                             </div>
                           </Select.Option>)
                       })}
                     </Select>
                   </div>
                </FormItem>
              </Col>
              <Col lg={10}>
                <FormItem
                  className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']} role-sel`}
                >
                  <Select
                    placeholder={i18n.t`Add Role`}
                    onChange={this.handleChangeRole}
                    mode="tags"
                    value={roles}
                    dropdownClassName={`${styles['roleDropdown']}`}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium role-field-container"
                  >
                    {userProjectRoles.map((userProjectRole, index) => {
                      return (
                        <Select.Option key={`upr-${index}-${userProjectRole.id}${userProjectRole.name}`}
                                       value={userProjectRole.name}>
                          {i18n._(userProjectRole.name)}
                        </Select.Option>
                      )
                    })}
                  </Select>

                </FormItem>
              </Col>
              <Col lg={10}>
                <FormItem
                  label={i18n.t`Start Date`}
                  className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
                >
                  <DatePicker
                    value={this.state.userProject.startDate}
                    format={this.#dateFormat}
                    className="app-datepicker-input show-icon"
                    suffixIcon={<Icons name="calendar"/>}
                    onChange={this.handleChangeUserProjectStartDate}
                    disabledDate={this.disabledUserProjectStartDate}
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                  />
                </FormItem>
              </Col>
              <Col lg={10}>
                <FormItem
                  label={i18n.t`End Date`}
                  className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
                >
                  <DatePicker
                    value={this.state.userProject.endDate}
                    format={this.#dateFormat}
                    className="app-datepicker-input show-icon"
                    suffixIcon={<Icons name="calendar"/>}
                    onChange={this.handleChangeUserProjectEndDate}
                    disabledDate={this.disabledUserProjectEndDate}
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                  />
                </FormItem>
                <FormItem label={i18n.t`Rate`}
                          className={
                            `${globalStyles['input-md-ex']}
                           ${globalStyles['label-grey']}
                           ${modalStyles['rate-elements-container']}`
                          }>
                  <Input
                    value={this.state.userProject.rate}
                    addonBefore={<Select
                      value={this.state.userProject.rateCurrency}
                      className="select-before select-global-md w_100 color-black font-medium"
                      onChange={(e) => this.handleChangeRateCurrency(e)}
                      suffixIcon={
                        <Icons
                          name="arrowdown2"
                          fill="#B3B3B3"
                        />
                      }
                      getPopupContainer={triggerNode => triggerNode.parentNode}>
                      {SYSTEM_CURRENCIES.map(sc => (
                        <Select.Option value={sc} key={`sc-${sc}`}>{sc}</Select.Option>
                      ))}
                    </Select>}
                    onChange={this.handleChangeUserProjectRate}
                    className='input-global-md  color-black font-medium form-control'
                  />
                </FormItem>
              </Col>

              <Col lg={4} className={modalStyles['action-buttons-column']}>
              <span className={modalStyles['add-users-actions']}>
                <Button
                  onClick={(e) => this.addEditMember(e)}
                  type="link"
                  className={modalStyles['manual-mode-actions-text']}
                >
                  {this.state.userProject.status === 0 || this.state.userProject.status === 1 ? i18n.t`Save` :  i18n.t`Add`}
                </Button>
                <Button
                  onClick={() => this.handleAddEditUsersCancel()}
                  type="link"
                  className={modalStyles['manual-mode-actions-text']}>
                  {i18n.t`Cancel`}
                </Button>
              </span>
              </Col>
              {projectMemberHistory.length > 0 ?
                <Col lg={24}>
                  {projectMemberHistory.length > 1 ? <p>{i18n.t`Member history of current project`}</p> : null}
                  <List
                    className={`${modalStyles['project-users-list']}`}
                    itemLayout="horizontal"
                    dataSource={projectMemberHistory}
                    renderItem={pmh => {
                      if (pmh.status === 1) return <></>;

                      let description = ``;
                      if (pmh.startDate) {
                        description += `${i18n.t`Start`}: ${pmh.startDate} `;
                      }
                      description += `${i18n.t`End`}: ${ pmh.endDate ? pmh.endDate : i18n.t`till now`} `;
                      if (pmh.rate) {
                        description += `${CURRENCY_SYMBOLS[pmh.rateCurrency]}${pmh.rate}`;
                      }

                      const fullName = getUserFullName({name: pmh.name, surname: pmh.surname});

                      let title = fullName + ' ' + (pmh.userRole ? `${i18n.t`Role`}: ${pmh.userRole} ` : i18n.t`Role` + ': ' + i18n.t`unknown`)
                      title += pmh.status === 1 ? ` (${i18n.t`current`})` : ` (${i18n.t`old`})`;
                      return (
                        <List.Item
                          key={`h-${pmh.id}-${pmh.project_id}-${pmh.user_id}-${pmh.startDate}`}
                          className={`${modalStyles['project-users-list__item']} ${canAssignUserToProject ? modalStyles['can-edit'] : ''} ${this.state.userProject.userProjectId === pmh.id ? 'active-user-project' : ''}`}
                          onClick={(e) => {
                            if(!canAssignUserToProject) return;
                            this.setState({
                              userProject: {
                                ...this.state.userProject,
                                userProjectId: pmh.id
                              }
                            });
                            this.selectMemberForEdit(e, {...pmh, userProjectId: pmh.id, id: pmh.user_id});
                          }}
                          actions={[
                            <Popconfirm
                              title={i18n.t`Are you sure delete this item?`}
                              okText={i18n.t`Yes`}
                              cancelText={i18n.t`Cancel`}
                              placement="topRight"
                              onConfirm={(e) => this.handleRemoveProjectMemberHistory(e, pmh)}
                            >
                              <Button>
                                <Icon type="delete" height="12px" width="12px"/>
                              </Button>
                            </Popconfirm>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar
                              src={pmh.avatar ? `${appUrl}storage/images/avatars${getResizedImage(pmh.avatar, 'avatar')}` : ''}
                              icon={!pmh.avatar ? <UserOutlined/> : ''}
                            />}
                            title={title}
                            description={description}
                          />
                        </List.Item>
                      )
                    }}
                  />
                </Col>
                : null
              }
            </Row> :
            null}

          {this.state.selectedUsersList.length ?
          <Row>
            {<p>{i18n.t`Active members`}</p>}
            <List
              className={`${modalStyles['project-users-list']}`}
              itemLayout="horizontal"
              dataSource={this.state.selectedUsersList}
              renderItem={user => {
                let description = ``;
                if (user.startDate) {
                  description += `${i18n.t`Start`}: ${user.startDate} `;
                }
                description += `${i18n.t`End`}: ${ user.endDate ? user.endDate : i18n.t`till now`} `;
                if (user.userRole) {
                  description += `${i18n.t`Role`}: ${user.userRole} `;
                }
                if (user.rate) {
                  description += `${CURRENCY_SYMBOLS[user.rateCurrency]}${user.rate}`;
                }
                return (
                  <List.Item
                    onClick={(e) => {
                      if(!canAssignUserToProject) return;
                      this.setState({
                        userProject: {
                          ...this.state.userProject,
                          userProjectId: user.userProjectId
                        }
                      });
                      this.selectMemberForEdit(e, user);
                    }}
                    key={`us-${user.id}${user.name}`}
                    className={`${modalStyles['project-users-list__item']} ${canAssignUserToProject ? modalStyles['can-edit'] : ''} ${this.state.userProject.userProjectId === user.userProjectId ? 'active-user-project' : ''}`}
                    actions={[
                      <Popconfirm
                        title={i18n.t`Are you sure unassigned this member?`}
                        okText={i18n.t`Yes`}
                        cancelText={i18n.t`Cancel`}
                        placement="topRight"
                        onConfirm={(e) => this.handleUnassignedMember(e, user)}
                      >
                        <Button>
                          <Icon type="close" height="12px" width="12px"/>
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar
                        src={user.avatar ? `${appUrl}storage/images/avatars${getResizedImage(user.avatar, 'avatar')}` : ''}
                        icon={!user.avatar ? <UserOutlined/> : ''}
                      />}
                      title={<span>{getUserFullName(user)}</span>}
                      description={description}
                    />
                  </List.Item>
                )
              }}
            />
          </Row> :
            null}
        </Form>
      </Modal>
    )
  }
}

ProjectModal.propTypes = {
  type: PropTypes.string,
  projectColor: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  onShowHideColors: PropTypes.func,
  onChangeItemColor: PropTypes.func,
};

export default ProjectModal
