import React from "react";
import PropTypes from 'prop-types';

export default function Plus(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={props.style}>
      <path d="M10 4.16797V15.8346" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            fill={props.fill}/>
      <path d="M4.16602 10H15.8327" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            fill={props.fill}/>
    </svg>
  )
}
Plus.defaultProps = {
  fill: '#fff',
  style: {}
};
Plus.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
