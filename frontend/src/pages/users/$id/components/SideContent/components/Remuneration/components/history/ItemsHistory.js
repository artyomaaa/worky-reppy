import React from "react";
import styles from "../../style.less";
import moment from 'utils/moment';
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Popconfirm} from 'antd';

function ItemsHistory(props = {}) {
  const {historyName, onDelete, canDelete, onEdit, canEdit, data: {id, salary, true_cost, date, rate, bonus}} = props;

  return (
    <section style={{display: "flex", paddingTop: "15px"}}>
      {
        historyName === "Salary" ?
          <>
            <div className={styles["salaryHistory"]}><p className={styles['items-history-salary']}>{salary} AMD</p>
            </div>
            <div className={styles["salaryHistory"]}><p className={styles['items-history-salary']}>{true_cost} AMD</p>
            </div>
            <div className={styles["salaryHistory"]}><p className={styles['items-history-salary']}>{rate} AMD</p></div>
            <div className={styles["salaryHistory"]}><p
              className={styles['items-history-salary']}>{moment(date).format('DD.MM.yyyy')}</p></div>
          </>
          :
          <>
            <div className={styles["salaryHistory"]}><p className={styles['items-history-salary']}>{bonus} AMD</p></div>
            <div className={styles["salaryHistory"]}><p
              className={styles['items-history-salary']}>{moment(date).format('DD.MM.yyyy')}</p></div>
          </>
      }
      {
        canEdit && <div style={{flex: "0.2"}} className={styles["salaryHistory"]}>
          <p className={styles['items-history-salary']}>
            <EditOutlined onClick={() => onEdit(id, historyName)} className={styles['edit-IconRemuneration']}/>
          </p>
        </div>
      }
      {
        canDelete && <Popconfirm
          title={`Are you sure delete?`}
          placement="left"
          onConfirm={() => onDelete(id, historyName)}
        >
          <div style={{flex: "0.2"}} className={styles["salaryHistory"]}><p className={styles['items-history-salary']}>
            <DeleteOutlined className={styles['edit-IconRemuneration']}/></p></div>
        </Popconfirm>
      }
    </section>
  )
}

export default ItemsHistory
