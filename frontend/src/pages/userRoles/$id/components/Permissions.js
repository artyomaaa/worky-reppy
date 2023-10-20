import React, {PureComponent} from 'react';
import {Collapse, Checkbox, Select, Modal} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import Icons from 'icons/icon';
// import PropTypes from 'prop-types';
import {withI18n} from '@lingui/react';
import store from 'store';
import {groupBy, keys} from 'lodash';
import styles from "./Permissions.less";

const {Panel} = Collapse;
const {Option} = Select;
const {confirm} = Modal;

@withI18n()
class Permissions extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userTimeOffset: store.get('user').time_offset || '+00:00',
      roleValue: '',
    };
  }

  handleChangeCollapse(key) {
    console.log(key);
  }

  handleSetDefaultPermission(role_name) {
    console.log('role_name', role_name);
    if (!role_name) return;

    const _self = this;

    const {details, i18n} = this.props;
    const confirmMsg = i18n.t`Do you really want to set` + ` ` + i18n.t`${role_name}` + ` ` + i18n.t`permissions`;
    confirm({
      title: i18n.t`Please confirm`,
      content: confirmMsg,
      icon: <ExclamationCircleOutlined/>,
      okText: i18n.t`Yes, I am sure`,
      okType: 'danger',
      onOk() {
        details.onAddDefaultPermissions({
          role_name: role_name,
        });
        _self.setState({
          roleValue: role_name
        });
      },
      onCancel() {
        _self.setState({
          roleValue: ''
        });
      },
    });
  }

  handleChangePermission(e, permission) {
    const {details} = this.props;
    details.onSave({
      permission: permission.name,
      guard_name: permission.guard_name,
      action: e.target.checked ? 'add' : 'remove',
    });
  }

  render() {
    const {i18n, details} = this.props;
    const {selectedPermissions = []} = details;
    const dangerPermissions = ['Administrators', 'Roles Permissions'];

    const groupedPermissions = groupBy(details.permissionList, 'group');
    // TODO for now no need to show Administrator permissions
    delete groupedPermissions['Administrators'];
    delete groupedPermissions['Roles Permissions'];

    const defaultActiveKey = keys(groupedPermissions);
    // // no need to open by default below sections
    // let index = defaultActiveKey.indexOf('Administrators');
    // if (index > -1) {
    //   defaultActiveKey.splice(index, 1);
    // }
    // index = defaultActiveKey.indexOf('Roles Permissions');
    // if (index > -1) {
    //   defaultActiveKey.splice(index, 1);
    // }

    return (
      <>
        <div className={styles['role-permissions']}>
          <h1>{i18n.t`Permissions`}</h1>
          <div className={styles['role-default-select']}>
            <Select
              className="select-global-md single-select font-medium"
              value={this.state.roleValue}
              onChange={(e) => this.handleSetDefaultPermission(e)}
              suffixIcon={
                <Icons name="arrowdown2" fill="#B3B3B3"/>
              }
            >
              <Option value="">{i18n.t`Set Default Permissions`}</Option>
              <Option value="Staff">{i18n.t`Staff`}</Option>
              <Option value="Manager">{i18n.t`Manager`}</Option>
              <Option value="Human Resources Manager">{i18n.t`Human Resources Manager`}</Option>
              <Option value="Administrator">{i18n.t`Administrator`}</Option>
            </Select>
          </div>
          <Collapse
            expandIconPosition={'right'}
            onChange={this.handleChangeCollapse}>
            {Object.keys(groupedPermissions).map(groupName => {
              const _groupName = dangerPermissions.includes(groupName) ? `${groupName} (${i18n.t`Danger section please be careful`})` : groupName;
              const groupedPermissionList = groupedPermissions[groupName];
              return (
                <Panel header={_groupName} key={groupName}>
                  {groupedPermissionList.map(permission => {
                    const title = permission.description || permission.name;
                    const checked = selectedPermissions.includes(permission.name);
                    return (
                      <div key={`${groupName}_${permission.name}`}>
                        <Checkbox
                          key={`${permission.name}_${permission.guard_name}`}
                          indeterminate={this.state.indeterminate}
                          onChange={(e) => this.handleChangePermission(e, permission)}
                          checked={checked}
                        >
                          {title}
                        </Checkbox>
                      </div>
                    )
                  })}
                </Panel>
              )
            })}
          </Collapse>
        </div>
      </>
    )
  }
}

// Permissions.propTypes = {
//   details: PropTypes.object,
// };

export default Permissions;
