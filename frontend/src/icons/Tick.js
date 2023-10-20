import React from "react";
import PropTypes from 'prop-types';

export default function Tick(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={props.style}>
      <path d="M10 0C4.48578 0 0 4.48578 0 10C0 15.5142 4.48578 20 10 20C15.5142 20 20 15.5142 20 10C20 4.48578 15.5142 0 10 0Z" fill="#F8F8FB"/>
      <path d="M15.0682 7.88074L9.65152 13.2973C9.48901 13.4598 9.2757 13.5416 9.06238 13.5416C8.84906 13.5416 8.63574 13.4598 8.47324 13.2973L5.76495 10.589C5.43903 10.2632 5.43903 9.73651 5.76495 9.41074C6.09073 9.08481 6.61731 9.08481 6.94324 9.41074L9.06238 11.5299L13.89 6.70245C14.2157 6.37653 14.7423 6.37653 15.0682 6.70245C15.394 7.02823 15.394 7.55481 15.0682 7.88074Z" fill="#49C39E"/>
    </svg>
  )
}
Tick.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Tick.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
