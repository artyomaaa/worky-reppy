import React from "react";
import PropTypes from 'prop-types';

export default function TwitterLogo(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 26 22">
      <path fill="#47b9cf"
            d="M.5 18.7c10 6.2 22.7-.7 22.5-13 1-.7 1.9-1.6 2.6-2.7-1 .5-2 .8-3.1.9 1.14-.7 2-1.7 2.4-2.9-1 .6-2 1-3.3 1.3-4.3-4.13-10 .3-8.8 4.7-4.3-.2-8-2.3-10.6-5.4C1 4 1.5 7.1 3.9 8.5 3 8.4 2 8.2 1.5 7.8c0 2.6 1.8 4.6 4.1 5.1-.8.2-1.5.3-2.3.1.6 2 2.6 3.6 4.8 3.6-2 1.6-4.7 2.4-7.6 2.1z"/>
    </svg>

  )
}
TwitterLogo.defaultProps = {
  fill: '#47b9cf',
  style: {}
};
TwitterLogo.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
