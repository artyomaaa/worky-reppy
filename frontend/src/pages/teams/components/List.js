import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {Modal, Tag, Row, Col} from 'antd';
import { Trans, withI18n } from '@lingui/react';
import Link from 'umi/link';
import styles from './List.less';
import {checkLoggedUserPermission, getStatusTextColor} from 'utils';
import store from "store";
import moment from 'utils/moment';
import Card from "./Card";
import {PERMISSIONS} from 'utils/constant'

const { confirm } = Modal;
const dateFormat = 'DD MMM, Y';

@withI18n()
class List extends PureComponent {
  handleMenuClick = (record, e) => {
    const { onDeleteItem, onEditItem, i18n } = this.props;

    if (e.key === '1') {
      onEditItem(record)
    } else if (e.key === '2') {
      confirm({
        title: i18n.t`Are you sure delete this team?`,
        okText:i18n.t`OK`,
        onOk() {
          onDeleteItem(record.id)
        },
      })
    }
  };

  getPermissions = () => {
    const loggedUser = store.get('user'),
      canViewTeams = checkLoggedUserPermission(PERMISSIONS.VIEW_TEAMS.name, PERMISSIONS.VIEW_TEAMS.guard_name),
      canViewSelfTeams = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_TEAMS.name, PERMISSIONS.VIEW_SELF_TEAMS.guard_name);
    return {
      canViewTeams,
      canViewSelfTeams,
      loggedUser,
    }
  }

  render() {
    const {onDeleteItem, onEditItem, i18n, dataSource, ...tableProps} = this.props,
      userTimeOffset = store.get('user').time_offset,
      permissions = this.getPermissions(),
      loggedUserId = permissions.loggedUser.id,
      isOwnerPage = dataSource?.some(data => data.members.some(member => member.id === loggedUserId));

    const columns = [
      {
        title: <Trans>Name</Trans>,
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <Link to={`teams/${record.id}`} style={{color: record.color}}>{text}</Link>,
      },
      {
        title: <Trans>Description</Trans>,
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: <Trans>Project</Trans>,
        dataIndex: 'project',
        key: 'project',
        render: (text, record) => record['projects'].map(item => {
          return <div key={item['id']} style={{color: item['color']}}>{item['name']}</div>
        })
      },
      {
        title:  <Trans>Status</Trans>,
        dataIndex: 'status',
        key: 'status',
        render: status => {
          return (
            <span>
                <Tag color={getStatusTextColor(status).color} key={status}>
                    {getStatusTextColor(status).text}
                </Tag>
            </span>
          )
        },
      },
      {
        title: <Trans>Members</Trans>,
        dataIndex: 'members',
        key: 'members',
        render: members => {
          const team = {};
          members.forEach(member => {
            if(!(member['role_name'] in team)) {
              team[member['role_name']] = 1;
            } else {
              team[member['role_name']] += 1;
            }
          });
          return (
            Object.keys(team).map(member => {
              return <span>{team[member]}{member}</span>
            })
          )
        }
      },
      {
        title: <Trans>CreatedAt</Trans>,
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date, record) => {
          return moment.parseZone(date).utcOffset(userTimeOffset).format(dateFormat);
        }
      },
    ];

    return (
      <Row className={styles['team-list__wrap']}>
        {(permissions.canViewTeams || (isOwnerPage && permissions.canViewSelfTeams)) &&
          dataSource.map(
            (card, index) => (
              <Col className={styles['team-card']} md={12} xs={24} sm={12} xxl={6} xl={8} key={index}>
                <Card data={card} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
              </Col>
            )
          )
        }
      </Row>
    )
  }
}

List.propTypes = {
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  location: PropTypes.object,
};

export default List
