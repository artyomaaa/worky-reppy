import React from "react";
import PropTypes from 'prop-types';

export default function Dots(props) {
  return (
    <svg width="4" height="20" viewBox="0 0 4 20" fill="none" style={props.style}>
      <circle cx="2" cy="2" r="2" fill="#C4C4C4"/>
      <circle cx="2" cy="10" r="2" fill="#C4C4C4"/>
      <circle cx="2" cy="18" r="2" fill="#C4C4C4"/>
    </svg>

  )
}
Dots.defaultProps = {
  fill: '#C4C4C4',
  fillOpacity: .28,
  style: {}
};
Dots.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
