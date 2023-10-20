import React from "react";
import PropTypes from 'prop-types';

export default function Military (props) {
  return (
    <svg width="12" height="24" viewBox="0 0 12 24" fill="none" style={props.style}>
      <path d="M11.3137 17.619C11.2196 17.3293 10.9496 17.1331 10.645 17.1331H7.60727L6.81799 14.7039L10.6609 11.5948C10.8259 11.4613 10.9217 11.2604 10.9217 11.0482V0.703125C10.9217 0.314812 10.6069 0 10.2186 0H1.78117C1.39286 0 1.07804 0.314812 1.07804 0.703125V11.0482C1.07804 11.2605 1.1739 11.4613 1.3389 11.5948L5.18177 14.704L4.39249 17.1332H1.3548C1.05015 17.1332 0.7802 17.3293 0.686075 17.619C0.59195 17.9087 0.695029 18.2261 0.941498 18.4052L3.39902 20.1907L2.46034 23.0797C2.36622 23.3694 2.4693 23.6868 2.71577 23.8658C2.839 23.9554 2.98403 24.0001 3.12906 24.0001C3.27409 24.0001 3.41913 23.9554 3.54236 23.8658L5.99993 22.0802L8.45749 23.8657C8.70387 24.0448 9.03766 24.0447 9.28404 23.8657C9.53051 23.6866 9.63363 23.3693 9.53946 23.0796L8.60079 20.1906L11.0583 18.4051C11.3047 18.2261 11.4079 17.9087 11.3137 17.619ZM5.99993 13.557L5.2968 12.9881V1.40625H6.70305V12.9881L5.99993 13.557ZM9.51556 10.7126L8.1093 11.8504V1.40625H9.51556V10.7126ZM2.4843 1.40625H3.89055V11.8504L2.4843 10.7126V1.40625ZM7.3609 19.3532C7.11443 19.5323 7.0113 19.8496 7.10547 20.1393L7.5333 21.4561L6.41322 20.6423C6.16675 20.4632 5.8331 20.4632 5.58663 20.6423L4.46655 21.4561L4.89438 20.1393C4.9885 19.8496 4.88542 19.5323 4.63896 19.3532L3.51883 18.5394H4.90333C5.20797 18.5394 5.47793 18.3433 5.57205 18.0535L5.99988 16.7368L6.42766 18.0535C6.52179 18.3432 6.79179 18.5394 7.09638 18.5394H8.48093L7.3609 19.3532Z" fill="#B3B3B3"/>
    </svg>

  )
}
Military.defaultProps = {
  stroke: '#353FDF',
  style: {}
};
Military.propTypes = {
  style: PropTypes.object,
  stroke: PropTypes.string
};
