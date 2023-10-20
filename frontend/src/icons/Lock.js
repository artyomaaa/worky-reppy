import React from "react";
import PropTypes from 'prop-types';

export default function Lock(props) {
  return (
    <svg width="20" height="21" viewBox="0 0 20 21" fill="none"  style={props.style}>
      <path d="M16.4167 9.82642H3.58333C2.57081 9.82642 1.75 10.6472 1.75 11.6597V18.0764C1.75 19.0889 2.57081 19.9097 3.58333 19.9097H16.4167C17.4292 19.9097 18.25 19.0889 18.25 18.0764V11.6597C18.25 10.6472 17.4292 9.82642 16.4167 9.82642Z" stroke={props.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.41669 9.82639V6.15973C5.41555 5.02311 5.83678 3.9266 6.59861 3.08309C7.36045 2.23957 8.40853 1.70922 9.5394 1.59499C10.6703 1.48076 11.8032 1.79081 12.7184 2.46493C13.6335 3.13906 14.2655 4.12917 14.4917 5.24306" stroke={props.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
Lock.defaultProps = {
  stroke: '#FADB39',
  style: {},
};
Lock.propTypes = {
  stroke: PropTypes.string,
  style: PropTypes.object,
};
