import React, {useState} from "react";
import PropTypes from "prop-types";
import stylesPage from "../../../components/Page/Page.less";
import styles from "./userProjects.less";
import globalStyles from "themes/global.less";
import {Select, Col} from "antd";

const DisplayContainer = ({name, color}) => {
  const radiusStyle = {
    width: '12px',
    height: '12px',
    marginRight: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    verticalAlign: 'middle',
  }

  return (
    <div>
      <span style={{...radiusStyle, backgroundColor: color}}/>
      {name}
    </div>
  )
}

const UserProjects = (props) => {
  const {i18n, onChangeProjectsFilter, handleChangeProjects, form, projects, projectIds} = props;
  const {getFieldDecorator} = form;

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [initialProjectIds, setInitialProjectIds] = useState([]);

  const handleDropDownVisibleChange = (isVisible) => {
    setIsDropdownVisible(isVisible);

    if (isVisible) {
      setInitialProjectIds(() => [...projectIds]);
    }

    const isSameIds = String(projectIds) === String(initialProjectIds);
    if (!isVisible && !isSameIds) {
      onChangeProjectsFilter();
    }
  }

  const handleDeselect = (id) => {
    const newProjectIds = projectIds.filter(projectId => projectId !== id);
    if (!isDropdownVisible) {
      onChangeProjectsFilter(newProjectIds);
    }
  }

  return (
    <Col sm={24} md={12} className={styles['select_content']}>
      <div
        className={`${stylesPage.searchSect} ${globalStyles['head-search--bar']} ${styles['select_projects']}`}>
        {getFieldDecorator('projects', {
          initialValue: projectIds,
        })(
          <Select
            mode="multiple"
            style={{width: '100%'}}
            placeholder={i18n.t`Select Projects`}
            optionFilterProp='children'
            onDropdownVisibleChange={handleDropDownVisibleChange}
            onDeselect={handleDeselect}
            onChange={handleChangeProjects}
            dropdownClassName={styles['user-project-dropdown']}
            className={globalStyles['input-md-ex']}
          >
            <Select.Option
              style={{'--backgroundColor': '#000'}} key={0} value={0}>{i18n.t`No Project`}</Select.Option>
            {projects?.map(({id, name, color}) => {
              return <Select.Option
                style={{'--backgroundColor': color}} key={id} value={id}>{name}</Select.Option>;
            })}
          </Select>
        )}
      </div>
    </Col>
  );
}

UserProjects.propTypes = {
  projectIds: PropTypes.array,
  projects: PropTypes.array,
  handleChangeProjects: PropTypes.func,
  onChangeProjectsFilter: PropTypes.func,
};

export default UserProjects;
