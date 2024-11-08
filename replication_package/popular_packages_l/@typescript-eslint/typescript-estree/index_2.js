import * as ts from 'typescript';

interface ParseOptions {
  comment?: boolean;
  debugLevel?: boolean | ('typescript-eslint' | 'eslint' | 'typescript')[];
  errorOnUnknownASTType?: boolean;
  filePath?: string;
  jsx?: boolean;
  loc?: boolean;
  loggerFn?: Function | false;
  range?: boolean;
  tokens?: boolean;
  useJSXTextNode?: boolean;
}

const DEFAULT_PARSE_OPTIONS: ParseOptions = {
  comment: false,
  errorOnUnknownASTType: false,
  filePath: 'estree.ts',
  jsx: false,
  loc: false,
  loggerFn: console.log,
  range: false,
  tokens: false,
  useJSXTextNode: false,
};

interface TSESTree {
  type: string;
  body: any[];
}

function parse(code: string, options: ParseOptions = DEFAULT_PARSE_OPTIONS): TSESTree {
  const sourceFile = ts.createSourceFile(
    options.filePath || 'file.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    options.jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const ast: TSESTree = {
    type: 'Program',
    body: [],
  };

  if (options.loc || options.range) {
    // Logic to enrich AST nodes with location/range info
  }

  return ast;
}

interface ParserServices {
  program: ts.Program;
  esTreeNodeToTSNodeMap: WeakMap<any, any>;
  tsNodeToESTreeNodeMap: WeakMap<any, any>;
}

interface ParseAndGenerateServicesResult {
  ast: TSESTree;
  services: ParserServices;
}

function parseAndGenerateServices(
  code: string,
  options: ParseOptions = DEFAULT_PARSE_OPTIONS
): ParseAndGenerateServicesResult {
  const program = ts.createProgram([options.filePath || 'file.ts'], {});
  const typeChecker = program.getTypeChecker();

  const ast = parse(code, options);

  const esTreeNodeToTSNodeMap = new WeakMap();
  const tsNodeToESTreeNodeMap = new WeakMap();

  return {
    ast,
    services: {
      program,
      esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap,
    },
  };
}

interface ParseWithNodeMapsResult {
  ast: TSESTree;
  esTreeNodeToTSNodeMap: WeakMap<any, any>;
  tsNodeToESTreeNodeMap: WeakMap<any, any>;
}

function parseWithNodeMaps(
  code: string,
  options: ParseOptions = DEFAULT_PARSE_OPTIONS
): ParseWithNodeMapsResult {
  const { ast, services } = parseAndGenerateServices(code, options);
  return {
    ast,
    esTreeNodeToTSNodeMap: services.esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap: services.tsNodeToESTreeNodeMap,
  };
}

export { parse, parseAndGenerateServices, parseWithNodeMaps, ParseOptions };
