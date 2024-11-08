cpp
// hello_world.cc
#include <napi.h>

Napi::String Method(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello, world!");
}

NAPI_MODULE_INIT() {
  return Napi::Function::New(env, Method, "hello");
}
