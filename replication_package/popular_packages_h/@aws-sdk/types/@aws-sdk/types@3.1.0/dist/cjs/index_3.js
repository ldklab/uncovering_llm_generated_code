"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const modules = [
  "./abort",
  "./client",
  "./command",
  "./credentials",
  "./crypto",
  "./eventStream",
  "./http",
  "./logger",
  "./pagination",
  "./serde",
  "./middleware",
  "./response",
  "./signature",
  "./transfer",
  "./util"
];

for (const module of modules) {
  Object.assign(exports, require(module));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0RBQXdCO0FBQ3hCLG1EQUF5QjtBQUN6QixvREFBMEI7QUFDMUIsd0RBQThCO0FBQzlCLG1EQUF5QjtBQUN6Qix3REFBOEI7QUFDOUIsaURBQXVCO0FBQ3ZCLG1EQUF5QjtBQUN6Qix1REFBNkI7QUFDN0Isa0RBQXdCO0FBQ3hCLHVEQUE2QjtBQUM3QixxREFBMkI7QUFDM0Isc0RBQTRCO0FBQzVCLHFEQUEyQjtBQUMzQixpREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgKiBmcm9tIFwiLi9hYm9ydFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vY2xpZW50XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jb21tYW5kXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jcmVkZW50aWFsc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vY3J5cHRvXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ldmVudFN0cmVhbVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vaHR0cFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vbG9nZ2VyXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9wYWdpbmF0aW9uXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zZXJkZVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vbWlkZGxld2FyZVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVzcG9uc2VcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NpZ25hdHVyZVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vdHJhbnNmZXJcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxcIjtcbiJdfQ==