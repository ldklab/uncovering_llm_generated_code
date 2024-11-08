cpp
// hello.cc
#include <nan.h>

// This function takes a string from JavaScript, prints it, and returns a message.
NAN_METHOD(SayHello) {
    // Ensure at least one argument of type string
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("String argument expected");
        return;
    }

    // Convert JavaScript string to C++ string and print it
    v8::String::Utf8Value inputString(info[0]->ToString(Nan::GetCurrentContext()).ToLocalChecked());
    printf("Hello %s\n", *inputString);
    
    // Set the return value for the JavaScript function
    info.GetReturnValue().Set(Nan::New("Hello from C++ add-on!").ToLocalChecked());
}

// Module initialization function
NAN_MODULE_INIT(Init) {
    Nan::Set(target, Nan::New("sayHello").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SayHello)).ToLocalChecked());
}

// Register the module and its initialization function
NODE_MODULE(hello, Init)
