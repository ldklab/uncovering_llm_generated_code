cpp
// hello.cc
#include <nan.h>

// C++ function that takes a string argument from JavaScript
NAN_METHOD(SayHello) {
    // Check if the argument is of type string
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("String argument expected");
        return;
    }

    // Convert the JavaScript string argument to a C++ string
    v8::String::Utf8Value str(info[0]->ToString());

    // Print the greeting message
    printf("Hello %s\n", *str);

    // Set the return value to a C++ generated message
    info.GetReturnValue().Set(Nan::New("Hello from C++ add-on!").ToLocalChecked());
}

// Module initialization function
NAN_MODULE_INIT(Init) {
    // Register the SayHello function as a property of the module's target object
    Nan::Set(target, Nan::New("sayHello").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SayHello)).ToLocalChecked());
}

// Macro to expose the module to Node.js
NODE_MODULE(hello, Init)
