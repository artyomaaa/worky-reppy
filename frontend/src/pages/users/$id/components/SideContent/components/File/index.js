import React, {PureComponent} from 'react';
import {Trans, withI18n} from "@lingui/react";
import {connect} from "dva";
import {Form} from "@ant-design/compatible";
import Icons from 'icons/icon';
import styles from "./style.less";
import {Upload, message, Progress, Popconfirm} from 'antd';
import {bytesToMB, checkLoggedUserPermission} from 'utils';
import {appUrl} from 'utils/config';
import {
  PERMISSIONS,
  USER_DYNAMIC_COMPONENTS,
  FILE_LIMITS,
  dateFormats
} from 'utils/constant';
import store from "store";
import moment from 'utils/moment';

@withI18n()
@Form.create()
@connect(({userDetail}) => ({userDetail}))
class File extends PureComponent {
  state = {
    matches: window.matchMedia("(min-width: 768px)").matches,
    documentTypes: {
      AGREEMENT: 'agreement',
      PASSPORT: 'passport',
      OTHERS: 'others'
    },
    agreement: [],
    passport: [],
    others: [],
    agreementTmp: {},
    passportTmp: {},
    otherTmp: {},
    isContractLoading: false,
    isPassportLoading: false,
    isOthersLoading: false,
    contractProgressPercent: 0,
    passportProgressPercent: 0,
    othersProgressPercent: 0,
    contractUploadFileType: '',
    passportUploadFileType: '',
    othersUploadFileType: ''
  };

  handler = e => this.setState({matches: e.matches});

  componentDidMount() {
    window.matchMedia("(min-width: 768px)").addListener(this.handler);
    if (this.props?.userDetail[USER_DYNAMIC_COMPONENTS.FILE]?.documents) {
      this.updateDocumentsState();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps?.userDetail[USER_DYNAMIC_COMPONENTS.FILE]?.documents !== this.props?.userDetail[USER_DYNAMIC_COMPONENTS.FILE]?.documents) {
      this.updateDocumentsState();
    }
  }

  componentWillUnmount() {
    window.matchMedia("(min-width: 768px)").removeListener(this.handler);
  }

  updateDocumentsState = () => {
    const {documentTypes} = this.state;
    const documents = this.props?.userDetail[USER_DYNAMIC_COMPONENTS.FILE]?.documents;
    const agreement = this.getFileByType(documents, documentTypes.AGREEMENT);
    const passport = this.getFileByType(documents, documentTypes.PASSPORT);
    const others = this.getFileByType(documents, documentTypes.OTHERS);
    this.setDocument(agreement, documentTypes.AGREEMENT);
    this.setDocument(passport, documentTypes.PASSPORT);
    this.setDocument(others, documentTypes.OTHERS);
  }

  setUploadFileType = (value, type) => {
    const {documentTypes} = this.state;
    let loadingType = '';
    switch (type) {
      case documentTypes.AGREEMENT:
        loadingType = 'contractUploadFileType';
        break;
      case documentTypes.PASSPORT:
        loadingType = 'passportUploadFileType';
        break;
      case documentTypes.OTHERS:
        loadingType = 'othersUploadFileType';
        break;
    }
    this.setState({
      [loadingType]: value
    });
  }

  setIsLoading = (value, type) => {
    const {documentTypes} = this.state;
    let loadingName = '';
    switch (type) {
      case documentTypes.AGREEMENT:
        loadingName = 'isContractLoading';
        break;
      case documentTypes.PASSPORT:
        loadingName = 'isPassportLoading';
        break;
      case documentTypes.OTHERS:
        loadingName = 'isOthersLoading';
        break;
    }
    this.setState({
      [loadingName]: value
    });
  }

  setCurrentUploadFileTmp = (file, type, setEmpty = false) => {
    const {documentTypes} = this.state;
    let fileTmp = '';

    switch (type) {
      case documentTypes.AGREEMENT:
        fileTmp = 'agreementTmp';
        break;
      case documentTypes.PASSPORT:
        fileTmp = 'passportTmp';
        break;
      case documentTypes.OTHERS:
        fileTmp = 'otherTmp';
        break;
    }
    if (setEmpty) {
      this.setState({
        [fileTmp]: null
      });
    } else {
      this.getBase64(file, fileTmp);
    }
  }

  setDocument = (value, type) => {
    this.setState({
      [type]: value
    });
  }

