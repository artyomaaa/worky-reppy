import React, {useState, useRef, useEffect} from 'react';
import { I18n, Trans } from '@lingui/react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { Button, Input, Form } from 'antd';
import { HuePicker } from 'react-color';
import styles from './projectColor.less';
import Icons from 'icons/icon';

const ProjectColorComponent = ({ item, form: { getFieldsValue, getFieldDecorator, setFieldsValue }}) => {

  // Refs
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [colorPickerBackgroundPreset] = useState(['#ebb424', '#49c39e', '#7958ab', '#80d2de', '#e51570']);
  const [colorPickerBackground, setColorPickerBackground] = useState('ebb424');
  const [isShowingPicker, setShowingPicker] = useState(false);

  useEffect(() => {
    setColorPickerBackground(item.color &&
    item.color?.charAt(0) === '#' ? item.color.substring(1) : item.color || 'ebb424');
  }, [item])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Methods
  const handleChangeComplete = (color) => {
    color = typeof (color) === 'object' ?
      color.hex.substring(1) : color.charAt(0) === '#' ?
        color.substring(1) : color;

    setColorPickerBackground(color.hex || color);
    setFieldsValue({
      color: color.hex || color,
    });
  }

  const showingPickerEnter = (e, show) => {
    e.stopPropagation()
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 13) {
      setShowingPicker(show);
    }
  }

  const handleClickOutside = (event) => {
    if (!pickerRef.current?.contains(event.target) && !inputRef.current?.contains(event.target)) {
      setShowingPicker(false)
    }
  }

  return (
    <I18n>
      {({ i18n }) => (
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
                                value={color.charAt(0) === '#' ? color.substring(1) : color}
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
                      style={{
                              backgroundColor: isShowingPicker ? colorPickerBackground : 'transparent',
                              borderColor: isShowingPicker && colorPickerBackground
                            }}
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
      )}
    </I18n>
  )
};
ProjectColorComponent.propTypes = {};
const ProjectColor = Form.create()(ProjectColorComponent);
export default React.memo(ProjectColor);
