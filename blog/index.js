'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var Realm = require('realm');

var app = express();
var counter =0;
let PostSchema = {
  name: 'Post',
  primaryKey: 'id',
  properties:{
    id: 'int',
    timestamp: 'date',
    title: 'string',
    author: 'string',
    content: 'string',
    image: 'string'
  }
}

var blogRealm = new Realm({
  path: 'blog.realm',
  schema: [PostSchema]
});

let count = blogRealm.objects('Post').sorted('id', true);
if(count[0] != null)
  counter = count[0].id;
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/views/assets'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  let posts = blogRealm.objects('Post').sorted('timestamp', true);
  res.render('pages/index', {posts: posts});
});
app.post('/', function(req,res){
  var j = parseInt(req.body.number);
  let ids = blogRealm.objects('Post').filtered('id ==' + j);
  res.redirect('/edit/'+ ids[0].id);
});

app.get('/about', function(req, res){
    res.render('pages/about');

});

app.get('/write', function(req, res){
  res.render('pages/write');
});

app.get('/edit/:postID', function(req, res){
  var j = parseInt(req.params.postID);
  let ids = blogRealm.objects('Post').filtered('id ==' + j);
  if(ids[0] == null)
    res.sendStatus(404);
  else
    res.render('pages/edit', {posts: ids});
});
app.post('/edit', function(req, res){
    var j = parseInt(req.body.number);
  let
    title = req.body['title'],
    author = req.body['author'],
    content = req.body['content'],
    image = req.body['image'],
    timestamp = new Date();
    if(req.body['submit'] == 'Edit'){
      blogRealm.write(()=>{
        blogRealm.create('Post', {id: j, title: title, author:author,
           content: content,image: image, timestamp: timestamp}, true);
      });
    }else if (req.body['submit'] == 'Delete') {
      blogRealm.write(()=>{
        let ids = blogRealm.objects('Post').filtered('id ==' + j);
        blogRealm.delete(ids);
      });
    }


  res.redirect('/');
});

app.post('/write', function(req, res){
  let
    id = ++counter,
    title = req.body['title'],
    author = req.body['author'],
    content = req.body['content'],
    image = req.body['image'],
    timestamp = new Date();

    blogRealm.write(()=>{
      blogRealm.create('Post', {id: id, title: title, author:author,
        content: content,image: image, timestamp: timestamp});
    });
    res.redirect('/');
});

var server = app.listen(5000,"127.0.0.1", function(){
  var host = server.address().address;
	var port = server.address().port;

	console.log("Listening on http://%s:%s", host, port);
});
