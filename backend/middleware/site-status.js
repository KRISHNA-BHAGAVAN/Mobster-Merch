import { redisClient } from "../config/redis.js";

export const siteClosedMiddleware = async (req, res, next) => {
  const closed = await redisClient.get('site_closed');

  // Allow all auth-related routes to pass through
  if (req.originalUrl.startsWith('/api/auth') || req.originalUrl.startsWith('/api/admin/toggle-site')) {
    return next();
  }
  
  if (closed === '1') {
    // Check if the user is an admin
    const isAdmin = req.session?.isAdmin;
    if (isAdmin) {
      return next(); // Admins can bypass the site closure
    }
    
    // Non-admin users are blocked from all other routes
    return res.status(503).json({ message: 'Site is under maintenance' });
  }

  next();
};
