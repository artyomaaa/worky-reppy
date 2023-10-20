import React from "react";
import PropTypes from 'prop-types';

export default function MinusGradient() {
  return (
    <svg width="31" height="7" viewBox="0 0 31 7" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.49099 0H27.509C29.4174 0 31 1.58258 31 3.49099C31 5.3994 29.4174 6.98198 27.509 6.98198H3.49099C1.58258 6.98198 0 5.3994 0 3.49099C0 1.58258 1.58258 0 3.49099 0Z" fill="url(#paint0_linear)"/>
      <defs>
        <linearGradient id="paint0_linear" x1="15.5" y1="0" x2="15.5" y2="6.98198" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6E73F0"/>
          <stop offset="1" stopColor="#9EA2FE"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
MinusGradient.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
MinusGradient.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
