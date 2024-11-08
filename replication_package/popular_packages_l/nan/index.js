cpp
// hello.cc
#include <nan.h>

// This is the C++ function that takes input from JavaScript
NAN_METHOD(SayHello) {
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("String argument expected");
        return;
    }

    v8::String::Utf8Value str(info[0]->ToString());
    printf("Hello %s\n", *str);
    
    info.GetReturnValue().Set(Nan::New("Hello from C++ add-on!").ToLocalChecked());
}

// Initialize the module with the method we're exporting
NAN_MODULE_INIT(Init) {
    Nan::Set(target, Nan::New("sayHello").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SayHello)).ToLocalChecked());
}

// Macro to initialize the module
NODE_MODULE(hello, Init)
