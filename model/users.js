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

const findByRefreshToken = async (refreshToken) => {
  return await User.findOne({refreshToken});
};

const create = async ({ email, password }) => {
  const user = new User({ email, password });

  return await user.save();
};

const createWithGoogle = async (email) => {
  const user = new User({ email });

  return await user.save();
};

const updateToken = async (id, accessToken, refreshToken) => {
  return await User.updateOne({ _id: id }, { accessToken, refreshToken });
};



module.exports = {
  findByEmail,
  findByID,
  findByToken,
  create,
  createWithGoogle,
  updateToken,
  findByRefreshToken
};
