const Session = require("./schemas/session");

const create = async (userID) => {
  const session = new Session({ userID });

  return await session.save();
};

const findByID = async (id) => {
  return await Session.findOne({ _id: id });
};

const findByUserID = async (userID) => {
  return await Session.findOne({ userID });
};

const findAllUserSessions = async (userID) => {
  return await Session.find({ userID });
};

const deleteAllUserSessions = async (userID) => {
  return await Session.deleteMany({ userID });
};

const remove = async (sessionID) => {
  return await Session.findOneAndRemove({ _id: sessionID });
};

const updateToken = async (id, refreshToken) => {
  return await Session.updateOne({ _id: id }, { refreshToken });
};

module.exports = {
  create,
  findByID,
  findByUserID,
  remove,
  updateToken,
  findAllUserSessions,
  deleteAllUserSessions,
};
