module.exports = async function handler(req, res) {
  // Enable CORS for Owlbear extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    message: 'Equipment Manager API is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/characters',
      '/api/sync'
    ]
  });
};