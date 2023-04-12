const express = require("express");
const bodyParser = require('body-parser')
const cors = require('cors')

const db = require('./db')
const spoonacularRouter = require('./routes/spoonacular-router')
const registerRouter = require('./routes/register-router')
const loginRouter = require('./routes/login-router')
const petProfileRouter = require('./routes/pet-profile-router')
const userRouter = require('./routes/user-router')
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use(express.json());
app.use('/', spoonacularRouter);
app.use('/', registerRouter);
app.use('/', loginRouter);
app.use('/', petProfileRouter);
app.use('/', userRouter);

 app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
 });

// For testing on Austin's Local Computer:
/*app.listen(port,'172.20.10.4', () => {
    console.log(`Listening on port ${port}!`);
});*/
