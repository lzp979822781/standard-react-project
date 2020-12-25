/* eslint-disable import/extensions */
import React, { Component } from "react";
import YaoFormTemplate from "@/components/yao-form-template";
import { formTplData } from "./templateData";
import styles from "./index.less";
// import { data } from "@/components/chart/GeoMap/geo";

// const json = [
//     { id: "4", pid: "1", name: "大家电" },
//     { id: "5", pid: "1", name: "生活电器" },
//     { id: "1", pid: "0", name: "家用电器" },
//     { id: "2", pid: "0", name: "服饰" },
//     { id: "3", pid: "0", name: "化妆" },
//     { id: "7", pid: "4", name: "空调" },
//     { id: "8", pid: "4", name: "冰箱" },
//     { id: "9", pid: "4", name: "洗衣机" },
//     { id: "10", pid: "4", name: "热水器" },
//     { id: "11", pid: "3", name: "面部护理" },
//     { id: "12", pid: "3", name: "口腔护理" },
//     { id: "13", pid: "2", name: "男装" },
//     { id: "14", pid: "2", name: "女装" },
//     { id: "15", pid: "7", name: "海尔空调" },
//     { id: "16", pid: "7", name: "美的空调" },
//     { id: "19", pid: "5", name: "加湿器" },
//     { id: "20", pid: "5", name: "电熨斗" },
// ];

// function transDataToTree(data) {
//     const transData = [];
//     const map = {};

//     // 先用map结构对id为key排序
//     data.forEach(item => {
//         map[item.id] = item;
//     });

//     // ?
//     data.forEach(item => {
//         const parent = map[item.pid];
//         if (parent) {
//             (parent.child || (parent.child = [])).push(item);
//         } else {
//             transData.push(item);
//         }
//     });

//     return transData;
// }

class TestTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tree: [],
        };
    }

    componentDidMount() {
        // const tree = transDataToTree(json);
        // this.setState({
        //     tree,
        // });
    }

    onSubmit = values => {
        console.log(values);
    };

    onReset = () => {};

    render() {
        const { tree } = this.state;
        return (
            <div className = {styles.tableList}>
                <YaoFormTemplate showExample items = {formTplData} onReset = {this.onReset} onSubmit = {this.onSubmit} />
                <pre className = "language-bash">{JSON.stringify(tree, null, 2)}</pre>
            </div>
        );
    }
}

export default TestTemplate;
