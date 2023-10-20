import React from "react";
import styles from "./style.less";
import {Button, ConfigProvider, message, Popconfirm, Row, Col, Select, Popover} from "antd";
import {withRouter} from "dva/router";
import {withI18n} from "@lingui/react";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {LANGUAGES_PROFICIENCY, LANGUAGES_LIST, USER_DYNAMIC_COMPONENTS} from 'utils/constant'
import {Form} from "@ant-design/compatible";
import {connect} from "dva";
import Icons from 'icons/icon';
import classnames from "classnames";

const {Option} = Select;
const FormItem = Form.Item;
const mapStateToProps = ({userDetail}) => ({userDetail});

@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)
class FormLanguageInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {  languageData: {
        active: 1,
        education: [],
        deletedEducationsId: [],
        actionType: '',
        editDisplay: true,
      },
      matches: window.matchMedia("(min-width: 768px)").matches,
      isPopOverVisible: true,
      show: true,
      isSubmittedLoading: false
    };
  }

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  popOverRemove = () => {
    this.setState({
      isPopOverVisible: false,
    })
  }

  popOverVisible = () => {
    this.setState({
      isPopOverVisible: true,
    })
  }

  setIsSubmittedLoading = (value) => {
    this.setState({
      isSubmittedLoading: value
    });
  };

 componentWillUnmount() {
   this.setState({
     show: true
   })
   window.matchMedia("(min-width: 768px)").removeListener(this.handler);
 }

  // #dateFormat = 'YYYY/MM/DD';
  deleteForm = (id, type) => {
    const {languageData: {education, deletedEducationsId}} = this.state,
      deletedIds = [...deletedEducationsId],
      shallowCopyEducation = [...education],
      filterEduactions = shallowCopyEducation.filter((edu) => String(edu.id) !== String(id));
    let languageData = {
      ...this.state.languageData,
      education: [...filterEduactions]
    }
    deletedIds.push(id)
    languageData.deletedEducationsId = [...deletedIds]
    this.setState({
      languageData: {
        ...languageData,
        actionType: '',
        editDisplay: true
      },
      show: true,
    }, () => this.state.languageData)
  }

  toPaintLanguageForm = () => {
    const {languageData: {education, actionType}, isSubmittedLoading} = this.state,
      {i18n, form, permissionsUser} = this.props,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM,
      {addLanguageAccess} = permissionsUser;
    if (education.length === 0) {
      return addLanguageAccess && <div className={styles['addLang']}><span onClick={() => {this.addLanguages(); this.popOverRemove()}} className="add-btn">{i18n.t`+ Add`}</span></div>
    }
    return education.map((edu, index) => (
        <div key={`edu-${index}-${edu.id}`} style={{marginTop: "20px"}}>
          <Row gutter={10} className={styles['form-input-row']}>
            <Col lg={12} className={styles['form-input-col-left']}>
              <span className="label-txt">{i18n.t`Language`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`language`, {
                    initialValue: edu.language && edu.language,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Language is required!`
                      },
                    ]
                  })(<Select
                    showSearch
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    placeholder={i18n.t`Languages`}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {
                      LANGUAGES_LIST.map((language, index) => <Option key={`l-${index}-${language}`}
                                                                      value={language}>{language}</Option>)
                    }
                  </Select>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={12} className={styles['form-input-col-right']}>
              <span className="label-txt">{i18n.t`Level`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('proficiency_level', {
                    initialValue: LANGUAGES_PROFICIENCY[edu.proficiency_level] && i18n._(LANGUAGES_PROFICIENCY[edu.proficiency_level].value),
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Proficiency Level is required!`
                      }
                    ]
                  })(<Select
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {Object.keys(LANGUAGES_PROFICIENCY).map(key => {
                      if (LANGUAGES_PROFICIENCY.hasOwnProperty(key)) {
                        return <Select.Option key={`lp-${key}-${LANGUAGES_PROFICIENCY[key].name}`}
                                              value={LANGUAGES_PROFICIENCY[key].value}>{i18n._(LANGUAGES_PROFICIENCY[key].name)}</Select.Option>
                      }
                    })}
                  </Select>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <div className={styles['form-actions']}>
            <Button className="app-btn primary-btn"
                    disabled={isSubmittedLoading}
                    onClick={(e) => this.addLanguageData(e, edu.id, 'language')}><span>{actionType !== 'edit' ? i18n.t`Add` : i18n.t`Edit`}</span></Button>
            <Button className="app-btn primary-btn-outline"
                    onClick={() => {
                      this.deleteForm(edu.id, "edu");
                      this.popOverVisible()
                    }}>{i18n.t`Cancel`}</Button>
          </div>
        </div>
      )
    )
  }

  addLanguages = () => {
    const {languageData: {education}} = this.state,
      edu = {
        id: "",
        language: "",
        proficiency_level: "",
      };
    education.push(edu)
    this.setState({
        languageData: {
          ...this.state.languageData,
          education,
          editDisplay: false,
          actionType: 'add',
        },
        show: false,
    })
  }

  addLanguageData = (e, formId, type) => {
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
            message.success(i18n.t`New language added successfully`);
            this.setIsSubmittedLoading(false);
            this.deleteForm(formId, type);
            this.popOverVisible();
          }
        })
      });
    })
  }

  deleteLanguage = (e, item, type) => {
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

  handleEditLanguage = (item) => {
    const {languageData: {editDisplay}} = this.state;

    return <>
      {this.state.matches ?
        editDisplay &&
        <span className={styles['ml156']} onClick={(e) => this.editLanguage(item)}>
          <Icons tabIndex={"0"} name="edit"/>
        </span>
        :
        editDisplay &&
        <span className={styles['ml156']} onClick={(e) => {this.editLanguage(item); this.popOverRemove()}}>
          <p className={styles['popover-media-text']}>Edit</p>
        </span>
      }
    </>
  }

  editLanguage = (item) => {
    const {languageData: {education}} = this.state,
      edu = {
        id: item.id,
        language: item.language,
        proficiency_level: Object.keys(LANGUAGES_PROFICIENCY).filter(key => LANGUAGES_PROFICIENCY[key].value === parseInt(item.proficiency_level))
      };
    education.push(edu)
    this.setState((state) => {
      return {
        languageData: {
          ...state.languageData,
          education,
          editDisplay: false,
          actionType: 'edit'
        },
        show: false,
      }
    })
  }

  render() {
    const {languageData: {education, actionType, editDisplay}} = this.state,
      {i18n, userDetail, permissionsUser} = this.props,
      edu = userDetail[USER_DYNAMIC_COMPONENTS.EDU],
      {viewLanguageAccess, editLanguageAccess, deleteLanguageAccess} = permissionsUser;
    return (
      <div className={styles['mb-30']}>
        <div className={this.state.show ? styles['sectionRow'] : styles['sectionRow1']}>
          <h3 className={styles['content-title']}>{i18n.t`Languages`}</h3>
          <div className={styles['eduForm']}>{actionType !== 'edit' && this.toPaintLanguageForm()}</div>
        </div>
        {viewLanguageAccess &&
        edu.languages && edu.languages.map((item, i) => {
          return (
            <div
              key={`el-${i}-${item.language}`}
              className={classnames(styles['dataSection'], this.state.show ? styles['sectionRow'] : styles['sectionRow1'])}>
              {actionType !== 'edit' && actionType !== 'add' && <div className={styles['dataSectionItem']}>
                  <div className={styles['icon']}>
                    <span><Icons name={'education'}/></span>
                  </div>
                <div className={styles['educationData']}>
                  <span className={styles['label']}>{item.language}</span>
                  {Object.keys(LANGUAGES_PROFICIENCY).map(key => {
                    if (LANGUAGES_PROFICIENCY.hasOwnProperty(key)) {
                      if (LANGUAGES_PROFICIENCY[key].value === parseInt(item.proficiency_level)) {
                        return (<span className={styles['label2']}
                                      key={`el-${i}-${key}-${item.language}`}>{i18n._(LANGUAGES_PROFICIENCY[key].name)}</span>)
                      }
                    }
                  })
                  }
                </div>
              </div>
              }

              { this.state.matches ?
                <div className={styles['dFlex']}>
                  <div className={!this.state.show ? styles['eduFormEditRow'] : ''}>
                    <div className={styles['eduForm']}>
                      {actionType === 'edit' && item.id === education[0]?.id && this.toPaintLanguageForm()}
                    </div>
                  </div>
                  {editLanguageAccess && this.handleEditLanguage(item)}
                  {deleteLanguageAccess && editDisplay && <Popconfirm
                    tabIndex="0"
                    title={i18n.t`Are you sure delete this item?`}
                    okText={i18n.t`Yes`}
                    onConfirm={(e) => this.deleteLanguage(e, item, 'lang')}
                  >
                 <span className={styles['ml156']}>
                   <Icons tabIndex={"0"} name="delete"/>
                 </span>
                  </Popconfirm>}
                </div>
                :
                <div className={styles['popover-media-container']}>
                  <div className={!this.state.show ? styles['eduFormEditRow'] : ''}>
                    <div className={styles['eduForm']}>
                      {actionType === 'edit' && item.id === education[0]?.id && this.toPaintLanguageForm()}
                    </div>
                  </div>

                  {this.state.isPopOverVisible &&
                  <Popover
                    overlayClassName={styles['popover-media-content']}
                    content={<div className={styles['dFlex']}>
                      {editLanguageAccess && this.handleEditLanguage(item)}
                      {deleteLanguageAccess && editDisplay && <Popconfirm
                        tabIndex="0"
                        title={i18n.t`Are you sure delete this item?`}
                        okText={i18n.t`Yes`}
                        onConfirm={(e) => this.deleteLanguage(e, item, 'lang')}
                      >
                         <span className={styles['ml156']}>
                            <p className={styles['popover-media-text']}>Delete</p>
                          </span>
                      </Popconfirm>}
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
        })
        }
      </div>
    )
  }
}

export default FormLanguageInfo
