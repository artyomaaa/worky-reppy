import React from "react";
import PropTypes from 'prop-types';

export default function PlusGradient() {
  return (
    <svg width="31" height="33" viewBox="0 0 31 33" fill="none">
      <path d="M12.1729 3.49366L12.1729 12.959L3.2822 12.959C3.2822 12.959 -0.0338606 12.8719 0.000260801 16.3564C0.0343822 19.8409 3.2822 20.0418 3.2822 20.0418L12.1729 20.0418L12.1729 29.5066C12.1729 29.5066 12.1882 32.9841 15.4549 32.9999C18.7219 33.0164 18.8266 29.5066 18.8266 29.5066L18.8266 20.0418L27.718 20.0418C27.718 20.0418 30.9847 20.0257 30.9999 16.5481C31.0152 13.0703 27.718 12.959 27.718 12.959L18.8266 12.959L18.8266 3.49366C18.8266 3.49366 18.9078 -0.0363473 15.6344 0.000281604C12.3614 0.0369105 12.1729 3.49366 12.1729 3.49366Z" fill="url(#paint0_linear)"/>
      <defs>
        <linearGradient id="paint0_linear" x1="-7.21238e-07" y1="16.5" x2="31" y2="16.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6B71EF"/>
          <stop offset="1" stopColor="#A4A8FF"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
PlusGradient.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
PlusGradient.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
