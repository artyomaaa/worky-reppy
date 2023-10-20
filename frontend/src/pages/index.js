import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {withI18n} from '@lingui/react';
import Price from '../components/Price/Price'
import HomePage from '../components/HomePage'

@withI18n()
@connect(({about}) => ({about}))

class index extends PureComponent {

  render() {
    return (
      <>
        <HomePage />
        <Price />
      </>
    )
  }
}

export default index;
