import React from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {Modal} from "antd";

class ImageCropper extends React.Component {
  state = {
    isCropperModalVisible: false,
    croppedImgData: {}
  }

  cropper = React.createRef()

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.imageUrl && nextProps.imageUrl !== this.state.croppedImageUrl ) {
      this.setState({
        isCropperModalVisible: true,
      })
    }
  }


  handleConfirm(){
    this.setState({
      isCropperModalVisible: false
    })
    const {handleBlobImgObj, handleImageUrl} = this.props

    let croppedImageUrl = this?.cropper?.current?.cropper?.getCroppedCanvas()?.toDataURL("image/png");
    this.setState({
      croppedImageUrl,
    }, () => handleImageUrl(croppedImageUrl))

    const blobFile = this?.cropper?.current?.cropper?.getCroppedCanvas()?.toBlob((blob) => {
      handleBlobImgObj(blob)
    })
  }

  onModalClose = () => {
    const {resetImageUrl} = this.props
    resetImageUrl()
    this.setState({
      isCropperModalVisible: false
    })
  }

  render() {
    return (
      <Modal
        maskClosable={false}
        onOk={this.handleConfirm.bind(this)}
        onCancel={this.onModalClose}
        visible={this.state.isCropperModalVisible}>

        <Cropper
          ref={this.cropper}
          src={this.props.imageUrl}
          style={{height: 300, width: '100%'}}
          aspectRatio={1}
          guides={true}
        />
      </Modal>
    );
  }
}

export default React.memo(ImageCropper)
