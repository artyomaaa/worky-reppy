import React from "react";
import List from "./List"
import styles from "../../style.less";

function WebSites({webSites, i18n, onDelete, permissions: {canEditContacts}}) {
  return (
    <div className={`${styles['line-wraps-elements']}`}>
      <List i18n={i18n} canEditContacts={canEditContacts} onDelete={onDelete} items={webSites}/>
    </div>
  )
}

export default WebSites
