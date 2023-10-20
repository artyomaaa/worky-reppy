import React from "react";
import PropTypes from 'prop-types';

export default function ArrowUp (props) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={props.style}>
      <g>
        <path d="M12.5 9.19141L6.49998 3.21093L0.5 9.19141L12.5 9.19141Z" fill={props.fill}/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="12" height="12" fill="white" transform="translate(12.5 12.2012) rotate(180)"/>
        </clipPath>
      </defs>
    </svg>
  )
}
ArrowUp.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
ArrowUp.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
