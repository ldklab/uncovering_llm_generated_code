"use strict";

import { defaults as schemaDefaults } from "@istanbuljs/schema";
import Instrumenter from "./instrumenter";
import Visitor from "./visitor";
import ReadCoverage from "./read-coverage";

export function createInstrumenter(opts) {
  return new Instrumenter(opts);
}

export const programVisitor = Visitor.default;
export const readInitialCoverage = ReadCoverage.default;
export const defaultOpts = schemaDefaults.instrumenter;
