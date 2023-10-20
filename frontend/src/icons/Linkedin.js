import React from "react";
import PropTypes from 'prop-types';

export default function Linkedin(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.202637 5.34937H3.63245V15.6683H0.202637V5.34937Z" fill="#006699"/>
      <path
        d="M1.94031 0.375C0.76709 0.375 0 1.14539 0 2.15796C0 3.14819 0.744263 3.94055 1.89526 3.94055H1.9176C3.11377 3.94055 3.85815 3.14819 3.85815 2.15796C3.83582 1.14539 3.11377 0.375 1.94031 0.375Z"
        fill="#006699"/>
      <path
        d="M12.0513 5.10718C10.2314 5.10718 9.41601 6.1073 8.9602 6.81055V5.34937H5.53027V15.6683H8.96008V9.90576C8.96008 9.59729 8.98242 9.28931 9.073 9.06873C9.32092 8.45264 9.88525 7.81445 10.8328 7.81445C12.0739 7.81445 12.5703 8.76074 12.5703 10.1479V15.6683H15.9999V9.75159C15.9999 6.58203 14.3077 5.10718 12.0513 5.10718Z"
        fill="#006699"/>
    </svg>
  )
}

Linkedin.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Linkedin.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
