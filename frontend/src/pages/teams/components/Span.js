import React from "react";

const Span = ({children, to, ...props}) => {
  return (
    <span {...props}>
      {children}
    </span>
  );
};

export default Span;
