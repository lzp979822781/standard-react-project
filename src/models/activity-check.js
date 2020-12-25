import { delay } from "dva/saga";
import { post } from "../services/activity-check";

export default {
    namespace: "activityCheck",

    state: {
        name: "activityCheck",
    },

    effects: {
        *submitOpinion({ payload, callback }, { call }) {
            const res = yield call(post, {
                url: payload.type,
                data: {
                    opinion: payload.opinion,
                    id: payload.id,
                    status: payload.status,
                },
            });

            if (callback && typeof callback === "function") {
                yield call(delay, 1000);
                callback(res);
            }
        },
    },

    reducers: {
        updateState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
    },
};
