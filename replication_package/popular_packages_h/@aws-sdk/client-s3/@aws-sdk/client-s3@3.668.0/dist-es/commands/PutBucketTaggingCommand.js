import { getFlexibleChecksumsPlugin } from "@aws-sdk/middleware-flexible-checksums";
import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_PutBucketTaggingCommand, se_PutBucketTaggingCommand } from "../protocols/Aws_restXml";
export { $Command };
export class PutBucketTaggingCommand extends $Command
    .classBuilder()
    .ep({
    ...commonParams,
    UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
    Bucket: { type: "contextParams", name: "Bucket" },
})
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
            input: this.input,
            requestAlgorithmMember: "ChecksumAlgorithm",
            requestChecksumRequired: true,
        }),
    ];
})
    .s("AmazonS3", "PutBucketTagging", {})
    .n("S3Client", "PutBucketTaggingCommand")
    .f(void 0, void 0)
    .ser(se_PutBucketTaggingCommand)
    .de(de_PutBucketTaggingCommand)
    .build() {
}