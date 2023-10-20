import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {addLangPrefix} from 'utils';
import {Steps} from 'antd';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { withI18n } from '@lingui/react';
import Icons from 'icons/icon';
import Brand from 'shared/UIElements/Brand';
import FirstForm from './components/FirstForm';
import SecondForm from './components/SecondForm';
import LastForm from './components/LastForm';
import Navlink from "umi/navlink";

const { Step } = Steps;


@withI18n()
@connect(({ loading,registration }) => ({ loading,registration }))
@Form.create()
class Signup extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      name: '',
      surname: '',
      companyName: '',
      phoneNumber: '',
      password: '',
      passwordConfirm: '',
    };
    this.formData = {}
  }
  getFormData = (childData) => {
    Object.keys(childData).forEach((key) => {
      this.formData[key] = childData[key];
    });
    if (Object.keys(childData).length) {
      this.next();
      Object.keys(childData).map(key => {
        this.setState({
          [key]: childData[key]
        })
      });
    }
  };

  showStep = () => {
    const{ current  } = this.props.registration;

    if (current === 0)
      return <FirstForm getFormData={this.getFormData} emailData={this.state.email}/>
    if (current === 1)
      return <SecondForm getFormData={this.getFormData} userData={{
        name: this.state.name,
        surname: this.state.surname,
        phoneNumber: this.state.phoneNumber
      }} />
    if (current === 2)
      return <LastForm sendData={this.sendData} getFormData={this.getFormData} userPassword={{
        passwordConfirm: this.state.passwordConfirm,
        password: this.state.password
      }}/>
  };

  next = () => {
    const {dispatch} = this.props;
    const{ current  } = this.props.registration;
    dispatch({
      type: `registration/NEXTPAGE`,
      payload: {current:current + 1},
    });
  }

  toSelectedPage = (pageNum) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'registration/TOSELECTEDPAGE',
      payload: {current: pageNum}
    })
  }

  sendData = () => {
    const { formData} = this;
    const {dispatch} = this.props;
    dispatch({
      type: `registration/REGISTRATION`,
      payload: {formData},
    }).catch(console.error);
  }


  render() {
    const{ current } = this.props.registration;

    return (
      <>
        <div className="user-layout">`
          <div className="card">
            <div className="logo">
              <Brand width="54px"
                     height="54px"
              />
              <span className="logo-title">Worky-Reppy</span>
            </div>
            {current === 3 ?
              //need to change when design will be ready
              <div style={{textAlign: 'center'}}>
                <Navlink to={addLangPrefix('/login')}>
                  SIGN IN
                </Navlink>
              </div>
              :
              <div className="content">
                <h1 className={'sign-up-title'}>Sign up</h1>
                <div className="steps-form">
                  <Steps current={current} onChange={this.toSelectedPage}>
                    <Step
                      icon={(current === 1 || current === 2) &&
                      <div className="finished-icon">
                        <span className="step-number">1</span>
                        <span className="step-icon"><Icons name="success" fill="#FFFFFF"/></span>
                      </div>}/>
                    <Step
                      icon={current === 2 &&
                    <div className="finished-icon">
                      <span className="step-number">2</span>
                      <span className="step-icon"><Icons name="success" fill="#FFFFFF"/></span>
                    </div>}/>
                    <Step/>
                  </Steps>
                  <div className="steps-content">
                    {this.showStep(current)}
                  </div>
                </div>
              </div>}

            <div className="link-button">
              <span>or</span>
              <Navlink tabIndex="-1" to={addLangPrefix('/login')}>SIGN IN</Navlink>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default Signup;
