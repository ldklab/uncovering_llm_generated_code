cpp
// hello_world.cc
#include <napi.h>

// A function that takes callback information and returns a "Hello, world!" string
Napi::String SayHello(const Napi::CallbackInfo& info) {
  // Obtain the environment from the callback info
  Napi::Env env = info.Env();

  // Create and return a new JavaScript string in the environment
  return Napi::String::New(env, "Hello, world!");
}

// Module initialization function that exports the SayHello function
NAPI_MODULE_INIT() {
  // Export the SayHello function as a JavaScript function named "hello"
  return Napi::Function::New(env, SayHello, "hello");
}
