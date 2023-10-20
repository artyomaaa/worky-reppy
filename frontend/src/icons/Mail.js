import React from "react";
import PropTypes from 'prop-types';

export default function Mail(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={props.style}>
      <path d="M10 13.2179C11.841 13.2179 13.3334 11.7256 13.3334 9.8846C13.3334 8.04365 11.841 6.55127 10 6.55127C8.15907 6.55127 6.66669 8.04365 6.66669 9.8846C6.66669 11.7256 8.15907 13.2179 10 13.2179Z" stroke={props.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3333 6.55124V10.7179C13.3333 11.3809 13.5967 12.0168 14.0655 12.4857C14.5344 12.9545 15.1703 13.2179 15.8333 13.2179C16.4963 13.2179 17.1322 12.9545 17.6011 12.4857C18.0699 12.0168 18.3333 11.3809 18.3333 10.7179V9.88457C18.3332 8.00376 17.6968 6.1783 16.5277 4.70502C15.3586 3.23173 13.7254 2.19726 11.8938 1.76982C10.0622 1.34238 8.13991 1.54711 6.43942 2.35071C4.73894 3.15432 3.3603 4.50954 2.52768 6.19601C1.69507 7.88248 1.45744 9.80102 1.85344 11.6397C2.24944 13.4783 3.25578 15.1289 4.70883 16.3231C6.16187 17.5173 7.97616 18.1849 9.85669 18.2172C11.7372 18.2495 13.5734 17.6448 15.0666 16.5012" stroke={props.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
Mail.defaultProps = {
  stroke: '#FFAF00',
  style: {},
};
Mail.propTypes = {
  stroke: PropTypes.string,
  style: PropTypes.object,
};
