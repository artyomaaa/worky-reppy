import React from "react";
import {Row} from "antd";
import List from "./List"

function Social({socialNetworks, i18n, onDelete, permissions: {canEditContacts}}) {
  return (
    <Row type="flex" justify="space-between" gutter={16}>
        <List i18n={i18n} canEditContacts={canEditContacts} onDelete={onDelete} items={socialNetworks}/>
      </Row>
  )
}

export default Social
