import React from "react";
import styles from "../../style.less";
import Icons from 'icons/icon';
import {Popconfirm, Col} from "antd";


function List({items,i18n, onDelete, canEditContacts}) {
  return items.map((item) => (
    <Col key={Math.random().toString(36).substr(2, 9)} span={12} className={styles['col-max-width']}>
      <div className={styles['social']}>
        <a target="_blank" href={item.link}>
          <div className={styles['social-info']}>
            {item?.icon && <Icons name={item?.icon}/>}
            <span className={styles['social-name']}>{item.value}</span>
          </div>
        </a>
        {
          canEditContacts && <Popconfirm
            tabIndex="0"
            title={i18n.t`Are you sure you want to delete this social network ?`}
            placement="topRight"
            onConfirm={() => onDelete(item.id)}
          >
            <span><Icons name='close'/></span>
          </Popconfirm>
        }

      </div>
    </Col>
  ))
}

export default List
