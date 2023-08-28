const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const PORT = process.env.PORT || 3000

//Use json
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

//Serve static files
app.use(express.static("public"));

//View Engine
app.set("view engine", "pug");

//Displays landing page for ABA Shortcuts
app.get("/", async(req, res)=>{
    try {
        //Render the page
        res.render("pages/index", {
        });
    } catch (err) {
        console.error(err.message);
    }
})

//Displays page for calculating limiting distance
app.get("/unprotected_opening", async(req, res)=>{
    try {
        //Render the page
        res.render("pages/unprotected_opening", {
        });
    } catch (err) {
        console.error(err.message);
    }
})

app.listen(PORT, () => {
    console.log("server running on port "+PORT);
})