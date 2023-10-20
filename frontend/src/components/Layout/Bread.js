import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'antd';
import Link from 'umi/navlink';
import withRouter from 'umi/withRouter';
import { withI18n } from '@lingui/react';
import { pathMatchRegexp, queryAncestors, addLangPrefix } from 'utils';
import styles from './Bread.less';

@withI18n()
@withRouter
class Bread extends PureComponent {
  generateBreadcrumbs = paths => {
    return paths.map((item, key) => {
      return (
        item && (
          <span key={key} className={styles.breadcrumb}>
            {paths.length - 1 !== key ? (
              <Link to={addLangPrefix(item.route) || '#'}>{item.name}</Link>
            ) : (
              item.name
            )}
          </span>
        )
      )
    })
  };
  render() {
    const { routeList, location, i18n } = this.props;

    // Find a route that matches the pathname.
    const currentRoute = routeList.find(
      _ => _.route && pathMatchRegexp(_.route, location.pathname)
    );

    // Find the breadcrumb navigation of the current route match and all its ancestors.
    const paths = currentRoute
      ? queryAncestors(routeList, currentRoute, 'breadcrumbParentId').reverse()
      : [
          routeList[0],
          {
            id: 404,
            name: i18n.t`Not Found`,
          },
        ];

    return (
      <div className={styles.bread + ' ant-breadcrumb'}>
        {this.generateBreadcrumbs(paths)}
      </div>
    )
  }
}

Bread.propTypes = {
  routeList: PropTypes.array,
};

export default Bread
