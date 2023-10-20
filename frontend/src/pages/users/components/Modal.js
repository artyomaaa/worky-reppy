import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import PhoneInput from 'react-phone-input-2'
import {Input, Select, Modal, Button, Row, message, AutoComplete, Col} from 'antd';
import {Form} from '@ant-design/compatible';
import {withI18n} from '@lingui/react';
import {ALLOWED_FILE_TYPES} from 'utils/constant';
import Icons from 'icons/icon';
import en_GB from 'antd/lib/locale-provider/en_GB';
import hy_AM from "antd/lib/locale-provider/hy_AM";
import 'moment/locale/en-gb';
import styles from "./modal.less";
import globalStyles from 'themes/global.less';

import '@ant-design/compatible/assets/index.css';
import 'react-phone-input-2/lib/material.css'
import login from "../../login";

const FormItem = Form.Item;

const props = {
  name: 'file',
  action: '',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

@withI18n()
@Form.create()
class UserModal extends PureComponent {
  state = {
    fileUploadingCount: 1,
    userPositions: [],
    documents: {
      agreement: {},
      passport: {},
      others: []
    },
    skills: [],
  };

  componentDidUpdate(oldProps) {
    if (oldProps?.positions !== this.props?.positions) {
      this.setState({
        userPositions: this.props?.positions,
      });
    }
  }

  handleOk = () => {
    const {onOk, form} = this.props;
    const {validateFields, getFieldsValue} = form;
    const {documents, ...formValues} = getFieldsValue();
    const {others, ...documentsData} = this.state.documents;
    let otherDocumentsData = this.getOtherDocumentsData(documents?.others);

    validateFields(errors => {
      if (errors) {
        return
      }
      const data = {
        formValues,
        documents: documentsData,
        otherDocuments: otherDocumentsData
      };
      onOk(data)
    })
  };

  getContactValue = (name, from) => {
    if (from) {
      let _filteredContact = from.filter(item => {
        return item.name === name;
      })
      return _filteredContact[0]?.value;
    }
  };

  getDivCount = (e) => {
    let arr = [];
    for (let i = 0; i < e; i++) {
      arr.push(i);
    }
    return arr;
  };

  //User documents functionality
  getOtherDocumentsData = documents => {
    let returnData = [];
    let others = this.state.documents.others;

    for (let i = 0; i < others.length; i++) {
      if (!!others[i]) {
        if (others[i].uid === documents[i].file.uid) {
          returnData.push({file: others[i], type: documents[i].type});
        }
      }
    }
    return returnData;
  };
  customFileRequest = (file, type, key = 0) => {
    if (type === 'others') {
      this.setState(state => {
        let othersCopy = [...state.documents.others];
        othersCopy[key] = file;
        return {
          documents: {...state.documents, others: othersCopy}
        };
      });
      return
    }

    this.setState(state => ({
      documents: {...state.documents, [type]: file},
    }));
    return
  };
  beforeFileUpload = file => {
    const {i18n} = this.props;
    const isRightType = this.isAllowedFileType(file.type);
    if (!isRightType) {
      message.error(i18n.t`Incorrect file type!`);
    }
    const isLt2M = file.size / 10240 / 10240 < 2;
    if (!isLt2M) {
      message.error(i18n.t`File must be smaller than 10MB!`);
    }
    return isRightType && isLt2M;
  };
  isAllowedFileType = type => {
    return !!ALLOWED_FILE_TYPES.find(element => (element === type));
  };
  //End user documents functionality

  //User Position AutoComplete functionality
  handlePositionSearch = value => {
    const _dataSource = !value ? [] : this.searchPositionResult(value);
    this.setState({
      userPositions: _dataSource,
    });
  };
  searchPositionResult = (query) => {
    const {positions} = this.props;

    return positions.filter(position => {
      return position.toLowerCase().includes(query.toLowerCase());
    })
      .map((position, idx) => {
        return position
      });
  };
  renderPositionOption = (item, index) => {
    return (
      <AutoComplete.Option key={index} text={item} value={item}>
        <div>
          <span>
              {item}
          </span>
        </div>
      </AutoComplete.Option>
    );
  };

  //End User Position AutoComplete functionality

  render() {
    const {item = {}, onOk, onCancel, form, i18n, ...modalProps} = this.props;
    const {getFieldDecorator} = form;
    const {roles = [], skills = []} = modalProps;
    let lang = i18n.language == 'en' ? en_GB : hy_AM;

    const status = item.status !== undefined ? item.status : 1;

    const user_skills = item?.skills ? item?.skills.map(item => item.name) : [];

    return (
      <Modal {...modalProps}
             className={styles['addUserModal']}
             closeIcon={
               <span className="close-icon">
                <Icons name="close"/>
               </span>
             }
             footer={null}
             width="initial"
      >
        <Form layout="horizontal">
          <Row type="flex" justify="space-between" gutter={22}>
            <Col lg={12}>
              <FormItem
                label={i18n.t`Name*`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('name', {
                  initialValue: item?.name,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Name is required`,

                    },
                    {
                      pattern: /^[^0-9\s-*\/=;'":,`!@#$%^&()\[\]\{\}\\\|<>+_՞»«՜։]*$/,
                      message: i18n.t`Name must contain only letters`,
                    },
                    {
                      max: 70,
                    },
                  ],
                })(<Input className="input-global-md color-black font-medium"/>)}
              </FormItem>
            </Col>
            <Col lg={12}>
              <FormItem
                label={i18n.t`Surename*`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('surname', {
                  initialValue: item?.surname,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Surename is required`,

                    },
                    {
                      pattern: /^[^0-9\s*\/=;'":,`!@#$%^&()\[\]\{\}\\\|<>+_՞»«՜։]*$/,
                      message: i18n.t`Surname must contain only letters`,
                    },
                    {
                      max: 191,
                    },
                  ],
                })(<Input className="input-global-md color-black font-medium"/>)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" gutter={22}>
            <Col lg={12}>
              <FormItem
                hasFeedback
                label={i18n.t`Email*`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('email', {
                  initialValue: item?.email,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`E-mail is required!`,
                    },
                    {
                      type: 'email',
                      message: i18n.t`The E-mail is not valid!`,
                    },
                  ],
                })(<Input className="input-global-md color-black font-medium"/>)}
              </FormItem>
            </Col>
            <Col lg={12}>
              <FormItem
                label={i18n.t`Phone Number*`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('contacts[workedNumber]', {
                  valuePropName: 'defaultValue',
                  initialValue: this.getContactValue('Phone', item?.contacts),
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Phone Number is required`,

                    },
                    {
                      message: i18n.t`Phone must be a number.`
                    },
                  ],
                })(
                  <PhoneInput
                    value={this.state.phone}
                    inputStyle={{width: '100%', paddingLeft: '55px'}}
                    masks={{am: '(..) ..-..-..'}}
                    specialLabel={null}
                    country={'am'}
                    inputClass="input-global-md color-black font-medium form-control"
                  />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col lg={24}>
              <FormItem
                label={i18n.t`Address`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('contacts[address1]', {
                  initialValue: item?.address,
                  rules: [
                    {
                      max: 191,
                    },
                  ],
                })(<Input
                  style={{width: '100%'}}
                  className="input-global-md color-black font-medium"/>)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" gutter={22}>
            <Col lg={12}>
              <FormItem
                label={i18n.t`Role*`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']} role-sel`}
              >
                {getFieldDecorator('role', {
                  initialValue: item?.user_role?.name,
                  rules: [
                    {required: true, message: i18n.t`Assign role for this user`, type: 'string'},
                  ],
                })(
                  <Select
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    dropdownClassName={styles.roleDropdown}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                  >
                    {roles.map((role, index) => {
                      return <Select.Option key={index} value={role}>{i18n._(role)}</Select.Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col lg={12}>
              <FormItem
                label={i18n.t`Position`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']} position-sel`}
                style={{marginBottom: 0}}
              >
                {getFieldDecorator('position', {
                  initialValue: item?.position,
                  rules: [
                    {
                      max: 191,
                    },
                  ],
                })(<AutoComplete
                  dataSource={this.state.userPositions.map(this.renderPositionOption)}
                  onSearch={this.handlePositionSearch}
                  optionLabelProp="text"
                  showArrow={false}
                  className="input-global-md w_100 color-black font-medium select-autoComplete inp-pos"
                />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col lg={24}>
              <FormItem
                label={i18n.t`Skills`}
                className={`${globalStyles['input-md-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('skills', {
                  initialValue: user_skills,
                })(
                  <Select
                    className="input-tags select-global-md select-text-lowercase"
                    mode="tags"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    {skills && skills.map((skill) => (
                      <Select.Option key={'skills' + skill.id} value={skill.name}>
                        {skill.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col lg={24}>
              <FormItem
                label={i18n.t`About`}
                className={`${globalStyles['input-xxl-ex']} ${globalStyles['label-grey']}`}
              >
                {getFieldDecorator('about', {
                  initialValue: item?.user_about ?? '',
                })
                (<Input.TextArea rows={3} cols={24} className="textarea-field"/>)}
              </FormItem>
            </Col>
          </Row>
          <Row className={styles['modal-footer']} type="flex" align="middle" justify='end'>
            <Button
              className={`${styles['modal-footer-cancel']} app-btn primary-btn-outlined md`}
              onClick={onCancel}
            >
              {i18n.t`Cancel`}
            </Button>

            <Button
              className={`${styles['modal-footer-submit']} app-btn primary-btn md`}
              onClick={this.handleOk}
            >
              {i18n.t`Save`}
            </Button>
          </Row>
        </Form>
      </Modal>
    );
  }
}

UserModal.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
};

export default UserModal;
