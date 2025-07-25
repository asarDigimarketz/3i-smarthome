// const apiKeyMiddleware = (req, res, next) => {
//   // Check if request is from a browser
//   const userAgent = req.headers['user-agent'] || '';
//   const isBrowser = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');

//   if (isBrowser) {
//     // Allow browser requests without API key
//     return next();
//   }

//   // For non-browser requests (like Thunder Client), require API key
//   const apiKey = req.headers['x-api-key'];
//   const validApiKey = process.env.API_KEY;

//   if (!apiKey || apiKey !== validApiKey) {
//     return res.status(401).json({
//       success: false,
//       message: 'API access denied'
//     });
//   }

//   next();
// };

// export default apiKeyMiddleware;

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing API key",
    });
  }

  next();
};

module.exports = apiKeyMiddleware;
