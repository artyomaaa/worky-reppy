import React from "react";
import PropTypes from 'prop-types';

export default function Dashboard(props) {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" style={props.style}>
      <path
        className="stroke"
        d="M10.5 3.91113H3.5V10.9111H10.5V3.91113Z"
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        strokeLinecap={props.strokeLinecap}
        strokeLinejoin={props.strokeLinecap}/>
      <path
        className="stroke"
        d="M21.5 3.91113H14.5V10.9111H21.5V3.91113Z"
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        strokeLinecap={props.strokeLinecap}
        strokeLinejoin={props.strokeLinecap}/>
      <path
        className="stroke"
        d="M21.5 14.9111H14.5V21.9111H21.5V14.9111Z"
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        strokeLinecap={props.strokeLinecap}
        strokeLinejoin={props.strokeLinecap}/>
      <path
        className="stroke"
        d="M10.5 14.9111H3.5V21.9111H10.5V14.9111Z"
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        strokeLinecap={props.strokeLinecap}
        strokeLinejoin={props.strokeLinecap}/>
    </svg>
  )
}
Dashboard.defaultProps = {
  stroke: '#B3B3B3',
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
  style: {}
};
Dashboard.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
