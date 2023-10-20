import React from "react";
import PropTypes from 'prop-types';

export default function Fb(props) {
  return (
    <svg width="10" height="20" viewBox="0 0 10 20" fill="none">
      <path
        d="M8.175 3.32083H10.0008V0.140833C9.68583 0.0975 8.6025 0 7.34083 0C4.70833 0 2.905 1.65583 2.905 4.69917V7.5H0V11.055H2.905V20H6.46667V11.0558H9.25417L9.69667 7.50083H6.46583V5.05167C6.46667 4.02417 6.74333 3.32083 8.175 3.32083Z"
        fill={props.fill}/>
    </svg>
  )
}
Fb.defaultProps = {
  fill: '#ffffff',
  style: {}
};
Fb.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
