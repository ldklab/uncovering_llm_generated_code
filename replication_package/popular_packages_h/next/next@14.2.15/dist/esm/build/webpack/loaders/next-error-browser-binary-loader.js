export default function nextErrorBrowserBinaryLoader() {
    const { resourcePath, rootContext } = this;
    const relativePath = resourcePath.slice(rootContext.length + 1);
    throw new Error(`Node.js binary module ./${relativePath} is not supported in the browser. Please only use the module on server side`);
}

//# sourceMappingURL=next-error-browser-binary-loader.js.map