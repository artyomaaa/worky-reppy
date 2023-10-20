import React from "react";
import styles from "./style.less";
import stylesEdu from '../Education/style.less'
import {Button, ConfigProvider, Popconfirm, Row, Col, Input, Popover} from "antd";
import {withRouter} from "dva/router";
import {withI18n} from "@lingui/react";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {USER_DYNAMIC_COMPONENTS, PERMISSIONS} from 'utils/constant';
import {Form} from "@ant-design/compatible";
import {connect} from "dva";
import {checkLoggedUserPermission} from 'utils';
import Icons from 'icons/icon';
import classnames from "classnames";

const FormItem = Form.Item;

@withRouter
@withI18n()
@Form.create()
@connect(({userDetail}) => ({userDetail}))
class CasualInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matches: window.matchMedia("(min-width: 768px)").matches,
      isIconVisible: true,
      showAddCasual: false,
      showEditCasual: false,
      editItem: null
    };
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

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  toggleNewCasual = () => {
    this.setState((prevState) => ({showAddCasual: !prevState.showAddCasual}));
  };

  toggleEditCasual = (item) => {
    this.setState((prevState) => ({showEditCasual: !prevState.showEditCasual}));
    this.setState({editItem: item});
    !this.state.matches && this.iconVisible()
  };

  handleSave = (e) => {
    e.preventDefault();
    const {form, details, userDetail: {headerData}} = this.props;
    const {onSave} = details;
    const {editItem} = this.state;

    form.validateFields((error, values) => {
      if (!error) {
        process.nextTick(() => {
          const updateData = {
            title: editItem ? values.editCasualTitle : values.addCasualTitle,
            value: editItem ? values.editCasualText : values.addCasualText,
            id: headerData?.id,
            casualId: editItem ? editItem.id : null,
            tab: USER_DYNAMIC_COMPONENTS.CASUAL_INFO
          };
          onSave(updateData);
          this.setState({
            editItem: null,
            showEditCasual: false,
            showAddCasual: false
          });
        });
      }
    });
    !this.state.matches && this.iconVisible();
  };

  deleteCasual = (e, item, type) => {
    const {dispatch} = this.props,
      deleteData = {
        casualId: item.id,
        userId: item.user_id,
        tab: USER_DYNAMIC_COMPONENTS.CASUAL_INFO,
      };
    dispatch({
      type: `userDetail/deleteCasual`,
      payload: deleteData,
    })
  }

  toPaintEditCasualForm = () => {
    const {i18n, form} = this.props,
      {editItem} = this.state,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM;
    return (
      <Form onSubmit={this.handleSave}>
        <Row type="flex" justify="space-between">
          <Col lg={10} className={styles['input-col']}>
            <span className="label-txt">{i18n.t`Title`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(`editCasualTitle`, {
                  initialValue: editItem.title,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Title is required`,
                    },
                    {
                      max: 191,
                      message: i18n.t`Title is too long!`
                    },
                  ]
                })(<Input
                  className="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={10} className={styles['input-col']}>
            <span className="label-txt">{i18n.t`Text`}</span>
            <ConfigProvider locale={lang}>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator(`editCasualText`, {
                  initialValue: editItem.value,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Text is required`,
                    },
                    {
                      max: 191,
                      message: i18n.t`Text is too long!`
                    },
                  ]
                })(<Input
                  className="input-global-md w_100 color-black font-medium"/>)}
              </FormItem>
            </ConfigProvider>
          </Col>
          <Col lg={3} className={styles["btn-column"]}>
            <div className={styles['social-actions']}>
              <Button
                className={styles['social-actions-text']}
                htmlType="submit"
              >
                {i18n.t`Save`}
              </Button>
              <Button
                className={styles['social-actions-text']}
                onClick={() => this.toggleEditCasual()}
              >
                {i18n.t`Cancel`}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    )
  }

  render() {
    const {i18n, form, userDetail} = this.props,
      casualInfo = userDetail?.casual_info,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM;

    const canEditCasual = checkLoggedUserPermission(PERMISSIONS.EDIT_USER_CASUAL.name, PERMISSIONS.EDIT_USER_CASUAL.guard_name);
    const canDeleteCasual = checkLoggedUserPermission(PERMISSIONS.DELETE_USER_CASUAL.name, PERMISSIONS.DELETE_USER_CASUAL.guard_name);
    const canAddCasual = checkLoggedUserPermission(PERMISSIONS.ADD_USER_CASUAL.name, PERMISSIONS.ADD_USER_CASUAL.guard_name);

    return (
      <div className={styles['mb-30']}>
        { !this.state.matches &&
        <div className={styles['form-title']}>
          <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.0026 5.66504C13.0902 5.66506 13.1769 5.64783 13.2578 5.61434C13.3386 5.58084 13.4122 5.53174 13.4741 5.46983C13.536 5.40792 13.5851 5.33441 13.6186 5.25352C13.6521 5.17263 13.6693 5.08592 13.6693 4.99837V2.99837C13.6693 2.85849 13.6253 2.72214 13.5435 2.60867C13.4617 2.4952 13.3463 2.41037 13.2135 2.36621L7.21354 0.366211C7.07661 0.320638 6.9286 0.320638 6.79166 0.366211L0.791664 2.36621C0.658933 2.41037 0.543477 2.4952 0.461675 2.60867C0.379873 2.72214 0.33588 2.85849 0.335938 2.99837V4.99837C0.335915 5.08592 0.353143 5.17263 0.386638 5.25352C0.420133 5.33441 0.469239 5.40792 0.531149 5.46983C0.593059 5.53174 0.666561 5.58084 0.747455 5.61434C0.828349 5.64783 0.91505 5.66506 1.0026 5.66504H1.66927V10.4546C1.28043 10.5915 0.943514 10.8455 0.704782 11.1816C0.46605 11.5177 0.337206 11.9194 0.335938 12.3317V13.665C0.335915 13.7526 0.353143 13.8393 0.386638 13.9202C0.420133 14.0011 0.469239 14.0746 0.531149 14.1365C0.593059 14.1984 0.666561 14.2475 0.747455 14.281C0.828349 14.3145 0.91505 14.3317 1.0026 14.3317H13.0026C13.0902 14.3317 13.1769 14.3145 13.2578 14.281C13.3386 14.2475 13.4122 14.1984 13.4741 14.1365C13.536 14.0746 13.5851 14.0011 13.6186 13.9202C13.6521 13.8393 13.6693 13.7526 13.6693 13.665V12.3317C13.668 11.9194 13.5392 11.5177 13.3004 11.1816C13.0617 10.8455 12.7248 10.5915 12.3359 10.4546V5.66504H13.0026ZM12.3359 12.9984H1.66927V12.3317C1.66945 12.1549 1.73974 11.9855 1.86473 11.8605C1.98971 11.7355 2.15918 11.6652 2.33594 11.665H11.6693C11.846 11.6652 12.0155 11.7355 12.1405 11.8605C12.2655 11.9855 12.3358 12.1549 12.3359 12.3317V12.9984ZM3.0026 10.3317V5.66504H4.33594V10.3317H3.0026ZM5.66927 10.3317V5.66504H8.33594V10.3317H5.66927ZM9.66927 10.3317V5.66504H11.0026V10.3317H9.66927ZM1.66927 4.3317V3.47884L7.0026 1.70084L12.3359 3.47884V4.3317H1.66927Z" fill="#4A54FF"/>
          </svg>
          <h3>Casual Information</h3>
        </div>
        }
        <div className={styles['sectionRow']}>
          <h3 className={styles['content-title']}>{i18n.t`Casual Information`}</h3>
          {canAddCasual &&
            <div className={styles['addCasual']}>
              <span onClick={() => this.toggleNewCasual()} className="add-btn">{i18n.t`+ Add`}</span>
            </div>
          }
        </div>
        <div className={styles['mt-30']}>
          {(this.state.showAddCasual && canAddCasual) &&
          <Form hideRequiredMark onSubmit={(e) => this.handleSave(e)} noValidate={true}>
            <Row type="flex" justify="space-between">
              <Col lg={10} className={styles['input-col']}>
                <span className="label-txt">{i18n.t`Title`}</span>
                <ConfigProvider locale={lang}>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator(`addCasualTitle`, {
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Title is required`,
                        },
                        {
                          max: 191,
                          message: i18n.t`Title is too long!`
                        },
                      ]
                    })(<Input
                      placeholder='Ex: T-shirt Size'
                      className="input-global-md w_100 color-black font-medium"/>)}
                  </FormItem>
                </ConfigProvider>
              </Col>
              <Col lg={10} className={styles['input-col']}>
                <span className="label-txt">{i18n.t`Text`}</span>
                <ConfigProvider locale={lang}>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator(`addCasualText`, {
                      rules: [
                        {
                          required: true,
                          message: i18n.t`Text is required`,
                        },
                        {
                          max: 191,
                          message: i18n.t`Text is too long!`
                        },
                      ]
                    })(<Input
                      placeholder='Ex: XS'
                      className="input-global-md w_100 color-black font-medium"/>)}
                  </FormItem>
                </ConfigProvider>
              </Col>
              <Col lg={3} className={styles["btn-column"]}>
                <div className={styles['social-actions']}>
                  <Button
                    className={styles['social-actions-text']}
                    htmlType="submit"
                  >
                    {i18n.t`Save`}
                  </Button>
                  <Button
                    className={styles['social-actions-text']}
                    onClick={() => this.toggleNewCasual()}
                  >
                    {i18n.t`Cancel`}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>}
          {(this.state.showEditCasual && canEditCasual) && <div>{this.toPaintEditCasualForm()}</div>}
          {
            casualInfo.length ?
            casualInfo?.map((item) => {
              return (
                <div key={item.id} className={classnames(styles['dataSection'])}>
                  <div className={styles['labels']}>
                    <span className={styles['label1']}>{item.title}</span>
                    <span className={styles['label2']}>{item.value}</span>
                  </div>
                  {this.state.matches ?
                    <div className={styles['dFlex']}>
                      {canEditCasual &&
                        <span className={styles['ml156']} onClick={() => this.toggleEditCasual(item)}>
                          <Icons tabIndex={"0"} name="edit"/>
                        </span>
                      }
                      {canDeleteCasual &&
                        <Popconfirm
                          tabIndex="0"
                          title={i18n.t`Are you sure delete this item?`}
                          okText={i18n.t`Yes`}
                          onConfirm={(e) => this.deleteCasual(e, item, 'casualInfo')}
                        >
                          <span className={styles['ml156']}>
                            <Icons tabIndex={"0"} name="delete"/>
                          </span>
                        </Popconfirm>
                      }
                    </div>
                    :
                    <>
                    { this.state.isIconVisible &&
                        <Popover
                          overlayClassName={stylesEdu['popover-media-content']}
                          content={<div className={stylesEdu['dFlex']}>
                            {canEditCasual &&
                              <span className={stylesEdu['ml156']} onClick={() => {this.toggleEditCasual(item); this.iconRemove()}}>
                                <p className={stylesEdu['popover-media-text']}>Edit</p>
                              </span>
                            }
                            {canDeleteCasual &&
                              <Popconfirm
                                tabIndex="0"
                                title={i18n.t`Are you sure delete this item?`}
                                okText={i18n.t`Yes`}
                                onConfirm={(e) => this.deleteCasual(e, item, 'casualInfo')}
                              >
                                <span className={stylesEdu['ml156']}>
                                  <p className={stylesEdu['popover-media-text']}>Delete</p>
                                </span>
                              </Popconfirm>
                            }
                          </div>
                          }
                          trigger="click"
                          placement="rightTop"
                        >
                          <div className={stylesEdu['popover-media-icon']}>
                            <svg width="4" height="18" viewBox="0 0 4 18" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M2 4C2.39556 4 2.78224 3.8827 3.11114 3.66294C3.44004 3.44318 3.69639 3.13082 3.84776 2.76537C3.99914 2.39992 4.03874 1.99778 3.96157 1.60982C3.8844 1.22186 3.69392 0.865492 3.41421 0.585787C3.13451 0.306082 2.77814 0.115601 2.39018 0.0384303C2.00222 -0.0387401 1.60009 0.000866562 1.23463 0.152242C0.869182 0.303617 0.556825 0.559962 0.337062 0.88886C0.117299 1.21776 1.07779e-06 1.60444 1.07779e-06 2C1.07779e-06 2.53043 0.210715 3.03914 0.585788 3.41421C0.960861 3.78929 1.46957 4 2 4ZM2 14C1.60444 14 1.21776 14.1173 0.888861 14.3371C0.559963 14.5568 0.303617 14.8692 0.152242 15.2346C0.000866562 15.6001 -0.0387401 16.0022 0.0384303 16.3902C0.115601 16.7781 0.306083 17.1345 0.585788 17.4142C0.865493 17.6939 1.22186 17.8844 1.60982 17.9616C1.99778 18.0387 2.39992 17.9991 2.76537 17.8478C3.13082 17.6964 3.44318 17.44 3.66294 17.1111C3.8827 16.7822 4 16.3956 4 16C4 15.4696 3.78929 14.9609 3.41421 14.5858C3.03914 14.2107 2.53043 14 2 14ZM2 7C1.60444 7 1.21776 7.1173 0.888861 7.33706C0.559963 7.55682 0.303617 7.86918 0.152242 8.23463C0.000866562 8.60009 -0.0387401 9.00222 0.0384303 9.39018C0.115601 9.77814 0.306083 10.1345 0.585788 10.4142C0.865493 10.6939 1.22186 10.8844 1.60982 10.9616C1.99778 11.0387 2.39992 10.9991 2.76537 10.8478C3.13082 10.6964 3.44318 10.44 3.66294 10.1111C3.8827 9.78224 4 9.39556 4 9C4 8.46957 3.78929 7.96086 3.41421 7.58579C3.03914 7.21071 2.53043 7 2 7Z"
                                fill="black" fillOpacity="0.29"/>
                            </svg>
                          </div>
                        </Popover>
                    }
                    </>
                  }
                </div>
              )
            }):null
          }
        </div>
      </div>
    )
  }
}

export default CasualInfo;
