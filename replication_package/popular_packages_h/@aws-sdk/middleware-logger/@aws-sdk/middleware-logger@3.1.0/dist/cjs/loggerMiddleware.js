"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoggerPlugin = exports.loggerMiddlewareOptions = exports.loggerMiddleware = void 0;
const loggerMiddleware = () => (next, context) => async (args) => {
    const { clientName, commandName, inputFilterSensitiveLog, logger, outputFilterSensitiveLog } = context;
    const response = await next(args);
    if (!logger) {
        return response;
    }
    if (typeof logger.info === "function") {
        const { $metadata, ...outputWithoutMetadata } = response.output;
        logger.info({
            clientName,
            commandName,
            input: inputFilterSensitiveLog(args.input),
            output: outputFilterSensitiveLog(outputWithoutMetadata),
            metadata: $metadata,
        });
    }
    return response;
};
exports.loggerMiddleware = loggerMiddleware;
exports.loggerMiddlewareOptions = {
    name: "loggerMiddleware",
    tags: ["LOGGER"],
    step: "initialize",
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getLoggerPlugin = (options) => ({
    applyToStack: (clientStack) => {
        clientStack.add(exports.loggerMiddleware(), exports.loggerMiddlewareOptions);
    },
});
exports.getLoggerPlugin = getLoggerPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyTWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXJNaWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVlPLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FDcEMsSUFBb0MsRUFDcEMsT0FBZ0MsRUFDQSxFQUFFLENBQUMsS0FBSyxFQUN4QyxJQUFxQyxFQUNLLEVBQUU7SUFDNUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZHLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWCxPQUFPLFFBQVEsQ0FBQztLQUNqQjtJQUVELElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtRQUNyQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcscUJBQXFCLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDVixVQUFVO1lBQ1YsV0FBVztZQUNYLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzFDLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQztZQUN2RCxRQUFRLEVBQUUsU0FBUztTQUNwQixDQUFDLENBQUM7S0FDSjtJQUVELE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQTFCVyxRQUFBLGdCQUFnQixvQkEwQjNCO0FBRVcsUUFBQSx1QkFBdUIsR0FBZ0Q7SUFDbEYsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QixJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDaEIsSUFBSSxFQUFFLFlBQVk7Q0FDbkIsQ0FBQztBQUVGLDZEQUE2RDtBQUN0RCxNQUFNLGVBQWUsR0FBRyxDQUFDLE9BQVksRUFBdUIsRUFBRSxDQUFDLENBQUM7SUFDckUsWUFBWSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUU7UUFDNUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyx3QkFBZ0IsRUFBRSxFQUFFLCtCQUF1QixDQUFDLENBQUM7SUFDL0QsQ0FBQztDQUNGLENBQUMsQ0FBQztBQUpVLFFBQUEsZUFBZSxtQkFJekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwUmVzcG9uc2UgfSBmcm9tIFwiQGF3cy1zZGsvcHJvdG9jb2wtaHR0cFwiO1xuaW1wb3J0IHtcbiAgQWJzb2x1dGVMb2NhdGlvbixcbiAgSGFuZGxlckV4ZWN1dGlvbkNvbnRleHQsXG4gIEluaXRpYWxpemVIYW5kbGVyLFxuICBJbml0aWFsaXplSGFuZGxlckFyZ3VtZW50cyxcbiAgSW5pdGlhbGl6ZUhhbmRsZXJPcHRpb25zLFxuICBJbml0aWFsaXplSGFuZGxlck91dHB1dCxcbiAgTWV0YWRhdGFCZWFyZXIsXG4gIFBsdWdnYWJsZSxcbn0gZnJvbSBcIkBhd3Mtc2RrL3R5cGVzXCI7XG5cbmV4cG9ydCBjb25zdCBsb2dnZXJNaWRkbGV3YXJlID0gKCkgPT4gPE91dHB1dCBleHRlbmRzIE1ldGFkYXRhQmVhcmVyID0gTWV0YWRhdGFCZWFyZXI+KFxuICBuZXh0OiBJbml0aWFsaXplSGFuZGxlcjxhbnksIE91dHB1dD4sXG4gIGNvbnRleHQ6IEhhbmRsZXJFeGVjdXRpb25Db250ZXh0XG4pOiBJbml0aWFsaXplSGFuZGxlcjxhbnksIE91dHB1dD4gPT4gYXN5bmMgKFxuICBhcmdzOiBJbml0aWFsaXplSGFuZGxlckFyZ3VtZW50czxhbnk+XG4pOiBQcm9taXNlPEluaXRpYWxpemVIYW5kbGVyT3V0cHV0PE91dHB1dD4+ID0+IHtcbiAgY29uc3QgeyBjbGllbnROYW1lLCBjb21tYW5kTmFtZSwgaW5wdXRGaWx0ZXJTZW5zaXRpdmVMb2csIGxvZ2dlciwgb3V0cHV0RmlsdGVyU2Vuc2l0aXZlTG9nIH0gPSBjb250ZXh0O1xuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbmV4dChhcmdzKTtcblxuICBpZiAoIWxvZ2dlcikge1xuICAgIHJldHVybiByZXNwb25zZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgbG9nZ2VyLmluZm8gPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGNvbnN0IHsgJG1ldGFkYXRhLCAuLi5vdXRwdXRXaXRob3V0TWV0YWRhdGEgfSA9IHJlc3BvbnNlLm91dHB1dDtcbiAgICBsb2dnZXIuaW5mbyh7XG4gICAgICBjbGllbnROYW1lLFxuICAgICAgY29tbWFuZE5hbWUsXG4gICAgICBpbnB1dDogaW5wdXRGaWx0ZXJTZW5zaXRpdmVMb2coYXJncy5pbnB1dCksXG4gICAgICBvdXRwdXQ6IG91dHB1dEZpbHRlclNlbnNpdGl2ZUxvZyhvdXRwdXRXaXRob3V0TWV0YWRhdGEpLFxuICAgICAgbWV0YWRhdGE6ICRtZXRhZGF0YSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2dnZXJNaWRkbGV3YXJlT3B0aW9uczogSW5pdGlhbGl6ZUhhbmRsZXJPcHRpb25zICYgQWJzb2x1dGVMb2NhdGlvbiA9IHtcbiAgbmFtZTogXCJsb2dnZXJNaWRkbGV3YXJlXCIsXG4gIHRhZ3M6IFtcIkxPR0dFUlwiXSxcbiAgc3RlcDogXCJpbml0aWFsaXplXCIsXG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5leHBvcnQgY29uc3QgZ2V0TG9nZ2VyUGx1Z2luID0gKG9wdGlvbnM6IGFueSk6IFBsdWdnYWJsZTxhbnksIGFueT4gPT4gKHtcbiAgYXBwbHlUb1N0YWNrOiAoY2xpZW50U3RhY2spID0+IHtcbiAgICBjbGllbnRTdGFjay5hZGQobG9nZ2VyTWlkZGxld2FyZSgpLCBsb2dnZXJNaWRkbGV3YXJlT3B0aW9ucyk7XG4gIH0sXG59KTtcbiJdfQ==