const User = require("./schemas/user");

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const findByID = async (id) => {
  return await User.findOne({ _id: id });
};

const create = async ({ email, password }) => {
  const user = new User({ email, password });

  return await user.save();
};

const createWithGoogle = async (email) => {
  const user = new User({ email });

  return await user.save();
};

module.exports = {
  findByEmail,
  findByID,
  create,
  createWithGoogle,
};
