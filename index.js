const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Route 1: health/version check
app.get('/version', (req, res) => {
  const versions = {
    node: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV || 'development',
  };
  console.log('[GET /version]', versions);
  res.json(versions);
});


app.get('/', (req, res) => {
  return res.send('Hello World 233');
});


// Route 2: simple ping that logs and returns versions
app.get('/check', (req, res) => {
  const versions = {
    node: process.version,
    timestamp: new Date().toISOString(),
  };
  console.log('[GET /check]', versions);
  res.json(versions);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
