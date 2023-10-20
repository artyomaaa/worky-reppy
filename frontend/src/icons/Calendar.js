import React from "react";
import PropTypes from 'prop-types';

export default function Calendar (props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 22 22" fill="none" style={props.style}>
      <path d="M18.4448 2.2H17.6V1.1C17.6 0.808262 17.4841 0.528473 17.2778 0.322183C17.0715 0.115893 16.7917 0 16.5 0C16.2083 0 15.9285 0.115893 15.7222 0.322183C15.5159 0.528473 15.4 0.808262 15.4 1.1V2.2H6.6V1.1C6.6 0.808262 6.48411 0.528473 6.27782 0.322183C6.07153 0.115893 5.79174 0 5.5 0C5.20826 0 4.92847 0.115893 4.72218 0.322183C4.51589 0.528473 4.4 0.808262 4.4 1.1V2.2H3.5552C2.6123 2.2 1.70802 2.57456 1.04129 3.24129C0.374565 3.90802 0 4.8123 0 5.7552L0 18.4448C0 19.3877 0.374565 20.292 1.04129 20.9587C1.70802 21.6254 2.6123 22 3.5552 22H18.4448C19.3877 22 20.292 21.6254 20.9587 20.9587C21.6254 20.292 22 19.3877 22 18.4448V5.7552C22 4.8123 21.6254 3.90802 20.9587 3.24129C20.292 2.57456 19.3877 2.2 18.4448 2.2ZM19.8 18.4448C19.8 18.8042 19.6572 19.1489 19.4031 19.4031C19.1489 19.6572 18.8042 19.8 18.4448 19.8H3.5552C3.19578 19.8 2.85108 19.6572 2.59693 19.4031C2.34278 19.1489 2.2 18.8042 2.2 18.4448V5.7552C2.2 5.39578 2.34278 5.05108 2.59693 4.79693C2.85108 4.54278 3.19578 4.4 3.5552 4.4H4.4V5.5C4.4 5.79174 4.51589 6.07153 4.72218 6.27782C4.92847 6.48411 5.20826 6.6 5.5 6.6C5.79174 6.6 6.07153 6.48411 6.27782 6.27782C6.48411 6.07153 6.6 5.79174 6.6 5.5V4.4H15.4V5.5C15.4 5.79174 15.5159 6.07153 15.7222 6.27782C15.9285 6.48411 16.2083 6.6 16.5 6.6C16.7917 6.6 17.0715 6.48411 17.2778 6.27782C17.4841 6.07153 17.6 5.79174 17.6 5.5V4.4H18.4448C18.8042 4.4 19.1489 4.54278 19.4031 4.79693C19.6572 5.05108 19.8 5.39578 19.8 5.7552V18.4448Z" fill={props.fill}/>
      <path d="M10.9999 12.32C11.6074 12.32 12.0999 11.8275 12.0999 11.22C12.0999 10.6125 11.6074 10.12 10.9999 10.12C10.3924 10.12 9.8999 10.6125 9.8999 11.22C9.8999 11.8275 10.3924 12.32 10.9999 12.32Z" fill={props.fill}/>
      <path d="M10.9999 16.28C11.6074 16.28 12.0999 15.7875 12.0999 15.18C12.0999 14.5725 11.6074 14.08 10.9999 14.08C10.3924 14.08 9.8999 14.5725 9.8999 15.18C9.8999 15.7875 10.3924 16.28 10.9999 16.28Z" fill={props.fill}/>
      <path d="M7.03994 16.28C7.64746 16.28 8.13994 15.7875 8.13994 15.18C8.13994 14.5725 7.64746 14.08 7.03994 14.08C6.43243 14.08 5.93994 14.5725 5.93994 15.18C5.93994 15.7875 6.43243 16.28 7.03994 16.28Z" fill={props.fill}/>
      <path d="M14.9601 12.32C15.5676 12.32 16.0601 11.8275 16.0601 11.22C16.0601 10.6125 15.5676 10.12 14.9601 10.12C14.3526 10.12 13.8601 10.6125 13.8601 11.22C13.8601 11.8275 14.3526 12.32 14.9601 12.32Z" fill={props.fill}/>
      <path d="M14.9601 16.28C15.5676 16.28 16.0601 15.7875 16.0601 15.18C16.0601 14.5725 15.5676 14.08 14.9601 14.08C14.3526 14.08 13.8601 14.5725 13.8601 15.18C13.8601 15.7875 14.3526 16.28 14.9601 16.28Z" fill={props.fill}/>
    </svg>
  )
}
Calendar.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Calendar.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
