import React, {Component} from 'react';
import { withI18n } from '@lingui/react';
import { Col, Form, Switch } from 'antd';
import PropTypes from "prop-types";
import styles from './Switcher.less'

@withI18n()
@Form.create()
class Switcher extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onChangePerson = this.onChangePerson.bind(this);
  }
  onChange = (checked) => {
    const { onSwitcherChange } = this.props;
    onSwitcherChange(checked);
  };
  onChangePerson = (checked) => {
    const { onSwitcherChangePerson } = this.props;
    onSwitcherChangePerson(checked);
  };

  render() {
    const { i18n, switcherTeam } = this.props;
    const { switcherPerson } = this.props;

    return (
        <Col  xl={{ span: 12 }} sm={{ span: 12 }} className={styles["switcher-parrent-col"]}>
          <span>{i18n._('Team')}</span>
          <div style={{display: 'inline-block', margin: '0 5px', marginRight:'23px'}}>
            <Switch onChange={this.onChange} checked={switcherTeam}/>
          </div>
          <span>{i18n._('Me')}</span>
          <div style={{display: 'inline-block', margin: '0 5px'}}>
            <Switch onChange={this.onChangePerson} checked={switcherPerson}/>
          </div>
        </Col>
    )
  }
}

Switcher.propTypes = {
  form: PropTypes.object,
};

export default Switcher
