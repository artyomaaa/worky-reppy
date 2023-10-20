import React from "react";
import styles from "./style.less";
import {Button, ConfigProvider, DatePicker, Input, Radio, Select, Row, Col} from "antd";
import moment from "moment";
import {withRouter} from "dva/router";
import {withI18n} from "@lingui/react";
import en_GB from "antd/lib/locale-provider/en_GB";
import hy_AM from "antd/lib/locale-provider/hy_AM";
import {FAMILY_STATUSES, GENDER, Countries, CONTACT_TYPES} from 'utils/constant'
import {Form} from "@ant-design/compatible";
import {connect} from "dva";
import Icons from 'icons/icon';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import countryData from './allCountryData.json'

const initialState = {
  family: {
    relatives: [
      {
        id: 1,
        name: "Father",
        valid: true,
        addedForms: []
      },
      {
        id: 2,
        name: "Mother",
        valid: true,
        addedForms: []
      },
      {
        id: 3,
        name: "Sister",
        valid: true,
        addedForms: []
      },
      {
        id: 4,
        name: "Brother",
        valid: true,
        addedForms: []
      }
    ],
    active: 1,
    kids: [],
    deletedRelativesId: []
  },
  marriedStatus: 0
};
const FormItem = Form.Item;
const mapStateToProps = ({userDetail}) => ({userDetail});

