import { Provider, UserAgent } from "@smithy/types";
import { DefaultUserAgentOptions } from "./configurations";
export interface PreviouslyResolved {
  userAgentAppId: Provider<string | undefined>;
}
export declare const defaultUserAgent: ({
  serviceId,
  clientVersion,
}: DefaultUserAgentOptions) => (
  config: PreviouslyResolved
) => Promise<UserAgent>;
