/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TransformOptions } from '@babel/core';
import type { Transformer } from '@jest/transform';
declare const transformer: Transformer<TransformOptions>;
export = transformer;
