import React, {useEffect, useMemo} from 'react';
import store from "store";

import styles from './index.less';

const Snowflakes = () => {
  const snowflakes = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8], []);
  let reloads = store.get('reloads') ? +store.get('reloads') : 0;

  const incrementReloads = () => {
    const isReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    if(isReload) {
      reloads++;
      store.set('reloads', reloads);
    }
  };

  useEffect(() => {
    if(!reloads) {
      store.set('reloads', reloads);
    }

    window.addEventListener('unload', incrementReloads);
    return () => window.removeEventListener('unload', incrementReloads);
  }, [reloads]);

  if(reloads >= 2) {
    return null;
  }

  return (
    <div>
      {snowflakes.map((snow) => {
        return (
          <React.Fragment key={snow}>
            <div className={styles.snowflake}>
              ❅
            </div>
            <div className={styles.snowflake}>
              ❆
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Snowflakes;
