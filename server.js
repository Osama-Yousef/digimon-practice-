'use strict';
// requierment

require('dotenv').config();

// application dependencies ( getting the libraries)

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodOverRide = require('method-override') // for lab 13(update and delete)

//main variables( application setup)


const PORT = process.env.PORT || 3030;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

// uses 

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverRide('_method')) 
app.use(cors());

//listen to port

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`)
    })
  }) 


////////////////////////////////////////////////

// for check that server is working 
/*
app.get('/',homeHandler)

function homeHandler(req,res){
    res.status(200).send('it works ');
}

*/
//////////////////////////////////////

//***********(Routs Definitions )**********\\
app.get('/',homeHandler)
app.get('/addToDb', addToDbHandler)
app.get('/selectData', selectDataHandler)
app.get('/details/:digi_id', detailsHandler)// the : or param means that this value is a variable so this line means (that digi_id is a variable )
app.put('/update/:update_id', updateHandler) // update_id is any name we use it later in fun.
                            // : we put it in the route defin. just to do the collect in the request

app.delete('/delete/:delete_id' , deleteHandler)

//***********(Routs Handlers)**********\\

//***********(homePageHandler)**********\\

// in our exam we didnt have api key or any query 
// we want to render all things from api on the index page 


function homeHandler(req, res) {
  let url = `https://digimon-api.herokuapp.com/api/digimon`; // the link who has the data
  superagent.get(url)
      .then(data => { // in our exam we have simple array of objects so req.body will make us reach to any property directly
          let digiArray = data.body.map(val => { // we want to map over each element in array // data.body represent the array of objects so we use map directly 
              return new Digimons(val) // creating new object depending on our constructor and do the return inside the digiArray variable that will used for index
          })                            // now go to make the constructor 
          res.render('index', { data: digiArray }) // we want to render on index page so we must put the path for it (but we put just 'index' because the server.js is already always exists in the route  of views folder so we just write the path like we did )
      })                       // { data: digiArray } , we want to know what to render and the answer is (digiArray),and data is just a key for it
}

// the constructor function

// note : the properties in the left must be the same names in the table (schema.sql)
function Digimons(val) { // val represent the returned object (each object in the array) so we said val.property directly
  this.name = val.name || 'no name'; // so now we make new property and store in it the (name) from the url
  this.image= val.img || 'no img'; // img : as the name from the url
  this.level = val.level || 'no level' ;
}
// ( we did no name ,no img , no level)  because if the url didnt have value for name or image or the level -- so the value will be like this and the code will run correctly
// after doing all the above -->>> now go to index.ejs 
// after doing the form and get the values we need now to do the action /addToDb and make function for it as below 


//*******************\\ 
// this function(route) just will do inserting to db
function addToDbHandler(req,res){

// collect the data (first step)
let { name, image, level} = req.query; // name ,level,image is the value for (name) attribute in the form
     // importanttttt (req.body) when the method is (post , PUT,DELETE) , and (req.body) when method is (get)
                // our form is GET method so we used req.query
// insert the data
let sql= `INSERT INTO digi_test (name , image ,level) VALUES ($1,$2,$3);`; // $... THIS TO MAKE SECURE VALUES
let safeValues= [ name,image,level] ; // now the values is stored 

client.query(sql,safeValues).then(()=>{ // here there is no result so we put ()

res.redirect('/selectData') // this route will do the selecting the data to render them in/from db
                            // now do a route definition for it and a function above 
})                    // redirect : have one parameter just , and its pirpose is to activate this route inside it 

}
// now write the function below
///////////////////////////////
// this function to do the selecting all pokemons and rendering process on the favourite page from the db
function selectDataHandler(req,res){
let sql= `SELECT * FROM digi_test ;`;
client.query(sql).then(result=>{ // here we needed the (result ) because this function have results not like the func before because inserting process have no result 

res.render('pages/favorite' , {data: result.rows}) // path of favorite page to render on it 

})
 
}

// now we need to go to the favorite page (favorite.ejs) to add some code there
// and adding the (show details ) button

//************************************\\ 
function detailsHandler(req,res){
// note : we use the param in the (detail,update,delete) because we will work on just one pokemon so we need the param 
// when we use the param we must do these steps below :

// collect param value to determine the pokemon i want 
let param= req.params.digi_id;//digi_id is a variable  

// select the pokemon (element) where id=param (selecting just one thing not lke before for all thngs )
let sql= `SELECT * FROM digi_test WHERE id=$1 ;` ;//$1 is the safe value that i will give for it
let safeValue=[param]; // its just one thing (one element)
client.query(sql,safeValue).then(result=>{ // here is selecting so we have result
res.render('pages/details' , {data: result.rows[0]}) // this line means we want to make render from  (data)   on the details page which have path pages/details
                             // result.rows[0] because its array of one object justtt
                            // so there is no forEach in details page 
})
}

// now go to details page and write some code

//**************************************************************************\\ 


function updateHandler(req,res){
//collect the param value (coz we deal with param so this is first step)
let param=req.params.update_id;
// collect the updated data 
let { name, image, level} = req.body; // req.body here because in PUT/DELETE/POST we use this
// update where the id=param value
let sql=`UPDATE digi_test SET name=$1, image=$2, level=$3 WHERE id =$4 ;`;
let safeValues=[name,image,level,param]; // importantttt :: we must add param into array , else we will have errors
client.query(sql,safeValues).then(()=>{ // just will redirect me so there is no result here because UPDATE / INSERT / DELETE command doesnt return anythinggg

  res.redirect(`/details/${param}`)     // we want to redirect to the same page which is (details page) , and its route is /details/id for the element , so we wrote /details/${param} because id=param  and param points to the id for this element

})

}

// now we want to make the delete 
// go to details page to add the delete button then we will do deleteHandler below 

 
//*************************************************************************************\\ 

//noteeeeeeeee ::::::: alwaysssss redirectttttttt doesnt neeeeed any resulttttt (result )  and takes just one parameter whis is the route to redirect to it 

function deleteHandler(req,res){

// must do : collect the  param value 
let param=req.params.delete_id;
// delete where id=param value (no need to collect data like the update)
let sql=`DELETE FROM digi_test WHERE id = $1 ;`;
let safeValue=[param];
client.query(sql,safeValue).then(()=>{ 

  res.redirect('/selectData') // we want to redirect to my favourite page which its route is /selectData

}
)

}
 

// now exam is finished but we want to go to index.ejs to make the form hidden
// adding  button with class and give class for the form 
// then adding link for jquery and app.js below the page
// then go to app.js and write the code 
//***** NOTE : i did alone the hidden form for updating in details page (see it) , i added a button and added a div includes form and button then i did the steps above so the hidden form is created  **********/

  //========================================\\
//error handlers


function errorHandler(err, req, res) {
    res.status(500).send(err);
  }
  
  //========================================\\
  
  
  function notFoundHandler(req, res) {
    res.status(404).send('This route does not exist!!'); // or the message ( page not found)
  }
  