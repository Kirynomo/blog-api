const rateLimit = require("express-rate-limit");

/* const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 2,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});
test limiter
*/

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

module.exports = authLimiter;
