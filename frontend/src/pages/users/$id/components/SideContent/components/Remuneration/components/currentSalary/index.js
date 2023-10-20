import React from 'react';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {Popconfirm} from 'antd';
import styles from '../../style.less';
import {I18n} from '@lingui/react';

function CurrentSalary(props = {}) {
  const {historyName, onDelete, canDelete, onEdit, canEdit, data: {id, salary, rate, true_cost, date}} = props;
  return (
    <I18n>
      {({ i18n }) => (
        <>
          <div className={`${styles["currentSalary"]} ${styles["borderCurrentSalary"]}`}>
            <p>{i18n._(`Current Salary`)}</p>
            <h3>{salary} AMD</h3>
          </div>
          <div className={`${styles["currentTrueCost"]} ${styles["borderCurrentSalary"]}`}>
            <p>{i18n._(`True Cost`)}</p>
            <h3>{+true_cost} AMD</h3>
          </div>
          <div className={`${styles["currentTrueCost"]} ${styles["borderCurrentSalary"]}`}>
            <p>{i18n._(`Rate`)}</p>
            <h3>{rate}</h3>
          </div>
          <div className={`${styles["currentSalaryCost"]}`}>
            <p>{i18n._(`Date`)}</p>
            <h3>{date}</h3>
          </div>
          {(canEdit || canDelete) && <>
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
          </>}
        </>
      )}
    </I18n>
  )
}

export default CurrentSalary
