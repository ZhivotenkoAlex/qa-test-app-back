const User = require("./schemas/user");

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const findByID = async (id) => {
  return await User.findOne({ _id: id });
};

const findByToken = async (token) => {
  return await User.findOne({ token });
};

const create = async ({ email, password }) => {
  const user = new User({ email, password });

  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

module.exports = {
  findByEmail,
  findByID,
  findByToken,
  create,
  updateToken,
};
