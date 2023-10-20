import React from 'react';
import {POLICIES} from "../../utils/constant";
import styles from './index.less';

const PrivacyPolicy = () => {
  return (
    <div className={styles['privacy']}>
      <div className="container">
        <div className={styles['privacy-content']}>
          <h1 className={styles['privacy-heading']}>Privacy Policy</h1>
          <div className={styles['privacy-policies']}>
            <div className={styles['privacy-policy']}>
              <p className={styles['privacy-policy-text']}>
                Worky.am ( “we”, “us”, “our” ) considers the privacy and safety of its visitors’ information from unauthorized access a priority request, thus, we kindly ask you to carefully read this document. Please note thatWorky-Reppy will treat your personal information confidentially and use it in accordance with the privacy policy only. By using our website, hereby, you agree to the Privacy Policy. The Privacy Policy can be updated, so please make sure to get back to this section frequently.
              </p>
            </div>

            {POLICIES.map((policy) => {
              return (
                <div key={policy.heading} className={styles['privacy-policy']}>
                  <h2 className={styles['privacy-policy-heading']}>
                    {policy.heading}
                  </h2>
                  {policy.text && <p>{policy.text}</p>}
                  {policy.list &&
                    <ul className={styles['privacy-policy-list']}>
                      {policy.list.map((item) => {
                        return (
                          <li key={item.heading}>
                            <h3>{item.heading}</h3>
                            {item.text && <p>{item.text}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
