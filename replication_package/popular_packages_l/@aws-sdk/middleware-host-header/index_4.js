markdown
// package.json
{
  "name": "@aws-sdk/middleware-host-header",
  "version": "1.0.0",
  "main": "build/index.js",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "devDependencies": {
    "typescript": "^4.0.0",
    "jest": "^27.0.0",
    "@types/jest": "^27.0.0"
  },
  "dependencies": {
    "@aws-sdk/types": "^3.0.0"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "outDir": "build"
  },
  "include": ["src/**/*"]
}

// src/index.ts
import {
  BuildMiddleware,
  FinalizeHandlerArguments,
  HttpRequest,
  MetadataBearer
} from "@aws-sdk/types";

export const hostHeaderMiddleware = (): BuildMiddleware<any, any> => {
  return (next, context) => async (args: FinalizeHandlerArguments<any>): Promise<{ response: MetadataBearer }> => {
    const { request } = args;
    if (HttpRequest.isInstance(request)) {
      ensureHostHeader(request);
    }
    return next(args);
  };
};

const ensureHostHeader = (request: HttpRequest) => {
  if (!request.headers.host) {
    const url = new URL(request.endpoint);
    request.headers.host = url.host;
  }
};

// Jest Test (src/index.test.ts)
import { hostHeaderMiddleware } from "./index";
import { HttpRequest } from "@aws-sdk/types";

describe("hostHeaderMiddleware", () => {
  it("adds host header if none is present", async () => {
    const request = new HttpRequest({ method: "GET", protocol: "https:", path: "/", hostname: "example.com", query: {} });
    const next = jest.fn((args) => Promise.resolve({ response: {} }));

    await hostHeaderMiddleware()(next, {})( { request } );

    expect(request.headers.host).toBe("example.com");
  });
  
  it("does not override an existing host header", async () => {
    const request = new HttpRequest({
      method: "GET",
      protocol: "https:",
      path: "/",
      hostname: "example.com",
      query: {},
      headers: {
        host: "predefined-host.com"
      }
    });
    const next = jest.fn((args) => Promise.resolve({ response: {} }));

    await hostHeaderMiddleware()(next, {})( { request } );

    expect(request.headers.host).toBe("predefined-host.com");
  });
});
