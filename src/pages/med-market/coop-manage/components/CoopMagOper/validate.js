import { UUID } from "@/utils/utils";
// import omit from 'lodash/omit';

function handleFile(data) {
    const { annex, annexName } = data;
    if (annex) {
        const splitArr = annex.split("/");
        const file = {
            uid: `-${UUID()}`,
            status: "done",
            url: annex,
            path: annex,
            name: annexName || splitArr[splitArr.length - 1],
        };
        return {
            annex: [file],
        };
    }
    return { annex: undefined };
}

function handleRow(rowData) {
    const newData = Object.assign({}, rowData, handleFile(rowData));
    return newData;
}

export default handleRow;
