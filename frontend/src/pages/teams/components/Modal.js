import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Select,
  Modal,
  Button,
  AutoComplete,
  List,
  Avatar,
  Row,
  Col, message
} from 'antd';
import { Form, Icon } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Trans, withI18n } from '@lingui/react';
import {STATUSES} from 'utils/constant';
import {appUrl} from 'utils/config';
import {getResizedImage, getUserFullName} from 'utils';
import styles from './modal.less'
import Icons from 'icons/icon';
import globalStyles from 'themes/global.less';
import TeamsUsersDropdown from "./TeamsUsersDropdown/TeamsUsersDropdown";

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};
@withI18n()
@Form.create()
class TeamModal extends PureComponent {
  state = {
    roleIdNameList: [],
    membersValidation:false,
    memberRole: {},
    selectedUsers: [],
    dataSourceMembers: [],
    showAddUserSection:false,
    showTeamUsersDropdown: false,
    inputUsersList: [],
    selectedUsersList: []
  };

  componentDidMount() {
    const {roleIdNameList, dataSourceMembers} = this.props;

    this.setState({
      roleIdNameList: [...roleIdNameList],
      dataSourceMembers: [...dataSourceMembers],
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps?.visible !== this.props?.visible) {
      this.setState(prevState =>({
        ...prevState,
        showAddUserSection: false,
      }));
    }
  }

  handleOk = () => {
    const { item = {}, onOk, form, selectedUserList } = this.props;
    const { validateFields, getFieldsValue } = form;

    validateFields(errors => {
      if (errors) {
        return
      }

      let values = getFieldsValue();
      values.members = selectedUserList && selectedUserList.map(item => {
        return {
          user_id: item.id,
          role_name: item.role_name,
          role_id: item.team_member_role_id,
          roles: item.roles
        }
      });


      const data = {
        ...values,
        key: item.key,
      };
      onOk(data)
    })
  };

  renderMemberOption = (item) => {
    return (
      <AutoComplete.Option key={item.key} text={item.user.name} user={item.user}>
        <div>
              <span>
                  {item.user.name}
              </span>
          {item.user.teams.length > 0 ? <span className="small"> <Trans>includes in</Trans> {item.user.teams.length} <Trans>iteam(s)</Trans></span> : ''}
        </div>
      </AutoComplete.Option>
    );
  };

  renderMemberRolesOption = (item) => {
    return (
      <AutoComplete.Option key={item.id} text={item.name}>
        <div>
              <span>
                  {item.name}
              </span>
        </div>
      </AutoComplete.Option>
    );
  };

  handleMemberRolesSearch = (value) => {
    const {roleIdNameList} = this.props;
    const _roleIdNameList = roleIdNameList.filter(e => e.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
    this.setState({
      roleIdNameList: _roleIdNameList
    })
  };

  onSelectMemberRole = (value, option) => {
    if (value === this.state.memberRole?.id) return;
    this.setState({
      memberRole: {
        id: value,
        name: option.props?.children,
      }
    });
  }

  onSelectMember = (value, option) => {
    if (value === this.state.selectedUser?.id) return;
    this.setState({
      selectedUser: option.props.user
    });
  };

  handleMemberSearch = value => {
    const _dataSource = value ? this.searchUserResult(value) : [];
    this.setState({
      dataSourceMembers: _dataSource
    });
  };

  searchUserResult = (query) => {
    const {users} = this.props;

    return users.filter(user => {
      return user.name.toLowerCase().includes(query.toLowerCase());
    })
      .map((user, idx) =>{
        return {
          query,
          user: user,
          key: `${user.id}${idx}`
        }
      });
  };

  handleAddUsersCancel = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        inputUsersList: [],
        showAddUserSection: false,
        showTeamUsersDropdown: false,
        memberRole:{}
      }
    })
  }

  addMember = (e) => {
    e.preventDefault();
    const {onSetSelectedUserList, selectedUserList = [], i18n, form} = this.props;
    const {inputUsersList, memberRole} = this.state;
    const {setFieldsValue} = form;
    let _selectedUserList = [...selectedUserList];

    if  (inputUsersList.length) {
      const uList = inputUsersList.map(user => {
        let listKey = `${user.id}${user.name}`;

        return {...user, key: listKey, role_name: memberRole.name, team_member_role_id : memberRole.id ? parseInt(memberRole.id) : null};
      })

      let isRoleSelected = false;

      if (memberRole?.id) {
        isRoleSelected = true
      }

      if (isRoleSelected) {
        const newSelectedUsers = [..._selectedUserList, ...uList]
        onSetSelectedUserList(newSelectedUsers);
        setFieldsValue({memberRole: {}});
      } else {
        message.error(i18n.t`Please select a role`)
        return;
      }
      this.setState({
        showAddUserSection: false,
        inputUsersList: [],
        memberRole: {}
      });
    } else {
      message.error(i18n.t`Please select the user!`);
      return;
    }
  };

  handleRemoveMember = (e, user) => {
    e.preventDefault();
    const {selectedUserList = [], onSetSelectedUserList} = this.props;
    const _selectedUserList = [...selectedUserList].filter(item => item.id !== user.id);
    onSetSelectedUserList(_selectedUserList);
  };

  toggleAddUserSection = () => {
    this.setState((prevState) => ({
      showAddUserSection: !prevState.showAddUserSection
    }));
  };

  setShowTeamUsersDropdown = () => {
    this.setState({showTeamUsersDropdown: true});
  };

  handleTeamUsersDropdownClose = () => {
    this.setState({showTeamUsersDropdown: false})
  };

  handleDropdownUsersAdd = (array) => {
    this.setState(prevState =>{
      return {
        ...prevState,
        inputUsersList : [...array],
        showTeamUsersDropdown: false
      }
    });
  };

  teamDropdownProps = () => {
    const {
      inputUsersList,
      showTeamUsersDropdown,
    } = this.state;

    const {users, selectedUserList=[]} = this.props;

    return {
      users,
      selectedUsersList:selectedUserList,
      show: showTeamUsersDropdown,
      inputUsersList: inputUsersList,
      onClose: this.handleTeamUsersDropdownClose,
      addToInputUsersList: this.handleDropdownUsersAdd
    }
  };

  render() {
    const {item = {}, onOk, form, i18n,roleIdNameList=[], selectedUserList = [], memberStatus, users, projects, ...modalProps} = this.props;
    const { getFieldDecorator } = form;
    const {membersValidation} = this.state;
    const status = item.status !== undefined ? item.status : 1;

    return (
      <Modal
        className={styles['teamsModal']}
        okText={i18n.t`OK`}
        {...modalProps}
        onOk={this.handleOk}
        footer={[
          <div className={`${styles['footer-action-buttons']}`}>
            <button
              type='button'
              className='app-btn primary-btn-outline md'
              onClick={modalProps.onCancel}
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
          <span onClick={() => this.props.onCancel()}
                className="close-icon">
                  <Icons name="close"/>
                </span>
        }
      >
        <Form layout="horizontal">
          <Row>
            <Col span={24}>
              <FormItem label={i18n.t`Team Name`}
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
                })(<Input className="input-md-ex" />)}
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16} xs={24} lg={16}>
              <Form.Item label={i18n.t`Project`}
                         className={
                           `${globalStyles['input-md-ex']}
                         ${globalStyles['label-grey']}
                         ${styles['technology-field-container']}`
                         }>
                {getFieldDecorator('project_id', {
                  initialValue: item.projects && item.projects.map(project => {
                    return project.id;
                  }) || [],
                })(
                  <Select mode="multiple"
                          optionFilterProp='children'
                          getPopupContainer={trigger => trigger.parentNode}
                          className='input-md-ex'
                          suffixIcon={
                            <Icons
                              name="arrowdown2"
                              fill="#B3B3B3"
                            />
                          }
                  >
                    {projects && projects.map((project, index) => {
                      return <Select.Option key={index} value={project.id}>{project.name}</Select.Option>
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8} xs={24} lg={8}>
              <Form.Item label={i18n.t`Status`}
                         className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
                         >
                {getFieldDecorator('status', {
                  initialValue: status,
                  rules: [
                    { required: true, message: i18n.t`Assign status for this team`},
                  ],
                })(
                  <Select mode="single"
                          className='input-md-ex'
                          placeholder={i18n.t`Assign status for this team`}
                          getPopupContainer={trigger => trigger.parentNode}
                          suffixIcon={
                            <Icons
                              name="arrowdown2"
                              fill="#B3B3B3"
                            />
                          }
                  >
                    {Object.keys(STATUSES).map(key => {
                      if(STATUSES.hasOwnProperty(key)){
                        return <Select.Option key={STATUSES[key].value} value={STATUSES[key].value}>{STATUSES[key].text}</Select.Option>
                      }
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                label={i18n.t`Description`}
                className={`${globalStyles['input-md-ex']}
                   ${globalStyles['label-grey']}
                   ${styles['description-field-container']}`}>
            {getFieldDecorator('description', {
              initialValue: item.description,
              rules: [
                {
                  required: false,
                },
                {
                  max: 1000,
                },
              ],
            })(<Input.TextArea />)}
          </FormItem>
              </Col>
          </Row>
          <Row gutter={10}>
            <Col lg={24}>
              <div className={`${styles['show-add-members-row']}`}>
                <div
                  className={`${styles['show-add-members-text-container']}`}
                >
                  <span className={`${styles['add-members-text']}`}>Team Members</span>
                  <span className={`${styles['add-members-text__suffix']}`}>Add members to your project</span>
                </div>
                {!this.state.showAddUserSection && <span
                  onClick={this.toggleAddUserSection}
                  className={`${styles['add-member-section']}`}
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

          {this.state.showAddUserSection ?
            <Row gutter={16}
                 className={`${styles['add-members-row']}`}>
              <Col lg={10} className={`${styles['members-dropdown-toggle-col']}`}>
                <FormItem
                  className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']} `}
                >
                  <div className={`${styles['dropdown-toggle-container']}`} >
                    <input
                      className={`${styles['dropdown-toggle-input']}`}
                      onClick={() => this.setShowTeamUsersDropdown()}
                      readOnly={true}
                      value={this.state.inputUsersList.length > 0 ?
                        this.state.inputUsersList.map(user => getUserFullName(user)).join(", ") : ''}
                      placeholder='Users'
                    />
                    <TeamsUsersDropdown {...this.teamDropdownProps()}/>
                  </div>
                  {membersValidation && <span style={{color: 'red'}}>{i18n.t`Members is required`}</span>}
                </FormItem>
              </Col>
              <Col lg={10}>
                <FormItem
                  className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']} role-sel`}
                >
                  <Select
                    placeholder={i18n.t`Add Role`}
                    onChange={this.onSelectMemberRole}
                    value={this.state.memberRole?.id}
                    dropdownClassName={`${styles['roleDropdown']}`}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium role-field-container"
                    suffixIcon={
                      <Icons
                        name="arrowdown2"
                        fill="#B3B3B3"
                      />
                    }
                  >
                    {roleIdNameList.map((userRole, index) => {
                      return (
                        <Select.Option key={`${userRole.id}${userRole.name}`}
                                       value={userRole.id}>
                          {i18n._(userRole.name)}
                        </Select.Option>
                      )
                    })}
                  </Select>

                </FormItem>
              </Col>

              <Col lg={4} className={styles['action-buttons-column']}>
              <span className={styles['add-users-actions']}>
                <Button
                  onClick={(e) => this.addMember(e)}
                  type="link"
                  className={styles['manual-mode-actions-text']}
                >
                  {i18n.t`Add`}
                </Button>
                <Button
                  onClick={()=>this.handleAddUsersCancel()}
                  type="link"
                  className={styles['manual-mode-actions-text']}>
                  {i18n.t`Cancel`}
                </Button>
              </span>
              </Col>
            </Row> :
            null}

          {selectedUserList.length ?
            <Row>
              <List
                itemLayout="horizontal"
                dataSource={selectedUserList}
                className={`${styles['project-users-list']}`}
                renderItem={(user, index) => (
                  <List.Item
                    className={`${styles['project-users-list__item']}`}
                    key={`${user.id}_${index}`}
                    actions={[
                      <Button onClick={(e) => this.handleRemoveMember(e, user)}>
                        <Icon type="close" height="12px" width="12px"/>
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={user.avatar ?
                        <Avatar src={`${appUrl}storage/images/avatars${getResizedImage(user.avatar, 'avatar')}`}/> : ''}
                      title={<span>{getUserFullName(user)}</span>}
                      description={i18n._(user.role_name)}
                    />
                  </List.Item>
                )}
              />
            </Row> :
            null
          }
        </Form>
      </Modal>
    )
  }
}

TeamModal.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onSetDataSourceMembers: PropTypes.func,
  onSetSelectedUser: PropTypes.func,
  onSetSelectedUserList: PropTypes.func,
  onSetMemberStatus: PropTypes.func,
  onSetDataMembersStatus: PropTypes.func,
};

export default TeamModal
