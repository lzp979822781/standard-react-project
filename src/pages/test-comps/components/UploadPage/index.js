/* eslint-disable react/destructuring-assignment */
/* eslint-disable prefer-destructuring */
import React, { Component } from "react";
// import { Upload, Icon, message } from 'antd';
import { connect } from "dva";
import UploadClip from "@/components/UploadClip";
import Clip from "@/components/UploadClip/clip";

let dispatch;

const defaultList = [
    {
        uid: "-1",
        name: "image.png",
        status: "done",
        url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
    {
        uid: "-2",
        name: "image.png",
        status: "done",
        url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
    {
        uid: "-3",
        name: "image.png",
        status: "done",
        url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
];

@connect(state => state.test)
class UploadPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        dispatch = this.props.dispatch;
    }

    /**
     * 编辑完成后将返回的blob上传到后台
     * @param {*} {file, blob}
     */
    onEdit = async ({ file, blob }) => {
        let formData = new FormData();
        formData.append("files", blob);
        formData.append("id", file.uid);
        await dispatch({
            type: "test/uploadFile",
            payload: formData,
        });

        formData = null;
    };

    render() {
        return (
            <div style = {{ padding: 24 }}>
                <UploadClip
                    url = "https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    multiple
                    headers = {{}}
                    limitSize = {100} // 单位为M
                    limitNum = {5}
                    onPreview = {file => console.log("预览回调", file)}
                    onRemove = {file => {
                        console.log("删除回调", file);
                    }}
                    showRemoveIcon
                    showPreviewIcon
                    showEditIcon
                    onEdit = {this.onEdit}
                    defaultFileList = {defaultList}
                    // limitPixel = {{ width: 690, height: 392 }}
                    // ratio = {1}
                />
                <Clip
                    url = "/api/be/upload/img"
                    multiple
                    headers = {{}}
                    limitSize = {100} // 单位为M
                    limitNum = {5}
                    onPreview = {file => console.log("预览回调", file)}
                    onRemove = {file => {
                        console.log("删除回调", file);
                    }}
                    showRemoveIcon
                    showPreviewIcon
                    showEditIcon
                    onEdit = {this.onEdit}
                    defaultFileList = {defaultList}
                    name = "imgFile"
                    data = {{ imageEnum: "LOGO" }}
                    limitPixel = {{ width: 690, height: 392 }}
                    // ratio = {1}
                />
            </div>
        );
    }
}

export default UploadPage;
