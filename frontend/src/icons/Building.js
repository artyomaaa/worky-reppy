import React from "react";
import PropTypes from 'prop-types';

export default function Building(props) {
  return (
    <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
      <path
        d="M13.0007 5.66504C13.0882 5.66506 13.1749 5.64783 13.2558 5.61434C13.3367 5.58084 13.4102 5.53174 13.4721 5.46983C13.534 5.40792 13.5831 5.33441 13.6166 5.25352C13.6501 5.17263 13.6673 5.08592 13.6673 4.99837V2.99837C13.6674 2.85849 13.6234 2.72214 13.5416 2.60867C13.4598 2.4952 13.3443 2.41037 13.2116 2.36621L7.21159 0.366211C7.07466 0.320638 6.92665 0.320638 6.78971 0.366211L0.789711 2.36621C0.65698 2.41037 0.541523 2.4952 0.459722 2.60867C0.37792 2.72214 0.333927 2.85849 0.333984 2.99837V4.99837C0.333962 5.08592 0.35119 5.17263 0.384685 5.25352C0.41818 5.33441 0.467286 5.40792 0.529196 5.46983C0.591106 5.53174 0.664608 5.58084 0.745502 5.61434C0.826396 5.64783 0.913097 5.66506 1.00065 5.66504H1.66732V10.4546C1.27848 10.5915 0.941561 10.8455 0.702829 11.1816C0.464097 11.5177 0.335253 11.9194 0.333984 12.3317V13.665C0.333962 13.7526 0.35119 13.8393 0.384685 13.9202C0.41818 14.0011 0.467286 14.0746 0.529196 14.1365C0.591106 14.1984 0.664608 14.2475 0.745502 14.281C0.826396 14.3145 0.913097 14.3317 1.00065 14.3317H13.0007C13.0882 14.3317 13.1749 14.3145 13.2558 14.281C13.3367 14.2475 13.4102 14.1984 13.4721 14.1365C13.534 14.0746 13.5831 14.0011 13.6166 13.9202C13.6501 13.8393 13.6673 13.7526 13.6673 13.665V12.3317C13.666 11.9194 13.5372 11.5177 13.2985 11.1816C13.0597 10.8455 12.7228 10.5915 12.334 10.4546V5.66504H13.0007ZM12.334 12.9984H1.66732V12.3317C1.66749 12.1549 1.73779 11.9855 1.86277 11.8605C1.98776 11.7355 2.15723 11.6652 2.33398 11.665H11.6673C11.8441 11.6652 12.0135 11.7355 12.1385 11.8605C12.2635 11.9855 12.3338 12.1549 12.334 12.3317V12.9984ZM3.00065 10.3317V5.66504H4.33398V10.3317H3.00065ZM5.66732 10.3317V5.66504H8.33398V10.3317H5.66732ZM9.66732 10.3317V5.66504H11.0007V10.3317H9.66732ZM1.66732 4.3317V3.47884L7.00065 1.70084L12.334 3.47884V4.3317H1.66732Z"
        fill="#4A54FF"/>
    </svg>
  )
}
Building.defaultProps = {
  fill: '#4A54FF',
  style: {},
};
Building.propTypes = {
  fill: PropTypes.string,
  style: PropTypes.object,
};