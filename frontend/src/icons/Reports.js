import React from "react";
import PropTypes from 'prop-types';

export default function Reports(props) {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" style={props.style}>
      <g clipPath="url(#clip0)">
        <path className="fill" d="M19.5115 18.8869H2.53342L5.62717 12.6994L9.81155 16.1931C9.90411 16.2703 10.0123 16.3264 10.1286 16.3577C10.245 16.3891 10.3667 16.3949 10.4855 16.3747C10.6042 16.3545 10.7172 16.3088 10.8167 16.2408C10.9161 16.1728 10.9997 16.084 11.0615 15.9806L15.9709 7.815L16.3803 9.09313C16.4339 9.26162 16.5397 9.40872 16.6824 9.51319C16.8251 9.61766 16.9972 9.6741 17.174 9.67438C17.2601 9.67464 17.3456 9.66092 17.4272 9.63375C17.637 9.56564 17.8115 9.41748 17.9127 9.22146C18.0139 9.02545 18.0337 8.79741 17.9678 8.58688L16.9084 5.34625C16.8754 5.24188 16.8221 5.14505 16.7515 5.06133C16.681 4.97762 16.5946 4.90867 16.4973 4.85843C16.4 4.8082 16.2938 4.77767 16.1847 4.76861C16.0756 4.75955 15.9658 4.77213 15.8615 4.80563L12.699 5.815C12.4996 5.89084 12.3367 6.04022 12.244 6.23244C12.1513 6.42467 12.1357 6.64511 12.2006 6.84843C12.2654 7.05176 12.4057 7.22251 12.5926 7.32557C12.7795 7.42863 12.9987 7.45616 13.2053 7.4025L14.5147 6.98688L10.1334 14.3025L5.8803 10.7463C5.78355 10.6661 5.66998 10.6087 5.54803 10.5783C5.42607 10.548 5.29885 10.5455 5.1758 10.571C5.05274 10.5965 4.937 10.6494 4.83716 10.7257C4.73732 10.802 4.65594 10.8998 4.59905 11.0119L2.01155 16.1775V1.38688C2.01851 1.27322 2.00214 1.15934 1.96344 1.05225C1.92474 0.945158 1.86452 0.847122 1.7865 0.764177C1.70849 0.681233 1.61432 0.615135 1.50979 0.569954C1.40527 0.524773 1.29261 0.501465 1.17874 0.501465C1.06486 0.501465 0.952199 0.524773 0.847676 0.569954C0.743152 0.615135 0.648983 0.681233 0.570966 0.764177C0.492949 0.847122 0.432735 0.945158 0.394033 1.05225C0.35533 1.15934 0.338957 1.27322 0.345923 1.38688V19.7181C0.351128 19.757 0.358431 19.7956 0.367798 19.8338C0.373638 19.8943 0.386216 19.9541 0.405298 20.0119C0.427074 20.06 0.453225 20.106 0.483423 20.1494C0.508564 20.1957 0.53785 20.2396 0.570923 20.2806C0.613614 20.3222 0.660776 20.3589 0.711548 20.39C0.740602 20.4176 0.771967 20.4427 0.805298 20.465H0.839673L0.886548 20.4806C0.978917 20.5182 1.07746 20.5384 1.17717 20.54H19.5115C19.6252 20.547 19.7391 20.5306 19.8462 20.4919C19.9533 20.4532 20.0513 20.393 20.1342 20.315C20.2172 20.2369 20.2833 20.1428 20.3285 20.0383C20.3737 19.9337 20.397 19.8211 20.397 19.7072C20.397 19.5933 20.3737 19.4807 20.3285 19.3761C20.2833 19.2716 20.2172 19.1774 20.1342 19.0994C20.0513 19.0214 19.9533 18.9612 19.8462 18.9225C19.7391 18.8838 19.6252 18.8674 19.5115 18.8744V18.8869Z" fill={props.fill}/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="20" height="20" fill="white" transform="translate(0.345703 0.552734)"/>
        </clipPath>
      </defs>
    </svg>
  )
}
Reports.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
Reports.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
