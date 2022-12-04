const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use('/public', express.static('public'));
mongoose.connect("mongodb+srv://admin-SAPTA:Test1234@cluster0.2sgcowp.mongodb.net/todolistDB", {useNewUrlParser: true});

const todolistSchema = new mongoose.Schema({
  name: String });
const todolistModel = mongoose.model("todolistModel", todolistSchema);

const todolistDocument1 = new todolistModel({
  name: "Learning "
})

const todolistDocument2 = new todolistModel({
  name: "Web"
})

const todolistDocument3 = new todolistModel({
  name: "developmemnt"
})

const allDocuments = [todolistDocument1, todolistDocument2, todolistDocument3];

const listSchema = {
  name: String,
  items: [todolistSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    todolistModel.find({}, function(err, foundItems){

  if(foundItems.length === 0){
    todolistModel.insertMany(allDocuments, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully saved default items to DB.");
      }
       });
       res.redirect("/");
    }
    else{
    res.render("list", { listTitle: "Today", newListItems: foundItems});
   }
   });

});

app.post("/", (req, res) => {
   const itemName = req.body.newItem;
   const listName = req.body.list;

   const item = new todolistModel({
    name: itemName
   });
    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }
    else{
       List.findOne({name: listName}, function(err, foundList){
         if(!err){
           foundList.items.push(item);
           foundList.save();
           console.log(listName);
           res.redirect("/" + listName);
          }

          });
       }

  });

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){

       //Create a new list
       const list = new List({
         name: customListName,
         items: allDocuments
       });
         list.save();
         res.redirect("/" + customListName);
      }
      else{

         //Show an existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
          }
             }
        });

      });

app.post("/delete", (req,res) => {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

   if(listName === "Today"){
     todolistModel.findByIdAndRemove(checkedItemId, function(err){
     if(!err){
     console.log("Removed Successfully !");
     res.redirect("/");
       }
    })
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }
 });


app.listen(3000, () => {
console.log("Server started on port 3000");
})
