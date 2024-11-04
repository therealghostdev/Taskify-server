import joi from "joi";

const validateUserReg = joi.object({
  username: joi.string().required().messages({
    "any.required": "Username is required",
  }),
  firstname: joi.string().min(3).max(30).required().messages({
    "string.base": "Firstname must be a string",
    "string.min": "Firstname must contain minimum of 3 characters",
    "any.required": "Firstname is required",
  }),
  lastname: joi.string().min(3).max(30).required().messages({
    "string.base": "Lastname must be a string",
    "string.min": "Lastname must contain minimum of 3 characters",
    "any.required": "Lastname is required",
  }),
  password: joi
    .string()
    .pattern(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9a-zA-Z]).{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain at least one uppercase letter and one special character",
      "any.required": "Password is required",
    }),
});

const validateUserLogin = joi.object({
  username: joi.string().required(),
  password: joi
    .string()
    .pattern(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9a-zA-Z]).{8,}$/
    )
    .message(
      "Password must be at least 8 characters long and contain at least one uppercase letter and one special character"
    )
    .required(),
});

const validateTask = joi.object({
  name: joi.string().required(),
  description: joi.string().required(),
  priority: joi.number().required(),
  category: joi.string().required(),
  expected_completion_time: joi.date().iso().min("now").required().messages({
    "date.base":
      "'expected_date_of_completion' must be a valid date => (request body Error)",
    "date.iso":
      "'expected_date_of_completion' in request body must be in ISO date format => (request body Error)",
    "date.min":
      "'expected_completion_time' cannot be in the past => (request body Error)",
    "any.required": "'expected_completion_time' is required",
  }),
});

const validateTaskQuery = joi.object({
  filter_by_date: joi.date().iso().required(),
  status: joi.string().valid("complete", "incomplete"),
});

const validateTaskUpdate = joi.object({
  name: joi.string().min(3).messages({
    "string.base": "Task name must be a string => (request body Error)",
    "string.min":
      "Task name must be 3 characters or more => (request body Error)",
    "any.required": "name is required => (request body Error)",
  }),
  description: joi.string().min(10).messages({
    "string.base": "Description must be a string => (request body Error)",
    "string.min":
      "Description must be a minimum of 10 characters => (request body Error)",
  }),
  priority: joi.number().min(1).max(10).messages({
    "number.base": "priority must be a string => (search query Error)",
    "number.min": "priority must be a minimum of 1 => (search query Error)",
    "number.max":
      "priority must be not be more that 10 => (search query Error)",
  }),
  category: joi.string().min(4).messages({
    "string.base": "Category must be a string => (request body Error)",
    "string.min":
      "Category must be a minimum of 4 characters => (request body Error)",
  }),
  duration: joi.number().min(1).messages({
    "number.base": "Duration must be a number => (request body error)",
    "number.min": "Duration must be value of 1 or higher",
  }),
  onFocus: joi.boolean().messages({
    "boolean.base": "onFocus must be of type boolean => (request body Error)",
  }),
  isRoutine: joi.boolean().messages({
    "boolean.base": "isRoutine must be of type boolean => (request body Error)",
  }),
  completed: joi.boolean().messages({
    "boolean.base": "completed must be of type boolean => (request body Error)",
  }),
  completedAt: joi.date().iso().messages({
    "date.base": "'completedAt' must be a valid date => (request body Error)",
    "date.iso":
      "'completedAt' mut be in ISO date format => (request body Error)",
  }),
  expected_completion_time: joi.date().iso().min("now").messages({
    "date.base":
      "'expected_date_of_completion' must be a valid date => (request body Error)",
    "date.iso":
      "'expected_date_of_completion' in request body must be in ISO date format => (request body Error)",
    "date.min":
      "'expected_completion_time' cannot be in the past => (request body Error)",
  }),
  recurrence: joi.string().valid("daily", "weekly", "monthly").messages({
    "any.only":
      "Recurrence must be one of 'daily', 'weekly', or 'monthly' => (request body Error)",
  }),
});

const validateTaskUpdateParam = joi.object({
  name: joi.string().min(3).required().messages({
    "string.base": "Task name must be a string",
    "string.min": "Task name must be 3 characters or more",
    "any.required": "Task name is required in search query",
  }),
  description: joi.string().min(10).messages({
    "string.base": "Description must be a string => (search query Error)",
    "string.min":
      "Description must be a minimum of 10 characters => (search query Error)",
  }),
  priority: joi.number().min(1).max(10).messages({
    "number.base": "priority must be a string => (search query Error)",
    "number.min": "priority must be a minimum of 1 => (search query Error)",
    "number.max":
      "priority must be not be more that 10 => (search query Error)",
  }),
  category: joi.string().min(4).messages({
    "string.base": "Category must be a string => (search query Error)",
    "string.min":
      "Category must be a minimum of 4 characters => (search query Error)",
  }),
  isRoutine: joi.boolean().messages({
    "boolean.base": "isRoutine must be of type boolean => (search query Error)",
  }),
  expected_completion_time: joi.date().iso().messages({
    "date.base":
      "'expected_completion_time' in request query must be a valid date => (search query Error)",
    "date.iso":
      "'expected_completion_time' in request query must be in ISO 8601 date format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ) => (search query Error)",
  }),
  completed: joi
    .boolean()
    .messages({
      "boolean.base":
        "Completed must be of type boolean => (search query Error)",
    })
    .required(),
  createdAt: joi
    .date()
    .iso()
    .messages({
      "date.base": "CreatedAt must be a valid date => (search query Error)",
      "date.format":
        "CreatedAt must be in ISO 8601 format => (search query Error)",
    })
    .required(),
  recurrence: joi.string().valid("daily", "weekly", "monthly").messages({
    "any.only":
      "Recurrence must be one of 'daily', 'weekly', or 'monthly' => (search query Error)",
  }),
});

const validateUserToken = joi.object({
  fcmToken: joi.string().required().messages({
    "string.base": "fcmToken field must be a string",
    "any.required": "fcmToken field is required",
  }),
});

export {
  validateUserReg,
  validateUserLogin,
  validateTask,
  validateTaskQuery,
  validateTaskUpdate,
  validateTaskUpdateParam,
  validateUserToken,
};
