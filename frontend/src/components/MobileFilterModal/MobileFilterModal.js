import React, {useCallback, useEffect, useState} from 'react'
import store from 'store';
import moment from 'utils/moment';
import PropTypes from 'prop-types';
import {Modal, Radio, DatePicker, Row, Col, Form, Button} from 'antd';
import {getFilterInitialStatus} from 'utils';
import {dateFormats} from 'utils/constant';

import Icons from 'icons/icon';
import styles from './MobileFilterModal.less';
import globalStyles from 'themes/global.less';
import {Trans} from "@lingui/react";

const MobileFilterModalComponent = ({show: isShowing, form, onClose, onFilterChange, filter = {} }) => {

  const handleFieldChange = useCallback((key, values) => {
    let fields = form.getFieldsValue();
    if (key === 'status') {
      fields[key] = (values instanceof Object) ? values.target.value : values;
    } else fields[key] = values;
  }, [form]);

  const handleFields = fields => {
    const { created_at } = fields;
    if (created_at?.length) {
      fields.created_at = [
        moment(created_at[0]).format('YYYY-MM-DD'),
        moment(created_at[1]).format('YYYY-MM-DD'),
      ]
    }
    return fields
  };

  const onSubmit = useCallback(() => {
    const { getFieldsValue } = form;

    let fields = getFieldsValue();
    fields = handleFields(fields);
    onFilterChange(fields)
    onClose();
  },[onClose, onFilterChange]);

  const handleResetFilter = () => {
    const {getFieldsValue, setFieldsValue} = form;

    const fields = getFieldsValue();
    for (let item in fields) {
      if ({}.hasOwnProperty.call(fields, item)) {
        if (fields[item] instanceof Array) {
          fields[item] = []
        } else {
          fields[item] = undefined
        }
      }
    }
    if (fields.status === undefined) fields.status = '1';
    setFieldsValue(fields);
  };

  const handleStatusToggle = (e) => {
    const {getFieldsValue, setFieldsValue} = form;
    let fields = getFieldsValue();
    if (e.target.value && (e.target.value === fields.status)) {
      fields.status = undefined;
      setFieldsValue(fields);
    }
  };

  const user = store.get('user');
  const userTimeOffset = user.time_offset;
  const {getFieldDecorator} = form;

// filter by status
  const initialStatus = getFilterInitialStatus(filter);

  return (
    <Modal
      visible={isShowing}
      title="Filter"
      className={styles['mobile-filter-modal']}
      closeIcon={
        <div className={styles['close-icon-container']} onClick={onClose}>
          <Icons name="close"/>
        </div>
      }
      footer={[
        <div className={`${styles['footer-action-buttons']}`}>
          <button
            type='button'
            className='app-btn primary-btn-outline md'
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type='button'
            className='app-btn primary-btn md'
            onClick={onSubmit}
          >
            Save
          </button>
        </div>
      ]}
    >
      <Form>
      <Row>
        <Form.Item>
          {getFieldDecorator('created_at')(
          <DatePicker.RangePicker
            placeholder={[moment().utcOffset(userTimeOffset).format(dateFormats.tasksPageCalendarFormat), '']}
            className={[styles['user-calendar-input'], globalStyles['input-md-ex']]}
            dropdownClassName={styles['app-datepicker']}
            onChange={handleFieldChange}
            suffixIcon={
              <span className={styles['head__calendar-icon']}>
                <Icons name="calendar"/>
              </span>
            }
            format='DD-MM-YY'
            separator={''}
          >
          </DatePicker.RangePicker>
          )}
        </Form.Item>
      </Row>
      <Row>
        <Col span={24}>
        <div className={`${styles['user-radio-wrap']}`} onClick={(e) => handleStatusToggle(e)}>
          <span className={styles['label-head__text']}>
          <Trans>Status</Trans>
        </span>
            <Form.Item>
          {getFieldDecorator('status', {
            initialValue: initialStatus,
          })(
            <Radio.Group onChange={handleFieldChange}>
              <Radio.Button value="1">
                <Trans>Active</Trans>
              </Radio.Button>
              <Radio.Button value="0">
                <Trans>Inactive</Trans>
              </Radio.Button>
            </Radio.Group>
          )}
            <div className={styles['filter-button-wrap']}>
              <Button className={styles['reset-btn']} type="secondary" onClick={handleResetFilter}>
                <Trans>Reset</Trans>
              </Button>
            </div>
            </Form.Item>
        </div>
        </Col>
      </Row>
      </Form>
    </Modal>
  )
};

MobileFilterModalComponent.propTypes = {
  onFilterChange: PropTypes.func,
  show: PropTypes.bool,
  onClose: PropTypes.func,
};

const MobileFilterModal = Form.create()(MobileFilterModalComponent)
export default MobileFilterModal;
