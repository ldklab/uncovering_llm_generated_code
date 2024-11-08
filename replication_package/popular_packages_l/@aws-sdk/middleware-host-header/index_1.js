json
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

export const hostHeaderMiddleware = (): BuildMiddleware<any, any> => (
  next,
  context
) => async (args: FinalizeHandlerArguments<any>): Promise<{ response: MetadataBearer }> => {
  const { request } = args;
  if (HttpRequest.isInstance(request)) {
    ensureHostHeader(request);
  }
  return next(args);
};

const ensureHostHeader = (request: HttpRequest) => {
  if (!request.headers.host) {
    const urlHost = new URL(request.endpoint).host;
    request.headers.host = urlHost;
  }
};

// Jest Test (src/index.test.ts)
import { hostHeaderMiddleware } from "./index";
import { HttpRequest } from "@aws-sdk/types";

describe("hostHeaderMiddleware", () => {
  it("should add host header if not present", async () => {
    const request = new HttpRequest({ method: "GET", protocol: "https:", path: "/", hostname: "example.com", query: {} });
    const next = jest.fn(() => Promise.resolve({ response: {} }));

    await hostHeaderMiddleware()(next, {})( { request } );

    expect(request.headers.host).toBe("example.com");
  });

  it("should not override existing host header", async () => {
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
    const next = jest.fn(() => Promise.resolve({ response: {} }));

    await hostHeaderMiddleware()(next, {})( { request } );

    expect(request.headers.host).toBe("predefined-host.com");
  });
});
