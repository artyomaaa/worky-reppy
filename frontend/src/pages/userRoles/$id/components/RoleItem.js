import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Popconfirm, Input, Button, Avatar, Tooltip, Popover, Select} from 'antd';
import {Form} from '@ant-design/compatible';
import {UserOutlined} from "@ant-design/icons";
import {withI18n} from '@lingui/react';
import store from 'store';
import moment from 'utils/moment';
import {getUserFullName, getResizedImage} from 'utils';
import {DATE_FORMAT, ROLE_TYPES} from 'utils/constant';
import {appUrl} from 'utils/config';
import Icons from 'icons/icon';
import {isEqual} from 'lodash';
import styles from "./RoleItem.less";

const FormItem = Form.Item;
const {TextArea} = Input;

const {Option} = Select;

@withI18n()
@Form.create()
class RoleItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userTimeOffset: store.get('user').time_offset || '+00:00',
      editMode: false,
      openAssignUsersToRoleSelect: false,
      assignUserIds: [],
      userList: [],
    };
  }

  #dateFormat = 'DD MMM, YYYY';

  handleSubmit = (e) => {
    e.preventDefault();
    const {form, details} = this.props;
    const {getFieldsValue} = form;
    let fields = getFieldsValue();

    const role = {...details.role};
    role['name'] = fields['role_name'];
    role['description'] = fields['description'];
    let saveData;
    if (role.id) {
      saveData = details.onEditItem(role);
    } else {
      saveData = details.onAddItem(role);
    }

    saveData
      .then(res => {
        if (res && res.status) {
          this.setState({editMode: false});
        }
      })
      .catch(console.error);
  }

  handleDelete = (roleId) => {
    const {details} = this.props;
    details.onDeleteItem(roleId);
  }

  handleCancel() {
    this.setState({editMode: false});
    const {details} = this.props;
    if (details.saveMode === 'add') {
      details.onCancel();
    }
  }

  handleAssignUserToRole(userIds) {
    this.setState({
      assignUserIds: userIds.sort() || []
    });
  }

  handleOpenAssignUsersToRoleSelect() {
    const {details} = this.props;
    details.getAllUserList()
      .then(() => {
        const {details} = this.props;
        const {role, allUserList} = details;
        const userIdsHasRoles = allUserList
          .filter(user => user.role_id === role.id)
          .map(user => user.id)
          .sort();

        this.setState({
          userList: [...allUserList],
          assignUserIds: userIdsHasRoles || [],
          openAssignUsersToRoleSelect: true
        });
      })
      .catch(console.error);
  }

  handleAssignUsersToRole() {
    const {details} = this.props;
    const {assignUserIds} = this.state;
    const userIdsHasRoles = details.allUserList
      .filter(user => user.role_id === details.role.id)
      .map(user => user.id);

    const addedUserIds = [];
    assignUserIds.forEach(userId => {
      if (!userIdsHasRoles.includes(userId)) {
        addedUserIds.push(userId);
      }
    });

    const removedUserIds = [];
    userIdsHasRoles.forEach(userId => {
      if (!assignUserIds.includes(userId)) {
        removedUserIds.push(userId);
      }
    });

    details.assignUsersToRole(addedUserIds, removedUserIds)
      .then(() => {
        this.setState({openAssignUsersToRoleSelect: false});
      })
      .catch(console.error);
  }

  handleAssignUsersClose() {
    this.setState({openAssignUsersToRoleSelect: false});
  }

  handleSearchUsers(username) {
    const {details} = this.props;
    const {allUserList} = details;
    this.setState({
      userList: !username ? [...allUserList] : allUserList.filter(item => {
        const fullName = getUserFullName(item);
        return fullName.includes(username);
      })
    });
  }

  userContentPopover = (member, index) => {
    const fullName = getUserFullName(member);
    return (
      <div>
        <Avatar
          key={`a_${member.id}_${index}`}
          src={member.avatar ? `${appUrl}/storage/images/avatars${getResizedImage(member.avatar, 'sm')}`: ''}
          icon={!member.avatar ? <UserOutlined/> : ``}
          alt={fullName}
        />
        <h4>{fullName}</h4>
        <span>{member.position}</span>
      </div>
    )
  }


  render() {
    const {i18n, details, form} = this.props;
    const {getFieldDecorator} = form;
    const {editMode, userTimeOffset, openAssignUsersToRoleSelect, assignUserIds, userList} = this.state;
    const {role, saveMode, roleType} = details;
    const createdAt = moment.parseZone(role.created_at).utcOffset(userTimeOffset).format(this.#dateFormat);
    const memberList = role.memberList;
    // let memberListData = [];
    // let moreMembersCount = 0;
    // if (memberList) {
    //   memberListData = memberList.data;
    //   // if (memberList.next_page_url) {
    //   //   moreMembersCount = memberList.total - (memberList.current_page * parseInt(memberList.per_page));
    //   // }
    // }

    const userIdsHasRoles = userList
      .filter(user => user.role_id === role.id)
      .map(user => user.id)
      .sort();

    return (
      <>
        <div className={styles['role-info-header']}>
          {(!editMode && saveMode !== 'add')
            ? <>
              <div className={styles['role-head']}>
                <h1 className={styles['role-name']}>{details.role.name}</h1>
                {saveMode !== 'add' &&
                <div className={styles['role-action-btn']}>
                  <span style={{cursor: 'pointer'}} onClick={() => this.setState({editMode: !this.state.editMode})}>
                    <Icons name="edit"/>
                  </span>
                  <Popconfirm
                    title={i18n.t`Are you sure delete this item?`}
                    okText="Yes"
                    placement="topRight"
                    onConfirm={() => this.handleDelete(role?.id)}
                  >
                <span style={{cursor: 'pointer'}}>
                 <Icons name="delete"/>
                </span>
                  </Popconfirm>
                </div>
                }
              </div>
              <div className={styles['role-details']}>
                <h3>{i18n.t`Created Date`}: <span>{createdAt}</span></h3>
                <h3>{i18n.t`Type`}: <span>{roleType}</span></h3>
              </div>
              <p className={styles['role-desc']}>{details.role.description}</p>
            </>
            :
            <>
              <Form onSubmit={this.handleSubmit}>
                <FormItem
                  label="Role Name">
                  {getFieldDecorator('role_name', {
                    initialValue: details.role.name,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Name is required`,

                      },
                      {
                        max: 70,
                      },
                    ],
                  })(<Input/>)}
                </FormItem>
                <FormItem
                  label="Description">
                  {getFieldDecorator('description', {
                    initialValue: details.role.description,
                    rules: [
                      {
                        max: 1000,
                      },
                    ],
                  })(<TextArea/>)}
                </FormItem>
                <div className={styles['form-actions']}>
                  <Button className="app-btn primary-btn-outline" type="default"
                          onClick={() => this.handleCancel()}>{i18n.t`Cancel`}</Button>
                  <Button className="app-btn primary-btn" type="primary"
                          htmlType="submit">{saveMode === 'add' ? i18n.t`Add` : i18n.t`Edit`}</Button>
                </div>
              </Form>
            </>
          }
          {saveMode !== 'add' &&
          <>
            <div className={styles['role-users']}>
              <h4> {i18n.t`Users`}:</h4>
              <div className={styles['role-users-block']}>
                <div className={styles['role-users-icons']}>
                  {
                    !openAssignUsersToRoleSelect && roleType === ROLE_TYPES[0]
                    &&
                    <button className={styles['plus-btn']} onClick={() => this.handleOpenAssignUsersToRoleSelect()}>
                      <Icons
                        name={'plus'}/></button>
                  }
                  {!!memberList && memberList?.map((member, index) => {const fullName = getUserFullName(member);
                    return (
                      <Popover content={this.userContentPopover(member, index, fullName)}
                               key={`t_${member.id}_${index}`} overlayClassName={styles['role-user-popover']}>
                        <Avatar
                          key={`a_${member.id}_${index}`}
                          src={member.avatar ? `${appUrl}/storage/images/avatars${getResizedImage(member.avatar, 'avatar')}`: ''}
                          icon={!member.avatar ? <UserOutlined/> : ``}
                          alt={fullName}
                        />
                      </Popover>
                    )
                  })}
                </div>
                {openAssignUsersToRoleSelect && roleType === ROLE_TYPES[0] && (
                  <div className={styles['role-users-select']}>
                    <Select
                      mode="multiple"
                      placeholder={i18n.t`Select users`}
                      defaultValue={userIdsHasRoles || []}
                      onChange={(userIds) => this.handleAssignUserToRole(userIds)}
                      optionLabelProp="label"
                      filterOption={false}
                      onSearch={(e) => this.handleSearchUsers(e)}
                    >
                      {userList.map(userItem => {
                        const fullName = getUserFullName(userItem);
                        return (
                          <Option value={userItem.id} label={fullName} key={`u-${userItem.id}`}>
                            <div className="demo-option-label-item">
                              <span role="img" aria-label={fullName}>
                              <Avatar
                                key={`ua_${userItem.id}`}
                                src={userItem.avatar ? `${appUrl}/storage/images/avatars${getResizedImage(userItem.avatar, 'avatar')}`: ''}
                                icon={!userItem.avatar ? <UserOutlined/> : ``}
                                alt={fullName}
                              />
                              </span>
                              {fullName}
                            </div>
                          </Option>)
                      })}
                    </Select>
                    <div className={styles['role-users-actions']}>
                    <Button onClick={() => this.handleAssignUsersToRole()} htmlType={'button'} size={'small'}
                            type={'primary'}
                            disabled={isEqual(assignUserIds, userIdsHasRoles)}
                    >
                      {i18n.t`Add`}
                    </Button>
                    <Button onClick={() => this.handleAssignUsersClose()} htmlType={'button'} size={'small'}>
                      {i18n.t`Cancel`}
                    </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
          }
        </div>
      </>
    )
  }

}

RoleItem.propTypes = {
  details: PropTypes.object
  ,
}


export default RoleItem;
