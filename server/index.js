require('dotenv').config();
const { app } = require('./app.js');

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log('Error listening to port,', err);
  } else {
    console.log(`Listening to port ${process.env.PORT}`);
  }
});
