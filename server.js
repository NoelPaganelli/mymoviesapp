var express = require('express');
var request = require('request');
var mongoose= require('mongoose');
var session = require("express-session");
var Trello  = require("node-trello");
 
mongoose.connect('mongodb://localhost/mymoviesapp' , function(err) {

});

var movieSchema = mongoose.Schema({
    original_title: String,
    overview: String,
    poster_path: String,
    id: Number
});
var MovieModel = mongoose.model('moviesLike', movieSchema);

var userSchema = mongoose.Schema({
    login: String,
    password: String
  },
  { collection: 'userslist' }
);
var UserModel = mongoose.model('userslist', userSchema);


var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(
 session({ 
  secret: 'a4f8071f-c873-4447-8ee2',
  resave: false,
  saveUninitialized: false,
 })
);

app.get('/', function (req, res) {
  request("https://api.themoviedb.org/3/discover/movie?api_key=1ca44169216245030924859d77648835&language=fr-FR&region=fr&sort_by=popularity.desc&include_adult=false&include_video=false&page=1", function(error, response, body) {
    var body = JSON.parse(body);
    
     MovieModel.find(function (err, movies) {
        res.render('home', { moviesList: body.results, moviesLike:movies});
     })
       
    
  });
});


//var isLog = false;

app.get('/review', function (req, res) {
  console.log(req.query.email+' // '+req.query.motdepasse);
  
   UserModel.find(function (err, userList) {
  
    for(var i=0; i<userList.length; i++) {
      console.log(userList[i].login+' / '+userList[i].password);
      if(req.query.email == userList[i].login) {
        if(req.query.motdepasse == userList[i].password) {
          //isLog = true;
          req.session.isLog = true;
        }
      }
    }
    
    if(req.session.isLog == true) {
      MovieModel.find(function (err, movies) {
        res.render('review', {moviesList : movies});
      })
    } else {
       res.redirect('/login');
    }
  
   });
    
  if(req.query.email == "noel@lacapsule.academy") {
     console.log("email OK");
     if(req.query.motdepasse == "riri") {
        console.log("email et mot de passe OK");
        isLog = true;
    }
  }

 

});

app.get('/contact', function (req, res) {
  res.render('contact');
});

app.get('/addcontact' , function(req, res) {
  
  var t = new Trello("568526dad1bd8f7874fadea91a432cdd", "29d125a99ba731091e55d920686c23dd41cf1f5c9ed272d70ba306e6130bb17f");
  t.post("/1/cards",  { idList : "57d278fee99551079c5ce0f0", name: req.query.lastName+' / '+req.query.email }, function(err, data) {
    res.render('contactconfirm');
  });

})


app.get('/single', function (req, res) {
  request("https://api.themoviedb.org/3/movie/"+req.query.id+"?api_key=1ca44169216245030924859d77648835&language=fr-FR", function(error, response, body) {
    var body = JSON.parse(body);
    res.render('single', { movie: body});
  });
});

app.get('/login', function (req, res) {
 res.render('loginform');
});



/*
app.get('/checklogin', function (req, res) {
 
 if(req.query.email == "noel@lacapsule.academy") {
   console.log("email OK");
   if(req.query.motdepasse == "riri") {
      console.log("email et mot de passe OK");
      isLog = true;
   }
 }
 if(isLog == true) {
    res.redirect('/review');
 } else {
    res.render('loginform');
 }
});*/

app.get('/like', function (req, res) {
  
  request("https://api.themoviedb.org/3/movie/"+req.query.id+"?api_key=1ca44169216245030924859d77648835&language=fr-FR", function(error, response, body) {
    var body = JSON.parse(body);
    var movie = new MovieModel ({
     original_title: body.original_title, 
     overview: body.overview, 
     poster_path: body.poster_path,
     id: body.id
    });
    movie.save(function (error, movie) {
       
       res.redirect('/review');
      
    });
  });

});


app.listen(80, function () {
  console.log("Server listening on port 80");
});