  setProgressPercent = (value, type) => {
    const {documentTypes} = this.state;
    let progressName = '';

    switch (type) {
      case documentTypes.AGREEMENT:
        progressName = 'contractProgressPercent';
        break;
      case documentTypes.PASSPORT:
        progressName = 'passportProgressPercent';
        break;
      case documentTypes.OTHERS:
        progressName = 'othersProgressPercent';
        break;
    }

    this.setState({
      [progressName]: value
    });
  }

  getBase64 = (file, tmpFileName) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.setState({
        [tmpFileName]: reader.result
      });
    }
  }

  getFileByType = (documents, type) => {
    const {documentTypes} = this.state;
    if (documents instanceof Array) {
      if (documents.length > 0) {
        if (type === documentTypes.OTHERS) {
          return documents.filter(document => (document.type !== documentTypes.PASSPORT && document.type !== documentTypes.AGREEMENT));
        } else {
          let result = documents.filter(document => document.type === type);
          if (result.length > 0) {
            return result;
          }
        }
      }
    }
    return {};
  }

  getIconNameByDocumentType = type => {
    let icon = 'documentDoc';

    const pdf = [
      'application/pdf'
    ];
    const image = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/gif'
    ];
    // const doc = [
    //   'application/doc',
    //   'application/docx',
    //   'application/otd',
    //   'application/gif'
    // ];

    if (pdf.includes(type)) {
      icon = 'documentPDF';
    } else if (image.includes(type)) {
      icon = 'image';
    }
    return icon;
  }

  beforeFileUpload = (file, type) => {
    const {i18n} = this.props;
    const {IMG_MAX_SIZE} = FILE_LIMITS
    const isLt10M = file.size < IMG_MAX_SIZE;
    if (!isLt10M) {
      message.error(i18n.t`File must be smaller than 10MB!`);
    }
    return isLt10M;
  };

  customRequest = (options, type) => {
    const {file, onProgress} = options;
    const {dispatch, userDetail} = this.props;
    const userId = userDetail ? userDetail[USER_DYNAMIC_COMPONENTS.FILE]?.id : null;
    try {
      this.setCurrentUploadFileTmp(file, type);
      this.setIsLoading(true, type);
      this.setUploadFileType(file?.type, type);
      dispatch({
        type: `userDetail/update`,
        payload: {
          id: userId,
          tab: USER_DYNAMIC_COMPONENTS.FILE,
          type: type,
          file: file,
          name: file?.name ? file?.name : '',
          size: file?.size ? file?.size : 0,
          file_type: file?.type ? file?.type : '',
        },
        config: {
          onUploadProgress: event => {
            const percent = Math.floor((event.loaded / event.total) * 100);
            onProgress({percent});
          }
        },
      }).then(res => {
        if (res?.success) {
          if (res?.data && res?.data?.documents) {
            const document = this.getFileByType(res?.data?.documents, type);
            this.setDocument(document, type);
          }
          this.setIsLoading(false, type);
          this.setCurrentUploadFileTmp(null, type, true);
          this.setProgressPercent(0, type);
          this.setUploadFileType('', type);
        } else {
          this.setIsLoading(false, type);
          this.setCurrentUploadFileTmp(null, type, true);
          this.setUploadFileType('', type);
          if (res?.message instanceof Object) {
            message.error(res?.message.document[0]);
          } else {
            message.error(res?.message);
          }
        }
      })
      this.setProgressPercent(0, type);

    } catch (err) {
      console.log("Eroor: ", err);
      const error = new Error("Some error");
      this.setIsLoading(false, type);
      this.setCurrentUploadFileTmp({}, type);
      this.setUploadFileType('', type);
    }
  }

  onProgress = (percent, type) => {
    this.setProgressPercent(Math.round(percent), type);
  }

  onRemoveFile = (file, type) => {
    const {dispatch, userDetail} = this.props;
    const {documentTypes, others} = this.state;

    dispatch({
      type: `userDetail/deleteDocument`,
      payload: {
        id: userDetail[USER_DYNAMIC_COMPONENTS.FILE].id,
        tab: USER_DYNAMIC_COMPONENTS.FILE,
        fileId: file.id,
        fileName: file.file
      }
    }).then(res => {
      if (type === documentTypes.OTHERS) {
        if (others) {
          let newOtherFileList = others.filter(item => item.id !== file.id);
          this.setDocument(newOtherFileList, type);
        }
      } else {
        this.setDocument({}, type);
      }
    })
  }

  render() {
    const {Dragger} = Upload;
    const {i18n, userDetail} = this.props;
    const {
      isContractLoading,
      isPassportLoading,
      isOthersLoading,
      agreement,
      passport,
      others,
      agreementTmp,
      passportTmp,
      otherTmp,
      documentTypes,
      contractUploadFileType,
      passportUploadFileType,
      othersUploadFileType
    } = this.state;
    const userId = userDetail ? userDetail[USER_DYNAMIC_COMPONENTS.FILE]?.id : null;
    const agreementIcon = this.getIconNameByDocumentType(agreement.file_type);
    const passportIcon = this.getIconNameByDocumentType(passport.file_type);
    const contractTmpIcon = this.getIconNameByDocumentType(contractUploadFileType);
    const passportTmpIcon = this.getIconNameByDocumentType(passportUploadFileType);
    const otherTmpIcon = this.getIconNameByDocumentType(othersUploadFileType);
    const loggedUser = store.get('user');
    const filesElement = (type) => {
      return type.map((file, i) => {
        const fileSize = bytesToMB(file.size);
        const fileDate = moment(file.created_at).format(dateFormats.userDetailsPageDateFormat);
        const fileIcon = this.getIconNameByDocumentType(file.file_type);
        return (
          <div className={`${fileIcon !== 'image' ? styles['uploaded-document'] : styles['uploaded-image']}`} key={i}>
            {(fileIcon !== 'image') ?
              <div>
                <a
                  href={file ? `${appUrl}storage/documents/${userId}${file.file}` : ''}
                  download
                  target='_blank'
                  shape="circle"
                >
                  <Icons name={fileIcon}/>
                </a>
                <div className={styles['upload-file-info']}>
                  <div className={styles['file-name']}>{file.name}</div>
                  <div className={styles['file-info']}>
                    {`${fileSize}MB`}
                    <Icons name='circle'/>
                    {fileDate}
                  </div>
                </div>
              </div>
              :
              <a
                href={file ? `${appUrl}storage/documents/${userId}${file.file}` : ''}
                download
                target='_blank'
                className={styles['image-block']}
              >
                <img src={`${appUrl}/storage/documents/${userId}${file.file}`} alt="document"/>
              </a>
            }
            {deleteDocumentsAccess && (
              <Popconfirm
                okText={i18n.t`Yes`}
                tabIndex="0"
                title={i18n.t`Are you sure delete this file ?`}
                placement="topRight"
                onConfirm={_ => this.onRemoveFile(file, documentTypes.OTHERS)}
              >
                <div className={styles['close-button']}>
                  <Icons name='close'/>
                </div>
              </Popconfirm>
            )}
          </div>
        )
      })
    };

    // Edit access
    const isOwnerPage = loggedUser?.id === userId;
    const canViewUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_DETAILS.name, PERMISSIONS.VIEW_USER_DETAILS.guard_name);
    const canViewSelfUserDetails = checkLoggedUserPermission(PERMISSIONS.VIEW_USER_SELF_DETAILS.name, PERMISSIONS.VIEW_USER_SELF_DETAILS.guard_name);
    const canEditUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_USERS.name, PERMISSIONS.EDIT_USERS.guard_name);
    const canEditSelfUsers = checkLoggedUserPermission(PERMISSIONS.EDIT_SELF_USERS.name, PERMISSIONS.EDIT_SELF_USERS.guard_name);
    const canViewDocuments = checkLoggedUserPermission(PERMISSIONS.VIEW_DOCUMENTS.name, PERMISSIONS.VIEW_DOCUMENTS.guard_name);
    const canAddDocuments = checkLoggedUserPermission(PERMISSIONS.ADD_DOCUMENTS.name, PERMISSIONS.ADD_DOCUMENTS.guard_name);
    const canDeleteDocuments = checkLoggedUserPermission(PERMISSIONS.DELETE_DOCUMENTS.name, PERMISSIONS.DELETE_DOCUMENTS.guard_name);
    const canViewSelfDocuments = checkLoggedUserPermission(PERMISSIONS.VIEW_SELF_DOCUMENTS.name, PERMISSIONS.VIEW_SELF_DOCUMENTS.guard_name);
    const canAddSelfDocuments = checkLoggedUserPermission(PERMISSIONS.ADD_SELF_DOCUMENTS.name, PERMISSIONS.ADD_SELF_DOCUMENTS.guard_name);
    const canDeleteSelfDocuments = checkLoggedUserPermission(PERMISSIONS.DELETE_SELF_DOCUMENTS.name, PERMISSIONS.DELETE_SELF_DOCUMENTS.guard_name);

    let viewDocumentsAccess = false;
    let addDocumentsAccess = false;
    let deleteDocumentsAccess = false;

    if ((canViewUserDetails || (isOwnerPage && canViewSelfUserDetails)) && (canViewDocuments || (isOwnerPage && canViewSelfDocuments))) {
      viewDocumentsAccess = true;
    }

    if (canEditUsers || (isOwnerPage && canEditSelfUsers)) {
      if (canAddDocuments || (isOwnerPage && canAddSelfDocuments)) {
        addDocumentsAccess = true;
      }
      if (canDeleteDocuments || (isOwnerPage && canDeleteSelfDocuments)) {
        deleteDocumentsAccess = true;
      }
    }

    return (
      <div>
        { !this.state.matches &&
        <div className={styles['form-title']}>
          <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.8092 7.79867L7.4317 12.1833C6.85782 12.6933 6.11076 12.9647 5.34334 12.9421C4.57591 12.9196 3.84612 12.6046 3.30323 12.0617C2.76035 11.5188 2.4454 10.789 2.4228 10.0216C2.40021 9.25419 2.67169 8.50713 3.1817 7.93325L8.84837 2.26658C9.18669 1.94521 9.63549 1.76603 10.1021 1.76603C10.5687 1.76603 11.0176 1.94521 11.3559 2.26658C11.6855 2.60063 11.8703 3.05104 11.8703 3.52033C11.8703 3.98963 11.6855 4.44004 11.3559 4.77408L6.46837 9.6545C6.42 9.70659 6.36184 9.74865 6.29722 9.77826C6.2326 9.80788 6.16277 9.82447 6.09174 9.8271C6.0207 9.82974 5.94984 9.81835 5.8832 9.7936C5.81657 9.76884 5.75546 9.7312 5.70337 9.68283C5.65128 9.63446 5.60922 9.57631 5.57961 9.51168C5.54999 9.44706 5.5334 9.37724 5.53076 9.3062C5.52813 9.23517 5.53952 9.16431 5.56427 9.09767C5.58903 9.03103 5.62666 8.96992 5.67503 8.91783L9.30879 5.29117C9.44217 5.15779 9.5171 4.97688 9.5171 4.78825C9.5171 4.59962 9.44217 4.41872 9.30879 4.28533C9.1754 4.15195 8.9945 4.07702 8.80587 4.07702C8.61724 4.07702 8.43633 4.15195 8.30295 4.28533L4.6692 7.92617C4.48738 8.10658 4.34306 8.32121 4.24458 8.55766C4.14609 8.79412 4.09539 9.04773 4.09539 9.30388C4.09539 9.56002 4.14609 9.81363 4.24458 10.0501C4.34306 10.2865 4.48738 10.5012 4.6692 10.6816C5.04063 11.0354 5.53394 11.2327 6.04691 11.2327C6.55988 11.2327 7.05319 11.0354 7.42462 10.6816L12.305 5.79408C12.8681 5.18984 13.1746 4.39064 13.16 3.56486C13.1455 2.73908 12.8109 1.9512 12.2269 1.36719C11.6429 0.783186 10.855 0.44866 10.0293 0.43409C9.20348 0.41952 8.40428 0.726044 7.80003 1.28908L2.13337 6.95575C1.36922 7.80209 0.961096 8.91065 0.994037 10.0504C1.02698 11.1902 1.49844 12.2734 2.3102 13.0742C3.12195 13.875 4.21139 14.3317 5.35153 14.3491C6.49167 14.3666 7.59457 13.9434 8.43045 13.1678L12.815 8.79033C12.8811 8.72429 12.9335 8.64588 12.9692 8.55959C13.005 8.4733 13.0234 8.38082 13.0234 8.28742C13.0234 8.19402 13.005 8.10153 12.9692 8.01524C12.9335 7.92895 12.8811 7.85054 12.815 7.7845C12.749 7.71846 12.6706 7.66607 12.5843 7.63033C12.498 7.59458 12.4055 7.57619 12.3121 7.57619C12.2187 7.57619 12.1262 7.59458 12.0399 7.63033C11.9537 7.66607 11.8752 7.71846 11.8092 7.7845V7.79867Z" fill="#4A54FF"/>
          </svg>
          <h3>Files</h3>
        </div>
        }
        <h3 className={styles['content-title']}>{i18n.t`Upload Files`}</h3>
        <div className={styles['file-item']}>
          <span className="label-txt">{i18n.t`Contract`}</span>
          <div>
            <div>
              {addDocumentsAccess && (
                <Dragger
                  name='agreement'
                  multiple={false}
                  customRequest={options => this.customRequest(options, documentTypes.AGREEMENT)}
                  beforeUpload={this.beforeFileUpload}
                  onProgress={event => this.onProgress(event.percent, documentTypes.AGREEMENT)}
                  className="dragger-wraps-container"
                  showUploadList={false}
                >
                  <div className="dragger-content">
                    <Icons name='upload'/>
                    <p className='drag-text'>Drag & Drop Files Here or <span>Browse Files</span></p>
                  </div>
                </Dragger>
              )}
            </div>
            {isContractLoading && (
              <div className={styles['loading-content']}>
                <div>
                  {(contractTmpIcon !== 'image')
                    ? <Icons name={contractTmpIcon}/>
                    : <img width={60} height={40} src={agreementTmp} alt="document"/>
                  }
                </div>
                <div className={styles['upload-info']}>
                  <span><Trans>Uploading file</Trans> {this.state.contractProgressPercent}%</span>
                  <Progress percent={this.state.contractProgressPercent} showInfo={false}/>
                </div>
              </div>
            )}

            {viewDocumentsAccess && (Object.keys(agreement).length > 0) && filesElement(agreement)}

          </div>
        </div>
        <div className={styles['file-item']}>
          <span className="label-txt">{i18n.t`ID/Passport`}</span>
          <div>
            <div>
              {addDocumentsAccess && (
                <Dragger
                  name='passport'
                  multiple={false}
                  customRequest={options => this.customRequest(options, documentTypes.PASSPORT)}
                  beforeUpload={this.beforeFileUpload}
                  onProgress={event => this.onProgress(event.percent, documentTypes.PASSPORT)}
                  className="dragger-wraps-container"
                  showUploadList={false}
                >
                  <div className="dragger-content">
                    <Icons name='upload'/>
                    <p className='drag-text'>Drag & Drop Files Here or <span>Browse Files</span></p>
                  </div>
                </Dragger>
              )}
            </div>
            {isPassportLoading && (
              <div className={styles['loading-content']}>
                <div>
                  <Icons name='documentPass'/>
                </div>
                <div className={styles['upload-info']}>
                  <span><Trans>Uploading file</Trans> {this.state.passportProgressPercent}%</span>
                  <Progress percent={this.state.passportProgressPercent} showInfo={false}/>
                </div>
              </div>
            )}

            {viewDocumentsAccess && (Object.keys(passport).length > 0) && filesElement(passport)}

          </div>
        </div>
        <div className={styles['file-item']}>
          <span className="label-txt">{i18n.t`Other Files`}</span>
          <div className={styles['other-files-content']}>
            {addDocumentsAccess && (
              <Dragger
                name='other'
                multiple={false}
                customRequest={options => this.customRequest(options, documentTypes.OTHERS)}
                beforeUpload={this.beforeFileUpload}
                onProgress={event => this.onProgress(event.percent, documentTypes.OTHERS)}
                className="dragger-wraps-container"
                showUploadList={false}
              >
                <div className="dragger-content">
                  <Icons name='upload'/>
                  <p className='drag-text'>Drag & Drop Files Here or <span>Browse Files</span></p>
                </div>
              </Dragger>
            )}

            {isOthersLoading && (
              <div className={styles['loading-content']}>
                <div>
                  {(otherTmpIcon !== 'image')
                    ? <Icons name={otherTmpIcon}/>
                    : <img width={60} height={40} src={otherTmp} alt="document"/>
                  }
                </div>
                <div className={styles['upload-info']}>
                  <span><Trans>Uploading file</Trans> {this.state.othersProgressPercent}%</span>
                  <Progress percent={this.state.othersProgressPercent} showInfo={false}/>
                </div>
              </div>
            )}

            {viewDocumentsAccess && (Object.keys(others).length > 0) && filesElement(others)}

          </div>
        </div>
      </div>
    );
  }
}

File.propTypes = {};
export default File;
