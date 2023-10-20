import React from "react";
import PropTypes from 'prop-types';

export default function UserDashboard (props) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <path d="M15 16.75V15C15 14.0717 14.6313 13.1815 13.9749 12.5251C13.3185 11.8687 12.4283 11.5 11.5 11.5H4.5C3.57174 11.5 2.6815 11.8687 2.02513 12.5251C1.36875 13.1815 1 14.0717 1 15V16.75" stroke={props.fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 8C9.933 8 11.5 6.433 11.5 4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5C4.5 6.433 6.067 8 8 8Z" stroke={props.fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
UserDashboard.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
UserDashboard.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
