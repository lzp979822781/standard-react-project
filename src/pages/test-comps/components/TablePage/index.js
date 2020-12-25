/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
import React, { Component } from "react";
import { connect } from "dva";
import ComplexTable from "@/components/ComplexTable";
import { EditTable, PicsComb } from "@/components/complex-table";

import { CONSTURL } from "../../services/index";
import { genPageObj, genPmpt } from "@/utils/utils";

const dataSource = [
    {
        key: "1",
        name: "胡彦斌",
        age: 32,
        address: "西湖区湖底公园1号",
    },
    {
        key: "2",
        name: "胡彦祖",
        age: 42,
        address: "西湖区湖底公园1号",
    },
];

const columns = [
    {
        title: "姓名",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "年龄",
        dataIndex: "age",
        key: "age",
    },
    {
        title: "住址",
        dataIndex: "address",
        key: "address",
    },
];

const editColums = [
    {
        title: "name",
        dataIndex: "name",
        editable: true,
        width: 130,
    },
    {
        title: "age",
        dataIndex: "age",
        width: 10,
    },
    {
        title: "address",
        dataIndex: "address",
        width: 200,
    },
];

const imgData = [
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
        url: "http://pic77.nipic.com/file/20150906/10262354_173615899356_2.jpg",
    },
    {
        uid: "-3",
        name: "image.png",
        status: "done",
        url: "http://pic34.nipic.com/20131030/2455348_194508648000_2.jpg",
    },
];

// eslint-disable-next-line no-unused-vars
let dispatch;

@connect(({ test, global }) => ({
    ...test,
    global,
}))
class TablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        /* customPageObj = Object.assign({}, pageObj, {
            onChange: this.onPageChange('pageIndex'),
            onShowSizeChange: this.onPageChange('pageSize'),
        }) */
        this.customPageObj = genPageObj(this, "abc");
        dispatch = props.dispatch;
    }

    /**
     * 分页索引和每页条数change回调函数
     * @param {string} type 标识索引和条数变化 值为current标识index pageSize标识条数
     * @memberof TablePage
     */
    onPageChange = type => (current, pageSize) => {
        console.log("type current pageSize", type, current, pageSize);
        dispatch({
            type: "test/changeTotal",
            payload: {
                a: 1,
            },
        });
    };

    render() {
        const { pageReq, global } = this.props;
        const emptyRow = {
            name: "",
            age: 35,
            address: `北京市`,
        };
        // 通过调用 window.g_app._store.dispatch发送action
        return (
            <div>
                <ComplexTable dataSource = {dataSource} columns = {columns} pagination = {{ ...this.customPageObj, ...pageReq }} promptInfo = {genPmpt(global, CONSTURL.GET_DATA)} />

                <div>
                    <EditTable columns = {editColums} emptyRow = {emptyRow} limit = {5} />
                </div>
                <div>
                    <PicsComb num = {2} data = {imgData} imgKey = "uid" imgStyle = {{ width: 60, height: 60 }} />
                </div>
            </div>
        );
    }
}

export default TablePage;
