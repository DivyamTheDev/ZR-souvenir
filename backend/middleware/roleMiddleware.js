const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: You do not have the required role to perform this action." });
        }
        next();
    };
};

module.exports = authorizeRoles;
