import React, { PureComponent } from 'react';
import {connect} from 'dva';
import {Trans} from "@lingui/react";

@connect(({emailVerify}) => ({emailVerify}))
class Verify extends PureComponent{
  render() {
    return (
      <>
        <Trans>Verifying...</Trans>
      </>
    )
  }
}

export default Verify;
