import React from "react";
import styles from "../../style.less";
import {Popconfirm} from "antd";
import Icons from 'icons/icon';

function List({items, i18n, onDelete, canEditContacts}) {
  return items.map((item,index) => (
      <div key={index} className={styles['website-item']}>
        <div className={styles['website-title']} title={item.name}>
          {item.name.length > 65 ? item.name.slice(0, 65) + "..." : item.name}
        </div>
        <div className={styles['website-link']}>
          <a target="_blank" href={item.value} title={item.value}>
            {item.value.length > 75 ? item.value.slice(0, 75) + "..." : item.value}
          </a>
          {
            canEditContacts && <Popconfirm
              tabIndex="0"
              title={i18n.t`Are you sure you want to delete this link ?`}
              placement="topRight"
              onConfirm={() => onDelete(item.id)}
            >
              <span><Icons name='close'/></span>
            </Popconfirm>
          }
        </div>
      </div>
    )
  )
}

export default List
