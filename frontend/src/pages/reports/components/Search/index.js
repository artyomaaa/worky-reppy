import React from "react";
import PropTypes from "prop-types";
import {Trans} from "@lingui/react";
import {Button} from "antd";

const Search = ({ className, handleSearch }) => {
  return (
    <Button
      type="primary"
      onClick={handleSearch}
      className={className}
    >
      <Trans>Search</Trans>
    </Button>
  );
};

Search.defaultProps = {
  className: '',
}

Search.propTypes = {
  className: PropTypes.string,
  handleSearch: PropTypes.func,
};

export default Search;
