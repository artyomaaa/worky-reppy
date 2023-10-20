import React, {PureComponent} from 'react';
import {withI18n} from "@lingui/react";
import PropTypes from 'prop-types';
import styles from './Card.less';
import Icons from 'icons/icon';
import moment from 'utils/moment';
import Avatar from '../../../shared/UIElements/Avatar';
import {appUrl} from 'utils/config';
import {PERMISSIONS} from 'utils/constant';
import {checkLoggedUserPermission} from 'utils';
import {Dropdown, Menu, Modal, Tooltip} from "antd";
import Link from "umi/link";
import {getResizedImage, getUserFullName} from 'utils';
import {EditItemBtn, RemoveItemBtn} from "../../tasks/components/TasksTable/TaskActionsBtns";

const {confirm} = Modal;

@withI18n()
class Card extends PureComponent {
  #textRef = React.createRef();

  getBadgeType(status) {
    return status ? 'active' : 'inactive'
  }

  textEllipsis(el) {
    const p = el;
    const divHeight = el.parentElement.getBoundingClientRect().height;
    while (p.scrollHeight > divHeight) {
      p.innerText = p.innerText.replace(/\W*\s(\S)*$/, '...')
    }
  }

  componentDidMount() {
    this.#textRef.current && this.textEllipsis(this.#textRef.current)
  }

  getTechnologies = (technologies) => {
    let technologiesArray = technologies.map(tec => {
      return tec.name;
    });

    let indexNum = this.props.screenWidth > 425 ? 3 : 2;

    if (technologiesArray !== undefined) {
        return technologiesArray.map((tec, index) => index < indexNum ?
          <div key={`${tec}${index}`} className={styles['tec-badges']}>{tec}</div>
          : null)
    }
  }

  attachedUsers = (users) => {
    return users.map((u, index) => {
      return index < 3 ? (
        <div key={`${u.id}${index}`} className={styles['avatar-badge']}>
          <span className={styles['users-tooltip']}>{getUserFullName(u)}</span>
          <Avatar src={`${appUrl}storage/images/avatars` + getResizedImage(u.avatar)}/>
        </div>
      ) : '';
    })
  }

  tooltipContent = (items) => {
    const indexNum = this.props.screenWidth > 420 ? 2 : 1;
    return items && items.map((item, index) => index > indexNum && `${item.name}${items.length - 1 !== index ? ', ' : ''}`)
  }

  userTooltipContent = (users) => {
    return users && users.map((user, index) => index > 2 && `${getUserFullName(user)}${users.length - 1 !== index ? ', ' : ''}`)
  }

  render() {
    const {data, onDeleteItem, onEditItem, i18n, screenWidth} = this.props;
    const {id, color, name, status, description, project_technologies, created_at, attached_users} = this.props.data;
    let plusMoreNumber = screenWidth > 425 ? 3 : 2;
    const canEditProjects = checkLoggedUserPermission(PERMISSIONS.EDIT_PROJECTS.name, PERMISSIONS.EDIT_PROJECTS.guard_name);
    const canDeleteProjects = checkLoggedUserPermission(PERMISSIONS.DELETE_PROJECTS.name, PERMISSIONS.DELETE_PROJECTS.guard_name);

    return (
      <div className={styles['card-wrap']}>
        <div className={styles['card-wrap_title']}>
          <Link to={`projects/${id}`} className={styles['card-wrap_title_label']}>
            <h4 title={name}>
              <span style={{backgroundColor: `#${color?.charAt(0) === '#' ? color.substring(1) : color}`}}></span>
              {name.length >= 22 ? name.slice(0, 22) + '...' : name}
            </h4>
          </Link>
          {(canEditProjects || canDeleteProjects) &&
            <Dropdown trigger={['click']} placement="bottomLeft" className={styles['dots']} overlay={
              <Menu className="dots-dropdown">
                {canEditProjects && <Menu.Item>{EditItemBtn(data, onEditItem, i18n)}</Menu.Item>}
                {canDeleteProjects && <Menu.Item>{RemoveItemBtn(id, onDeleteItem, i18n)}</Menu.Item>}
              </Menu>}>
              <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <Icons name="dots"/>
              </a>
            </Dropdown>
          }
          {(canEditProjects || canDeleteProjects) &&
            <div className={styles['action-icons']}>
              {canEditProjects &&
                <>{EditItemBtn(data, onEditItem, i18n)}</>
              }
              {canDeleteProjects &&
                <>{RemoveItemBtn(id, onDeleteItem, i18n)}</>
              }
            </div>
          }
        </div>
        <Link to={`projects/${id}`}>
          <p>
            <span
              className={`${styles[this.getBadgeType(status)]} ${styles['badge']}`}>{status ? 'Active' : 'Inactive'}</span>
          </p>
          <div className={styles['technologies']}>
            <h4>Technologies</h4>
            <div className={styles['tech-row']}>
              {this.getTechnologies(project_technologies)}
              <Tooltip
                placement='topRight'
                title={this.tooltipContent(project_technologies)}
                overlayClassName='techTooltip'
                >
                <p>{project_technologies.length > plusMoreNumber ? `+ ${project_technologies.length - plusMoreNumber} more` : ''}</p>
              </Tooltip>
            </div>
          </div>
          <div className={styles['attached_users']}>
            {this.attachedUsers(attached_users)}
            <Tooltip
              placement='topRight'
              title={this.userTooltipContent(attached_users)}
              overlayClassName='userTooltip'
             >
              <p>{attached_users.length > 3 ? `+ ${attached_users.length - 3} more` : ''}</p>
            </Tooltip>
          </div>
          <div className={styles['created_at']}>
            <Icons name="calendar" style={{marginRight: '10px', marginTop: '-2px'}}/>
            Created at:
            <b>{moment(created_at).format('DD MMM YYYY')}</b>
          </div>
        </Link>
      </div>
    );
  }
}

Card.propTypes = {
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  data: PropTypes.object,
};
export default Card;
