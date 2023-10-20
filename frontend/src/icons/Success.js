import React from "react";
import PropTypes from 'prop-types';

export default function Success(props) {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <path d="M4.59503 9.80735C4.48048 9.93101 4.3242 10 4.16185 10C3.99951 10 3.84323 9.93101 3.72868 9.80735L0.26926 6.09406C-0.0897532 5.70876 -0.0897532 5.08398 0.26926 4.69941L0.702431 4.2344C1.06156 3.84911 1.64304 3.84911 2.00206 4.2344L4.16185 6.55244L9.99794 0.288972C10.3571 -0.096324 10.9391 -0.096324 11.2976 0.288972L11.7307 0.753976C12.0898 1.13927 12.0898 1.76393 11.7307 2.14863L4.59503 9.80735Z" fill={props.fill}/>
    </svg>

  )
}
Success.defaultProps = {
  fill: '#D3D1D1',
  style: {}
};
Success.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
