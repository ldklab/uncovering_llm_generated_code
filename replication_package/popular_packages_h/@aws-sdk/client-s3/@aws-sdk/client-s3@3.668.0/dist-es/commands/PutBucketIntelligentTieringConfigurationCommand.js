import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_PutBucketIntelligentTieringConfigurationCommand, se_PutBucketIntelligentTieringConfigurationCommand, } from "../protocols/Aws_restXml";
export { $Command };
export class PutBucketIntelligentTieringConfigurationCommand extends $Command
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
    ];
})
    .s("AmazonS3", "PutBucketIntelligentTieringConfiguration", {})
    .n("S3Client", "PutBucketIntelligentTieringConfigurationCommand")
    .f(void 0, void 0)
    .ser(se_PutBucketIntelligentTieringConfigurationCommand)
    .de(de_PutBucketIntelligentTieringConfigurationCommand)
    .build() {
}