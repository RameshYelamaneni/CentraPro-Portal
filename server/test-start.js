const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(4000, () => {
  console.log('✅ Test server running on http://localhost:4000');
  console.log('✅ Try: http://localhost:4000/test');
});
