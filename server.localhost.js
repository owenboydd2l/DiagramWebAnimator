const express = require('express');
const app = express();
const port = 3000;

app.use('/static', express.static('static') );

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`${new Date()} Diagram Animator Web Server listening on port ${port}`);  
});