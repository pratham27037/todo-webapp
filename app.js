const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-pratham:test1234@cluster0.zmtfz.mongodb.net/todolistDB",{ useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
  name : String
})

const Item = mongoose.model("Item",itemSchema);

const item1 =new Item({
  name: "Food"
})

const item2 =new Item({
  name: "work"
})

const item3 =new Item({
  name: "sleep"
})

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("List",listSchema);

app.get("/", (req, res) => {

  Item.find((err,founditems)=>{

    if (founditems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("succefully saved");
        }
      })
      res.redirect("/");
    }else{
    res.render("list", {
      listTitle:"Today",
      newlistItem: founditems
    });
  }
  })


})

// app.get("/work",(req,res)=>{
//   res.render("list",{listTitle:"Work List",newlistItem: workItems});
// });

app.get("/:paramname",(req,res)=>{
  const customListName = _.capitalize(req.params.paramname);

  List.findOne({name: customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show existing list
        res.render("list",{listTitle:foundList.name,newlistItem:foundList.items})
      }
    }
  })
});

// app.post("/work",(req,res)=>{
//   let item = req.body.newitem;
//   workItems.push(item);
//   res.redirect("/work");
// })

app.post("/",(req,res)=>{
const itemName = req.body.newitem;
const listName = req.body.list;

const item = new Item({
  name:itemName
})

if(listName === "Today"){
  item.save();
res.redirect("/");
}else{
  List.findOne({name:listName},(err,foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })
}

})

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("succefully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
})

let port = process.env.PORT;
if(PORT == null || port == ""){
  port = 3000;
}

app.listen(port, () => {
  console.log("server started");
})
