cpp
// hello.cc
#include <nan.h>

// Function that prints a greeting and returns a message
NAN_METHOD(SayHello) {
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("String argument expected");
        return;
    }

    v8::String::Utf8Value str(info[0]->ToString(Nan::GetCurrentContext()).ToLocalChecked());
    printf("Hello %s\n", *str);
    
    info.GetReturnValue().Set(Nan::New("Hello from C++ add-on!").ToLocalChecked());
}

// Module initialization logic
NAN_MODULE_INIT(Init) {
    Nan::Set(target, Nan::New("sayHello").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SayHello)).ToLocalChecked());
}

// Register the module
NODE_MODULE(hello, Init)
