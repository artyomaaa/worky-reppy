import React from "react";
import PropTypes from "prop-types";
import {Button} from "antd";
import {Trans} from "@lingui/react";

import styles from "./index.less";

const Reset = ({ className, withoutMargin, horizontalMargin, handleReset }) => {
  return (
    <div className={`${className} ${styles['reset']} ${horizontalMargin ? styles['reset-horizontal-margin'] : ''} ${withoutMargin ? styles['reset-without-margin'] : ''}`}>
      <Button type="secondary" onClick={handleReset}>
        <Trans>Reset</Trans>
      </Button>
    </div>
  );
};

Reset.defaultProps = {
  className: '',
}

Reset.propTypes = {
  className: PropTypes.string,
  withoutMargin: PropTypes.bool,
  horizontalMargin: PropTypes.bool,
  handleReset: PropTypes.func,
};

export default Reset;
