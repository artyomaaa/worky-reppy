import React from "react";
import PropTypes from 'prop-types';

export default function Play(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.7642 7.32854L4.76595 0.483742C4.30421 0.167415 3.83897 0 3.45227 0C2.70466 0 2.24219 0.600014 2.24219 1.60436V16.398C2.24219 17.4011 2.70407 18 3.44994 18C3.83722 18 4.29503 17.8324 4.75779 17.5152L14.7608 10.6706C15.404 10.2297 15.7603 9.63637 15.7603 8.9992C15.7604 8.36247 15.4083 7.7693 14.7642 7.32854Z" fill={props.fill}/>
    </svg>
  )
}
Play.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Play.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
