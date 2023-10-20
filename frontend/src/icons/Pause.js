import React from "react";
import PropTypes from 'prop-types';

export default function Pause(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5.6 0H0.8C0.3584 0 0 0.3584 0 0.8V15.2C0 15.6416 0.3584 16 0.8 16H5.6C6.0416 16 6.4 15.6416 6.4 15.2V0.8C6.4 0.3584 6.0416 0 5.6 0Z" fill={props.fill}/>
      <path d="M15.1996 0H10.3996C9.95801 0 9.59961 0.3584 9.59961 0.8V15.2C9.59961 15.6416 9.95801 16 10.3996 16H15.1996C15.6412 16 15.9996 15.6416 15.9996 15.2V0.8C15.9996 0.3584 15.6412 0 15.1996 0Z" fill={props.fill}/>
    </svg>
  )
}
Pause.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Pause.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
