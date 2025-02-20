import { ListObjectsV2CommandInput, ListObjectsV2CommandOutput } from "../commands/ListObjectsV2Command";
import { S3PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListObjectsV2(config: S3PaginationConfiguration, input: ListObjectsV2CommandInput, ...additionalArguments: any): Paginator<ListObjectsV2CommandOutput>;
