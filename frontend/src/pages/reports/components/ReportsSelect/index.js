import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {Select} from "antd";
import {withI18n} from "@lingui/react/index";

import globalStyles from "themes/global.less";

@withI18n()
class ReportsSelect extends PureComponent {
  render() {
    const { className, name, isInactive, toggleInactive, children, i18n, ...props } = this.props;
    return (
      <Select
        {...props}
        mode="multiple"
        style={{width: '100%'}}
        optionFilterProp='children'
        className={`${className} ${globalStyles['input-md-ex']}`}
        dropdownRender={(content) => toggleInactive ? (
          <div>
            {content}
            <div
              className='select-render-button'
              onMouseDown={e => e.preventDefault()}
              onClick={() => toggleInactive(`isInactive${name}`)}
            >
              <span>{!isInactive ? `Include Inactive ${name}` : `Exclude Inactive ${name}`}</span>
            </div>
          </div>
        ) : content}
      >
        {children}
      </Select>
    );
  }
}

ReportsSelect.defaultProps = {
  className: '',
  isInactive: false,
};

ReportsSelect.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  isInactive: PropTypes.bool,
  toggleInactive: PropTypes.func,
};

export default ReportsSelect;
