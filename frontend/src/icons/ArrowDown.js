import React from "react";
import PropTypes from 'prop-types';

export default function ArrowDown (props) {
  return (
    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={props.style}>
      <path d="M0 0.00985718L6.00002 5.99033L12 0.00985718H0Z" fill={props.fill}/>
    </svg>
  )
}
ArrowDown.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
ArrowDown.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
