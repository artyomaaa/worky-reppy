import React, {useState, useRef, useEffect} from 'react';
import {I18n, Trans} from '@lingui/react';
import {CSSTransition, SwitchTransition} from 'react-transition-group';
import {Input, Form, Button, Col, Row} from 'antd';
import {HuePicker} from 'react-color';
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import styles from './AddEditTag.less';
import Icons from 'icons/icon';

const CreateTagComponent = (
  {
    form: {getFieldDecorator, getFieldsValue, validateFields, resetFields, setFieldsValue},
    createTagRequest,
    editTag,
    hideModal,
    tagAction,
    isKeyPress,
    editTagRequest,
    tagNameInputRef,
    handleAddEditTag,
    allTags
  }) => {

  // Refs
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [colorPickerBackgroundPreset] = useState(['#ebb424', '#49c39e', '#7958ab', '#80d2de', '#e51570']);
  const [colorPickerBackground, setColorPickerBackground] = useState('ebb424');
  const [isShowingPicker, setShowingPicker] = useState(false);
  const [value, setValue] = useState('');
  const [valueEdit, setValueEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Permissions
  const canAddTags = checkLoggedUserPermission(PERMISSIONS.ADD_TAGS.name, PERMISSIONS.ADD_TAGS.guard_name);

  useEffect(() => {
    editTag.name && setValue(editTag.name);
    setValueEdit(true);
  }, [editTag]);

  useEffect(() => {
    value && setErrorMessage("");
  }, [value]);

  useEffect(() => {
    if (editTag.id) {
      setColorPickerBackground(editTag.color.substring(1));
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editTag]);

  useEffect(() => {
    if (tagAction) {
      addEditTag();
    }
  }, [tagAction]);

  useEffect(() => {
    if (isKeyPress) {
      addEditTagEnter();
    }
  }, [isKeyPress]);

  // Methods
  function handleChangeComplete(color) {
    color = typeof (color) === 'object' ?
      color.hex.substring(1) : color.charAt(0) === '#' ?
        color.substring(1) : color;

    setColorPickerBackground(color.hex || color);
    setFieldsValue({
      color: color.hex || color,
    });
  }

  function showingPickerEnter(e, show) {
    e.stopPropagation()
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 13) {
      setShowingPicker(show);
    }
  }

  function handleClickOutside(event) {
    if (!pickerRef.current?.contains(event.target) && !inputRef.current?.contains(event.target)) {
      setShowingPicker(false)
    }
  }

  function addEditTag() {
    if (value === '') {
      setErrorMessage({error: true, setErrorMessage: <Trans>Tag's name field is required․</Trans>});
    } else if ((value === allTags.find(e => e.name === value)?.name) && !valueEdit) {
      setErrorMessage({error: true, setErrorMessage: <Trans>This tag already exists</Trans>});
    } else {
      let fields = getFieldsValue();
      fields.color = `#${fields.color}`;
      fields.name = value;
      if (editTag.id) {
        fields.id = editTag.id;
        editTagRequest(fields);
        !canAddTags && hideModal();
      } else {
        if(!canAddTags) return;
        createTagRequest(fields);
      }
      resetFields();
      setColorPickerBackground('ebb424');
      setValue("");
    }
  }

  function addEditTagEnter(e) {
    e.stopPropagation();
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 13) {
      addEditTag();
    }
  }

  function getInputValue(e) {
    setValue(e.target.value);
    setValueEdit(false);
  }

  return (
    <I18n>
      {({i18n}) => (
        <Form>
          <Row type="flex"
               justify="space-between"
               align="top">
            <Col>
              <Form.Item className={styles['create-tag__input']}>
             <span className={styles['create-tag__input_icon']}>
                <Icons name="tag" fill={`#${colorPickerBackground}`}/>
             </span>
                <Input
                  value={value}
                  onChange={e => getInputValue(e)}
                  autoFocus={true}
                  ref={tagNameInputRef}
                  placeholder={i18n.t`Tag name...`}
                  onKeyPress={e => addEditTagEnter(e)}
                />
              </Form.Item>
              <p style={{
                color: "red",
                margin: 0
              }}>{errorMessage.error ? errorMessage.setErrorMessage : null}</p>
            </Col>
            <Col>
              <Button
                className="app-btn primary-btn md"
                onClick={() => addEditTag(editTag.id)}
              >
                <Trans>Save</Trans>
              </Button>
            </Col>
          </Row>
          <div className={styles['wrapper']}>
            <div className={styles['colorBoxWrapper']}>
              <SwitchTransition>
                <CSSTransition
                  key={isShowingPicker ? 'show-picker' : 'hide-picker'}
                  addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
                  classNames='pickerAnim'
                  timeout={300}
                >
                  <div style={{display: 'flex'}}>
                    {!isShowingPicker ? (
                      <>
                        {colorPickerBackgroundPreset && colorPickerBackgroundPreset.map((color, index) => {
                          return (
                            <label className={styles['colorBox']} key={color + index}>
                              <input
                                type="radio"
                                name="radio"
                                value={color}
                                checked={`#${colorPickerBackground}` === color}
                                onChange={(e) => handleChangeComplete(e.target.value)}
                              />
                              <span
                                onClick={() => handleChangeComplete(color)}
                                className={styles['colorBoxCheckmark']}
                                style={{background: color}}
                              />
                            </label>
                          )
                        })}
                      </>
                    ) : (
                      <div ref={pickerRef}>
                        <HuePicker
                          color={colorPickerBackground}
                          onChange={handleChangeComplete}
                          direction="horizontal"
                        />
                      </div>
                    )}
                  </div>
                </CSSTransition>
              </SwitchTransition>
              <Form.Item className={styles['colorItem']}>
                <div onClick={() => setShowingPicker(true)}
                     className={styles['colorPickerBlock']}>
                  <Icons name="circlePicker"/>
                  {getFieldDecorator('color', {
                    initialValue: colorPickerBackground,
                    rules: [
                      {required: true, message: <Trans>{'Color'} field is required</Trans>},
                      {
                        validator: (rule, val) => {
                          return val.length === 6 && /^#[0-9A-F]{6}$/i.test(`#${val}`)
                        }
                      },
                    ],
                  })(
                    <Input
                      ref={{inputRef}}
                      type="text"
                      className={styles['colorPickerField']}
                      placeholder={i18n.t`000000`}
                      prefix="#"
                      onChange={(e) => handleChangeComplete(e.target.value)}
                      onKeyPress={e => showingPickerEnter(e, true)}
                    />
                  )}
                </div>
              </Form.Item>
            </div>
          </div>
        </Form>
      )}
    </I18n>
  )
};

CreateTagComponent.propTypes = {};
const CreateTag = Form.create()(CreateTagComponent);
export default React.memo(CreateTag);
