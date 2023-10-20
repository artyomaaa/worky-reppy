import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {I18n, Trans} from "@lingui/react"
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import styles from './ProjectsDropdown.less'
import {Button} from "antd";
import {SecondaryTagIcon} from "icons/antd";
import AddEditTag from "../AddEditTag/AddEditTag";
import {isColorLikeWhite} from "utils/theme";
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import Icons from 'icons/icon';


const ProjectsDropdown = (
  {
    show, onClose, onChange, onChangeTag, onDelete,
    projects, allTags, currentProject, isModal,
    tagsProps, activeTagsArray, addToActiveTags,
    removeFromActiveTags, resetActiveTags, handleSelectedTags
  }) => {

  const {editTagRequest} = tagsProps;

  // Refs
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // State
  const [isShowing, setIsShowing] = useState(show);
  const [showTagModal, setShowTagModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [filteredTags, setFilteredTags] = useState(allTags);
  const [activeProject, setActiveProject] = useState({name: '', id: 0});
  const [activeTag, setActiveTag] = useState([]);
  const [activeTags, setActiveTags] = useState(activeTagsArray);
  const [notFoundProjectOrTag, setNotFoundProjectOrTag] = useState(false);
  const [tag, setTag] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  // Permissions
  const canViewTags = checkLoggedUserPermission(PERMISSIONS.VIEW_TAGS.name, PERMISSIONS.VIEW_TAGS.guard_name);
  const canAddTags = checkLoggedUserPermission(PERMISSIONS.ADD_TAGS.name, PERMISSIONS.ADD_TAGS.guard_name);
  const canEditTags = checkLoggedUserPermission(PERMISSIONS.EDIT_TAGS.name, PERMISSIONS.EDIT_TAGS.guard_name);
  const canDeleteTags = checkLoggedUserPermission(PERMISSIONS.DELETE_TAGS.name, PERMISSIONS.DELETE_TAGS.guard_name);

  // Effects

  useEffect(() => {
    setActiveTags(activeTagsArray)
  }, [activeTagsArray])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!show) return;
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onClose()
      }
    };
    setShowTagModal(false)
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [show]);

  useEffect(() => {
    setSearch('');
    setFilteredProjects(projects)
    setFilteredTags(allTags)
  }, [projects, allTags]);

  useEffect(() => {
    setIsShowing(show)
  }, [show]);

  //autofocus effect for search input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isShowing]);

  // Methods
  const handleProjectClick = (project) => {
    setActiveProject(project);
    onChange(project);
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    onChangeTag(tag);
  };

  const handleSearchChange = (event) => {
    const searchText = event.target.value;
    if (searchText.length <= 100) {
      setSearch(searchText);
      setErrorMessage("");
    } else {
      setErrorMessage({
        error: true,
        setErrorMessage: <Trans>Project name cannot be longer than 191 characters.</Trans>
      });
      setSearch();
    }

    const filteredProjects = projects.filter(project => {
      return project.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    });
    const filteredTags = Object.values(allTags).filter(allTag => {
      return allTag.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    });

    !filteredTags.length && !filteredProjects.length ? setNotFoundProjectOrTag(true) : setNotFoundProjectOrTag(false)
    setFilteredTags(filteredTags)
    setFilteredProjects(filteredProjects)
  };

  const handleInputClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  }

  const toggleTagModal = () => {
    setShowTagModal(prevState => !prevState)
  }

  const toggleTagModalEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowTagModal(true)
  }

  const selectTagsEnter = (e, tag) => {
    e.preventDefault();
    e.stopPropagation();
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 13) {
      setActiveTag(tag);
      onChangeTag(tag);
    }
  }

  const selectProjectsEnter = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 13) {
      setActiveProject(project);
      onChange(project);
    }
  }

  const addEditTagProps = () => {
    return {
      activeTagsArray: activeTags,
      addToActiveTags,
      removeFromActiveTags,
      onClose: (selectedTags) => {
        handleSelectedTags(selectedTags)
        setShowTagModal(false)
        setTag({})
      },
      resetActiveTags
    }
  }

  const editFunction = (e, tagObject) => {
    e.preventDefault();
    e.stopPropagation();
    setTag(tagObject);
    setShowTagModal(true);
  }

  const editTag = (val) => {
    editTagRequest(val);
    setTag({});
  }

  const handleTagDelete = (e, tagId) => {
    e.stopPropagation();
    onDelete(tagId);
  }

  return (
    <I18n>
      {({i18n}) => (
        <CSSTransition
          in={Boolean(isShowing)}
          timeout={200}
          classNames="fade"
          unmountOnExit
        >
          <div ref={wrapperRef} onClick={e => handleInputClick(e)}
               className={!isModal ? styles['dropdown'] : `${styles['dropdown']} ${styles['modalDropdown']}`}>
            <div className={styles['searchField']}>
              <input
                type="text"
                placeholder={i18n._(`Find project and tags`)}
                value={search}
                onChange={handleSearchChange}
                ref={searchInputRef}
              />
            </div>
            <p style={{color: "red"}}>{errorMessage.error ? errorMessage.setErrorMessage : null}</p>
            <ul className={styles['list']}>
              <div className={styles['label']}>
                {i18n._(`Projects`)}
              </div>
              <li
                onClick={() => handleProjectClick({name: '', id: 0})}
                className={`${currentProject && currentProject.id === 0 ? styles['active'] : ""}`
                }
              >
                <span
                  className={styles['colorIndicator']}
                />
                {i18n._(`No Project`)}
              </li>
              <TransitionGroup>
                {filteredProjects && Object.keys(filteredProjects).map((key) => {
                  const project = filteredProjects[key];
                  return (
                    <CSSTransition
                      key={project.id}
                      timeout={200}
                      classNames="animateHeight"
                    >
                      <li
                        onKeyPress={(e) => selectProjectsEnter(e, project)}
                        style={{outline: 'none'}}
                        tabIndex="0"
                        onClick={() => handleProjectClick(project)}
                        className={`${currentProject && currentProject.id === project.id ? styles['active'] : ""} ${styles['project-list-item']}`}
                      >
                      <span
                        className={`
                        ${styles['colorIndicator']}
                        ${project &&
                        project.color &&
                        isColorLikeWhite(project.color)
                          ? styles['projectBlackIndicator']
                          : null}`}
                        style={{backgroundColor: project.color}}
                      />
                        <span className={styles['projectName']}>
                        {project.name}
                      </span>
                      </li>
                    </CSSTransition>
                  )
                })}
                {canViewTags &&
                  <CSSTransition
                    key={0}
                    timeout={200}
                    classNames="animateHeight"
                  >
                    <div className={styles['tagsSect']}>
                      <span className={styles['label']}>
                        {i18n._(`Tags`)}
                      </span>
                      {canAddTags &&
                        <Button
                          type="link"
                          className={styles['addTagBtn']}
                          onClick={() => toggleTagModal(true)}
                          onKeyPress={(e) => toggleTagModalEnter(e, true)}
                        >
                          {i18n._('add_edit_tags')}
                        </Button>
                      }
                      {(canAddTags || canEditTags) &&
                        <AddEditTag {...addEditTagProps()} {...tagsProps} tag={tag} hide={() => setShowTagModal(false)} show={showTagModal} allTags={allTags}
                                    editTag={editTag}/>
                      }
                    </div>
                  </CSSTransition>
                }
                {(canViewTags && filteredTags) && Object.values(filteredTags).map(tag => {
                  if (!tag || !tag.id) return "";
                  return (
                    <CSSTransition
                      key={tag.id}
                      timeout={200}
                      classNames="animateHeight"
                    >
                      <li
                        onClick={(e) => handleTagClick(tag)}
                        onKeyPress={(e) => selectTagsEnter(e, tag)}
                        tabIndex="0"
                        className={
                          `${
                            activeTags &&
                            activeTags.length > 0 &&
                            activeTags.map(activeTag => {
                              let currentTagKey = !activeTag.hasOwnProperty("tag_id") ? 'id' : 'tag_id';
                              return activeTag && activeTag[currentTagKey] === tag.id ? styles.active : ""
                            })
                          } ${styles['tag-item']}`.trim()
                            .split(",")
                            .join("")
                        }
                      >
                        <span className={styles['tagIconWrapper']}>
                          {tag && tag.color && !isColorLikeWhite(tag.color)
                            ? <Icons name="tag" fill={tag.color}/>
                            : <SecondaryTagIcon className={styles['whiteTagIcon']}/>
                          }
                        </span>
                        <span className={styles['projectName']}>
                          {tag.name}
                        </span>
                        {canEditTags &&
                          <span className={styles['edit-tag']} onClick={(e) => editFunction(e, tag)}>
                            <Icons name="small-pencil"/>
                          </span>
                        }
                        <span className={styles['add-tag']}>
                          <Icons name="success"/>
                        </span>
                        {canDeleteTags &&
                          <span className={styles['delete-tag']} onClick={(e) => handleTagDelete(e, tag.id)}>
                            <Icons name="close"/>
                          </span>
                        }
                      </li>
                    </CSSTransition>)
                })}

              </TransitionGroup>
              {notFoundProjectOrTag && <span className={styles['notFound']}>{i18n._(`Not Found`)}</span>}
            </ul>

          </div>
        </CSSTransition>
      )}
    </I18n>
  )
};

ProjectsDropdown.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onChange: PropTypes.func,
  onChangeTag: PropTypes.func,
  allTags: PropTypes.array,
  currentProject: PropTypes.object,
  isModal: PropTypes.bool,
  tagsProps: PropTypes.object
};

export default ProjectsDropdown;
