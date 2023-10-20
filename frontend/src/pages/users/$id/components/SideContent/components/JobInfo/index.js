import React from 'react';
import PropTypes from 'prop-types';
import {withI18n} from "@lingui/react";
import styles from './style.less';
import {checkLoggedUserPermission} from 'utils';
import {
  Select,
  Input,
  Button,
  Col,
  Row,
} from 'antd';
import moment from 'moment';
import Icons from 'icons/icon';
import {Form} from "@ant-design/compatible";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {
  STATUSES,
  PERMISSIONS,
  USER_DYNAMIC_COMPONENTS
} from 'utils/constant';
import store from "store";
import {connect} from "dva";
import FormLanguageInfo from "../Education/FormLanguageInfo";
import WorkExperience from "./components/WorkExperience";

const FormItem = Form.Item;


const mapStateToProps = ({userDetail}) => ({userDetail});

@withI18n()
@Form.create()
@connect(mapStateToProps)
class JobInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      matches: window.matchMedia("(min-width: 768px)").matches,
    }
  }

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);

    const {dispatch} = this.props;
    dispatch({
      type: `userDetail/emptyJobData`,
    })
  }

  getPermissions = () => {
    const loggedUser = store.get('user'),
      isOwnerPage = loggedUser?.id === +this.props.match?.params?.id,
      canEditUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name),
      canEditSelfUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name),
      canViewEducation = checkLoggedUserPermission(PERMISSIONS.VIEW_EDUCATION.name, PERMISSIONS.VIEW_EDUCATION.guard_name),
      canAddEducation = checkLoggedUserPermission(PERMISSIONS.ADD_EDUCATION.name, PERMISSIONS.ADD_EDUCATION.guard_name),
      canEditEducation = checkLoggedUserPermission(PERMISSIONS.EDIT_EDUCATION.name, PERMISSIONS.EDIT_EDUCATION.guard_name),
      canDeleteEducation = checkLoggedUserPermission(PERMISSIONS.DELETE_EDUCATION.name, PERMISSIONS.DELETE_EDUCATION.guard_name),
      canViewSelfEducation = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_EDUCATION.name, PERMISSIONS.VIEW_SELF_EDUCATION.guard_name),
      canAddSelfEducation = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_EDUCATION.name, PERMISSIONS.ADD_SELF_EDUCATION.guard_name),
      canEditSelfEducation = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_EDUCATION.name, PERMISSIONS.EDIT_SELF_EDUCATION.guard_name),
      canDeleteSelfEducation = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_EDUCATION.name, PERMISSIONS.DELETE_SELF_EDUCATION.guard_name),
      canViewLanguage = checkLoggedUserPermission(PERMISSIONS.VIEW_LANGUAGE.name, PERMISSIONS.VIEW_LANGUAGE.guard_name),
      canAddLanguage = checkLoggedUserPermission(PERMISSIONS.ADD_LANGUAGE.name, PERMISSIONS.ADD_LANGUAGE.guard_name),
      canEditLanguage = checkLoggedUserPermission(PERMISSIONS.EDIT_LANGUAGE.name, PERMISSIONS.EDIT_LANGUAGE.guard_name),
      canDeleteLanguage = checkLoggedUserPermission(PERMISSIONS.DELETE_LANGUAGE.name, PERMISSIONS.DELETE_LANGUAGE.guard_name),
      canViewSelfLanguage = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_LANGUAGE.name, PERMISSIONS.VIEW_SELF_LANGUAGE.guard_name),
      canAddSelfLanguage = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_LANGUAGE.name, PERMISSIONS.ADD_SELF_LANGUAGE.guard_name),
      canEditSelfLanguage = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_LANGUAGE.name, PERMISSIONS.EDIT_SELF_LANGUAGE.guard_name),
      canDeleteSelfLanguage = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_LANGUAGE.name, PERMISSIONS.DELETE_SELF_LANGUAGE.guard_name);
    let viewEducationAccess = false, addEducationAccess = false, editEducationAccess = false,
      deleteEducationAccess = false,
      viewLanguageAccess = false, addLanguageAccess = false, editLanguageAccess = false, deleteLanguageAccess = false;

    if (canEditUsers || (isOwnerPage && canEditSelfUsers)) {
      if (canViewEducation || (isOwnerPage && canViewSelfEducation)) {
        viewEducationAccess = true;
      }
      if (canAddEducation || (isOwnerPage && canAddSelfEducation)) {
        addEducationAccess = true;
      }
      if (canEditEducation || (isOwnerPage && canEditSelfEducation)) {
        editEducationAccess = true;
      }
      if (canDeleteEducation || (isOwnerPage && canDeleteSelfEducation)) {
        deleteEducationAccess = true;
      }
      if (canViewLanguage || (isOwnerPage && canViewSelfLanguage)) {
        viewLanguageAccess = true;
      }
      if (canAddLanguage || (isOwnerPage && canAddSelfLanguage)) {
        addLanguageAccess = true;
      }
      if (canEditLanguage || (isOwnerPage && canEditSelfLanguage)) {
        editLanguageAccess = true;
      }
      if (canDeleteLanguage || (isOwnerPage && canDeleteSelfLanguage)) {
        deleteLanguageAccess = true;
      }
    }
    return {
      viewEducationAccess,
      addEducationAccess,
      editEducationAccess,
      deleteEducationAccess,
      viewLanguageAccess,
      addLanguageAccess,
      editLanguageAccess,
      deleteLanguageAccess
    }
  }

  state = {
    allProfessionalSkills: [],
    allSoftSkills: [],
    jobsWorkContractEndDate: {},
  };
  #dateFormat = 'DD/MM/YYYY';

  componentDidUpdate(oldProps) {
    if (oldProps?.details?.allSkills !== this.props?.details?.allSkills) {
      this.setState({
        allProfessionalSkills: this.props?.details?.allSkills,
      });
    }
    if (oldProps?.details?.allSoftSkills !== this.props?.details?.allSoftSkills) {
      this.setState({
        allSoftSkills: this.props?.details?.allSoftSkills,
      });
    }
    if (!this.props.details?.user_job_information?.work_contract_end_date
      && oldProps?.details?.user_job_information?.work_contract_end_date !== this.props.details?.user_job_information?.work_contract_end_date) {
      this.setState({
        presentChecked: true,
      });
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    const {form, details} = this.props;
    const {allProfessionalSkills, allSoftSkills} = this.state;
    const {onSave, id, skills, soft_skills} = details;
    const {getFieldsValue} = form;
    const formValues = getFieldsValue();
    const {jobsWorkContractEndDate} = this.state;
    const jobs = formValues['jobs'] ? (Object.keys(formValues['jobs']).map(key => {
      const job = formValues['jobs'][key];
      if (jobsWorkContractEndDate[key]) {
        job.work_contract_end_date = jobsWorkContractEndDate[key].work_contract_end_date;
      }
      return job;
    })) : null;

    form.validateFields((error) => {
      if (!error) {
        // this.addLanguageData();
        process.nextTick(() => {
          const updateSkills = formValues.skills.map((skill) => {
            return {
              id: skills.find((s) => s.name === skill)?.id || allProfessionalSkills.find((s) => s.name === skill)?.id,
              name: skill,
            };
          });

          const updateSoftSkills = formValues.soft_skills.map((softSkill) => {
            return {
              id: soft_skills.find((s) => s.name === softSkill)?.id || allSoftSkills.find((s) => s.name === softSkill)?.id,
              name: softSkill,
            };
          });

          const updateData = {
            ...formValues,
            skills: updateSkills,
            soft_skills: updateSoftSkills,
            jobs: jobs,
            id: id,
            tab: USER_DYNAMIC_COMPONENTS.JOB_INFO
          };

          onSave(updateData);
        });
      }
    });
  };

  handleChangeWorkContractEndDate = (data) => {
    this.setState({
      jobsWorkContractEndDate: data
    });
  }


  render() {
    const {
      i18n,
      form,
      details,
      isLoading,
    } = this.props;
    const {getFieldDecorator} = form;
    const lang = i18n.language === 'en' ? en_GB : hy_AM;
    const {allProfessionalSkills, allSoftSkills} = this.state;
    const {skills, soft_skills, user_role, user_job_information, status, professional_story} = details;
    const user_skills = skills ? skills.map(item => item.name) : [];
    const loggedUser = store.get('user');
    let initialExperiment = [];
    let user_soft_skills = [];

    if (user_job_information) {
      if (user_job_information?.experimental_period_start_date) {
        initialExperiment[0] = moment(user_job_information?.experimental_period_start_date)
      }
      if (user_job_information?.experimental_period_end_date) {
        initialExperiment[1] = moment(user_job_information?.experimental_period_end_date)
      }
    }

    if (soft_skills) {
      user_soft_skills = soft_skills.map(softSkill => softSkill.name);
    }

    // Edit access
    const isOwnerPage = loggedUser?.id === details?.id;
    const canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name);
    const canViewSelfUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name);
    const canEditUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name);
    const canEditSelfUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name);
    const canDeleteJobInformation = checkLoggedUserPermission(PERMISSIONS.DELETE_JOB_INFORMATION.name, PERMISSIONS.DELETE_JOB_INFORMATION.guard_name);
    const canEditJobInformation = checkLoggedUserPermission(PERMISSIONS.EDIT_JOB_INFORMATION.name, PERMISSIONS.EDIT_JOB_INFORMATION.guard_name);
    const canViewJobInformation = checkLoggedUserPermission(PERMISSIONS.VIEW_JOB_INFORMATION.name, PERMISSIONS.VIEW_JOB_INFORMATION.guard_name);
    const canDeleteSelfJobInformation = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_JOB_INFORMATION.name, PERMISSIONS.DELETE_SELF_JOB_INFORMATION.guard_name);
    const canEditSelfJobInformation = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_JOB_INFORMATION.name, PERMISSIONS.EDIT_SELF_JOB_INFORMATION.guard_name);
    const canViewSelfJobInformation = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_JOB_INFORMATION.name, PERMISSIONS.VIEW_SELF_JOB_INFORMATION.guard_name);
    let deleteJobInfoAccess = false;
    let editJobInfoAccess = false;
    let viewJobInfoAccess = false;

    if ((canViewUserDetails || (isOwnerPage && canViewSelfUserDetails)) && (canViewJobInformation || (isOwnerPage && canViewSelfJobInformation))) {
      viewJobInfoAccess = true;
    }

    if (canEditUsers || (isOwnerPage && canEditSelfUsers)) {
      if (canEditJobInformation || (isOwnerPage && canEditSelfJobInformation)) {
        editJobInfoAccess = true;
      }
      if (canDeleteJobInformation || (isOwnerPage && canDeleteSelfJobInformation)) {
        deleteJobInfoAccess = true;
      }
    }

    if (isLoading) {
      return (
        <div className="linear-activity linear-activity__top">
          <div className="indeterminate"/>
        </div>
      )
    }

    return (viewJobInfoAccess &&
      <Form className={styles['jobInfoBlock']} hideRequiredMark onSubmit={(e) => this.handleSave(e)} noValidate={true}>
        <div className="long-form rounded-scrollbar">
          { !this.state.matches &&
            <div className={styles['form-title']}>
              <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.6654 2.5H9.66537V1.83333C9.66537 1.47971 9.52489 1.14057 9.27484 0.890524C9.02479 0.640476 8.68565 0.5 8.33203 0.5H5.66536C5.31174 0.5 4.9726 0.640476 4.72256 0.890524C4.47251 1.14057 4.33203 1.47971 4.33203 1.83333V2.5H2.33203C1.8016 2.5 1.29289 2.71071 0.917818 3.08579C0.542745 3.46086 0.332031 3.96957 0.332031 4.5V10.5C0.332031 11.0304 0.542745 11.5391 0.917818 11.9142C1.29289 12.2893 1.8016 12.5 2.33203 12.5H11.6654C12.1958 12.5 12.7045 12.2893 13.0796 11.9142C13.4547 11.5391 13.6654 11.0304 13.6654 10.5V4.5C13.6654 3.96957 13.4547 3.46086 13.0796 3.08579C12.7045 2.71071 12.1958 2.5 11.6654 2.5ZM5.66536 1.83333H8.33203V2.5H5.66536V1.83333ZM12.332 10.5C12.332 10.6768 12.2618 10.8464 12.1368 10.9714C12.0117 11.0964 11.8422 11.1667 11.6654 11.1667H2.33203C2.15522 11.1667 1.98565 11.0964 1.86063 10.9714C1.7356 10.8464 1.66536 10.6768 1.66536 10.5V6.76L4.78537 7.83333C4.85615 7.84294 4.92791 7.84294 4.9987 7.83333H8.9987C9.071 7.832 9.14277 7.82078 9.21203 7.8L12.332 6.76V10.5ZM12.332 5.35333L8.89203 6.5H5.10536L1.66536 5.35333V4.5C1.66536 4.32319 1.7356 4.15362 1.86063 4.0286C1.98565 3.90357 2.15522 3.83333 2.33203 3.83333H11.6654C11.8422 3.83333 12.0117 3.90357 12.1368 4.0286C12.2618 4.15362 12.332 4.32319 12.332 4.5V5.35333Z" fill="#4A54FF"/>
              </svg>
              <h3>Employment History</h3>
            </div>
          }
          <h3 className={styles['content-title']}>{i18n.t`JobInfo`}</h3>
          <Row type="flex" justify="space-between" gutter={16}>
            <Col lg={12} md={24} sm={24} xs={24}>
              <span className="label-txt">{i18n.t`Role`}</span>
              <Form.Item className="no-icons-form-filed">
                {getFieldDecorator('role', {
                  initialValue: user_role?.name ?? '',
                })(
                  <Select
                    disabled={!editJobInfoAccess}
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                    placeholder={i18n.t`Role`}>
                    {details.allRoles && details.allRoles.map((role, index) =>
                      <Select.Option key={index} value={role}>{role}</Select.Option>
                    )}
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col lg={12} md={24} sm={24} xs={24}>
              <span className="label-txt">{i18n.t`Status`}</span>
              <Form.Item className="no-icons-form-filed">
                {getFieldDecorator('status', {
                  initialValue: status,
                  rules: [
                    {required: true, message: i18n.t`Assign status for this user`},
                  ],
                })(
                  <Select
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    disabled={!editJobInfoAccess}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                    mode="single"
                    placeholder={i18n.t`Assign status for this user`}>
                    {Object.keys(STATUSES).map(key => {
                      if (STATUSES.hasOwnProperty(key)) {
                        return <Select.Option
                          key={STATUSES[key].value}
                          value={STATUSES[key].value}>{STATUSES[key].text}</Select.Option>
                      }
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <hr/>
          <WorkExperience
            details={details}
            form={form}
            editJobInfoAccess={editJobInfoAccess}
            deleteJobInfoAccess={deleteJobInfoAccess}
            handleChangeWorkContractEndDate={this.handleChangeWorkContractEndDate}
          />
          <hr/>
          <FormLanguageInfo permissionsUser={this.getPermissions()}/>
          <hr/>
          <h3 className={styles['content-title']}>{i18n.t`Professional Skills`}</h3>
          <Row>
            <Col>
              <span className="label-txt">{i18n.t`Hard Skills`}</span>
              <Form.Item className="no-icons-form-filed">
                {getFieldDecorator('skills', {
                  initialValue: user_skills,
                })(
                  <Select
                    disabled={!editJobInfoAccess}
                    className="input-tags select-global-md select-text-lowercase"
                    mode="tags"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    placeholder={i18n.t`Please select/add your Professional skills`}
                  >
                    {allProfessionalSkills && allProfessionalSkills.map(i => (
                      <Select.Option key={'p-skill' + i.id} value={i.name}>{i.name}</Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <span className="label-txt">{i18n.t`SoftSkills`}</span>
              <Form.Item className="no-icons-form-filed">
                {getFieldDecorator('soft_skills', {
                  initialValue: user_soft_skills ?? [],
                })(
                  <Select
                    disabled={!editJobInfoAccess}
                    className="input-tags select-global-md select-text-lowercase job-info-skills"
                    mode="tags"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    placeholder={i18n.t`Please select/add your Soft skills`}
                  >
                    {allSoftSkills && allSoftSkills.map(i => (
                      <Select.Option key={'s-skill' + i.id} value={i.name}>{i.name}</Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <span className="label-txt">{i18n.t`Professional Story`}</span>
              <FormItem className="no-icons-form-filed ">
                {getFieldDecorator('professional_story', {
                  initialValue: professional_story ?? '',
                })
                (<Input.TextArea disabled={!editJobInfoAccess} rows={3} className="textarea-field"/>)}
              </FormItem>
            </Col>
          </Row>
        </div>
        {editJobInfoAccess &&
          <div className={styles['form-actions']}>
            <Button
              className="app-btn primary-btn"
              htmlType="submit"
            >
              {i18n.t`Save`}
            </Button>
          </div>
        }
      </Form>
    );
  }
}

JobInfo.defaultProps = {
  details: {},
};

JobInfo.propTypes = {
  details: PropTypes.object,
};
export default JobInfo;
