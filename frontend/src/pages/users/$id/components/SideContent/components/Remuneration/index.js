import React from 'react';
import Salaries from './components/addForm/Salaries';
import BonusesAndOtherSpends from './components/addForm/BonusesAndOtherSpends';
import CurrentSalary from "./components/currentSalary"
import {withRouter} from "dva/router";
import {connect} from "dva";
import {Form} from "@ant-design/compatible";
import {withI18n, Trans} from "@lingui/react";
import {Button, Col, ConfigProvider, Input, Row, Select} from "antd";
import Icons from 'icons/icon';
import styles from "../Remuneration/style.less";
import {TYPE, USER_DYNAMIC_COMPONENTS, PERMISSIONS, DATE_FORMAT, DEFAULT_CURRENCY} from 'utils/constant'
import store from "store";
import {checkLoggedUserPermission} from 'utils';

const mapStateToProps = ({userDetail}) => ({userDetail});
const FormItem = Form.Item;

const increment = 5;
const SALARY = "Salary";
const BONUSES = "Bonuses";

@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)

class Remuneration extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addItemCountSalary: increment,
      addItemCountBonuses: increment,
      editItem: {},
      isActiveSalary: false,
      isActiveBonuses: false,
      growthSalaryCurrencies: {},
      netSalaryCurrencies: {},
      bonusCurrencies: {},
      otherSpendCurrencies: {},
      matches: window.matchMedia("(min-width: 768px)").matches,
    }
  }

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  handleClickShowMore = (e, historyName) => {
    e.preventDefault();
    const {userDetail: {data: {bonuses}}} = this.props,
      {addItemCountBonuses, addItemCountSalary} = this.state,
      countBonuses = addItemCountBonuses + increment,
      countSalary = addItemCountSalary + increment;

    this.setState(() => {
      if (historyName === SALARY) {
        return {
          addItemCountSalary: countSalary
        }
      } else if (historyName === BONUSES) {
        return {
          addItemCountBonuses: countBonuses
        }
      }
    })
  }

  toggleAddEditSalaryAndBonuses = (activeForm, editItem = {}) => {
    this.setState((state) => {
      if (activeForm === SALARY || activeForm === 'updateSalary') {
        return {
          isActiveSalary: !state.isActiveSalary,
          editItem: editItem,
        }
      } else if (activeForm === BONUSES || activeForm === 'updateBonus') {
        return {
          isActiveBonuses: !state.isActiveBonuses,
          editItem: editItem,
        }
      }
    });
  }

  renderCurrentSalary = () => {
    const {userDetail: {remuneration: {user_salary}}} = this.props;
    const permissions = this.getPermissions();

    if (user_salary) {
      const currentSalary = user_salary.find((userSalary) => {
        return userSalary.status === 1;
      });

      return currentSalary ? <CurrentSalary
        historyName={SALARY}
        onEdit={this.onEdit}
        onDelete={this.onDelete}
        data={currentSalary}/> : null;
    }

    return null
  }

  onHandelChange = (value) => {
    const {match: {params: {id}}} = this.props,
      sendData = {};

    sendData.userId = +id;
    sendData.jobType = value;
    sendData.actionName = "jobType";
    this.onSubmit(sendData);
  }

  onDelete = (id, historyName) => {
    const sendData = {};

    sendData.actionName = "deleteItems";
    sendData.historyName = historyName;
    sendData.deleteItemId = id;
    this.onSubmit(sendData)
  }

  onEdit = (id, historyName) => {
    const {userDetail: {remuneration: {user_salary, bonuses}}} = this.props,
      sendData = {};

    sendData.actionName = "editItems";
    sendData.historyName = historyName;
    sendData.editItemId = id;
    let editItem = {};
    if (historyName === SALARY) {
      editItem = user_salary.find(s => s.id === id);
      this.toggleAddEditSalaryAndBonuses(SALARY, editItem);
    } else if (historyName === BONUSES) {
      editItem = bonuses.find(b => b.id === id);
      this.toggleAddEditSalaryAndBonuses(BONUSES, editItem);
    }
    // this.onSubmit(sendData)
  }

  getPermissions = () => {
    const loggedUser = store.get('user'),
      isOwnerPage = +loggedUser.id === +this.props.userDetail?.headerData?.id,
      canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name),
      canViewSelfUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name),
      canEditUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name),
      canEditSelfUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name),
      canEditJobType = checkLoggedUserPermission(PERMISSIONS.EDIT_JOB_TYPE.name, PERMISSIONS.EDIT_JOB_TYPE.guard_name),
      canEditSelfJobType = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_JOB_TYPE.name, PERMISSIONS.EDIT_SELF_JOB_TYPE.guard_name),
      canAddSalary = checkLoggedUserPermission(PERMISSIONS.ADD_SALARY.name, PERMISSIONS.ADD_SALARY.guard_name),
      canAddSelfSalary = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_SALARY.name, PERMISSIONS.ADD_SELF_SALARY.guard_name),
      canEditSalary = checkLoggedUserPermission(PERMISSIONS.EDIT_SALARY.name, PERMISSIONS.EDIT_SALARY.guard_name),
      canEditSelfSalary = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_SALARY.name, PERMISSIONS.EDIT_SELF_SALARY.guard_name),
      canDeleteSalary = checkLoggedUserPermission(PERMISSIONS.DELETE_SALARY.name, PERMISSIONS.DELETE_SALARY.guard_name),
      canDeleteSelfSalary = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_SALARY.name, PERMISSIONS.DELETE_SELF_SALARY.guard_name),
      canViewSalary = checkLoggedUserPermission(PERMISSIONS.VIEW_SALARY.name, PERMISSIONS.VIEW_SALARY.guard_name),
      canViewSelfSalary = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_SALARY.name, PERMISSIONS.VIEW_SELF_SALARY.guard_name),
      canDeleteBonus = checkLoggedUserPermission(PERMISSIONS.DELETE_BONUS.name, PERMISSIONS.DELETE_BONUS.guard_name),
      canDeleteSelfBonus = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_BONUS.name, PERMISSIONS.DELETE_SELF_BONUS.guard_name),
      canAddBonuses = checkLoggedUserPermission(PERMISSIONS.ADD_BONUS.name, PERMISSIONS.ADD_BONUS.guard_name),
      canAddSelfBonuses = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_BONUS.name, PERMISSIONS.ADD_SELF_BONUS.guard_name),
      canEditBonus = checkLoggedUserPermission(PERMISSIONS.EDIT_BONUS.name, PERMISSIONS.EDIT_BONUS.guard_name),
      canEditSelfBonus = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_BONUS.name, PERMISSIONS.EDIT_SELF_BONUS.guard_name),
      canViewBonuses = checkLoggedUserPermission(PERMISSIONS.VIEW_BONUS.name, PERMISSIONS.VIEW_BONUS.guard_name),
      canViewSelfBonuses = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_BONUS.name, PERMISSIONS.VIEW_SELF_BONUS.guard_name),
      canEditOtherSpends = checkLoggedUserPermission(PERMISSIONS.EDIT_OTHER_SPENDS.name, PERMISSIONS.EDIT_OTHER_SPENDS.guard_name),
      canEditSelfOtherSpends = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_OTHER_SPENDS.name, PERMISSIONS.EDIT_SELF_OTHER_SPENDS.guard_name),
      canAddOtherSpends = checkLoggedUserPermission(PERMISSIONS.ADD_OTHER_SPENDS.name, PERMISSIONS.ADD_OTHER_SPENDS.guard_name),
      canViewOtherSpends = checkLoggedUserPermission(PERMISSIONS.VIEW_OTHER_SPENDS.name, PERMISSIONS.VIEW_OTHER_SPENDS.guard_name),
      canViewSelfOtherSpends = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_OTHER_SPENDS.name, PERMISSIONS.VIEW_SELF_OTHER_SPENDS.guard_name),
      canDeleteOtherSpends = checkLoggedUserPermission(PERMISSIONS.DELETE_OTHER_SPENDS.name, PERMISSIONS.DELETE_OTHER_SPENDS.guard_name),
      canDeleteSelfOtherSpends = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_OTHER_SPENDS.name, PERMISSIONS.DELETE_SELF_OTHER_SPENDS.guard_name),
      canAddSelfOtherSpends = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_OTHER_SPENDS.name, PERMISSIONS.ADD_SELF_OTHER_SPENDS.guard_name);
    let editUserAccess = false,
      editJobTypeAccess = false,
      addSalaryAccess = false,
      editSalaryAccess = false,
      viewSalaryAccess = false,
      deleteSalaryAccess = false,
      addBonusAccess = false,
      editBonusAccess = false,
      viewBonusesAccess = false,
      deleteBonusesAccess = false,
      addOtherSpendsAccess = false,
      editOtherSpendsAccess = false,
      viewOtherSpendsAccess = false,
      deleteOtherSpendsAccess = false;

    if (canViewUserDetails || (isOwnerPage && canViewSelfUserDetails)) {
      if (canViewSalary || (isOwnerPage && canViewSelfSalary)) {
        viewSalaryAccess = true;
      }
      if (canViewBonuses || (isOwnerPage && canViewSelfBonuses)) {
        viewBonusesAccess = true;
      }
      if (canViewOtherSpends || (isOwnerPage && canViewSelfOtherSpends)) {
        viewOtherSpendsAccess = true;
      }
    }

    if (canEditUsers || (isOwnerPage && canEditSelfUsers)) {
      editUserAccess = true;

      if (canEditJobType || (isOwnerPage && canEditSelfJobType)) {
        editJobTypeAccess = true;
      }

      // Salary Section
      if (canAddSalary || (isOwnerPage && canAddSelfSalary)) {
        addSalaryAccess = true;
      }
      if (canEditSalary || (isOwnerPage && canEditSelfSalary)) {
        editSalaryAccess = true;
      }
      if (canDeleteSalary || (isOwnerPage && canDeleteSelfSalary)) {
        deleteSalaryAccess = true;
      }

     // Bonus Section
      if (canAddBonuses || (isOwnerPage && canAddSelfBonuses)) {
        addBonusAccess = true;
      }
      if (canEditBonus || (isOwnerPage && canEditSelfBonus)) {
        editBonusAccess = true;
      }
      if (canDeleteBonus || (isOwnerPage && canDeleteSelfBonus)) {
        deleteBonusesAccess = true;
      }

      // Other Spends Section
      if (canAddOtherSpends || (isOwnerPage && canAddSelfOtherSpends)) {
        addOtherSpendsAccess = true;
      }
      if (canEditOtherSpends || (isOwnerPage && canEditSelfOtherSpends)) {
        editOtherSpendsAccess = true;
      }
      if (canDeleteOtherSpends || (isOwnerPage && canDeleteSelfOtherSpends)) {
        deleteOtherSpendsAccess = true;
      }
    }

    return {
      loggedUser,
      isOwnerPage,
      editUserAccess,
      editJobTypeAccess,
      addSalaryAccess,
      editSalaryAccess,
      viewSalaryAccess,
      deleteSalaryAccess,
      addBonusAccess,
      editBonusAccess,
      viewBonusesAccess,
      deleteBonusesAccess,
      addOtherSpendsAccess,
      editOtherSpendsAccess,
      viewOtherSpendsAccess,
      deleteOtherSpendsAccess,
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    const {growthSalaryCurrencies, netSalaryCurrencies, bonusCurrencies, otherSpendCurrencies} = this.state;
    const {form, details: {onSave}, userDetail: {remuneration: {userRemuneration: {user_salary, bonuses}}}, match: {params: {id}}} = this.props;
    const {getFieldsValue} = form;
    const formValues = getFieldsValue();

    form.validateFields((error) => {
    if(error) return null;

    if (formValues.salaries) {
      formValues.salaries = Object.keys(formValues.salaries).map(key => {
        let item = formValues.salaries[key];
        let oldSalary = null;
        if (!growthSalaryCurrencies[key] || !netSalaryCurrencies[key]) {
          oldSalary = user_salary && user_salary.filter(s => s.id === item.id);
        }
        if (growthSalaryCurrencies[key]) {
          item.salary_currency = growthSalaryCurrencies[key];
        } else {
          if (oldSalary) {
            item.salary_currency = oldSalary[0]?.salary_currency ?? DEFAULT_CURRENCY;
          } else {
            item.salary_currency = DEFAULT_CURRENCY;
          }
        }

        if (netSalaryCurrencies[key]) {
          item.true_cost_currency = netSalaryCurrencies[key];
        } else {
          if (oldSalary) {
            item.true_cost_currency = oldSalary[0]?.true_cost_currency ?? DEFAULT_CURRENCY;
          } else {
            item.true_cost_currency = DEFAULT_CURRENCY;
          }
        }

        item.start_date = item.start_date ? item.start_date.format(DATE_FORMAT) : null;
        item.end_date = item.end_date ? item.end_date.format(DATE_FORMAT) : null;
        return item;
      });
    }

    let bonusList = [];
    if (formValues.bonuses) {
      bonusList = Object.keys(formValues.bonuses).map(key => {
        let item = formValues.bonuses[key];
        item.title = null;
        item.type = 'bonus';
        if (bonusCurrencies[key]) {
          item.currency = bonusCurrencies[key];
        } else {
          const oldBonus = bonuses && bonuses.filter(b => b.id === item.id && b.type === 'bonus');
          if (oldBonus) {
            item.currency = oldBonus[0]?.currency ?? DEFAULT_CURRENCY;
          } else {
            item.currency = DEFAULT_CURRENCY;
          }
        }

        item.date = item.date ? item.date.format(DATE_FORMAT) : null;
        item.description = item.description ? item.description.trim() : null;
        return item;
      });
      delete formValues.bonuses;
    }

    let otherSpendList = [];
    if (formValues.otherSpends) {
      otherSpendList = Object.keys(formValues.otherSpends).map(key => {
        let item = formValues.otherSpends[key];
        item.title = item.title ? item.title.trim() : null;
        item.type = 'other_spend';
        if (otherSpendCurrencies[key]) {
          item.currency = otherSpendCurrencies[key];
        } else {
          const oldBonus = bonuses && bonuses.filter(b => b.id === item.id && b.type === 'other_spend');
          if (oldBonus) {
            item.currency = oldBonus[0]?.currency ?? DEFAULT_CURRENCY;
          } else {
            item.currency = DEFAULT_CURRENCY;
          }
        }
        item.date = item.date ? item.date.format(DATE_FORMAT) : null;
        item.description = item.description ? item.description.trim() : null;
        return item;
      });
      delete formValues.otherSpends;
    }
    formValues.bonusesOtherSpends = [...bonusList, ...otherSpendList];

    process.nextTick(() => {
      const updateData = {
        ...formValues,
        id: id,
        tab: USER_DYNAMIC_COMPONENTS.REMUNERATION
      };

      onSave(updateData);
    });
    });
  };

  onSubmit = (values) => {
    const {details: {onSave}, match: {params: {id}}} = this.props;

    values.tab = USER_DYNAMIC_COMPONENTS.REMUNERATION;
    values.user_id = values.user_id ?? +id;

    onSave(values)

    this.toggleAddEditSalaryAndBonuses(values.actionName)
  }

  handleChangeGrowthSalaryCurrency = (key, currency) => {
    this.setState({
      growthSalaryCurrencies: {
        ...this.state.growthSalaryCurrencies,
        [key]: currency
      }
    });
  }

  handleChangeNetSalaryCurrency = (key, currency) => {
    this.setState({
      netSalaryCurrencies: {
        ...this.state.netSalaryCurrencies,
        [key]: currency
      }
    });
  }

  handleChangeBonusCurrency = (key, currency) => {
    this.setState({
      bonusCurrencies: {
        ...this.state.bonusCurrencies,
        [key]: currency
      }
    });
  }

  handleChangeOtherSpendCurrency = (key, currency) => {
    this.setState({
      otherSpendCurrencies: {
        ...this.state.otherSpendCurrencies,
        [key]: currency
      }
    });
  }

  render() {
    const {i18n, form, userDetail} = this.props,
      {isActiveSalary, isActiveBonuses, addItemCountSalary, addItemCountBonuses, editItem} = this.state,
      currentSalary = this.renderCurrentSalary(),
      permissions = this.getPermissions();
    const {userRemuneration = {}, jobTypes = [], levels = []} = userDetail?.remuneration ?? {};
    const {type, user_salary = [], bonuses = []} = userRemuneration;
    const {getFieldDecorator} = form;

    return (
      <Form onSubmit={(e) => this.handleSave(e)}>
        { !this.state.matches &&
        <div className={styles['form-title']}>
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6654 2.5H9.66537V1.83333C9.66537 1.47971 9.52489 1.14057 9.27484 0.890524C9.02479 0.640476 8.68565 0.5 8.33203 0.5H5.66536C5.31174 0.5 4.9726 0.640476 4.72256 0.890524C4.47251 1.14057 4.33203 1.47971 4.33203 1.83333V2.5H2.33203C1.8016 2.5 1.29289 2.71071 0.917818 3.08579C0.542745 3.46086 0.332031 3.96957 0.332031 4.5V10.5C0.332031 11.0304 0.542745 11.5391 0.917818 11.9142C1.29289 12.2893 1.8016 12.5 2.33203 12.5H11.6654C12.1958 12.5 12.7045 12.2893 13.0796 11.9142C13.4547 11.5391 13.6654 11.0304 13.6654 10.5V4.5C13.6654 3.96957 13.4547 3.46086 13.0796 3.08579C12.7045 2.71071 12.1958 2.5 11.6654 2.5ZM5.66536 1.83333H8.33203V2.5H5.66536V1.83333ZM12.332 10.5C12.332 10.6768 12.2618 10.8464 12.1368 10.9714C12.0117 11.0964 11.8422 11.1667 11.6654 11.1667H2.33203C2.15522 11.1667 1.98565 11.0964 1.86063 10.9714C1.7356 10.8464 1.66536 10.6768 1.66536 10.5V6.76L4.78537 7.83333C4.85615 7.84294 4.92791 7.84294 4.9987 7.83333H8.9987C9.071 7.832 9.14277 7.82078 9.21203 7.8L12.332 6.76V10.5ZM12.332 5.35333L8.89203 6.5H5.10536L1.66536 5.35333V4.5C1.66536 4.32319 1.7356 4.15362 1.86063 4.0286C1.98565 3.90357 2.15522 3.83333 2.33203 3.83333H11.6654C11.8422 3.83333 12.0117 3.90357 12.1368 4.0286C12.2618 4.15362 12.332 4.32319 12.332 4.5V5.35333Z" fill="#4A54FF"/>
          </svg>
          <h3>Remuneration</h3>
        </div>
        }
        <h3 className={styles['content-title']}>{i18n.t`JobType`}</h3>
        <Row type="flex" justify="space-between" gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24} className={styles['job-title-col']}>
            <span className="label-txt">{i18n.t`Job Type`}</span>
            <FormItem className="no-icons-form-filed">
              {getFieldDecorator('job_type', {
                initialValue: type ?? null,
              })(<Select
                mode="single"
                suffixIcon={
                  <Icons name="arrowdown2" fill='#B3B3B3'/>
                }
                getPopupContainer={triggerNode => triggerNode.parentNode}
                disabled={!permissions.editJobTypeAccess}
                className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                placeholder={i18n.t`Job Type`}>
                {jobTypes && jobTypes.map((jobType) =>
                    <Select.Option
                      key={`jt-${jobType.id}-${jobType.name}`}
                      value={jobType.id}>{jobType.name}
                    </Select.Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <hr/>
        <Salaries
          permissions={permissions}
          form={form}
          salaries={user_salary}
          levels={levels}
          userDetail={userDetail}
          handleChangeGrowthSalaryCurrency={this.handleChangeGrowthSalaryCurrency}
          handleChangeNetSalaryCurrency={this.handleChangeNetSalaryCurrency}
        />
        <hr/>
        <BonusesAndOtherSpends
          permissions={permissions}
          form={form}
          bonusesAndOtherSpends={bonuses}
          userDetail={userDetail}
          handleChangeBonusCurrency={this.handleChangeBonusCurrency}
          handleChangeOtherSpendCurrency={this.handleChangeOtherSpendCurrency}
        />
        {permissions.editUserAccess &&
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

export default Remuneration;
