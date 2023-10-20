import React, {PureComponent} from 'react';
import {LandingLayout} from "components";
import store from "store";
import {router} from 'utils';
class PublicLayout extends PureComponent {
  constructor(props) {
    super(props);
  }
  checkIfPublic (pathName, pages) {
    return pages.every((e) => pathName.indexOf(e) === -1)
  }

  getHeaderColor (pathName) {
      return pathName.includes('demo') ? 'white' : 'transparent'
  }

  render() {
    const {children} = this.props;
    const isPublic = this.checkIfPublic(children.props.location.pathname,
      ['login', 'signup','error', '/password/forgot', '/password/reset'])
    const headerColor = this.getHeaderColor(children.props.location.pathname);
    const userLogged = store.get('user')
    const isPrivacyPolicy = children.props.location.pathname.includes('privacypolicy');
    return (
      !userLogged ?
    <>
      {isPublic && <LandingLayout.LandingHeader isPrivacyPolicy={isPrivacyPolicy} type={headerColor}/>}
      {children}
      {isPublic && <LandingLayout.LandingFooter/>}
    </> :
        <> {router.push({
          pathname: "/dashboard",
        })}
        </>

    )
  }
}
export default PublicLayout;
