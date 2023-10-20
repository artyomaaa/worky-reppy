import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {I18n} from '@lingui/react';
import {Dropdown, Menu, Modal, Popconfirm} from 'antd';
import styles from './AddEditTag.less';
import CreateTag from './createTag';
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import {isColorLikeWhite} from 'utils/theme';
import Icons from 'icons/icon';

const AddEditTag = (
  {
    show,
    hide,
    onClose,
    createTagRequest,
    editTagRequest,
    deleteTag,
    allTags,
    activeTagsArray,
    editTag,
    tag
  }) => {

  // Refs
  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const tagNameInputRef = useRef(null);

  // State
  const [isShowing, setShowing] = useState(show);
  const [isShowingPicker, setShowingPicker] = useState(false);
  const [addEditTag, setAddEditTag] = useState('');
  const [selectedTags, setSelectedTags] = useState(activeTagsArray);
  const [updateTag, setUpdateTag] = useState(tag);

  // Permissions
  const canEditTags = checkLoggedUserPermission(PERMISSIONS.EDIT_TAGS.name, PERMISSIONS.EDIT_TAGS.guard_name);
  const canDeleteTags = checkLoggedUserPermission(PERMISSIONS.DELETE_TAGS.name, PERMISSIONS.DELETE_TAGS.guard_name);

  // Effects
  useEffect(() => {
    setShowing(show)
  }, [show]);

  useEffect(() => {
    setUpdateTag(tag)
  }, [tag]);

  useEffect(() => {
    setSelectedTags(activeTagsArray)
  }, [activeTagsArray?.length]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Methods
  function handleClickOutside(event) {
    if (!pickerRef.current?.contains(event.target) && !inputRef.current?.contains(event.target)) {
      setShowingPicker(false)
    }
  }

  const handleTagDelete = (e, id) => {
    setUpdateTag({});
    deleteTag(id);
  }

  const editTagItem = (tagItem) => {
    setUpdateTag(tagItem);
  }

  const onCloseAddTagModal = () => {
    onClose(selectedTags);
  }

  const handleAddEditTag = (id) => {
    if (id) {
      setAddEditTag(id);
    } else {
      const randomId = Math.random().toString()
      setAddEditTag(randomId);
    }
  }

  return (
    <I18n>
      {({i18n}) => (
        <Modal
          className={styles['tag-modal']}
          title={i18n.t`ADD/EDIT A TAG`}
          centered
          visible={isShowing}
          closeIcon={
            <span onClick={() => onCloseAddTagModal()} className="close-icon">
                  <Icons name="close"/>
            </span>
          }
          width="initial"
          footer={null}
          onCancel={onCloseAddTagModal}
        >
          <div className={styles['tag-modal-content']}>
            <CreateTag
              createTagRequest={createTagRequest}
              editTag={updateTag}
              hideModal={hide}
              tagNameInputRef={tagNameInputRef}
              editTagRequest={editTag}
              tagAction={addEditTag}
              handleAddEditTag={handleAddEditTag}
              allTags={allTags}
            />
            {canEditTags &&
              <div className={styles['existingTag']}>
                <div className={styles['scrollableSectTag']}>
                  <div className={styles['tag-section']}>
                    {allTags && allTags.length > 0
                      ?
                      allTags.map(tag =>
                        <div key={tag.id} className={styles['tag-item']}>
                          <span className={styles['create-tag__input_icon']}>
                            <Icons name="tag" fill={`${tag.color}`}/>
                          </span>
                            <span
                              className={styles['tag-name']}
                            >
                            {tag.name}
                          </span>
                          <Dropdown trigger={['click']} placement="bottomLeft" className={styles['dots']}
                                    overlay={<Menu className="dots-dropdown">
                                      {canEditTags &&
                                        <Menu.Item onClick={(e) => editTagItem(tag)}>Edit</Menu.Item>
                                      }
                                      {canDeleteTags &&
                                        <Menu.Item onClick={(e) => handleTagDelete(e, tag.id)}>Delete</Menu.Item>
                                      }
                                    </Menu>}
                          >
                            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                              <Icons name="dots"/>
                            </a>
                          </Dropdown>
                          {canEditTags &&
                            <span
                              className={styles['tag-icon']}
                              onClick={(e) => editTagItem(tag)}
                            >
                              <Icons name="small-pencil"/>
                            </span>
                          }
                          {canDeleteTags &&
                            <Popconfirm
                              title="Are you sure you want to delete this tag?"
                              onConfirm={(e) => handleTagDelete(e, tag.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <span className={styles['tag-icon']}>
                                <Icons name="small-delete"/>
                              </span>
                            </Popconfirm>
                          }
                        </div>)
                      :
                      <p>{i18n.t`No existing tags`}</p>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </Modal>
      )}
    </I18n>
  )
};

AddEditTag.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default React.memo(AddEditTag);
