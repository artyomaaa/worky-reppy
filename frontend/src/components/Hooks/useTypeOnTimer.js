import React, { useEffect } from 'react';

export default function useTypeOnTimer(ref, open, toggle, disabledHours, disabledMinutes) {
  useEffect(() => {
    if (!open) return;
    let onKeydown, onInput, input;
    process.nextTick(() => {
      if (!ref.current) return;
      input = document.querySelector(`.${ref.current.props.popupClassName} input`);
      let val = '00:00';
      let keyCode;
      onKeydown = input.addEventListener('keydown', (e) => {
        keyCode = e.keyCode;
        if (e.keyCode === 13) {
          toggle(false)
        }
      });
      onInput = input.addEventListener('input', (e) => {
        if (keyCode !== 46 && keyCode !== 8) {
          if (e.target.value.length <= 5) {
            if (e.target.value.length === 2) {
              input.value = e.target.value + ':'
            }
            val = e.target.value;
          } else input.value = val;
        }

        // When : symbol is deleted
        if (e.target.value.length === 3 && !e.target.value.includes(':')) {
          let newVal = [...e.target.value];
          newVal.splice(2, 0, ':');
          input.value = newVal.join('');
        }
      })
    });
    return (() => {
      if (!input) return;
      input.removeEventListener('keydown', onKeydown);
      input.removeEventListener('input', onInput)
    })
  }, [open, disabledHours, disabledMinutes]);
}
