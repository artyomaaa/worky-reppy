import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import { Row, Col } from 'antd';

class List extends PureComponent {
  render() {
    const { dataSource, onDeleteItem, onEditItem, width } = this.props;

    return (
      <Row xs={1} sm={2}>
        {
          dataSource.map((card) =>
            <Col xs={24} sm={24} md={12} xxl={6} xl={8}  key={card.id}>
              <Card screenWidth={width} data={card} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
            </Col>
          )
        }
      </Row>
    )
  }
}

List.propTypes = {
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  location: PropTypes.object,
};

export default List
