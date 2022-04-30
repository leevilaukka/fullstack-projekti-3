// init express 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

app.use(cors());
app.use(bodyParser.json());

const routes = fs
    .readdirSync("./routes")
    .filter((file) => file.endsWith(".js"));

routes.forEach((route) => {
    const file = require(`./routes/${route}`);
    const path = `/${route.slice(0, -3)}`;
    console.log(`Route ${path} loaded!`);
    app.use(path, file);
});

app.get("/teapot", (req, res) => {
    res.status(418).json({
        message: "I'm a teapot!"
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "Forum API",
        documentation: "https://documenter.getpostman.com/view/10139458/UyrBiFmX"
    });    
})

mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true }, () => {
    console.log('Connected to database');
});

app.listen((process.env.PORT || 3000), () => {
    console.log(`Server started on port ${process.env.PORT}`);
});