const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "pug");

//Displays landing page for ABA Shortcuts
app.get("/", async(req, res)=>{
    try {
        res.render("pages/index", {
        });
    } catch (err) {
        console.error(err.message);
    }
})

//Displays page for calculating unprotected openings
app.get("/unprotected_opening", async(req, res)=>{
    try {
        res.render("pages/unprotected_opening", {
        });
    } catch (err) {
        console.error(err.message);
    }
})

//Displays page for upo chart lookups
app.get("/upo_charts", async(req, res)=>{
    try {
        res.render("pages/upo_charts", {
        });
    } catch (err) {
        console.error(err.message);
    }
})

app.listen(PORT, () => {
    console.log("server running on port "+PORT);
})