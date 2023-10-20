import React from "react";
import PropTypes from 'prop-types';

export default function Upload (props) {
  return (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.355 6.03502C18.675 2.595 15.64 0 12 0C9.11002 0 6.60502 1.64002 5.34998 4.035C2.34502 4.36003 0 6.90501 0 10C0 13.315 2.685 16 6 16H19C21.76 16 24 13.76 24 11C24 8.36001 21.945 6.22003 19.355 6.03502ZM14 9V13H10V9H7.00003L12 4.00003L17 9.00005H14V9Z" fill="#B3B3B3"/>
  </svg>
)
}
Upload.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Upload.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
