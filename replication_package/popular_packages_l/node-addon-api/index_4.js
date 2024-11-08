cpp
// Include necessary N-API header
#include <napi.h>

// Define a method that returns "Hello, world!" as a JavaScript string
Napi::String Method(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env(); // Obtain the environment from the CallbackInfo
  return Napi::String::New(env, "Hello, world!"); // Create and return a new string
}

// Initialize the module and export the "hello" function
NAPI_MODULE_INIT() {
  return Napi::Function::New(env, Method, "hello"); // Export "hello" as a callable function
}
