import React from "react";
import {Col, ConfigProvider, DatePicker, Checkbox, Row, AutoComplete, Input, Popconfirm} from "antd";
import moment from "moment";
import {withRouter} from "dva/router";
import {withI18n} from "@lingui/react";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {Form} from "@ant-design/compatible";

import Icons from 'icons/icon';
import styles from "./WorkExperience.less";
import {v4 as uuidv4} from 'uuid';

const initialState = {
    presentChecked: false,
    allUserPositions: [],
    jobInformationArr: [],
    jobsWorkContractEndDate: {},
  },
  FormItem = Form.Item;

@withRouter
@withI18n()

class WorkExperience extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      matches: window.matchMedia("(min-width: 768px)").matches,
    };
  }

  #dateFormat = 'YYYY/MM/DD';

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    if (this.props?.details?.allPositions && this.state.allUserPositions !== this.props?.details?.allPositions) {
      this.touchAllUserPositions();
    }
    if (this.props.details?.user_job_information && this.props.details?.user_job_information !== this.state?.jobInformationArr) {
      this.touchJobInformationData();
    }
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentDidUpdate(oldProps) {
    if (oldProps?.details?.allPositions !== this.props?.details?.allPositions) {
      this.touchAllUserPositions();
    }
    if (oldProps?.details?.user_job_information !== this.props.details?.user_job_information) {
      this.touchJobInformationData();
    }
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  touchAllUserPositions = () => {
    this.setState({
      allUserPositions: this.props?.details?.allPositions,
    });
  }

  touchJobInformationData = () => {
    const _jobsWorkContractEndDate = {...this.state.jobsWorkContractEndDate};
    const _jobInformationArr = [...this.props.details?.user_job_information].map(job => {
      job.key = uuidv4();
      job.presentChecked = !job.work_contract_end_date;
      if (_jobsWorkContractEndDate[job.key] === undefined) {
        _jobsWorkContractEndDate[job.key] = {};
      }
      _jobsWorkContractEndDate[job.key].work_contract_end_date = job.work_contract_end_date ? moment(job.work_contract_end_date) : null;
      return job;
    });

    this.setState({
      jobInformationArr: _jobInformationArr,
      jobsWorkContractEndDate: _jobsWorkContractEndDate,
    }, () => {
      const {handleChangeWorkContractEndDate} = this.props;
      handleChangeWorkContractEndDate(_jobsWorkContractEndDate);
    });
  }

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

  handlePositionSearch = value => {
    const _dataSource = !value ? [] : this.searchPositionResult(value);
    this.setState({
      allUserPositions: _dataSource,
    });
  };

  searchPositionResult = (query) => {
    const {details} = this.props;
    const {allPositions} = details;

    return allPositions.filter(position => {
      return position.toLowerCase().includes(query.toLowerCase());
    })
      .map((position, idx) => {
        return position
      });
  };

  handleChangeWorkContractEndTime = (data, jobInformation) => {
    const _jobsWorkContractEndDate = {...this.state.jobsWorkContractEndDate};
    const _jobInformationArr = [...this.state.jobInformationArr].map(job => {
      if (job.key === jobInformation.key) {
        job.work_contract_end_date = data;
        job.presentChecked = !data;
        if (_jobsWorkContractEndDate[job.key] === undefined) {
          _jobsWorkContractEndDate[job.key] = {};
        }
        _jobsWorkContractEndDate[job.key].work_contract_end_date = data;
      }
      return job;
    })
    this.setState({
      jobInformationArr: _jobInformationArr,
      jobsWorkContractEndDate: _jobsWorkContractEndDate,
    }, () => {
      const {handleChangeWorkContractEndDate} = this.props;
      handleChangeWorkContractEndDate(_jobsWorkContractEndDate);
    });
  }

  handleAddWorkExperience = () => {
    const {jobInformationArr} = this.state;
    const item = {
      id: null,
      key: uuidv4(),
      position: null,
      position_description: null,
      company_name: null,
      experimental_period_end_date: null,
      experimental_period_start_date: null,
      location: null,
      interview: null,
      work_contract: null,
      work_contract_start_date: null,
      work_contract_end_date: null,
      presentChecked: false,
    };
    this.setState({
      jobInformationArr: [item, ...jobInformationArr]
    });
  }

  handleRemoveJobInformation = (e, jobInformation) => {
    const {details} = this.props;
    const {onRemoveJobInformation} = details;
    if (jobInformation.id) {
      onRemoveJobInformation(jobInformation);
    } else {
      this.setState({
        jobInformationArr: this.state.jobInformationArr.filter(item => item.key !== jobInformation.key)
      });
    }
  }


  render() {
    const {jobInformationArr} = this.state;
    const {i18n, editJobInfoAccess, deleteJobInfoAccess, form} = this.props;
    const lang = i18n.language === 'en' ? en_GB : hy_AM;
    const {getFieldDecorator} = form;
    return (
      <>
        <div className={styles['dFlex']}>
          <h3 className={styles['content-title']}>{i18n.t`Work Experience`}</h3>
          <span onClick={this.handleAddWorkExperience} className="add-btn">{i18n.t`+ Add`}</span>
        </div>
        {jobInformationArr.map((jobInformation, index) => {
          const key = jobInformation.key;
          return (
            <div key={`${jobInformation.key}-${index}`}>
              <FormItem style={{display: 'none'}}>
                {getFieldDecorator('jobs[' + key + '][id]', {
                  initialValue: jobInformation?.id
                })(<Input
                  disabled={!editJobInfoAccess}
                  type={'hidden'}
                />)}
              </FormItem>
              <Row type="flex" justify="space-between" gutter={16} className={styles['workExp']}>
                <Col lg={12} md={24} sm={24} xs={24}>
                  <span className="label-txt">{i18n.t`Job Title `}*</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('jobs[' + key + '][position]', {
                      initialValue: jobInformation?.position,
                      rules: [
                        {
                          max: 191,
                          required: true,
                          message: i18n.t`Job title is required`
                        },
                      ],
                    })(<AutoComplete
                      dataSource={this.state.allUserPositions.map(this.renderPositionOption)}
                      onSearch={this.handlePositionSearch}
                      placeholder={i18n.t`Ex: UI/UX Designer`}
                      optionLabelProp="text"
                      disabled={!editJobInfoAccess}
                      showArrow={false}
                      className="w_100 color-black font-medium select-autoComplete"
                    />)}
                  </FormItem>
                </Col>
                <Col lg={12} md={24} sm={24} xs={24}>
                  <span className="label-txt">{i18n.t`The company’s name`}*</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('jobs[' + key + '][company_name]', {
                      initialValue: jobInformation?.company_name,
                      rules: [
                        {
                          max: 191,
                          required: true,
                          message: i18n.t`The company’s name is required`
                        },
                      ],
                    })(
                      <Input
                        disabled={!editJobInfoAccess}
                        placeholder={i18n.t`Ex: Google`}
                        className="input-global-md w_100 color-black font-medium"
                      />)}
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" gutter={16} className={styles['workExp']}>
                <Col lg={12} md={24} sm={24} xs={24}>
                  <span className="label-txt">{i18n.t`Location`}*</span>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator('jobs[' + key + '][location]', {
                      initialValue: jobInformation?.location,
                      rules: [
                        {
                          max: 191,
                          required: true,
                          message: i18n.t`Location is required`
                        },
                      ],
                    })(
                      <Input
                        disabled={!editJobInfoAccess}
                        placeholder={i18n.t`Ex: Yerevan, Armenia`}
                        className="input-global-md w_100 color-black font-medium"
                      />)}
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" gutter={16}>
                <Col lg={12} className={styles['responsive-date']}>
                  <span className="label-txt">{i18n.t`InterviewDate`}</span>
                  <ConfigProvider locale={lang}>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('jobs[' + key + '][interview]', {
                        initialValue: jobInformation?.interview ?
                          moment(jobInformation?.interview) : null,
                      })(<DatePicker
                        disabled={!editJobInfoAccess}
                        format={this.#dateFormat}
                        placeholder={i18n.t`Select date`}
                        suffixIcon={
                          <Icons name="calendar"/>
                        }
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                        className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                      />)}
                    </FormItem>
                  </ConfigProvider>
                </Col>
                <Col lg={6} className={styles['responsive-date-range']}>
                  <span className="label-txt">{i18n.t`TrialPeriod`}</span>
                  <ConfigProvider locale={lang}>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('jobs[' + key + '][experimental_period_start_date]', {
                        initialValue: jobInformation?.experimental_period_start_date ?
                          moment(jobInformation?.experimental_period_start_date) : null,
                      })(<DatePicker
                        disabled={!editJobInfoAccess}
                        format={this.#dateFormat}
                        suffixIcon={
                          <Icons name="calendar"/>
                        }
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                        className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                        placeholder={i18n.t`Start`}
                      />)}
                    </FormItem>
                  </ConfigProvider>
                </Col>
                <Col lg={6} style={{marginTop: "20px"}} className={styles['responsive-date-range']}>
                  <ConfigProvider locale={lang}>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('jobs[' + key + '][experimental_period_end_date]', {
                        initialValue: jobInformation?.experimental_period_end_date ?
                          moment(jobInformation?.experimental_period_end_date) : null,
                      })(<DatePicker
                        disabled={!editJobInfoAccess}
                        format={this.#dateFormat}
                        suffixIcon={
                          <Icons name="calendar"/>
                        }
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                        className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                        placeholder={i18n.t`End`}
                      />)}
                    </FormItem>
                  </ConfigProvider>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" gutter={16}>
                <Col lg={12} className={styles['responsive-date']}>
                  <span className="label-txt">{i18n.t`Work Date`}</span>
                  <ConfigProvider locale={lang}>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('jobs[' + key + '][work_contract]', {
                        initialValue: jobInformation?.work_contract ?
                          moment(jobInformation?.work_contract) : null,
                      })(<DatePicker
                        disabled={!editJobInfoAccess}
                        format={this.#dateFormat}
                        suffixIcon={
                          <Icons name="calendar"/>
                        }
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                        className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                        placeholder={i18n.t`Select date`}
                      />)}
                    </FormItem>
                  </ConfigProvider>
                </Col>
                <Col lg={6} className={styles['responsive-date-range']}>
                  <span className="label-txt">{i18n.t`Contract Date`}</span>
                  <ConfigProvider locale={lang}>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('jobs[' + key + '][work_contract_start_date]', {
                        initialValue: jobInformation?.work_contract_start_date ?
                          moment(jobInformation?.work_contract_start_date) : null,
                      })(<DatePicker
                        disabled={!editJobInfoAccess}
                        format={this.#dateFormat}
                        suffixIcon={
                          <Icons name="calendar"/>
                        }
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                        className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                        placeholder={i18n.t`Start`}
                      />)}
                    </FormItem>
                  </ConfigProvider>
                </Col>
                <Col lg={6} style={{marginTop: "20px"}} className={styles['responsive-date-range']}>
                  <ConfigProvider locale={lang}>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('jobs[' + key + '][work_contract_end_date]', {
                        initialValue: jobInformation?.work_contract_end_date ? moment(jobInformation?.work_contract_end_date) : null
                      })(
                        <DatePicker
                          disabled={!editJobInfoAccess}
                          format={this.#dateFormat}
                          suffixIcon={
                            <Icons name="calendar"/>
                          }
                          getCalendarContainer={triggerNode => triggerNode.parentNode}
                          className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                          onChange={(e) => this.handleChangeWorkContractEndTime(e, jobInformation)}
                          placeholder={i18n.t`End`}
                        />
                      )}
                      <span className={`${styles['datepicker-present']} label-txt`}>
                        {jobInformation?.work_contract_end_date
                          ? moment(jobInformation?.work_contract_end_date) > moment() && i18n.t`Present`
                          : i18n.t`Present`}
                      </span>
                    </FormItem>
                  </ConfigProvider>
                </Col>
              </Row>
              <div className={styles['form-delete-action']} >
                {deleteJobInfoAccess && <Popconfirm
                  tabIndex="0"
                  title={i18n.t`Are you sure delete this item?`}
                  okText={i18n.t`Yes`}
                  onConfirm={(e) => this.handleRemoveJobInformation(e, jobInformation)}
                >
                <span className={styles['ml156']}>
                  <Icons tabIndex={"0"} name="delete"/>
                </span>
                </Popconfirm>}

              </div>
            </div>
          )
        })}
      </>
    )
  }
}

export default WorkExperience;
