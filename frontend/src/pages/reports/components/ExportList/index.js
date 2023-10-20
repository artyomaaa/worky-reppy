import React from "react";
import PropTypes from "prop-types";
import Icons from 'icons/icon';
import {Dropdown} from "antd";
import {Trans} from "@lingui/react";

import globalStyles from "themes/global.less";

const ExportList = ({ className, overlay }) => {
  return (
    <div className={`${className} ${globalStyles['flexRow']}`}>
      <Dropdown overlay={overlay()} placement="bottomLeft">
        <button className={`btn-linked`}>
          <Trans>EXPORT LIST</Trans>
          <Icons name="arrowdown2" fill="#4A54FF"/>
        </button>
      </Dropdown>
    </div>
  );
};

ExportList.defaultProps = {
  className: '',
};

ExportList.propTypes = {
  className: PropTypes.string,
  overlay: PropTypes.func,
};

export default ExportList;
