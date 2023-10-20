import React from "react";
import styles from "./style.less";
import {Button, ConfigProvider, DatePicker, Input, message, Popconfirm, Row, Col, Select} from "antd";
import moment from "moment";
import {withRouter} from "dva/router";
import {withI18n} from "@lingui/react";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {Form} from "@ant-design/compatible";
import { Popover } from 'antd';
import {connect} from "dva";
import Icons from 'icons/icon';
import classnames from "classnames";
import {DEGREES, USER_DYNAMIC_COMPONENTS} from 'utils/constant'

const FormItem = Form.Item;
const mapStateToProps = ({userDetail}) => ({userDetail});

@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)
class FormUniversityInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      universityData: {
        active: 1,
        education: [],
        deletedEducationsId: [],
        actionType: '',
        editDisplay: true,
        from: null,
        to: null,
      },
      matches: window.matchMedia("(min-width: 768px)").matches,
      isIconVisible: true,
      show: true,
      isSubmittedLoading: false
    };
  }

  #dateFormat = 'YYYY/MM/DD';

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    this.setState({
      show: true
    })
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  iconRemove = () => {
    this.setState({
      isIconVisible: false,
    })
  }

  iconVisible = () => {
      this.setState({
        isIconVisible: true,
      })
  }

  setIsSubmittedLoading = (value) => {
    this.setState({
      isSubmittedLoading: value
    });
  };

  deleteForm = (id) => {
    const {universityData: {education, deletedEducationsId}} = this.state,
      deletedIds = [...deletedEducationsId],
      shallowCopyUniversity = [...education],
      filterUniversity = shallowCopyUniversity.filter((edu) => String(edu.id) !== String(id));
    let universityData;
    universityData = {
      ...this.state.universityData,
      education: [...filterUniversity]
    }
    this.setState({
      show: true
      }
    )
    deletedIds.push(id)
    universityData.deletedEducationsId = [...deletedIds]
    this.setState({
      universityData: {
        ...universityData,
        actionType: '',
        editDisplay: true,
      }
    })

  }

  addUniversityData = (e, formId, type) => {
    e.preventDefault();
    const {form, dispatch, userDetail, i18n} = this.props,
      edu = userDetail[USER_DYNAMIC_COMPONENTS.EDU],
      {getFieldsValue, validateFields} = form,
      formValues = getFieldsValue();

    validateFields(errors => {
      if (errors) return;
      this.setIsSubmittedLoading(true);
      process.nextTick(() => {
        const updateData = {
          ...formValues,
          formId: formId,
          id: edu.id,
          type: type,
          tab: "edu",
        };
        dispatch({
          type: `userDetail/update`,
          payload: updateData,
        }).then(response => {
          if (response.success) {
            message.success(response.message);
            this.deleteForm(formId, type);
            this.iconVisible();
          }
        });
        setTimeout(() => {
          this.setIsSubmittedLoading(false);
        }, 0);
      });
    });
  }

  disabledDate = (current, university, type) => {
    if (type === 'ending_in') {
      const to = this.props.form.getFieldValue('starting_from') ? this.props.form.getFieldValue('starting_from') : moment(university.from)
      return current && current <= to;
    } else {
      const from = this.props.form.getFieldValue('ending_in') ? this.props.form.getFieldValue('ending_in') : moment(university.to)
      return current && current >= from;
    }
  }

  toPaintUniversityForm = () => {
    const {universityData: {education, actionType}, isSubmittedLoading} = this.state,
      {i18n, form, permissionsUser} = this.props,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM,
      {addEducationAccess} = permissionsUser;
    if (education.length === 0) {
      return addEducationAccess && <span onClick={() => {this.addUniversity(); this.iconRemove()}} className="add-btn">{i18n.t`+ Add`}</span>
    }
    return education.map((university, index) => (
        <div className={styles['formBlock']} key={index}>
          <Row>
            <Col>
              <ConfigProvider locale={lang}>
                <span className="label-txt">{i18n.t`University Name`}</span>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`school`, {
                    initialValue: university.school && university.school,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`University name is required!`
                      },
                      {
                        max: 191,
                        message: i18n.t`Field name is too long!`
                      },
                    ]
                  })(<Input
                    placeholder={i18n.t`Ex: United State University`}
                    className="input-global-md w_100 color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <Row>
            <Col>
              <ConfigProvider locale={lang}>
                <span className="label-txt">{i18n.t`Degree`}</span>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`degree`, {
                    initialValue: DEGREES[university.degree] && i18n._(DEGREES[university.degree].value),
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Degree is required!`
                      },
                    ]
                  })((<Select
                    placeholder={i18n.t`Degree`}
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {Object.keys(DEGREES).map(key => {
                      if (DEGREES.hasOwnProperty(key)) {
                        return <Select.Option key={DEGREES[key].name}
                                              value={DEGREES[key].value}>{i18n._(DEGREES[key].name)}</Select.Option>
                      }
                    })}
                  </Select>))}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <Row>
            <Col>
              <ConfigProvider locale={lang}>
                <span className="label-txt">{i18n.t`Faculty of study`}</span>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`faculty_of_study`, {
                    initialValue: university.faculty_of_study,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Faculty of study is required!`
                      },
                      {
                        max: 191,
                        message: i18n.t`Field name is too long!`
                      },
                    ]
                  })(<Input
                    placeholder={i18n.t`Ex: Psychology and Philosophy`}
                    className="input-global-md w_100 color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <Row>
            <Col>
              <ConfigProvider locale={lang}>
                <span className="label-txt">{i18n.t`Field of study`}</span>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`field_of_study`, {
                    initialValue: university.field_of_study,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Field of study is required!`
                      },
                      {
                        max: 191,
                        message: i18n.t`Field name is too long!`
                      },
                    ]
                  })(<Input placeholder={i18n.t`Ex: Management of Psychology `}
                            className="input-global-md w_100 color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <span className="label-txt">{i18n.t`Time Period`}</span>
          <Row type="flex" justify="space-between" gutter={10} className={styles['mobile-row-width']}>
            <Col lg={12} className={styles['mobile-column-width']}>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`starting_from`, {
                    initialValue: university.from ? moment(university.from) : null,
                    valuePropName: 'defaultValue',
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Starting From is required!`
                      },
                    ]
                  })(<DatePicker format={this.#dateFormat}
                                 disabledDate={(current) => this.disabledDate(current, university, 'starting_from')}
                                 className="datepicker-global-md w_100 ex_p-l-r-3 w_100 no-icon-w-reset color-black font-medium svg-icon"
                                 placeholder={i18n.t`Start`}
                                 getCalendarContainer={triggerNode => triggerNode.parentNode}
                                 suffixIcon={<Icons name="calendar"/>}/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={12} className={styles['mobile-column-width']}>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`ending_in`, {
                    initialValue: university.to ? moment(university.to) : null,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Ending In is required!`
                      },
                    ]
                  })(<DatePicker
                    disabledDate={(current) => this.disabledDate(current, university, 'ending_in')}
                    format={this.#dateFormat}
                    className="datepicker-global-md w_100 ex_p-l-r-3 no-icon-w-reset color-black font-medium svg-icon"
                    placeholder={i18n.t`End`}
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    suffixIcon={<Icons name="calendar"/>}/>
                  )}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <div className={styles['form-actions']}>
            <Button
              className={`app-btn primary-btn-outline ${styles['mobile-btn-width']}`}
              onClick={() => {this.deleteForm(university.id, "edu"); this.iconVisible()}}>{i18n.t`Cancel`}
            </Button>
            <Button
              className={`app-btn primary-btn ${styles['mobile-btn-width']}`}
              disabled={isSubmittedLoading}
              onClick={(e) => this.addUniversityData(e, university.id, 'university')}>{i18n.t`Save`}
            </Button>
          </div>
        </div>
      )
    )
  }

  addUniversity = () => {
    this.setState({
        show:false
      }
    )
    const {universityData: {education}} = this.state,
      edu = {
        id: "",
        school: "",
        degree: "",
        faculty_of_study: "",
        field_of_study: "",
        from: "",
        to: "",
        description: ""
      };
    education.push(edu)
    this.setState((state) => {
      return {
        universityData: {
          ...state.universityData,
          education,
          editDisplay: false,
          actionType: 'add',
        }
      }
    })
  }

  editUniversity = (item) => {
    const {universityData: {education}} = this.state,
      edu = {
        id: item.id,
        school: item.education_institution,
        degree: Object.keys(DEGREES).filter(key => DEGREES[key].value === parseInt(item.degree)),
        faculty_of_study: item.faculty_and_department,
        field_of_study: item.profession,
        from: item.from,
        to: item.to,
        description: item.description
      };
    education.push(edu)
    this.setState({
        show: false
      }
    )
    this.setState((state) => {
      return {
        universityData: {
          ...state.universityData,
          education,
          editDisplay: false,

          actionType: 'edit'
        }
      }
    })
  }

  deleteUniversity = (e, item, type) => {
    const {dispatch} = this.props;
    process.nextTick(() => {
      const deleteData = {
        edu_id: item.id,
        user_id: item.user_id,
        tab: "edu",
        type: type
      };
      dispatch({
        type: `userDetail/delete`,
        payload: deleteData,
      })
    });
  }

  handleEditUniversity = (item) => {
    const {universityData: {editDisplay}} = this.state;
    return <>
      { this.state.matches ?
        editDisplay &&
        <span className={styles['ml156']} onClick={(e) => this.editUniversity(item)}>
          <Icons tabIndex={"0"} name="edit"/>
        </span>
        :
        editDisplay &&
        <span className={styles['ml156']} onClick={(e) => {this.editUniversity(item); this.iconRemove()}}>
          <p className={styles['popover-media-text']}>Edit</p>
        </span>
      }
    </>
  }

  render() {
    const {universityData: {education, actionType, editDisplay}} = this.state,
      {i18n, userDetail, permissionsUser} = this.props,
      edu = userDetail[USER_DYNAMIC_COMPONENTS.EDU],
      {viewEducationAccess, editEducationAccess, deleteEducationAccess} = permissionsUser;
    return (
      <div className={styles['mb-30']}>
        <Form className={this.state.show ? styles['sectionRow'] : styles['sectionRow1']}>
          <h3 className={styles['content-title']}>{i18n.t`University`}</h3>
          <div className={styles['eduForm']}>
            {actionType !== 'edit' && this.toPaintUniversityForm()}
          </div>
        </Form>
        {viewEducationAccess &&
        edu.educations && edu.educations.map((item, index) => {
          if (item.type === 'university') {
            return (
              <div key={index}
                   className={classnames(styles['dataSection'], this.state.show ? styles['sectionRow'] : styles['sectionRow1'])}>
                {actionType !== 'edit' && actionType !== 'add' && <div className={styles['dataSectionItem']}>
                  <div className={styles['icon']}>
                    <span><Icons name={'education'}/></span>
                  </div>
                  <div className={styles['educationData']}>
                    <span className={styles['label']}>{item.education_institution}</span>
                    {/*{Object.keys(DEGREES).map(key => {*/}
                    {/*  if (DEGREES.hasOwnProperty(key)) {*/}
                    {/*    if (DEGREES[key].value === parseInt(item.degree)) {*/}
                    {/*      return (<span className={styles.label1}>{i18n._(DEGREES[key].name)}</span>)*/}
                    {/*    }*/}
                    {/*  }*/}
                    {/*})*/}
                    {/*}*/}
                    <span className={styles['label1']}>{`${item.faculty_and_department} - ${item.profession}`}</span>
                    <span className={styles['label2']}>
                      {`${moment(item.from).format('MMM YYYY')} - ${moment(item.to).format('MMM YYYY')}`}
                    </span>
                  </div>
                </div>}

                { this.state.matches ?
                  <div className={styles['dFlex']}>
                    <Form>
                      <div className={styles['eduForm']}>
                        {actionType === 'edit' && item.id === education[0]?.id && this.toPaintUniversityForm()}
                      </div>
                    </Form>
                    {editEducationAccess && this.handleEditUniversity(item)}
                    {deleteEducationAccess && editDisplay && <Popconfirm
                      tabIndex="0"
                      title={i18n.t`Are you sure delete this item?`}
                      okText={i18n.t`Yes`}
                      onConfirm={(e) => this.deleteUniversity(e, item, 'university')}
                    >
                      <span className={styles['ml156']}>
                        <Icons tabIndex={"0"} name="delete"/>
                      </span>
                    </Popconfirm>
                    }
                  </div>
                  :
                  <div className={styles['popover-media-container']}>
                    <Form>
                      <div className={styles['eduForm']}>
                        {actionType === 'edit' && item.id === education[0]?.id && this.toPaintUniversityForm()}
                      </div>
                    </Form>
                    {this.state.isIconVisible &&
                    <Popover
                      overlayClassName={styles['popover-media-content']}
                      content={<div className={styles['dFlex']}>
                        {editEducationAccess && this.handleEditUniversity(item)}
                        {deleteEducationAccess && editDisplay && <Popconfirm
                          tabIndex="0"
                          title={i18n.t`Are you sure delete this item?`}
                          okText={i18n.t`Yes`}
                          onConfirm={(e) => this.deleteUniversity(e, item, 'university')}
                        >
                            <span className={styles['ml156']}>
                              <p className={styles['popover-media-text']}>Delete</p>
                            </span>
                        </Popconfirm>
                        }
                      </div>
                      }
                      trigger="click"
                      placement="rightTop"
                    >
                      {actionType !== 'edit' &&
                      <div className={styles['popover-media-icon']}>
                        <svg width="4" height="18" viewBox="0 0 4 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M2 4C2.39556 4 2.78224 3.8827 3.11114 3.66294C3.44004 3.44318 3.69639 3.13082 3.84776 2.76537C3.99914 2.39992 4.03874 1.99778 3.96157 1.60982C3.8844 1.22186 3.69392 0.865492 3.41421 0.585787C3.13451 0.306082 2.77814 0.115601 2.39018 0.0384303C2.00222 -0.0387401 1.60009 0.000866562 1.23463 0.152242C0.869182 0.303617 0.556825 0.559962 0.337062 0.88886C0.117299 1.21776 1.07779e-06 1.60444 1.07779e-06 2C1.07779e-06 2.53043 0.210715 3.03914 0.585788 3.41421C0.960861 3.78929 1.46957 4 2 4ZM2 14C1.60444 14 1.21776 14.1173 0.888861 14.3371C0.559963 14.5568 0.303617 14.8692 0.152242 15.2346C0.000866562 15.6001 -0.0387401 16.0022 0.0384303 16.3902C0.115601 16.7781 0.306083 17.1345 0.585788 17.4142C0.865493 17.6939 1.22186 17.8844 1.60982 17.9616C1.99778 18.0387 2.39992 17.9991 2.76537 17.8478C3.13082 17.6964 3.44318 17.44 3.66294 17.1111C3.8827 16.7822 4 16.3956 4 16C4 15.4696 3.78929 14.9609 3.41421 14.5858C3.03914 14.2107 2.53043 14 2 14ZM2 7C1.60444 7 1.21776 7.1173 0.888861 7.33706C0.559963 7.55682 0.303617 7.86918 0.152242 8.23463C0.000866562 8.60009 -0.0387401 9.00222 0.0384303 9.39018C0.115601 9.77814 0.306083 10.1345 0.585788 10.4142C0.865493 10.6939 1.22186 10.8844 1.60982 10.9616C1.99778 11.0387 2.39992 10.9991 2.76537 10.8478C3.13082 10.6964 3.44318 10.44 3.66294 10.1111C3.8827 9.78224 4 9.39556 4 9C4 8.46957 3.78929 7.96086 3.41421 7.58579C3.03914 7.21071 2.53043 7 2 7Z"
                            fill="black" fillOpacity="0.29"/>
                        </svg>
                      </div>
                      }
                    </Popover>
                    }
                  </div>
                }
              </div>
            )
          }
        })
        }
      </div>
    )
  }
}

export default FormUniversityInfo
