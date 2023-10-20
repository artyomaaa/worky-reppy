import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Pagination, Table} from "antd";
import styles from './List.less';
class List extends PureComponent {

  handlePagination = (page) => {
    const {onGetWorkList} = this.props;
    this.setState(() => {
      onGetWorkList(page);
      return {tasksCurPage: page};
    });
  }
  render() {
    const {columns, dataSource} = this.props;

    return (
      <Table columns={columns}
             dataSource={dataSource}
             pagination={{hideOnSinglePage: true}}
             className={`data-table, ${styles['projects-participants__list']}`}
             scroll={{x:1000}}
      />
    );
  }
}

List.propTypes = {
  columns: PropTypes.array,
  dataSource: PropTypes.array
};

export default List;
