//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://lekhasharmals16:Lekha290858@cluster0.d2gygo3.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => { 

    console.log(`CONNECTED TO MONGO!`);
})
.catch((err) => {
    console.log(`OH NO! MONGO CONNECTION ERROR!`);
    console.log(err);
});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = new mongoose.Schema({
    name : { type: String, required: [true, "No name speified!"]}
});

const ItemModel = mongoose.model("Item", itemsSchema);

const item1 = new ItemModel({name: "Pizza!"});
const item2 = new ItemModel({name: "Burger!"});
const item3 = new ItemModel({name: "Pasta!"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const ListModel = mongoose.model("List", listSchema);
 

app.get("/", function(req, res) {

//const day = date.getDate();

  ItemModel.find({},function(err, foundItems){

   if(foundItems.length === 0){
      ItemModel.insertMany(defaultItems, function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Successfully added all the items to the todolistDB");
        }
      });
      res.redirect("/");
    }
    else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
        //mongoose.connection.close();
        //console.log(items);
        // items.forEach(item => {
        //     console.log(item.name);
        // });
    }
  });
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  //console.log(customListName);

  ListModel.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new ListModel({
          name: customListName,
          items: defaultItems
        });
        list.save();

        res.redirect("/" + customListName);
      }
      else{
        // display the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new ItemModel({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    ListModel.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req,res){
  const selectedCheckeBoxID = req.body.check;
  const listName = req.body.listName;

  if(listName === "Today"){
    ItemModel.findByIdAndRemove(selectedCheckeBoxID, function(err){
      if(!err){
        console.log("item deleted successfully!");
        res.redirect("/");
      }
    });
  }
  else{
    ListModel.findOneAndUpdate({name: listName}, {$pull: {items: {_id: selectedCheckeBoxID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

