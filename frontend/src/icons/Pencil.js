import React from "react";
import PropTypes from 'prop-types';

export default function Pencil (props) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={props.style}>
      <path d="M8.83333 1L11.75 3.91667L4.16667 11.5H1.25V8.58333L8.83333 1Z" stroke={props.stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
Pencil.defaultProps = {
  stroke: '#353FDF',
  style: {}
};
Pencil.propTypes = {
  style: PropTypes.object,
  stroke: PropTypes.string
};
