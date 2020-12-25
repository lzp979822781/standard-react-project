import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import Link from "umi/link";
import { formatMessage } from "umi/locale";
import Exception from "@/components/Exception";

export default () => (
    <Exception
        type = "404"
        linkElement = {Link}
        desc = {formatMessage({ id: "app.exception.description.404" })}
        backText = {formatMessage({ id: "app.exception.back" })}
    />
);
