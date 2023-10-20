import React from "react";
import styles from "../../style.less";
import {I18n} from "@lingui/react"

function Header({historyName}) {
  return (
    <I18n>
      {({i18n}) => (
        <section className={styles["section-history-salary"]}>
          {
            historyName === "Salary" ?
              <>
                <div className={styles["salaryHistory"]}><p
                  className={styles["header-history-salary"]}>{i18n._(`SALARY`)}</p></div>
                <div className={styles["salaryHistory"]}><p
                  className={styles["header-history-salary"]}>{i18n._(`TRUE COST`)}</p></div>
                <div className={styles["salaryHistory"]}><p
                  className={styles["header-history-salary"]}>{i18n._(`RATE`)}</p></div>
                <div className={styles["salaryHistory"]}><p
                  className={styles["header-history-salary"]}>{i18n._(`CREATED DATE`)}</p></div>
                <div className={styles["salaryHistory"]} style={{flex: "0.2"}}><p
                  className={styles["header-history-salary"]}/></div>
              </> :
              <>
                <div className={styles["salaryHistory"]}><p
                  className={styles["header-history-salary"]}>{i18n._(`BONUS`)}</p></div>
                <div className={styles["salaryHistory"]}><p
                  className={styles["header-history-salary"]}>{i18n._(`CREATED DATE`)}</p></div>
                <div className={styles["salaryHistory"]} style={{flex: "0.2"}}><p
                  className={styles["header-history-salary"]}/></div>
              </>
          }
        </section>
      )}
    </I18n>
  )
}

export default Header

