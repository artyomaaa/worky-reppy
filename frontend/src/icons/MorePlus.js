import React from "react";
import PropTypes from 'prop-types';

export default function MorePlus(props) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path
        d="M13.4583 2.125H3.54167C2.75926 2.125 2.125 2.75926 2.125 3.54167V13.4583C2.125 14.2407 2.75926 14.875 3.54167 14.875H13.4583C14.2407 14.875 14.875 14.2407 14.875 13.4583V3.54167C14.875 2.75926 14.2407 2.125 13.4583 2.125Z"
        stroke="#4A54FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 5.66797V11.3346" stroke="#4A54FF" strokeWidth="1.5" strokeLinejoin="round"
            strokeLinejoin="round"/>
      <path d="M5.66602 8.5H11.3327" stroke="#4A54FF" strokeWidth="1.5" strokeLinejoin="round"
            strokeLinejoin="round"/>
    </svg>
  )
}
MorePlus.defaultProps = {
  stroke: '#4A54FF',
  style: {},
};
MorePlus.propTypes = {
  stroke: PropTypes.string,
  style: PropTypes.object,
};
