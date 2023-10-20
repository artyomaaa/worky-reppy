import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Helmet } from 'react-helmet';
import { Loader } from 'components';
import { queryLayout } from 'utils';
import NProgress from 'nprogress';
import config from 'utils/config';
import withRouter from 'umi/withRouter';
import Snowflakes from "../components/Snowflakes";

import PublicLayout from './PublicLayout';
import PrimaryLayout from './PrimaryLayout';
import './BaseLayout.less';

const LayoutMap = {
  primary: PrimaryLayout,
  public: PublicLayout,
};

@withRouter
@connect(({ loading }) => ({ loading }))
class BaseLayout extends PureComponent {
  previousPath = '';

  render() {
    const { loading, children, location, locale } = this.props;
    const Container = LayoutMap[queryLayout(config.layouts, location.pathname)];
    const currentPath = location.pathname + location.search;
    if (currentPath !== this.previousPath || loading.global === true) {
      NProgress.start();
    }

    if (!loading.global) {
      NProgress.done();
      this.previousPath = currentPath
    }

    return (
      <Fragment>
        <Snowflakes />
        <Helmet>
          <title>{config.siteName}</title>
        </Helmet>
        <Loader fullScreen spinning={loading.effects['app/query']} />
        <Container locale={locale}>{children}</Container>
      </Fragment>
    )
  }
}

BaseLayout.propTypes = {
  loading: PropTypes.object,
};

export default BaseLayout
