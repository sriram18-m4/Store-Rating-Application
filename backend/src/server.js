require('./config/env');
const app = require('./app');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Store rating API running on port ${port}`);
});
