import React from "react";
import {Col} from "antd";
import {DashboardSummeryBar} from "../../../components/Charts";
import styles from "./statisticsSummeryBar.less";
import {I18n} from "@lingui/react";


const StatisticsSummeryBar = (props) => {

  return (
    <I18n>
      {({i18n}) => (
        <Col lg={15} md={24} className={styles['summery-bar-content']}>
          <h3>{i18n.t`Statistics`}</h3>
          <DashboardSummeryBar {...props} />
        </Col>
      )}
    </I18n>
  )
}

export default StatisticsSummeryBar;
