import React from "react";
import Icons from 'icons/icon'
import {Button, Icon, Popconfirm, Tooltip} from "antd";
import {PlayIcon} from "icons/antd";

export const PlayBtn = (item, cb, disableButton) => {
  return (
    <Button
      className="play-btn"
      onClick={e => cb(e, item)}
      disabled={disableButton}
    >
      <PlayIcon/>
    </Button>
  );
};

export const EditItemBtn = (item, cb, i18n) => {
  return <>
    {window.innerWidth > 768 ?
      <span
          className="icon-with-bg"
          onClick={(e) => cb(e, item)}
      >
        <Icons name="edit"/>
      </span>
      :
      <p onClick={(e) => cb(e, item)}>{i18n.t`Edit`}</p>
    }
  </>
};

export const InfoItemBtn = (item, i18n) => {
  return (
    <Tooltip placement="top"
             title={i18n.t`Already submitted`}
    >
      <span>
        <Icons name="info"/>
      </span>
    </Tooltip>
  )
};

export const InfoParentItemBtn = (item, i18n) => {
  return (
    <Tooltip placement="top"
             title={i18n.t`Parent Item`}
    >
      <Icon type="info-circle"
            size={'small'}
            style={{fontSize: '14px'}} />
      <span>{i18n.t`Parent Item`}</span>
    </Tooltip>
  )
};

export const RemoveItemBtn = (item, cb, i18n) => {
  return (<Popconfirm
    title={i18n.t`Are you sure to delete this item?`}
    okText={i18n.t`Yes`}
    cancelText={i18n.t`No`}
    placement={window.innerWidth > 768 ? "bottom" : 'top'}
    onConfirm={(e) => cb(e, item)}
  >
    {window.innerWidth > 768 ?
      <span className="icon-with-bg">
        <Icons name="delete"/>
      </span>
      :
      <p>
        {i18n.t`Delete`}
      </p>
    }
  </Popconfirm>)
};
