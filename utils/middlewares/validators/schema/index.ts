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
  expected_completion_time: joi.date().required(),
});

const validateTaskQuery = joi.object({
  filter_by_date: joi.date().iso().required(),
  status: joi.string().valid("complete", "incomplete"),
});

const validateTaskUpdate = joi.object({
  name: joi.string().min(3).required().messages({
    "string.base": "Task name must be a string",
    "string.min": "Task name must be 3 characters or more",
    "any.required": "Task name is required",
  }),
  description: joi.string().min(10).messages({
    "string.base": "Description must be a string",
    "string.min": "Description must be a minimum of 10 characters",
  }),
  category: joi.string().min(4).messages({
    "string.base": "Category must be a string",
    "string.min": "Category must be a minimum of 4 characters",
  }),
  isRoutine: joi.boolean().messages({
    "boolean.base": "isRoutine must be of type boolean",
  }),
  expected_completion_time: joi.date().iso().messages({
    "date.base": "'expected_date_of_completion' must be a valid date",
    "date.iso": "'expected_date_of_completion' must be in ISO date format",
  }),
  recurrence: joi.string().valid("daily", "weekly", "monthly").messages({
    "any.only": "Recurrence must be one of 'daily', 'weekly', or 'monthly'",
  }),
});

const validateTaskUpdateParam = joi.object({
  name: joi.string().min(3).required().messages({
    "string.base": "Task name must be a string",
    "string.min": "Task name must be 3 characters or more",
    "any.required": "Task name is required",
  }),
  description: joi.string().min(10).messages({
    "string.base": "Description must be a string",
    "string.min": "Description must be a minimum of 10 characters",
  }),
  category: joi.string().min(4).messages({
    "string.base": "Category must be a string",
    "string.min": "Category must be a minimum of 4 characters",
  }),
  isRoutine: joi.boolean().messages({
    "boolean.base": "isRoutine must be of type boolean",
  }),
  expected_completion_time: joi.date().iso().messages({
    "date.base": "'expected_date_of_completion' must be a valid date",
    "date.iso": "'expected_date_of_completion' must be in ISO date format",
  }),
  completed: joi
    .boolean()
    .messages({
      "boolean.base": "Completed must be of type boolean",
    })
    .required(),
  createdAt: joi
    .date()
    .iso()
    .messages({
      "date.base": "CreatedAt must be a valid date",
      "date.format": "CreatedAt must be in ISO 8601 format",
    })
    .required(),
  recurrence: joi.string().valid("daily", "weekly", "monthly").messages({
    "any.only": "Recurrence must be one of 'daily', 'weekly', or 'monthly'",
  }),
});

export {
  validateUserReg,
  validateUserLogin,
  validateTask,
  validateTaskQuery,
  validateTaskUpdate,
  validateTaskUpdateParam,
};
