// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
    "GET /api/coop-approval/get-list": (req, res) => {
        res.send({
            status: "ok",
            current: 1,
            total: 34,
            pageSize: 10,
            data: [
                {
                    key: "1",
                    id: 1,
                    status: 1, // 1 待审核 2：审核通过
                    companyName: "天津同仁医药",
                    taskName: "医药营销",
                    income: "1000000元",
                    expend: "1000元",
                    startTime: "2019-09-09 00:00",
                    endTime: "2019-09-09 23:59",
                    create: "张三",
                    approval: "李四",
                },
                {
                    key: "2",
                    id: 2,
                    status: 2, // 1 待审核 2：审核通过
                    companyName: "天津同仁医药",
                    taskName: "医药营销",
                    income: "1000000元",
                    expend: "1000元",
                    startTime: "2019-09-09 00:00",
                    endTime: "2019-09-09 23:59",
                    create: "张三",
                    approval: "李四",
                },
                {
                    key: "2",
                    id: 2,
                    status: 1, // 1 待审核 2：审核通过
                    companyName: "天津同仁医药",
                    taskName: "医药营销",
                    income: "1000000元",
                    expend: "1000元",
                    startTime: "2019-09-09 00:00",
                    endTime: "2019-09-09 23:59",
                    create: "张三",
                    approval: "李四",
                },
            ],
        });
    },
    "GET /api/coop-approval/get-detail": {
        key: "1",
        id: 1,
        status: 1,
        companyName: "天津同仁医药",
        taskName: "医药营销",
        income: "1000000元",
        expend: "1000元",
        paybacktTime: "2019-09-09 00:00",
        startTime: "2019-09-09 00:00",
        endTime: "2019-09-09 23:59",
        create: "张三",
        createTime: "2019-09-09 00:00",
        approval: "李四",
        opinion: "挺好",
        remarks: "111111111备注",
    },
    "POST /api/coop-approval/submit-opinion": (req, res) => {
        res.send({
            status: "ok",
            data: {
                key: "1",
                id: 1,
                status: 2,
                companyName: "天津同仁医药",
                taskName: "医药营销",
                income: "1000000元",
                expend: "1000元",
                paybacktTime: "2019-09-09 00:00",
                startTime: "2019-09-09 00:00",
                endTime: "2019-09-09 23:59",
                create: "张三",
                createTime: "2019-09-09 00:00",
                approval: "李四",
                opinion: "挺好",
                remarks: "111111111备注",
            },
        });
    },
};
