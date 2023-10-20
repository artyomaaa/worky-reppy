import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment';
import {checkLoggedUserPermission, disabledDate} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import './Filter.less';
import filterStyles from "./Filter.less";
import styles from "../../../components/Page/Page.less";
import stylesUser from "../../users/components/Filter.less";
import stylesUserRoles from "./Filter.less";
import en_GB from 'antd/lib/locale-provider/en_GB';
import 'moment/locale/en-gb';
/* global document */
import { Form  } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css';
import { Trans, withI18n } from '@lingui/react';
import {Row, Col, DatePicker, Input, ConfigProvider, Tabs} from 'antd';
import hy_AM from 'antd/lib/locale-provider/hy_AM';
import globalStyles from 'themes/global.less';
import Icons from 'icons/icon';
import {debounce} from "lodash";
const { TabPane } = Tabs;
@withI18n()
@Form.create()
class Filter extends PureComponent {
  handleFields = fields => {
    const { created_at } = fields;
    if (created_at && created_at.length) {
      fields.created_at = [
        moment(created_at[0]).format('YYYY-MM-DD'),
        moment(created_at[1]).format('YYYY-MM-DD'),
      ]
    }
    return fields
  };

  handleSubmit = debounce(() => {
    const { onFilterChange, form } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    fields = this.handleFields(fields);
    onFilterChange(fields)
  }, 300);

  handleChange = (key, values) => {

    const { form, onFilterChange } = this.props;
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    if (key === 'statuses' || key === 'roleType') { // Status bar is Radio that is why we must detect if it returned native value or nativeEvent
      fields[key] = (values instanceof Object) ? values.target.value : values;
    } else fields[key] = values;

    fields = this.handleFields(fields);
    onFilterChange(fields)
  };

  render() {
    const { onAdd, filter, form, i18n } = this.props;
    const { getFieldDecorator } = form;
    const { name, roleType } = filter;
    let lang = i18n.language === 'en' ? en_GB : hy_AM;
    const canAddRolePermissions = checkLoggedUserPermission(PERMISSIONS.ADD_ROLES_PERMISSIONS.name, PERMISSIONS.ADD_ROLES_PERMISSIONS.guard_name);
    const initialCreateAt = [];
    if (filter.created_at && filter.created_at[0]) {
      initialCreateAt[0] = moment(filter.created_at[0]);
    }
    if (filter.created_at && filter.created_at[1]) {
      initialCreateAt[1] = moment(filter.created_at[1]);
    }

    return (
      <>
        <Row
          className={`${styles.filtersReportsActionsSect} ${stylesUser['parent-row__head']} ${stylesUserRoles['first-row']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
          <Col>
              <Tabs
                onChange={this.handleChange.bind(this, 'roleType')}
                defaultActiveKey='company'
              >
                <TabPane tab={<Trans>Company</Trans>} key={'company'}/>
                <TabPane tab={<Trans>Team</Trans>} key={'team'}/>
                <TabPane tab={<Trans>Project</Trans>} key={'project'}/>
              </Tabs>
          </Col>
        </Row>
        <Row
          className={`${filterStyles['filter-row']} ${stylesUser['parent-row__head']} ${stylesUserRoles['second-row']}`}
          type="flex"
          justify="space-between"
          align="middle"
        >
          <Col className={`${styles.taskSearch} ${filterStyles['filter-col']}`}>
            <div className={`${styles.searchSect} ${stylesUser['head-search--bar']}`} style={{width: '100%'}}>
              {getFieldDecorator('name', { initialValue: name })(
                <Input
                  className={globalStyles['input-md-ex']}
                  placeholder={i18n.t`Search Role`}
                  allowClear
                  onChange={this.handleSubmit}
                  onPressEnter={this.handleSubmit}
                  prefix={
                    <span onClick={this.handleSubmit}>
                    <Icons name="search" style={{marginRight: '10px', marginTop: '2px'}}/>
                  </span>
                  }
                />
              )}
            </div>
          </Col>
          <Col className={filterStyles['filter-col']}>
            <div className={stylesUser['second-row__head']}>
              {/*Created date bar*/}
              <div className={filterStyles['label-head']}>
                <ConfigProvider locale={lang}>
                  {getFieldDecorator('created_at', {
                    initialValue: initialCreateAt,
                  })(
                    <DatePicker.RangePicker
                      placeholder={[i18n.t`Created Date`, '']}
                      className={[stylesUserRoles['user-calendar-input'], globalStyles['input-md-ex']]}
                      dropdownClassName={stylesUser['app-datepicker']}
                      suffixIcon={
                        <span className={stylesUser['head__calendar-icon']}>
                        <Icons name="calendar" style={{marginRight: '10px', marginTop: '-2px'}}/>
                      </span>
                      }
                      format='DD-MM-YYYY'
                      onChange={this.handleChange.bind(this, 'created_at')}
                      disabledDate={disabledDate}
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                    >
                    </DatePicker.RangePicker>
                  )}
                </ConfigProvider>
              </div>
            </div>
          </Col>
          <Col className={filterStyles['filter-col-button']}>
            <div className={filterStyles['btnWrap']}>
              {canAddRolePermissions &&
              <button
                onClick={onAdd}
                className="app-btn primary-btn"

              >
                <Icons name="plus" fill="#FFFFFF"/>
                <Trans>ADD ROLE</Trans>
              </button>
              }
            </div>
          </Col>
        </Row>
      </>
     )
  }
}

Filter.propTypes = {
  onAdd: PropTypes.func,
  form: PropTypes.object,
  filter: PropTypes.object,
  onFilterChange: PropTypes.func,
};

export default Filter
