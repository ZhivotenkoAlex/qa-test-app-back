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

const findByTokenAndUpdate = async (token, body) => {
  return await User.findOneAndUpdate({ token }, { ...body }, { new: true });
};

const create = async ({ name, email, password }) => {
  const user = new User({ name, email, password });

  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

module.exports = {
  findByEmail,
  findByID,
  findByToken,
  findByTokenAndUpdate,
  create,
  updateToken,
};
