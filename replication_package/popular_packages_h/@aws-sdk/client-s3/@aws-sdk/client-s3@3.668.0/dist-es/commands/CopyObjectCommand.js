import { getThrow200ExceptionsPlugin } from "@aws-sdk/middleware-sdk-s3";
import { getSsecPlugin } from "@aws-sdk/middleware-ssec";
import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CopyObjectOutputFilterSensitiveLog, CopyObjectRequestFilterSensitiveLog, } from "../models/models_0";
import { de_CopyObjectCommand, se_CopyObjectCommand } from "../protocols/Aws_restXml";
export { $Command };
export class CopyObjectCommand extends $Command
    .classBuilder()
    .ep({
    ...commonParams,
    DisableS3ExpressSessionAuth: { type: "staticContextParams", value: true },
    Bucket: { type: "contextParams", name: "Bucket" },
    Key: { type: "contextParams", name: "Key" },
    CopySource: { type: "contextParams", name: "CopySource" },
})
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config),
    ];
})
    .s("AmazonS3", "CopyObject", {})
    .n("S3Client", "CopyObjectCommand")
    .f(CopyObjectRequestFilterSensitiveLog, CopyObjectOutputFilterSensitiveLog)
    .ser(se_CopyObjectCommand)
    .de(de_CopyObjectCommand)
    .build() {
}