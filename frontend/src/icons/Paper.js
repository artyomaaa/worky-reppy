import React from "react";
import PropTypes from 'prop-types';

export default function Paper(props) {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
      <path
        d="M12 5.705C11.9922 5.6361 11.9771 5.56822 11.955 5.5025V5.435C11.9189 5.35789 11.8708 5.287 11.8125 5.225L7.3125 0.725C7.2505 0.666662 7.17961 0.618561 7.1025 0.5825H7.035C6.95881 0.538806 6.87467 0.510758 6.7875 0.5H2.25C1.65326 0.5 1.08097 0.737053 0.65901 1.15901C0.237053 1.58097 0 2.15326 0 2.75V13.25C0 13.8467 0.237053 14.419 0.65901 14.841C1.08097 15.2629 1.65326 15.5 2.25 15.5H9.75C10.3467 15.5 10.919 15.2629 11.341 14.841C11.7629 14.419 12 13.8467 12 13.25V5.75C12 5.75 12 5.75 12 5.705ZM7.5 3.0575L9.4425 5H8.25C8.05109 5 7.86032 4.92098 7.71967 4.78033C7.57902 4.63968 7.5 4.44891 7.5 4.25V3.0575ZM10.5 13.25C10.5 13.4489 10.421 13.6397 10.2803 13.7803C10.1397 13.921 9.94891 14 9.75 14H2.25C2.05109 14 1.86032 13.921 1.71967 13.7803C1.57902 13.6397 1.5 13.4489 1.5 13.25V2.75C1.5 2.55109 1.57902 2.36032 1.71967 2.21967C1.86032 2.07902 2.05109 2 2.25 2H6V4.25C6 4.84674 6.23705 5.41903 6.65901 5.84099C7.08097 6.26295 7.65326 6.5 8.25 6.5H10.5V13.25Z"
        fill="#4A54FF"/>
    </svg>
  )
}
Paper.defaultProps = {
  fill: '#4A54FF',
  style: {},
};
Paper.propTypes = {
  fill: PropTypes.string,
  style: PropTypes.object,
};
