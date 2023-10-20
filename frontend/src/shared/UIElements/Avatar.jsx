import React, {useState, useEffect} from 'react';
import useImage from "../../hooks/use-image";

const Avatar = ({ src, alt = "" }) => {
  const { loaded, error } = useImage({ src });
  const [srcAvatar, setSrcAvatar] = useState(null);

  useEffect(() => {
    if (error) setSrcAvatar('/img/avatar.png');
    if (loaded) setSrcAvatar(src);
  }, [loaded, src, error]);

  return (
    <img src={srcAvatar || '/img/loading.gif'} alt={alt} style={{objectFit: !srcAvatar ? 'none' : 'cover' }} />
  )
};

export default Avatar;
