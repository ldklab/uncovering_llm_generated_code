cpp
// hello_world.cc
#include <napi.h>

// Define a function that takes a CallbackInfo object (contains arguments and context)
// and returns a Napi::String with "Hello, world!".
Napi::String Method(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env(); // Retrieve the environment associated with the call
  return Napi::String::New(env, "Hello, world!"); // Create a new Napi string in the given environment
}

// Register the native method "Method" with the name "hello" to be accessible from JavaScript
NAPI_MODULE_INIT() {
  return Napi::Function::New(env, Method, "hello");
}
