import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import Navlink from 'umi/navlink';
import {addLangPrefix} from 'utils';
import config from 'utils/config';
import style from './Brand.less'
import withRouter from 'umi/withRouter';


const Index = (props) => {
  const { pathname } = props.location;

  const className = useMemo(() => {
    if(pathname.includes('login')) {
      return true;
    }
    if(pathname.includes('signup')) {
      return true;
    }
    return false;
  }, [pathname]);

  return (
    <div className={`${style['brand']} ${style[className ? 'login' : 'signup']}`}>
      <div className={style['logo']}>
        <Navlink to={addLangPrefix('/')}>
          <img src={require('img/logo.svg')} alt="logo" style={{width: props.width, height: props.height}}/>
        </Navlink>
      </div>
      {
        props.fontSize ? <div className={`text ${style[props.color]}`} style={{fontSize: props.fontSize}}>
          {config.siteName}
        </div> : ''
      }
    </div>
  );
};

Index.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
  fontSize: PropTypes.string,
};
export default withRouter(Index);
