import React from "react";
import {List} from 'antd';
import styles from "../../style.less";
import {Button} from 'antd';
import {Trans} from "@lingui/react";
import ItemsHistory from "./ItemsHistory";
import Header from "./Header";

function HistoryList(props = {}) {
  const {data, header, handleShowMore, sliceCount, onDelete, canDelete, onEdit, canEdit} = props;
  let dataSource = data ? [...data].slice(0, sliceCount) : [],
      showMoreBtn = data?.length !== dataSource?.length;

  if (header === "Salary") {
    dataSource = dataSource.filter((items) => items.status === 0);
    showMoreBtn = data?.length - 1 !== dataSource?.length
  }

  return (
    <>
      <Header historyName={header}/>
      <div className={styles['demo-infinite-container']}>
        <List
          itemLayout="horizontal"
          dataSource={dataSource.sort((a, b) => b.date - a.date)}
          renderItem={(item, index) => <ItemsHistory key={`${index}-${item.id}`} canDelete={canDelete} onDelete={onDelete} canEdit={canEdit} onEdit={onEdit} historyName={header}
                                            data={item}/>}/>
      </div>
      {
        showMoreBtn ?
          <div className={styles["show-more"]}>
            <Button className={styles["show-more-btn"]} onClick={(e) => handleShowMore(e, header)}><Trans>Show
              More</Trans></Button>
          </div> : null
      }
    </>
  )
}

export default HistoryList
