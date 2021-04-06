const Joi = require("joi");
const { HttpCode } = require("../../helpers/constants");

const schemaRegister = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(6).max(16).required(), 
});

const schemaLogin = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(6).max(16).required(),
});

const validate = (schema, object, next) => {
  const { error } = schema.validate(object);

  if (error) {
    const [{ message }] = error.details;
    return next({
      status: HttpCode.BAD_REQUEST,
      message: `Filed: ${message.replace(/"/g, "")}`,
    });
  }

  next();
};

module.exports.register = (req, res, next) => {
  return validate(schemaRegister, req.body, next);
};

module.exports.login = (req, res, next) => {
  return validate(schemaLogin, req.body, next);
};
