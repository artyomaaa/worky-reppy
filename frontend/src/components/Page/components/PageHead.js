import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';

const Head = (props) => {
  const {children} = props;
  return (
    <div className={styles['parent-wrap']}>
      {children}
    </div>
  )
}
Head.propTypes = {}

export default React.memo(Head);
