const User = require("./schemas/user");

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const findByID = async (id) => {
  return await User.findOne({ _id: id });
};

const create = async ({ email, password, verificationToken }) => {
  const user = new User({ email, password, verificationToken });

  return await user.save();
};

const createWithGoogle = async (email) => {
  const user = new User({ email, verificationToken: null });

  return await user.save();
};

const findByVerificationToken = async (verificationToken) => {
  return await User.findOne({ verificationToken });
};

const updateVerificationToken = async (id, verificationToken) => {
  return await User.findOneAndUpdate({ _id: id }, { verificationToken });
};

module.exports = {
  findByEmail,
  findByID,
  create,
  createWithGoogle,
  findByVerificationToken,
  updateVerificationToken,
};