@withRouter
@withI18n()
@Form.create()
@connect(mapStateToProps)
class FormPersonalInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      matches: window.matchMedia("(min-width: 768px)").matches,
    };
  }

  #dateFormat = 'DD/MM/YYYY';

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
    this.setState(() => ({
      marriedStatus: this.props.userDetail.personal_info.family_status
    }));
    const {userDetail: {isLoading, personal_info: {user_relative}}} = this.props;
    if (!isLoading && user_relative) {
      this.getFamily(user_relative)
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.userDetail?.personal_info?.user_relative !== this.props.userDetail?.personal_info?.user_relative) {
      this.getFamily(this.props?.userDetail?.personal_info?.user_relative)
      this.props.form.resetFields();
    }
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  getFamily = (user_relative) => {
    const shallowCopyRelatives = JSON.parse(JSON.stringify([...initialState.family.relatives])),
      shallowCopyKids = JSON.parse(JSON.stringify([...initialState.family.kids]));
    for (let i = 0; i < user_relative.length; i++) {
      if (user_relative[i]['type'] !== "kid") {
        const index = shallowCopyRelatives.findIndex((item) => item.name.toLowerCase() === user_relative[i]['type'].toLowerCase());
        if (shallowCopyRelatives[index]) {
          if (shallowCopyRelatives[index]["name"] === "Father" && shallowCopyRelatives[index]["addedForms"].length > 0) {
            shallowCopyRelatives[index]["addedForms"].length = 0;
            shallowCopyRelatives[index]['addedForms'].push(user_relative[i]);
          } else if (shallowCopyRelatives[index]["name"] === "Mother" && shallowCopyRelatives[index]["addedForms"].length > 0) {
            shallowCopyRelatives[index]["addedForms"].length = 0;
            shallowCopyRelatives[index]['addedForms'].push(user_relative[i]);
          } else {
            shallowCopyRelatives[index]['addedForms'].push(user_relative[i]);
          }
        }
      } else {
        shallowCopyKids.push(user_relative[i])
      }
    }

    this.setState((state) => {
      return {
        family: {
          ...state.family,
          relatives: [...shallowCopyRelatives],
          kids: [...shallowCopyKids]
        }
      }
    })
  }

  getAllOffsets() {
    let minusOffsets = [],
      plusOffsets = ['+00:00'];

    moment.tz.names().forEach(timeZoneName => {
      let formattedTimeZone = moment.tz(timeZoneName).format().substr(moment.tz(timeZoneName).format().length - 6);
      if (formattedTimeZone.substr(formattedTimeZone.length - 1) !== 'Z' && !minusOffsets.includes(formattedTimeZone) && !plusOffsets.includes(formattedTimeZone)) {
        formattedTimeZone.substr(0, 1) === '-' ? minusOffsets.push(formattedTimeZone) : plusOffsets.push(formattedTimeZone);
      }
    });
    return minusOffsets.sort().concat(plusOffsets.sort());
  }

  onChangeTabs = (ev) => {
    const typeRelatives = ev.target.value;

    this.setState((state) => {
      return {
        family: {
          ...state.family,
          active: typeRelatives
        }
      }
    })
  }

  deleteForm = (id, type) => {
    const {family: {relatives, kids, deletedRelativesId}} = this.state,
      deletedIds = [...deletedRelativesId];

    let family;

    if (type !== "kid") {
      const shallowCopyRelatives = [...relatives],
        index = shallowCopyRelatives.findIndex((item) => item.name.toLowerCase() === type.toLowerCase()),
        filterRelatives = shallowCopyRelatives[index]['addedForms'].filter((relative) => String(relative.id) !== String(id));

      shallowCopyRelatives[index]['addedForms'] = [...filterRelatives];

      family = {
        ...this.state.family,
        relatives: [...shallowCopyRelatives],
      }

    } else {
      const shallowCopyKids = [...kids],
        filterKids = shallowCopyKids.filter((kid) => String(kid.id) !== String(id));

      family = {
        ...this.state.family,
        kids: [...filterKids]
      }
    }
    deletedIds.push(id)
    family.deletedRelativesId = [...deletedIds]

    this.setState({family: {...family}}, () => this.state.family)
  }

  toPaintFamilyForm = (relatives) => {
    const {i18n, form, permissionsUser: {editRelativeAccess,addRelativeAccess}, userDetail: {isSubmittedLoading}} = this.props,
      {family: {active}} = this.state,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM,
      paintForm = [];

    for (let i = 0; i < relatives.length; i++) {
      let generateForm = relatives[i]['addedForms'].map((item, index) =>
        (
          <div key={index} className={relatives[i].id === active ? null : styles['hiddenTab']}>
            {
              ['Sister', 'Brother'].includes(relatives[i]['name']) && editRelativeAccess ?
                <div className={styles['delete-icon']}
                     onClick={() => this.deleteForm(item.id, relatives[i]['name'])}>
                  <Icons name="close"/>
                </div>
                : null
            }

            <Row type="flex" justify="space-between" gutter={16}>
              <Col lg={12} md={24} sm={24} xs={24}>
                <span className="label-txt">{i18n.t`Full Name`}</span>
                <ConfigProvider locale={lang}>
                  <FormItem className="no-icons-form-filed">
                    {getFieldDecorator(`family-name-${relatives[i].name.toLowerCase()}-${item.id}`, {
                      initialValue: item.full_name,
                      rules: [
                        {
                          max: 70,
                          message: i18n.t`Field name is too long!`
                        }
                      ]
                    })(<Input
                      disabled={!editRelativeAccess}
                      className="input-global-md color-black font-medium"/>)}
                  </FormItem>
                </ConfigProvider>
              </Col>
              <Col lg={12} md={24} sm={24} xs={24}>
                <span className="label-txt">{i18n.t`Phone Number`}</span>
                <ConfigProvider locale={lang}>
                  <FormItem className="selectPhoneNumber">
                    {getFieldDecorator(`family-phone-${relatives[i].name.toLowerCase()}-${item.id}`, {
                      valuePropName: 'defaultValue',
                      initialValue: item.phone_number,
                      rules: [
                        {
                          message: i18n.t`Phone Number is required!`
                        },
                      ]
                    })(<PhoneInput
                      value={item.phone_number ? item.phone_number : ''}
                      disabled={!editRelativeAccess}
                      inputStyle={{width: "100%"}}
                      masks={{am: '(..) ..-..-..'}}
                      specialLabel={null}
                      country={'am'}
                      inputClass="input-global-md color-black font-medium"/>)}
                  </FormItem>
                </ConfigProvider>
              </Col>
            </Row>

            {index === relatives[i]['addedForms'].length - 1 && ['Sister', 'Brother'].includes(relatives[i]['name']) && editRelativeAccess ?
              <div className={styles['add-section']}>
                {addRelativeAccess &&
                  <span onClick={() => this.addFormFamily(relatives[i].id)} className="add-btn">{i18n._(`+ Add ${relatives[i]['name']}`)}</span>
                }
              </div> : ['Sister', 'Brother'].includes(relatives[i]['name']) ?
                <div className={styles['separator']}/> : null}
          </div>
        )
      )

      if (relatives[i]['addedForms'].length === 0 && editRelativeAccess) {
        generateForm = <div key={Math.random().toString(36).substr(2, 9)} className={relatives[i].id === active ? styles['add-section'] : styles['hiddenTab']}>
          {addRelativeAccess &&
            <span onClick={() => this.addFormFamily(relatives[i].id)} className="add-btn">
            {i18n._(`+ Add ${relatives[i]['name']}`)}
          </span>
          }
        </div>
      }
      paintForm.push(generateForm)

    }

    return paintForm
  }

  toPaintKidsForm = ({editRelativeAccess,addRelativeAccess}) => {
    const {family: {kids}} = this.state,
      {i18n, form, userDetail: {personal_info, isSubmittedLoading}} = this.props,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM;

    if (kids.length === 0 && editRelativeAccess) {
      return (
        <div className={styles['add-section']}>
          {addRelativeAccess &&
            <span onClick={this.addKids} className="add-btn">{i18n.t`+ Add Kid's Information`}</span>
          }
        </div>
      )
    }

    return kids.map((kid, index) => (
        <div key={index}>
          {
            editRelativeAccess &&
            <div onClick={() => this.deleteForm(kid.id, "kid")} className={styles['delete-icon']}>
              <Icons name="close"/>
            </div>
          }
          <Row type="flex" justify="space-between" gutter={16}>
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <span className="label-txt">{i18n.t`Kid’s Full Name`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`family-name-kid-${kid.id}`, {
                    initialValue: kid.full_name,
                    rules: [
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editRelativeAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <span className="label-txt">{i18n.t`Date of Birth`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`family-birthday-kid-${kid.id}`, {
                    initialValue: kid.birthday ? moment(kid.birthday) : moment(),
                  })(<DatePicker
                    disabledDate={this.disabledFutureDate}
                    disabled={!editRelativeAccess}
                    format={this.#dateFormat}
                    suffixIcon={
                      <Icons name="calendar"/>
                    }
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    className="datepicker-global-md ex_p-l-r-3 w_100 color-black font-medium svg-icon"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <span className="label-txt">{i18n.t`Gender`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator(`family-gender-kid-${kid.id}`, {
                    initialValue: +kid.gender,
                  })(<Select
                    disabled={!editRelativeAccess}
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {Object.keys(GENDER).map((key, index) =>
                      <Select.Option key={index} className={styles['genderUpperCase']}
                                     value={GENDER[key].value}>{GENDER[key].text}</Select.Option>
                    )}
                  </Select>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>

          {index === kids.length - 1 && editRelativeAccess ?
            <div className={styles['add-section']}>
              {addRelativeAccess &&
                <span onClick={this.addKids} className="add-btn">{i18n.t`+ Add Kid's Information`}</span>
              }
            </div> : <div className={styles['separator']}/>}
        </div>
      )
    )

  }

  disabledFutureDate = (value) => {
    return value >= moment();
  }

  addKids = () => {
    const {family: {kids}} = this.state,
      kid = {
        id: "0_new",
        name: "",
        surname: "",
        birthday: moment(),
        gender: 0,
      };

    if (kids.length > 0) {
      const lastKidId = kids[kids.length - 1]['id'];
      if (String(lastKidId).includes("_new")) {
        const splitId = lastKidId.split("_");
        kid.id = +splitId[0] + 1 + "_new"
      } else {
        kid.id = lastKidId + "_new";
      }
    }


    kids.push(kid)

    this.setState((state) => {
      return {
        family: {
          ...state.family,
          kids
        }
      }
    })

  }

  addFormFamily = (idRelative) => {
    const {family: {relatives}} = this.state;
    let newRelatives = [...relatives].map((relative) => {
      if (+idRelative === +relative.id) {
        let addedForms = [...relative.addedForms],
          formRelative = {
            name: "",
            surname: "",
            email: "",
            phone_number: "",
          };

        if (addedForms.length > 0) {
          if (String(addedForms[addedForms.length - 1]['id']).includes("_new")) {
            const splitId = addedForms[addedForms.length - 1]['id'].split("_");
            formRelative.id = +splitId[0] + 1 + "_new"
          } else {
            formRelative.id = addedForms[addedForms.length - 1]['id'] + "_new";
          }
        } else {
          formRelative.id = "0_new"
        }

        addedForms.push(formRelative)

        return {
          ...relative,
          addedForms
        }
      } else {
        return {
          ...relative
        }
      }
    })

    this.setState((state) => {
      return {
        family: {
          ...state.family,
          relatives: [...newRelatives]
        }
      }
    })
  }

  numberValidation = (rule, value, callback) => {
    if (isNaN(value)) {
      callback('Please enter only numbers');
    } else {
      callback();
    }
  }

  generateSendingData = (data) => {
    const family = {brother: {}, father: {}, sister: {}, mother: {}, kid: {}},
      contacts = [],
      userPersonalInformation = {};

    for (let prop in data) {
      if (prop.includes("family-")) {
        const splitPropertyData = prop.split("-");
        if (family[splitPropertyData[2]][splitPropertyData[3]] === undefined) {
          family[splitPropertyData[2]][splitPropertyData[3]] = {}
          family[splitPropertyData[2]][splitPropertyData[3]][splitPropertyData[1]] = splitPropertyData[1] === "birthday" ? moment(data[prop]).format('YYYY-MM-DD') : data[prop];
        } else {
          family[splitPropertyData[2]][splitPropertyData[3]][splitPropertyData[1]] = splitPropertyData[1] === "birthday" ? moment(data[prop]).format('YYYY-MM-DD') : data[prop];
        }
      } else {
        switch (prop) {
          case "city":
            contacts.city = {
              type: CONTACT_TYPES.address.type,
              name: CONTACT_TYPES.address.names.city,
              value: data[prop]
            }
            break;
          case "country":
            contacts.country = {
              type: CONTACT_TYPES.address.type,
              name: CONTACT_TYPES.address.names.country,
              value: data[prop]
            }
            break;
          case "address1":
            contacts.address1 = {
              type: CONTACT_TYPES.address.type,
              name: CONTACT_TYPES.address.names.address1,
              value: data[prop]
            }
            break;
          case "address2":
            contacts.address2 = {
              type: CONTACT_TYPES.address.type,
              name: CONTACT_TYPES.address.names.address2,
              value: data[prop]
            }
            break;
          case "phoneNumber":
            contacts.phoneNumber = {
              type: CONTACT_TYPES.phone.phoneNumber.type,
              name: CONTACT_TYPES.phone.phoneNumber.name,
              value: data[prop]
            }
            break;
          case "homeNumber":
            if (data[prop].trim().length > 0) {
              contacts.homeNumber = {
                type: CONTACT_TYPES.phone.homeNumber.type,
                name: CONTACT_TYPES.phone.homeNumber.name,
                value: data[prop] ? data[prop] : ""
              }
            }
            break;
          case "zipCode":
            if (data[prop].trim().length > 0) {
              contacts.zipCode = {
                type: CONTACT_TYPES.address.type,
                name: CONTACT_TYPES.address.names.zipCode,
                value: data[prop] ? data[prop] : ""
              }
            }
            break;
          default:
            userPersonalInformation[prop] = prop === "birthday" ? moment(data[prop]).format('YYYY-MM-DD') : data[prop]
        }
      }
    }
    userPersonalInformation.family = {...family};
    for (let key in userPersonalInformation.family) {
      let obj = userPersonalInformation.family[key];

      for (let prop in obj) {
        if (obj[prop].name == undefined) {
          delete obj[prop];
        } else {
          userPersonalInformation.family[key][prop] = obj[prop];
        }
      }
    }

    userPersonalInformation.contacts = {...contacts};

    return userPersonalInformation
  }

  getContactsUser = (contacts) => {
    const contactsUser = {};

    for (let i = 0; i < contacts.length; i++) {
      contactsUser[contacts[i]['name']] = contacts[i]['value'];
    }

    return contactsUser;
  }

  onSubmit = (event) => {
    event.preventDefault();
    const {onSubmit, form, match: {params: {id}}} = this.props,
      {family: {deletedRelativesId, relatives}} = this.state;

    form.validateFields((error, values) => {
      const errorsValidation = error ? Object.keys(error) : [],
        validation = new Set();

      for (let i = 0; i < errorsValidation.length; i++) {
        const splitErrorMsg = errorsValidation[i].split("-");
        if (splitErrorMsg[0] === 'family') {
          validation.add(splitErrorMsg[2].toLowerCase())
        }
      }

      const itemsUniq = [...validation],
        newValidation = [...relatives].map((item) => {
          itemsUniq.includes(item.name.toLowerCase()) ? item.valid = false : item.valid = true;
          return item;
        });

      this.setState((prevState) => {
        return {
          family: {
            ...prevState.family,
            relatives: [...newValidation]
          }
        }
      })

      if (!error && onSubmit) {
        if (values.meta) {
          const _numberThreshold = Number(parseFloat(values.meta.threshold).toFixed(0)).toString();
          if (_numberThreshold !== "") {
            values.meta.threshold = _numberThreshold
          }
        }

        const userPersonalInformation = this.generateSendingData(values);

        userPersonalInformation.deletedRelativesId = deletedRelativesId.length > 0 ? [...deletedRelativesId] : null;
        userPersonalInformation.userId = id;
        userPersonalInformation.id = +id;
        if (userPersonalInformation.spouseBirthday){
          userPersonalInformation.spouseBirthday = userPersonalInformation.spouseBirthday.format('YYYY-MM-DD');
        }
        onSubmit(userPersonalInformation)
      }
    });

  }

  render() {
    const {i18n, permissionsUser, form, userDetail: {personal_info, isSubmittedLoading}} = this.props,
      {editUserAccess, editRelativeAccess} = permissionsUser,
      {family: {relatives, active}} = this.state,
      {getFieldDecorator} = form,
      lang = i18n.language === 'en' ? en_GB : hy_AM,
      timeZone = this.getAllOffsets(),
      userContacts = (personal_info && personal_info?.contacts) ? this.getContactsUser(personal_info.contacts) : [];

    return (

      <Form hideRequiredMark
            onSubmit={this.onSubmit}
            noValidate={true}
      >
        <div className="long-form rounded-scrollbar">
          { !this.state.matches &&
            <div className={styles['form-title']}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.47235 7.47179C10.1259 6.95756 10.603 6.2524 10.8372 5.45442C11.0713 4.65643 11.051 3.8053 10.7789 3.01943C10.5068 2.23357 9.99652 1.55205 9.31907 1.06969C8.64161 0.587335 7.83065 0.328125 6.99902 0.328125C6.16739 0.328125 5.35643 0.587335 4.67897 1.06969C4.00152 1.55205 3.49125 2.23357 3.21916 3.01943C2.94707 3.8053 2.9267 4.65643 3.16086 5.45442C3.39503 6.2524 3.87209 6.95756 4.52569 7.47179C3.40574 7.92048 2.42855 8.66469 1.69828 9.62507C0.96802 10.5854 0.512063 11.726 0.379021 12.9251C0.369391 13.0127 0.377099 13.1013 0.401705 13.1858C0.426311 13.2704 0.467333 13.3493 0.522429 13.418C0.6337 13.5568 0.795544 13.6457 0.972354 13.6651C1.14917 13.6846 1.32646 13.633 1.46524 13.5217C1.60401 13.4104 1.69291 13.2486 1.71235 13.0718C1.85874 11.7686 2.48015 10.565 3.45783 9.69098C4.43552 8.81697 5.70095 8.33381 7.01235 8.33381C8.32375 8.33381 9.58918 8.81697 10.5669 9.69098C11.5446 10.565 12.166 11.7686 12.3124 13.0718C12.3305 13.2356 12.4086 13.3869 12.5318 13.4965C12.6549 13.606 12.8142 13.6661 12.979 13.6651H13.0524C13.2271 13.645 13.3868 13.5567 13.4967 13.4193C13.6066 13.2819 13.6578 13.1067 13.639 12.9318C13.5053 11.7293 13.0469 10.5858 12.3129 9.62392C11.5789 8.66207 10.597 7.91811 9.47235 7.47179ZM6.99902 6.99846C6.4716 6.99846 5.95603 6.84206 5.5175 6.54904C5.07897 6.25602 4.73717 5.83955 4.53534 5.35228C4.33351 4.86501 4.2807 4.32883 4.38359 3.81155C4.48649 3.29427 4.74046 2.81911 5.1134 2.44617C5.48634 2.07323 5.9615 1.81926 6.47878 1.71636C6.99606 1.61347 7.53224 1.66628 8.01951 1.86811C8.50678 2.06994 8.92325 2.41174 9.21627 2.85027C9.50929 3.2888 9.66569 3.80437 9.66569 4.33179C9.66569 5.03903 9.38473 5.71731 8.88464 6.21741C8.38454 6.7175 7.70626 6.99846 6.99902 6.99846Z" fill="#4A54FF" stroke="#4A54FF" strokeWidth="0.2"/>
              </svg>
              <h3>Personal Information</h3>
            </div>
          }
          <Row type="flex" justify="space-between" gutter={16}>
            <Col lg={6} className={styles['input-responsive']}>
              <span className="label-txt">{i18n.t`Name`}*</span>
              <FormItem className="no-icons-form-filed">
                {getFieldDecorator('name', {
                  initialValue: personal_info.name,
                  rules: [
                    {
                      required: true,
                      message: i18n.t`Name is required`
                    },
                    {
                      max: 70,
                      message: i18n.t`Field name is too long!`
                    }
                  ]
                })(<Input
                  disabled={!editUserAccess }
                  className="input-global-md color-black font-medium"/>)}
              </FormItem>
            </Col>
            <Col lg={6} className={styles['input-responsive']}>
              <span className="label-txt">{i18n.t`Surname`}*</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('surname', {
                    initialValue: personal_info.surname,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Surname is required`
                      },
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={6} className={styles['input-responsive']}>
              <span className="label-txt">{i18n.t`Patronymic`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('patronymic', {
                    initialValue: personal_info.patronymic,
                    rules: [
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={6} className={styles['input-responsive']}>
              <span className="label-txt">{i18n.t`Nickname`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('nickname', {
                    initialValue: personal_info.nickname,
                    rules: [
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" gutter={16}>
            <Col lg={8} className={`${styles['input-responsive']} ${styles['input-responsive-birth-and-phone']}`}>
              <span className="label-txt">{i18n.t`Date of Birth`}*</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('birthday', {
                    initialValue: personal_info.birthday ? moment(personal_info.birthday) : moment(),
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Birthday is required!`
                      }
                    ]
                  })(<DatePicker
                    disabledDate={this.disabledFutureDate}
                    disabled={!editUserAccess}
                    format={this.#dateFormat}
                    suffixIcon={
                      <Icons name="calendar"/>
                    }
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    className="datepicker-global-md w-100 ex_p-l-r-3 w_100 color-black font-medium svg-icon"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={8} className={`${styles['input-responsive']} ${styles['input-responsive-birth-and-phone']}`}>
              <span className="label-txt">{i18n.t`TIN`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('tin', {
                    initialValue: personal_info.tin || "000000000",
                    rules: [
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={8} className={styles['input-responsive']}>
              <span className="label-txt">{i18n.t`Nationality`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('nationality', {
                    initialValue: personal_info.nationality,
                    rules: [
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" gutter={16}>
            <Col lg={8} sm={24} className={styles['input-responsive']}>
              <span className="label-txt">{i18n.t`Country`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('country', {
                    initialValue: userContacts.country ? userContacts.country : null,
                  })(<Select
                    optionFilterProp='children'
                    showSearch
                    disabled={!editUserAccess}
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                  >
                    {countryData.map((country, index) =>
                      <Select.Option key={index} value={country['code']}>{country['name']}</Select.Option>
                    )}
                  </Select>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={8} sm={24} className={styles['input-responsive']}>
              <span className="label-txt">{i18n.t`Current City`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('city', {
                    initialValue: userContacts.city ? userContacts.city : null,
                    rules: [
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={3} className={styles['input-responsive-zone']}>
              <span className="label-txt">{i18n.t`ZIP Code`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('zipCode', {
                    initialValue: userContacts?.zipCode || "0000",
                    rules: [
                      {
                        max: 70,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={5} className={styles['input-responsive-zone']}>
              <span className="label-txt">{i18n.t`Time Zone`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('time_offset', {
                    initialValue: personal_info.time_offset,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Time Offset is required!`
                      }
                    ]
                  })(<Select
                    disabled={!editUserAccess}
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {timeZone.map((timeOffset) =>
                      <Select.Option key={timeOffset} value={timeOffset}>{timeOffset}</Select.Option>
                    )}
                  </Select>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <hr/>
          <Row>
            <Col>
              <span className="label-txt">{i18n.t`Residence Address`}*</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('address1', {
                    initialValue: userContacts.address1 ? userContacts.address1 : '',
                    rules: [
                      { transform: (value) => value.trim() },
                      {
                        required: true,
                        message: i18n.t`Residence Address is required!`
                      },
                      {
                        max: 150,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <Row>
            <Col>
              <span className="label-txt">{i18n.t`Registration Address`}*</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('address2', {
                    initialValue: userContacts.address2 ? userContacts.address2 : '',
                    rules: [
                      { transform: (value) => value.trim() },
                      {
                        required: true,
                        message: i18n.t`Registration Address is required!`
                      },
                      {
                        max: 150,
                        message: i18n.t`Field name is too long!`
                      }
                    ]
                  })(<Input
                    disabled={!editUserAccess}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <hr/>
          <Row type="flex" justify="space-between" gutter={16}>
            <Col lg={12} md={12} sm={12} xs={24}>
              <span className="label-txt">{i18n.t`Gender`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('gender', {
                    initialValue: +personal_info.gender,
                    rules: [
                      {
                        required: true,
                        message: i18n.t`Gender is required!`
                      }
                    ]
                  })(<Select
                    disabled={!editRelativeAccess}
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium">
                    {Object.keys(GENDER).map((key, index) =>
                      <Select.Option key={index} className={styles['genderUpperCase']}
                                     value={GENDER[key].value}>{GENDER[key].text}</Select.Option>
                    )}
                  </Select>)}
                </FormItem>
              </ConfigProvider>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24}>
              <span className="label-txt">{i18n.t`Marital Status`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('family_status', {
                    initialValue: personal_info.family_status,
                  })(<Select
                    disabled={!editRelativeAccess}
                    mode="single"
                    suffixIcon={
                      <Icons name="arrowdown2" fill="#B3B3B3"/>
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="select-global-md w_100 single-select ex_m-l-r-3 color-black font-medium"
                    onChange={(value) => {
                      this.setState(() => ({
                        marriedStatus: value
                      }))
                    }}>
                    {FAMILY_STATUSES.map((status, index) =>
                      <Select.Option
                        key={index}
                        value={status.value}>
                        {status.text}
                      </Select.Option>
                    )}
                  </Select>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          {
            this.state.marriedStatus ? (personal_info.user_relative?.filter(e => e.type === "spouse").length ?
              personal_info.user_relative?.filter(e => e.type === "spouse").map((spouse, index) => (
                <React.Fragment key={index}>
                  <Row type="flex" justify="space-between" gutter={16}>
                    <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                      <span className="label-txt">{i18n.t`Spouse Full Name`}</span>
                      <FormItem className="no-icons-form-filed">
                        {getFieldDecorator('spouseName', {
                          initialValue: spouse.full_name,
                          rules: [
                            {
                              max: 70,
                              message: i18n.t`Field name is too long!`
                            }
                          ]
                        })(<Input
                          disabled={!editRelativeAccess}
                          className="input-global-md color-black font-medium"/>)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row type="flex" justify="space-between" gutter={16}>
                    <Col lg={12} className={`${styles['input-responsive']} ${styles['input-responsive-birth-and-phone']}`}>
                      <span className="label-txt">{i18n.t`Date of Birth`}</span>
                      <ConfigProvider locale={lang}>
                        <FormItem className="no-icons-form-filed">
                          {getFieldDecorator('spouseBirthday', {
                            initialValue: spouse.birthday ? moment(spouse.birthday) : moment(),
                          })(<DatePicker
                            disabledDate={this.disabledFutureDate}
                            disabled={!editRelativeAccess}
                            format={this.#dateFormat}
                            suffixIcon={
                              <Icons name="calendar"/>
                            }
                            getCalendarContainer={triggerNode => triggerNode.parentNode}
                            className="datepicker-global-md w-100 ex_p-l-r-3 w_100 color-black font-medium svg-icon"/>)}
                        </FormItem>
                      </ConfigProvider>
                    </Col>
                    <Col lg={12} className={`${styles['input-responsive']} ${styles['input-responsive-birth-and-phone']}`}>
                      <span className="label-txt">{i18n.t`Personal Phone Number`}</span>
                      <ConfigProvider locale={lang}>
                        <FormItem className="selectPhoneNumber no-icons-form-filed ">
                          {getFieldDecorator('spousePhoneNumber', {
                            valuePropName: 'defaultValue',
                            initialValue: spouse.phone_number,
                          })(<PhoneInput
                            value={spouse.phone_number ? spouse.phone_number : ""}
                            disabled={!editRelativeAccess}
                            inputStyle={{width: "100%"}}
                            masks={{am: '(..) ..-..-..'}}
                            specialLabel={null}
                            country={'am'}
                            inputClass=" input-global-md color-black font-medium"/>)}
                        </FormItem>
                      </ConfigProvider>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span className="label-txt">{i18n.t`Residence Address`}</span>
                      <ConfigProvider locale={lang}>
                        <FormItem className="no-icons-form-filed">
                          {getFieldDecorator('spouseAddress', {
                            initialValue: spouse.birthplace,
                            rules: [
                              {
                                max: 150,
                                message: i18n.t`Field name is too long!`
                              }
                            ]
                          })(<Input
                            disabled={!editRelativeAccess}
                            className="input-global-md color-black font-medium"/>)}
                        </FormItem>
                      </ConfigProvider>
                    </Col>
                  </Row>
                </React.Fragment>
              )) :
              <React.Fragment>
                <Row type="flex" justify="space-between" gutter={16}>
                  <Col lg={12} md={24} sm={24} xs={24}>
                    <span className="label-txt">{i18n.t`Spouse Full Name`}</span>
                    <FormItem className="no-icons-form-filed">
                      {getFieldDecorator('spouseName', {
                        initialValue: '',
                        rules: [
                          {
                            max: 70,
                            message: i18n.t`Field name is too long!`
                          }
                        ]
                      })(<Input
                        disabled={!editRelativeAccess}
                        className="input-global-md color-black font-medium"/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row type="flex" justify="space-between" gutter={16}>
                  <Col lg={12} md={24} sm={24} xs={24}>
                    <span className="label-txt">{i18n.t`Date of Birth`}</span>
                    <ConfigProvider locale={lang}>
                      <FormItem className="no-icons-form-filed">
                        {getFieldDecorator('spouseBirthday', {
                        })(<DatePicker
                          disabledDate={this.disabledFutureDate}
                          disabled={!editRelativeAccess}
                          format={this.#dateFormat}
                          suffixIcon={
                            <Icons name="calendar"/>
                          }
                          getCalendarContainer={triggerNode => triggerNode.parentNode}
                          className="datepicker-global-md w-100 ex_p-l-r-3 w_100 color-black font-medium svg-icon"/>)}
                      </FormItem>
                    </ConfigProvider>
                  </Col>
                  <Col lg={12} md={24} sm={24} xs={24}>
                    <span className="label-txt">{i18n.t`Personal Phone Number`}</span>
                    <ConfigProvider locale={lang}>
                      <FormItem className="selectPhoneNumber no-icons-form-filed ">
                        {getFieldDecorator('spousePhoneNumber', {
                          valuePropName: 'defaultValue',
                          initialValue: '',
                        })(<PhoneInput
                          value={""}
                          disabled={!editRelativeAccess}
                          inputStyle={{width: "100%"}}
                          masks={{am: '(..) ..-..-..'}}
                          specialLabel={null}
                          country={'am'}
                          inputClass=" input-global-md color-black font-medium"/>)}
                      </FormItem>
                    </ConfigProvider>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span className="label-txt">{i18n.t`Residence Address`}</span>
                    <ConfigProvider locale={lang}>
                      <FormItem className="no-icons-form-filed">
                        {getFieldDecorator('spouseAddress', {
                          initialValue: '',
                          rules: [
                            {
                              max: 150,
                              message: i18n.t`Field name is too long!`
                            }
                          ]
                        })(<Input
                          disabled={!editRelativeAccess}
                          className="input-global-md color-black font-medium"/>)}
                      </FormItem>
                    </ConfigProvider>
                  </Col>
                </Row>
              </React.Fragment>) : null
          }
          <hr/>
          <Row gutter={10} className={styles['input-responsive-zone-mg0']}>
            <Col lg={4} className={styles['input-responsive-zone-pd0']}>
              <span className="label-txt">{i18n.t`Number of Kids`}</span>
              <ConfigProvider locale={lang}>
                <FormItem className="no-icons-form-filed">
                  {getFieldDecorator('amountOfKids', {
                    initialValue: personal_info.amountOfKids,
                    rules: [
                      {validator: this.numberValidation}
                    ]
                  })(<Input
                    disabled={true}
                    className="input-global-md color-black font-medium"/>)}
                </FormItem>
              </ConfigProvider>
            </Col>
          </Row>
          <div className={styles['family-relatives']}>
            {this.toPaintKidsForm(permissionsUser)}
          </div>
          <hr/>
          <Row>
            <Col>
              <Radio.Group className="custom-radio-group" onChange={this.onChangeTabs}>
                {
                  relatives.map((item, index) => <Radio.Button className={!item.valid && styles['validationSection']}
                                                               key={index} checked={item.id === active}
                                                               value={item.id}>{i18n._(item.name)}</Radio.Button>)
                }
              </Radio.Group>
            </Col>
          </Row>
          <div className={styles['family-relatives']}>
            {this.toPaintFamilyForm(relatives, permissionsUser)}
          </div>
          <div className={styles['form-actions']}>
            {
              editUserAccess && <Button
                className="app-btn primary-btn"
                htmlType="submit"
                disabled={!editUserAccess}
              >
                {i18n.t`Save`}
              </Button>
            }
          </div>
        </div>
      </Form>
    )
  }


}

export default FormPersonalInfo
