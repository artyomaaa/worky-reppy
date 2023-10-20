import React, {useState} from "react";
import styles from "./UpdateWorkModal.less";
import {Popconfirm} from "antd";
import Icons from 'icons/icon'
import {appUrl} from 'utils/config';
import {fnCommentDateFormat, getResizedImage} from 'utils';


function CommentView(
  {
    comment,
    i18n,
    user,
    editCommentBtnClick,
    handleDeleteComment,
    onCommentReply,
    isParent,
  }) {
  const [isPopoverVisible, setIsPopoverVisible] = useState(false)

  const onEditBtnClick = (commentId, commentText) => {
    editCommentBtnClick(commentId, commentText);
  }

  const onDelete = (commentId, workId) => {
    handleDeleteComment(commentId, workId);
    setIsPopoverVisible(false);
  }

  return (
    <div
      key={`${comment.id + new Date(`${comment.created_at}`).getTime() / 1000}`}
      className={`${styles['replyComment']} ${!isParent ? styles['childComment'] : ""}`}>
      <div className={styles['replyAvatarName']}>
        <img className={styles['avatar']}
             src={comment.user_avatar
               ? `${appUrl}storage/images/avatars${getResizedImage(comment.user_avatar, 'avatar')}`
               : require('img/avatar.png')}/>
        <p className={styles['replySectName']}>
          {comment.username}
          <span>{fnCommentDateFormat(comment.created_at, i18n.t`English`)}</span>
        </p>
      </div>
      <div className={styles['replySect']}>
        <div className={styles['textReply']}>
          <p>
            {comment.text}
          </p>
          {
            user.id === comment.user_id &&
            <div className={styles['editDeleteSect']}>
              {/*<div>*/}
              {/*{isParent && <Button*/}
              {/*    className={styles['commentSectBtn']}*/}
              {/*    type="link"*/}
              {/*    onClick={() => onCommentReply(comment.id)}*/}
              {/*>*/}
              {/*  {i18n.t`Reply`}*/}
              {/*</Button>}*/}
              {/*</div>*/}
              <div className={styles['commentSectLeftSideBtns']}>
            <span
              className="icon-with-bg"
              onClick={() => onEditBtnClick(comment.id, comment.text)}>
              <Icons name="small-pencil"/>
            </span>
                <Popconfirm
                  title={i18n.t`Are you sure to delete this item?`}
                  okText={i18n.t`Yes`}
                  placement="topRight"
                  onConfirm={() => onDelete(comment.id, comment.work_time_id)}
                >
              <span className="icon-with-bg">
                <Icons name="delete" fill='#B6B6B6'/>
              </span>
                </Popconfirm>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default React.memo(CommentView);
