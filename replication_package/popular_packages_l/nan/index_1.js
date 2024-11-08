cpp
// hello.cc
#include <nan.h>

// Function to be called from JavaScript
NAN_METHOD(SayHello) {
    // Check if the correct arguments are provided
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("String argument expected");
        return;
    }

    // Convert JavaScript string to C++ string
    v8::String::Utf8Value str(info[0]->ToString());
    printf("Hello %s\n", *str);

    // Set return value
    info.GetReturnValue().Set(Nan::New("Hello from C++ add-on!").ToLocalChecked());
}

// Module initialization
NAN_MODULE_INIT(Init) {
    Nan::Set(target, Nan::New("sayHello").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SayHello)).ToLocalChecked());
}

// Register the module
NODE_MODULE(hello, Init)
