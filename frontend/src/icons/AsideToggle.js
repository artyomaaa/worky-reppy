import React from "react";
import PropTypes from 'prop-types';

export default function AsideToggle(props) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" style={props.style}>
      <circle cx="15" cy="15" r="13.75" fill="#7C83FF" stroke="white" strokeWidth="2.5"/>
      <g>
        <path d="M12.0479 9.19181L11.6521 9.58488C11.5285 9.70859 11.4604 9.87318 11.4604 10.0491C11.4604 10.2249 11.5285 10.3897 11.6521 10.5134L16.1362 14.9973L11.6471 19.4864C11.5235 19.6099 11.4555 19.7747 11.4555 19.9505C11.4555 20.1263 11.5235 20.2912 11.6471 20.4148L12.0405 20.808C12.2963 21.064 12.713 21.064 12.9688 20.808L18.3328 15.4632C18.4563 15.3397 18.5434 15.1751 18.5434 14.9977L18.5434 14.9957C18.5434 14.8198 18.4562 14.6552 18.3328 14.5317L12.9833 9.19181C12.8598 9.0681 12.6902 9.00019 12.5144 9C12.3385 9 12.1713 9.0681 12.0479 9.19181Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="12" height="12" fill="white" transform="translate(9 21) rotate(-90)"/>
        </clipPath>
      </defs>
    </svg>
  )
}
AsideToggle.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
AsideToggle.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
