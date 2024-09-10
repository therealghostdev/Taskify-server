import joi from "joi";

const validateUserReg = joi.object({
  username: joi
    .string()
    .required(),
  firstname: joi
    .string()
    .min(3)
    .max(30)
    .message("Firstname must contain minimum of 3 characters")
    .required(),
  lastname: joi
    .string()
    .min(3)
    .max(30)
    .message("Lastname must contain minimum of 3 characters")
    .required(),
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

const validateUserLogin = joi.object({
  username: joi
    .string()
    .required(),
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

export { validateUserReg, validateUserLogin };
