import React from "react";
import PropTypes from 'prop-types';

export default function Facebook(props) {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.99764 2.98875H9.64089V0.12675C9.35739 0.08775 8.38239 0 7.24689 0C2.04789 0 3.46239 5.8875 3.25539 6.75H0.640137V9.9495H3.25464V18H6.46014V9.95025H8.96889L9.36714 6.75075H6.45939C6.60039 4.63275 5.88864 2.98875 7.99764 2.98875Z"
        fill="#3B5999"/>
    </svg>
  )
}
Facebook.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Facebook.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
