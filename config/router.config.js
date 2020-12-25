export default [
    // app
    {
        path: "/",
        component: "../layouts/BasicLayout",
        Routes: ["src/pages/Authorized"],
        authority: ["admin", "user"],
        routes: [
            // dashboard
            { path: "/", redirect: "/m/med-market/activity/" },
            {
                path: "/home",
                name: "home",
                icon: "home",
                routes: [
                    {
                        path: "/home/index",
                        name: "系统列表",
                        component: "./home/components/Home",
                    },
                    {
                        path: "/home/compage",
                        name: "系统创建",
                        component: "./home/components/ComPage",
                        hideInMenu: true,
                    },
                    {
                        path: "/home/sys-env",
                        name: "集群列表",
                        component: "./home/components/SysEnv",
                        hideInMenu: true,
                    },
                    {
                        path: "/home/env-compage",
                        name: "集群创建",
                        component: "./home/components/EnvComPage",
                        hideInMenu: true,
                    },
                    {
                        path: "/home/sys-state",
                        name: "运行状态列表",
                        component: "./home/components/SysState",
                        hideInMenu: true,
                    },
                    {
                        path: "/home/sys-state-compage",
                        name: "创建发布",
                        component: "./home/components/SysStateComPage",
                        hideInMenu: true,
                    },
                ],
            },
            {
                name: "upload",
                icon: "upload",
                path: "/upload",
                component: "./test-comps/components/UploadPage",
            },
            {
                name: "复杂表格",
                icon: "ordered-list",
                path: "/complex-table",
                component: "./test-comps/components/TablePage",
            },
            {
                name: "自由查询表单",
                icon: "ordered-list",
                path: "/test-template",
                component: "./test-comps/components/TestTemplate",
            },
            {
                name: "复杂表单",
                icon: "form",
                path: "/complex-form",
                component: "./test-comps/components/FormPage",
            },
            {
                name: "药企营销",
                path: "/m/med-market",
                icon: "form",
                routes: [
                    {
                        path: "./coop-manager",
                        name: "合作管理",
                        routes: [
                            { path: "./", redirect: "./list" },
                            {
                                path: "./list",
                                name: "合作管理列表",
                                component: "./med-market/coop-manage/components/CoopControl",
                            },
                            {
                                path: "./operation",
                                name: "合作管理列表",
                                component: "./med-market/coop-manage/components/CoopMagOper",
                            },
                        ],
                    },
                    {
                        path: "./coop-approval",
                        name: "合作任务审核",
                        routes: [
                            { path: "./", redirect: "./list" },
                            {
                                path: "./list",
                                name: "合作任务审核列表",
                                component: "./med-market/coop-approval/components/CoopApproval",
                            },
                            {
                                path: "./operation",
                                name: "合作任务审批",
                                component: "./med-market/coop-approval/components/CoopAppOper",
                            },
                            {
                                path: "./detail",
                                name: "合作任务查看",
                                component: "./med-market/coop-approval/components/CoopAppOper",
                            },
                        ],
                    },
                    {
                        path: "./activity",
                        name: "活动",
                        routes: [
                            { path: "./", redirect: "./list" },
                            {
                                path: "./list",
                                name: "活动管理",
                                component: "./med-market/activity/list",
                            },
                            {
                                path: "./result-list",
                                name: " 效果数据列表",
                                component: "./med-market/activity/result-list",
                            },
                            {
                                path: "./check-list-op",
                                name: "运营审核列表",
                                component: "./med-market/activity/check-list-op",
                            },
                            {
                                path: "./create",
                                name: "活动创建",
                                // hideInMenu: true,
                                routes: [
                                    { path: "./", redirect: "./display" },
                                    {
                                        path: "./display",
                                        name: "陈列活动",
                                        component: "./med-market/activity/display-create",
                                    },
                                    {
                                        path: "./collect",
                                        name: "采集活动",
                                        component: "./med-market/activity/collect-create",
                                    },
                                    {
                                        path: "./pull-sale",
                                        name: "动销活动",
                                        component: "./med-market/activity-pull-sales/components/PullSaleCreate",
                                    },
                                    {
                                        path: "./train",
                                        name: "培训活动",
                                        component: "./med-market/activity-train/components/TrainCreate",
                                    },
                                ],
                            },
                            {
                                path: "./check",
                                name: "活动审核",
                                hideInMenu: true,
                                routes: [
                                    {
                                        path: "./display",
                                        name: "陈列活动",
                                        component: "./med-market/activity/display-create",
                                    },
                                    {
                                        path: "./collect",
                                        name: "采集活动",
                                        component: "./med-market/activity/collect-create",
                                    },
                                    {
                                        path: "./pull-sale",
                                        name: "动销活动",
                                        component: "./med-market/activity-pull-sales/components/PullSaleCreate",
                                    },
                                    {
                                        path: "./train",
                                        name: "培训活动",
                                        component: "./med-market/activity-train/components/TrainCreate",
                                    },
                                ],
                            },
                            {
                                path: "./detail",
                                name: "活动详情",
                                hideInMenu: true,
                                routes: [
                                    {
                                        path: "./display",
                                        name: "陈列活动",
                                        component: "./med-market/activity/display-create",
                                    },
                                    {
                                        path: "./collect",
                                        name: "采集活动",
                                        component: "./med-market/activity/collect-create",
                                    },
                                    {
                                        path: "./pull-sale",
                                        name: "动销活动",
                                        component: "./med-market/activity-pull-sales/components/PullSaleCreate",
                                    },
                                    {
                                        path: "./train",
                                        name: "培训活动",
                                        component: "./med-market/activity-train/components/TrainCreate",
                                    },
                                ],
                            },
                            {
                                path: "./result",
                                name: "活动效果",
                                hideInMenu: true,
                                routes: [
                                    {
                                        path: "./display",
                                        name: "陈列活动效果",
                                        component: "./med-market/activity/display-result",
                                    },
                                    {
                                        path: "./display-detail",
                                        name: "陈列活动效果",
                                        component: "./med-market/activity/display-result-detail",
                                    },
                                    {
                                        path: "./collect",
                                        name: "采集活动效果",
                                        component: "./med-market/activity/collect-result",
                                    },
                                    {
                                        path: "./pull-sale",
                                        name: "动销活动效果",
                                        component: "./med-market/activity-pull-sales/components/PullSaleEffect",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        path: "./act-group",
                        name: "活动组管理",
                        routes: [
                            { path: "./", redirect: "./list" },
                            {
                                path: "./list",
                                name: "活动组列表",
                                component: "./med-market/activity-group-manage/components/ActGroupList",
                            },
                            {
                                path: "./create",
                                name: "活动组创建",
                                component: "./med-market/activity-group-manage/components/ActGroupCreate",
                            },
                        ],
                    },
                    {
                        path: "./data-analysis",
                        name: "数据分析",
                        routes: [
                            { path: "./", redirect: "./list" },
                            {
                                path: "./list",
                                name: "数据分析列表",
                                component: "./med-market/data-analysis/components/DataAnalysisList",
                            },
                            {
                                path: "./display-analysis",
                                name: "陈列分析",
                                component: "./med-market/data-analysis/components/DisplayAnalysis",
                            },
                            {
                                path: "./display-detail",
                                name: "陈列详情",
                                component: "./med-market/data-analysis/components/DisplayDetail",
                            },
                            {
                                path: "./collect-analysis",
                                name: "采购分析",
                                component: "./med-market/data-analysis/components/CollectAnalysis",
                            },
                            {
                                path: "./collect-detail",
                                name: "采购详情",
                                component: "./med-market/data-analysis/components/CollectDetail",
                            },
                            {
                                path: "./pull-sale-analysis",
                                name: "动销分析",
                                component: "./med-market/data-analysis/components/PullSaleAnalysis",
                            },
                            {
                                path: "./pull-sale-detail",
                                name: "动销详情",
                                component: "./med-market/data-analysis/components/PullSaleDetail",
                            },
                            {
                                path: "./train-analysis",
                                name: "培训分析",
                                component: "./med-market/data-analysis/components/TrainAnalysis",
                            },
                            {
                                path: "./train-detail",
                                name: "培训详情",
                                component: "./med-market/data-analysis/components/TrainDetail",
                            },
                            {
                                path: "./unreward-statistics",
                                name: "达成未奖励统计",
                                component: "./med-market/data-analysis/components/UnRewardStatistics",
                            },
                            {
                                path: "./unreward-checklist",
                                name: "未奖励清单",
                                component: "./med-market/data-analysis/components/UnRewardList",
                            },
                        ],
                    },
                ],
            },
            {
                name: "工业端",
                path: "/med-market",
                icon: "form",
                routes: [
                    {
                        path: "./activity",
                        name: "活动",
                        routes: [
                            {
                                path: "./check-list-gy",
                                name: "工业审核列表",
                                component: "./med-market/activity/check-list-gy",
                            },
                            {
                                path: "./result-list",
                                name: " 效果数据列表",
                                component: "./med-market/activity/result-list",
                            },
                            {
                                path: "./check",
                                name: "活动审核",
                                hideInMenu: true,
                                routes: [
                                    {
                                        path: "./display",
                                        name: "陈列活动",
                                        component: "./med-market/activity/display-create",
                                    },
                                    {
                                        path: "./collect",
                                        name: "采集活动",
                                        component: "./med-market/activity/collect-create",
                                    },
                                    {
                                        path: "./pull-sale",
                                        name: "动销活动",
                                        component: "./med-market/activity-pull-sales/components/PullSaleCreate",
                                    },
                                    {
                                        path: "./train",
                                        name: "培训活动",
                                        component: "./med-market/activity-train/components/TrainCreate",
                                    },
                                ],
                            },
                            {
                                path: "./detail",
                                name: "活动详情",
                                hideInMenu: true,
                                routes: [
                                    {
                                        path: "./display",
                                        name: "陈列活动",
                                        component: "./med-market/activity/display-create",
                                    },
                                    {
                                        path: "./collect",
                                        name: "采集活动",
                                        component: "./med-market/activity/collect-create",
                                    },
                                    {
                                        path: "./pull-sale",
                                        name: "动销活动",
                                        component: "./med-market/activity-pull-sales/components/PullSaleCreate",
                                    },
                                    {
                                        path: "./train",
                                        name: "培训活动",
                                        component: "./med-market/activity-train/components/TrainCreate",
                                    },
                                ],
                            },
                            {
                                path: "./result",
                                name: "活动效果",
                                hideInMenu: true,
                                routes: [
                                    {
                                        path: "./display",
                                        name: "陈列活动效果",
                                        component: "./med-market/activity/display-result",
                                    },
                                    {
                                        path: "./display-detail",
                                        name: "陈列活动效果详情",
                                        component: "./med-market/activity/display-result-detail",
                                    },
                                    {
                                        path: "./collect",
                                        name: "采集活动效果",
                                        component: "./med-market/activity/collect-result",
                                    },
                                    {
                                        path: "./pull-sale",
                                        name: "动销活动效果",
                                        component: "./med-market/activity-pull-sales/components/PullSaleEffect",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        path: "./data-analysis",
                        name: "数据分析",
                        routes: [
                            { path: "./", redirect: "./list" },
                            {
                                path: "./list",
                                name: "数据分析列表",
                                component: "./med-market/data-analysis/components/DataAnalysisList",
                            },
                            {
                                path: "./display-analysis",
                                name: "陈列分析",
                                component: "./med-market/data-analysis/components/DisplayAnalysis",
                            },
                            {
                                path: "./display-detail",
                                name: "陈列详情",
                                component: "./med-market/data-analysis/components/DisplayDetail",
                            },
                            {
                                path: "./collect-analysis",
                                name: "采购分析",
                                component: "./med-market/data-analysis/components/CollectAnalysis",
                            },
                            {
                                path: "./collect-detail",
                                name: "采购详情",
                                component: "./med-market/data-analysis/components/CollectDetail",
                            },
                            {
                                path: "./pull-sale-analysis",
                                name: "动销分析",
                                component: "./med-market/data-analysis/components/PullSaleAnalysis",
                            },
                            {
                                path: "./pull-sale-detail",
                                name: "动销详情",
                                component: "./med-market/data-analysis/components/PullSaleDetail",
                            },
                            {
                                path: "./train-analysis",
                                name: "培训分析",
                                component: "./med-market/data-analysis/components/TrainAnalysis",
                            },
                        ],
                    },
                ],
            },

            {
                name: "exception",
                icon: "warning",
                path: "/exception",
                routes: [
                    // exception
                    {
                        path: "/exception/403",
                        name: "not-permission",
                        component: "./Exception/403",
                    },
                    {
                        path: "/exception/404",
                        name: "not-find",
                        component: "./Exception/404",
                    },
                    {
                        path: "/exception/500",
                        name: "server-error",
                        component: "./Exception/500",
                    },
                    {
                        path: "/exception/trigger",
                        name: "trigger",
                        hideInMenu: true,
                        component: "./Exception/TriggerException",
                    },
                ],
            },
            {
                component: "404",
            },
        ],
    },
];
