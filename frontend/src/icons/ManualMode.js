import React from "react";
import PropTypes from 'prop-types';

export default function ManualMode(props) {
  return (
    <svg width="39" height="38" viewBox="0 0 39 38" fill="none">
      <path d="M32.6143 16.7227C32.4284 16.726 32.251 16.801 32.1193 16.9322L29.0663 19.9853L29.0609 19.988C29.0563 19.9925 29.0517 19.9971 29.0473 20.0017L18.3724 30.6799C18.3052 30.7468 18.2518 30.8264 18.2153 30.914C18.1789 31.0016 18.1602 31.0956 18.1602 31.1905V36.2828C18.1605 36.3774 18.1795 36.4709 18.216 36.5582C18.2525 36.6454 18.3059 36.7246 18.373 36.7912C18.4401 36.8578 18.5197 36.9105 18.6072 36.9463C18.6947 36.9822 18.7884 37.0004 18.883 37H23.9736C24.1633 36.9985 24.3447 36.9222 24.4784 36.7877L35.1336 26.1334C35.1382 26.1298 35.1427 26.1262 35.1472 26.1225C35.1556 26.1154 35.1637 26.1082 35.1717 26.1007L38.2275 23.0447C38.2944 22.9777 38.3474 22.8981 38.3834 22.8105C38.4195 22.723 38.438 22.6291 38.4377 22.5344C38.4375 22.4397 38.4185 22.3459 38.382 22.2585C38.3454 22.1711 38.292 22.0919 38.2248 22.0252L33.1328 16.9328C33.0645 16.8649 32.9832 16.8113 32.8938 16.7753C32.8045 16.7393 32.7088 16.7216 32.6124 16.7233L32.6143 16.7227ZM32.6252 18.4623L36.6991 22.5379L34.6656 24.5714L30.5917 20.4973L32.6252 18.4623ZM29.5708 21.5155L32.2891 24.231L33.6475 25.5882V25.5897L23.6786 35.5605H19.6019V31.4878L29.5708 21.5155Z" fill="black" stroke="black" strokeWidth="0.3"/>
      <path d="M15.4013 1C11.7128 1.00071 8.02404 2.40674 5.21442 5.21593C-0.404793 10.8353 -0.40482 19.9661 5.21442 25.5854C8.45087 28.822 12.8531 30.1947 17.0776 29.703C17.4739 29.6714 17.7701 29.3245 17.7385 28.9281C17.7069 28.5318 17.36 28.2441 16.9637 28.2756C13.1487 28.7369 9.167 27.5018 6.23397 24.5687C1.16505 19.4996 1.16132 11.3003 6.23125 6.23125C11.3 1.16247 19.5012 1.16299 24.5702 6.23125C27.4843 9.14545 28.7215 13.0942 28.2841 16.8878C28.2128 17.2789 28.4667 17.6532 28.8578 17.7245C29.249 17.7958 29.6232 17.5362 29.6946 17.1451C30.2093 12.8999 28.8413 8.46645 25.5883 5.21311C22.7787 2.40343 19.0899 0.999184 15.4014 1H15.4013Z" fill="black" stroke="black" strokeWidth="0.3"/>
      <path d="M15.3871 5.30982C15.1969 5.31328 15.0158 5.39174 14.8833 5.52815C14.7507 5.66455 14.6776 5.84779 14.6797 6.03788V15.397C14.6794 15.4915 14.6977 15.5852 14.7336 15.6728C14.7694 15.7603 14.8222 15.8399 14.8889 15.907C14.9556 15.9741 15.0348 16.0275 15.1221 16.064C15.2094 16.1005 15.3031 16.1194 15.3977 16.1197H24.7691C24.9602 16.1197 25.1435 16.0439 25.2787 15.9089C25.4138 15.7738 25.4898 15.5906 25.4898 15.3996C25.4898 15.2086 25.4138 15.0254 25.2787 14.8904C25.1435 14.7553 24.9602 14.6795 24.7691 14.6795H16.1211V6.03788C16.1222 5.94152 16.1039 5.84587 16.0673 5.75669C16.0308 5.66751 15.9767 5.58658 15.9082 5.51868C15.8398 5.45078 15.7584 5.39736 15.6689 5.36147C15.5794 5.32559 15.4836 5.30802 15.3871 5.30982Z" fill="black" stroke="black" strokeWidth="0.3"/>
    </svg>

  )
}
ManualMode.defaultProps = {
  fill: '#B3B3B3',
  style: {}
};
ManualMode.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
