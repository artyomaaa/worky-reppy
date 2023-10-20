import React from 'react';
import PropTypes from 'prop-types';
import Icons from 'icons/icon';
import styles from "./style.less";
import {withI18n} from "@lingui/react";

@withI18n()
class Item extends React.Component {
  state = {};

  activeLinkClick = (e) => {
    const {closedModal} = this.props;
    const {switchKey} = this.props.data;
    e.stopPropagation();
    this.props.changeTab(switchKey);
    closedModal && closedModal();
  }

  render () {
    const {activeLink, i18n} = this.props;
    const {icon, text, switchKey, iconColor} = this.props.data;
    return (
      <div className={`${styles['every-link']} ${activeLink === switchKey ? styles['active-link'] : ''}`} onClick={this.activeLinkClick}>
        <span>
          <Icons name={icon} fill={iconColor}/>
        </span>
        <p>{i18n._(text)}</p>
      </div>
    )
  }
}
Item.propTypes = {
  changeTab: PropTypes.func,
  data: PropTypes.object,
  activeLink: PropTypes.string,
};
export default Item;
