import React from "react";
import PropTypes from 'prop-types';

export default function Slack(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0)">
        <path d="M6.63196 9.48828C5.58796 9.48828 4.74121 10.335 4.74121 11.379V16.1085C4.74121 17.1525 5.58796 17.9993 6.63196 17.9993C7.67596 17.9993 8.5227 17.1525 8.5227 16.1085V11.379C8.52195 10.335 7.67521 9.48828 6.63196 9.48828Z" fill="#E91E63"/>
        <path d="M0.0141602 11.3791C0.0141602 12.4238 0.86166 13.2713 1.90641 13.2713C2.95116 13.2713 3.79866 12.4238 3.79866 11.3791V9.48682H1.90791C1.90716 9.48682 1.90716 9.48682 1.90641 9.48682C0.86166 9.48682 0.0141602 10.3343 0.0141602 11.3791Z" fill="#E91E63"/>
        <path d="M6.63473 -0.000976562C6.63398 -0.000976562 6.63323 -0.000976562 6.63248 -0.000976562C5.58773 -0.000976562 4.74023 0.846523 4.74023 1.89127C4.74023 2.93602 5.58773 3.78352 6.63248 3.78352H8.52323V1.89127C8.52323 1.89052 8.52323 1.88902 8.52323 1.88752C8.52248 0.844273 7.67723 -0.000976562 6.63473 -0.000976562Z" fill="#00BCD4"/>
        <path d="M1.89371 8.52742H6.63221C7.67696 8.52742 8.52446 7.67992 8.52446 6.63517C8.52446 5.59042 7.67696 4.74292 6.63221 4.74292H1.89371C0.848965 4.74292 0.00146484 5.59042 0.00146484 6.63517C0.00146484 7.67992 0.848965 8.52742 1.89371 8.52742Z" fill="#00BCD4"/>
        <path d="M16.0926 4.74219C15.0494 4.74219 14.2041 5.58744 14.2041 6.63069V6.63444V8.52669H16.0949C17.1396 8.52669 17.9871 7.67919 17.9871 6.63444C17.9871 5.58969 17.1396 4.74219 16.0949 4.74219C16.0941 4.74219 16.0934 4.74219 16.0926 4.74219Z" fill="#4CAF50"/>
        <path d="M9.48096 1.89173V6.63548C9.48096 7.67948 10.3277 8.52623 11.3717 8.52623C12.4157 8.52623 13.2625 7.67948 13.2625 6.63548V1.89173C13.2625 0.847727 12.4157 0.000976562 11.3717 0.000976562C10.3277 0.000976562 9.48096 0.847727 9.48096 1.89173Z" fill="#4CAF50"/>
        <path d="M13.2615 16.1071C13.2615 15.0631 12.4147 14.2163 11.3707 14.2163H9.47998V16.1086C9.48073 17.1518 10.3267 17.9978 11.3707 17.9978C12.4147 17.9978 13.2615 17.1511 13.2615 16.1071Z" fill="#FF9800"/>
        <path d="M16.1093 9.48682H11.3708C10.326 9.48682 9.47852 10.3343 9.47852 11.3791C9.47852 12.4238 10.326 13.2713 11.3708 13.2713H16.1093C17.154 13.2713 18.0015 12.4238 18.0015 11.3791C18.0015 10.3343 17.154 9.48682 16.1093 9.48682Z" fill="#FF9800"/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="18" height="18" fill="white"/>
        </clipPath>
      </defs>
    </svg>

  )
}

Slack.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Slack.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
