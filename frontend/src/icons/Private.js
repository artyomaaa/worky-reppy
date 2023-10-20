import React from "react";
import PropTypes from 'prop-types';

export default function Private(props) {
  return (
    <svg className="private-icon" width="15" height="15" viewBox="0 0 15 15" fill="none"  style={props.style}>
      <g>
        <path d="M13.3356 1.66231C13.1213 1.44498 12.7724 1.44804 12.555 1.66231L10.596 3.62136C8.16859 2.51939 5.57898 2.78876 3.10874 4.40192C1.26907 5.60183 0.151801 7.11091 0.105885 7.17519C-0.0410432 7.37722 -0.0349211 7.65271 0.12119 7.84862C1.16806 9.13424 2.2639 10.1352 3.38423 10.8331L1.66088 12.5565C1.44661 12.7707 1.44661 13.1197 1.66088 13.337C1.76802 13.4441 1.90882 13.4992 2.04963 13.4992C2.19043 13.4992 2.33124 13.4441 2.43838 13.337L13.3356 2.44287C13.5499 2.2286 13.5499 1.87964 13.3356 1.66231ZM6.13608 8.08125C6.05649 7.90065 6.0167 7.70475 6.0167 7.49966C6.0167 7.10479 6.16975 6.73135 6.45136 6.44973C6.89215 6.00895 7.54415 5.90487 8.08288 6.13445L6.13608 8.08125ZM8.89711 5.32328C7.89616 4.68047 6.54626 4.79679 5.67387 5.66918C5.1841 6.15894 4.9178 6.80787 4.9178 7.4966C4.9178 7.9986 5.06166 8.47918 5.32797 8.89242L4.19234 10.0281C3.19751 9.45259 2.21798 8.60162 1.26601 7.49048C1.67312 7.01296 2.53327 6.09159 3.71176 5.32328C5.75039 3.9948 7.77984 3.70707 9.75726 4.46314L8.89711 5.32328Z" fill="#B3B3B3"/>
        <path d="M14.8785 7.15063C14.1224 6.22008 13.3388 5.43646 12.5429 4.81508C12.3011 4.62836 11.9552 4.67121 11.7654 4.90997C11.5787 5.14873 11.6216 5.49462 11.8603 5.68441C12.4909 6.17723 13.1215 6.78943 13.7337 7.50571C13.3725 7.92812 12.6684 8.68725 11.7134 9.3821C9.87373 10.7198 8.0157 11.2034 6.19439 10.8177C5.89748 10.7534 5.60362 10.9463 5.5424 11.2432C5.47812 11.5401 5.67096 11.834 5.96788 11.8952C6.44234 11.9962 6.91985 12.0452 7.40043 12.0452C8.12283 12.0452 8.85135 11.9319 9.57681 11.7054C10.5288 11.4085 11.4746 10.9187 12.3899 10.2514C13.9326 9.12192 14.854 7.87609 14.8938 7.82405C15.0407 7.62202 15.0346 7.34653 14.8785 7.15063Z" fill="#B3B3B3"/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="15" height="15" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}
Private.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Private.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
