import React from "react";
import PropTypes from 'prop-types';

export default function Cart(props) {
    return (
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3.95768 7.6263H6.08268C6.27054 7.6263 6.45071 7.55167 6.58355 7.41884C6.71639 7.286 6.79102 7.10583 6.79102 6.91797C6.79102 6.73011 6.71639 6.54994 6.58355 6.4171C6.45071 6.28426 6.27054 6.20963 6.08268 6.20963H3.95768C3.76982 6.20963 3.58965 6.28426 3.45682 6.4171C3.32398 6.54994 3.24935 6.73011 3.24935 6.91797C3.24935 7.10583 3.32398 7.286 3.45682 7.41884C3.58965 7.55167 3.76982 7.6263 3.95768 7.6263ZM12.4577 0.542969H2.54102C1.97743 0.542969 1.43693 0.766852 1.03841 1.16537C0.639899 1.56388 0.416016 2.10438 0.416016 2.66797V9.04297C0.416016 9.60655 0.639899 10.1471 1.03841 10.5456C1.43693 10.9441 1.97743 11.168 2.54102 11.168H12.4577C13.0213 11.168 13.5618 10.9441 13.9603 10.5456C14.3588 10.1471 14.5827 9.60655 14.5827 9.04297V2.66797C14.5827 2.10438 14.3588 1.56388 13.9603 1.16537C13.5618 0.766852 13.0213 0.542969 12.4577 0.542969ZM13.166 9.04297C13.166 9.23083 13.0914 9.411 12.9586 9.54384C12.8257 9.67667 12.6455 9.7513 12.4577 9.7513H2.54102C2.35315 9.7513 2.17299 9.67667 2.04015 9.54384C1.90731 9.411 1.83268 9.23083 1.83268 9.04297V4.79297H13.166V9.04297ZM13.166 3.3763H1.83268V2.66797C1.83268 2.48011 1.90731 2.29994 2.04015 2.1671C2.17299 2.03426 2.35315 1.95964 2.54102 1.95964H12.4577C12.6455 1.95964 12.8257 2.03426 12.9586 2.1671C13.0914 2.29994 13.166 2.48011 13.166 2.66797V3.3763Z"
                fill="#4A54FF"/>
        </svg>
    )
}
Cart.defaultProps = {
    fill: '#4A54FF',
    style: {},
};
Cart.propTypes = {
    fill: PropTypes.string,
    style: PropTypes.object,
};
