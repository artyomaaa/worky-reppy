import React from "react";
import PropTypes from 'prop-types';

export default function Ln(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.9959 17.9992V17.9984H18.0004V11.3969C18.0004 8.16744 17.3052 5.67969 13.5297 5.67969C11.7147 5.67969 10.4967 6.67569 9.99944 7.61994H9.94694V5.98119H6.36719V17.9984H10.0947V12.0479C10.0947 10.4812 10.3917 8.96619 12.3319 8.96619C14.2437 8.96619 14.2722 10.7542 14.2722 12.1484V17.9992H17.9959Z"
        fill={props.fill}/>
      <path d="M0.296875 5.98242H4.02888V17.9997H0.296875V5.98242Z" fill={props.fill}/>
      <path
        d="M2.1615 0C0.96825 0 0 0.96825 0 2.1615C0 3.35475 0.96825 4.34325 2.1615 4.34325C3.35475 4.34325 4.323 3.35475 4.323 2.1615C4.32225 0.96825 3.354 0 2.1615 0V0Z"
        fill={props.fill}/>
    </svg>
  )
}
Ln.defaultProps = {
  fill: '#ffffff',
  style: {}
};
Ln.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
