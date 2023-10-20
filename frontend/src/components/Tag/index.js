import React, {useState, useEffect} from "react";
import PropTypes from 'prop-types';
import {Tooltip} from 'antd';
import Icons from 'icons/icon'
import classes from "./Tag.less"
import {isColorLikeWhite} from "utils/theme";


function Tag({activeTagsArray, allTags}) {
  const [activeTags, setActiveTags] = useState(activeTagsArray);

  useEffect(() => {
    if(allTags) {
      allTags.find((elem) => {
        activeTagsArray.find((item) => {
          if(item.id === elem.id) {
            item.color = elem.color;
            item.name = elem.name;
            return item;
          }
        })
      })
      setActiveTags(activeTagsArray);
    }
  }, [activeTagsArray]);

  const getMoreTags = () => {
    return activeTagsArray && activeTagsArray.map((tag, index) => index > 0 && `${tag.name}${activeTagsArray.length - 1 !== index ? ', ' : ''}`)
  }

  return (
    <div
      className={classes['tag-section']}
    >
      {
        activeTagsArray && Object.values(activeTagsArray).length > 0 &&
        <div className={classes['tag-item']}>
          {activeTagsArray && activeTagsArray[0].color && !isColorLikeWhite(activeTagsArray[0].color)
            ?
            <>
              <Icons name="tag" fill={activeTagsArray[0].color}/>
              <span className={classes['tag-name']}>
                {activeTagsArray[0].name}
              </span>
            </>
            :
            <>
              {activeTagsArray[0]?.name && <Icons name="tag" fill="#000000"/>}
              <span className={classes['tag-name']}>
                {activeTagsArray[0].name}
              </span>
            </>
          }
        </div>
      }
      {
        <Tooltip placement="topLeft"
                 overlayClassName="custom-tooltip"
                 title={getMoreTags}>
          <div className={classes['tag-more']} onClick={event => event.stopPropagation()}>
            {activeTagsArray.length > 1 ? `+ ${activeTagsArray.length - 1}` : ''}
            {activeTagsArray.length > 1 ? <span>tags</span> : ''}
          </div>
        </Tooltip>
      }
    </div>
  )
}

Tag.propTypes = {
  activeTagsArray: PropTypes.array,
};

export default React.memo(Tag)
