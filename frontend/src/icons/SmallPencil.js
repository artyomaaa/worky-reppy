import React from 'react';
import PropTypes from "prop-types";

export default function SmallPencil(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={props.style}>
      <path d="M9.20638 1.65234L12.123 4.56901L4.53971 12.1523H1.62305V9.23568L9.20638 1.65234Z" stroke="#B3B3B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

SmallPencil.defaultProps = {
  style: {}
};
SmallPencil.propTypes = {
  style: PropTypes.object,
};
