import React, {PureComponent} from 'react';
import {withI18n} from '@lingui/react';
import {PERMISSIONS} from 'utils/constant';
import {checkLoggedUserPermission, getResizedImage, getUserFullName} from 'utils';
import store from "store";
import {Link} from "umi";
import styles from './Card.less';
import Icons from 'icons/icon';
import {Dropdown, Menu, Modal, Tooltip} from 'antd';
import projectCardStyles from '../../projects/components/Card.less'
import moment from 'utils/moment'
import {appUrl} from 'utils/config';
import Avatar from "../../../shared/UIElements/Avatar";
import Span from "./Span";
import {EditItemBtn, RemoveItemBtn} from "../../tasks/components/TasksTable/TaskActionsBtns";



const {confirm} = Modal;


@withI18n()
class Card extends PureComponent {

  #textRef = React.createRef();
  getBadgeType (status) {
    return status ? 'active' : 'inactive'
  }
  textEllipsis (el) {
    const p = el;
    const divHeight = el.parentElement.getBoundingClientRect().height;
    while (p.scrollHeight > divHeight) {
      p.innerText = p.innerText.replace(/\W*\s(\S)*$/, '...')
    }
  }
  componentDidMount() {
    this.#textRef.current && this.textEllipsis(this.#textRef.current)
  }

  attachedUsers (users) {
    return users.map((u, index) => {
      return index < 3 ? (
        <div key={u.id} className={styles['avatar-badge']}>
          <span className={styles['users-tooltip']}>{getUserFullName(u)}</span>
          <Avatar src={`${appUrl}storage/images/avatars` + getResizedImage(u.avatar, 'avatar')}/>
        </div>
      ) : '';
    })
  }

  getProjectsList = (projects) => {
    if (projects !== undefined) {
      return projects.map((prjct, index) => index < 2 ?
        <h5 key={index} className={styles['project-container']}>
            <span className={styles['project-icon']}
                  style={{
                    backgroundColor: prjct.color ?
                      `#${prjct.color?.charAt(0) === '#' ? prjct.color.substring(1) : prjct.color}` :
                      `#cccccc`
                  }}>
            </span>
            <span className={styles['project-name']}>
                      {(prjct.name && prjct.name)}
            </span>
        </h5>
        : null)
    }
  }

  projectListToolTipContent = (projects) => {
    return projects && projects.map((project, index) => index > 1 && `${project.name}${projects.length - 1 !== index ? ', ' : ''}`)
  }

  userTooltipContent = (users) => {
    return users && users.map((user, index) => index > 2 && `${getUserFullName(user)}${users.length - 1 !== index ? ', ' : ''}`)
  }

  render() {
    const canEditTeams = checkLoggedUserPermission(PERMISSIONS.EDIT_TEAMS.name, PERMISSIONS.EDIT_TEAMS.guard_name),
      canEditSelfTeams = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_TEAMS.name, PERMISSIONS.EDIT_SELF_TEAMS.guard_name),
      canDeleteTeams = checkLoggedUserPermission(PERMISSIONS.DELETE_TEAMS.name, PERMISSIONS.DELETE_TEAMS.guard_name),
      canDeleteSelfTeams = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_TEAMS.name, PERMISSIONS.DELETE_SELF_TEAMS.guard_name),
      canViewTeamDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_TEAM_DETAILS.name, PERMISSIONS.VIEW_TEAM_DETAILS.guard_name),
      canViewSelfTeamDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_TEAM_DETAILS.name, PERMISSIONS.VIEW_SELF_TEAM_DETAILS.guard_name),
      {data, onDeleteItem, onEditItem, i18n} = this.props,
      {created_at, id, members, name, projects, status,} = data,
      loggedUser = store.get('user'),
      isOwnerPage = !!members.find((member) => member.id === loggedUser.id),
      ClickableLink = canViewTeamDetails || (isOwnerPage && canViewSelfTeamDetails) ? Link : Span;

    return (
      <div className={styles['team-card_wrap']}>
        <div className={styles['team-card__title']}>
          <h4 className={styles['team-card__titles_heading']}>
            <ClickableLink to={`teams/${id}`}>
              {name}
            </ClickableLink>
          </h4>
          <>
            <Dropdown trigger={['click']} placement="bottomLeft" className={projectCardStyles['dots']} overlay={
              <Menu className="dots-dropdown">
                {(canEditTeams || (isOwnerPage && canEditSelfTeams)) && <Menu.Item>{EditItemBtn(data, onEditItem, i18n)}</Menu.Item>}
                {(canDeleteTeams || (isOwnerPage && canDeleteSelfTeams)) && <Menu.Item>{RemoveItemBtn(id, onDeleteItem, i18n)}</Menu.Item>}
              </Menu>
            }>
              <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <Icons name="dots"/>
              </a>
            </Dropdown>
          </>
          <div className={styles['action-icons']}>
            {(canEditTeams || (isOwnerPage && canEditSelfTeams)) && <> {EditItemBtn(data, onEditItem, i18n)} </>}
            {(canDeleteTeams || (isOwnerPage && canDeleteSelfTeams)) && <> {RemoveItemBtn(id, onDeleteItem, i18n)} </>}
          </div>
        </div>
        <ClickableLink className={styles['team-card__body']} style={{flex: 1}} to={`teams/${id}`}>
        <p
          className={styles['team-card__status']}
          style={{backgroundColor: status === 1 ? '#29CD39' : '#FA3B4B'}}
        >
          {status === 1 ? 'active' : 'inactive'}
        </p>
        <div className={styles['team-card__project']}>
          <p className={styles['team-card__project_label']}>
            Project
          </p>
          <div className={styles['team-card__project_list']}>
            {!!projects.length &&
              this.getProjectsList(projects)
            }
            <Tooltip
              placement="rightBottom"
              title={this.projectListToolTipContent(projects)}
              overlayClassName={styles['userTooltip']}
            >
              <p>
                {projects.length > 2 ? `+ ${projects.length - 2} more` : ''}
              </p>
            </Tooltip>
          </div>
        </div>
        <div className={styles['team-card__members']}>
          {this.attachedUsers(members)}
          <Tooltip
            placement='rightBottom'
            title={this.userTooltipContent(members)}
            overlayClassName={styles['userTooltip']}
          >
          <p>{(members.length > 3 ? ('+ ' + (members.length - 3) + ' more') : '' )}</p>
          </Tooltip>
        </div>
        <div className={styles['team-card__created']}>
          <Icons name="calendar" style={{marginRight: '10px', marginTop: '-2px'}}/>
          Created at:
          <b>{moment(created_at).format('DD MMM YYYY')}</b>
        </div>
        </ClickableLink>
      </div>
    );
  }
}

export default Card;
