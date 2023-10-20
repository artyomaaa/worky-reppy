import React from "react";
import PropTypes from 'prop-types';

export default function Shared(props) {
  return (
    <svg className="shared-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" style={props.style}>
      <path d="M14.5 8C14.5 8 11.6 12 8 12C4.4 12 1.5 8 1.5 8C1.5 8 4.4 4 8 4C11.6 4 14.5 8 14.5 8Z" stroke="#B3B3B3" strokeMiterlimit="10" strokeLinejoin="round"/>
      <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#B3B3B3" strokeMiterlimit="10" strokeLinejoin="round"/>
    </svg>
  )
}
Shared.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Shared.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
