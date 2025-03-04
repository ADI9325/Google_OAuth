const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.profile || req.user.profile.role !== role) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

module.exports = { checkRole };
