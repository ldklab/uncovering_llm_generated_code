cpp
// hello_world.cc
#include <napi.h>

// Function that returns a "Hello, world!" string
Napi::String SayHello(const Napi::CallbackInfo& info) {
  // Get the current environment
  Napi::Env env = info.Env();
  // Return a new JavaScript string
  return Napi::String::New(env, "Hello, world!");
}

// Initialize the module
NAPI_MODULE_INIT() {
  // Define and export the "hello" function
  return Napi::Function::New(env, SayHello, "hello");
}
