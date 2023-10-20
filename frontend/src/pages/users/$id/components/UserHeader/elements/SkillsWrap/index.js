import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styles from './style.less';
import {withI18n} from "@lingui/react";

@withI18n()
class UserSkills extends PureComponent {
  state = {
    showAll: false
  };

  toggleSkills() {
    this.setState(prevState => ({
      showAll: !prevState.showAll
    }))
  }

  render() {
    const {i18n} = this.props;
    const {skills} = this.props.data;
    return (
      <div className={styles['skills-wrapper']}>
        <h3>{i18n.t`Skills`}</h3>
        {this.state.showAll ?
          <div className={styles['skills-badges-block']} style={{paddingBottom: '20px'}}>
            <div className={styles['skills-badges']}>
              {skills ? skills.map((skill, index) =>
                  <span className={styles['skills-badge']} key={'skill-' + index}>{skill}</span>)
                : <span className={styles['no-skill']}>{i18n.t`No skills`}</span>}
            </div>
            <p onClick={() => this.toggleSkills()} className={styles['skills-badges-less']}>less</p>
          </div> :
          <div className={styles['skills-badges-block']}>
            <div className={styles['skills-badges']}>
              {skills ? skills.map((skill, index) =>
                  index < 6 ? <span className={styles['skills-badge']} key={'skill-' + index}>{skill}</span> : null)
                : <span className={styles['no-skill']}>{i18n.t`No skills`}</span>}
            </div>
            <p onClick={() => this.toggleSkills()}
               className={styles['skills-badges-more']}>
              {skills?.length > 6 ? `+ ${skills?.length - 6} more` : ''}
            </p>
          </div>
        }
      </div>
    )
  }

}

UserSkills.defaultProps = {
  data: {
    skills: [],
    about: '',
  }
  ,
}

;
UserSkills.propTypes =
  {
    data: PropTypes.object,
  }
;

export default UserSkills;
