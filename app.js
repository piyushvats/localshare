var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var multer  = require('multer');
var logger = require('morgan');
var url = require("url");
var fs = require('fs');
var app = express();

//app.use(logger('dev'));


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(function (req, resp, next) {    
    //console.log(req.body);
    //console.log(req.url);
    //var querystringresult = querystring.parse(req.url.substring(req.url.indexOf('?') + 1));
    //console.log(querystringresult);
    //req.querystring = querystringresult; //req.url;
    next();
});


var rootpath = '/home/piyush/localserver';
var fileserver = rootpath + '/file_server';
var filprofile = rootpath + '/file_server/misc/';
var filprojprof = rootpath + '/file_server/project/';

app.use(logger('dev'));

var folpath = __dirname + '/views/';
var rootdirpath = __dirname ;

app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req,res,next) {   
  if (fs.existsSync(filprofile)){
      //console.log("found path")
  } 
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var dir = filprofile + req.body.folname +'/'        
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir,{ recursive: true }, (err) => { 
            if (err) {                 
              return console.error(err); 
            }             
        });
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {       
    //var dt =new Date().toISOString().replace(/T/, ' ').replace(/-:/,'').replace(/[^0-9]/g, "").trim() 
    var fnm = file.originalname;
    var dir = filprofile + req.body.folname +'/'+fnm
    console.log("Copied:"+dir);
    cb(null, fnm)
  }  

});

var upload = multer({ storage: storage });

var cpUpload = upload.fields([{ name: 'files', maxCount: 5000 }])
app.post('/upusrfiles', cpUpload, function (req, res, next) {
    var file = req.files;
    console.log("Total files copied:"+file.files.length)        
    if (!file.files.length) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400        
    }
    res.end()  
});



function makepage(req,res,dirlist,prepath)
{    
    var header = '<!DOCTYPE html> <html lang="en"> '+
                   '<head>'+
                   '<meta charset="utf-8">'+
                   '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">'+
                   '<meta name="description" content="">'+
                   '<meta name="author" content="">'+
                   '<title>LocalShare</title>'+
                  '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto|Varela+Round|Open+Sans">'+
                  '<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">'+
                  '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">'+                  
                  '<!-- Bootstrap core CSS -->'+
                  '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">'+
                  '<link rel="shortcut icon" href="">'+
                  '</head>"';
    var body = '<body>'+
                  '<nav class="navbar navbar-expand-lg navbar-dark bg-dark static-top">'+
                    '<div class="container">'+
                    '<h4 class="navbar-brand" >Local Share</h4>'+          
                    
                    '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">'+
                      '<span class="navbar-toggler-icon"></span>'+
                    '</button>'+
                    '<div class="collapse navbar-collapse" id="navbarResponsive">'+
                      '<ul class="navbar-nav ml-auto">'+
                        '<li class="nav-item active">'+
                          '<a class="nav-link" href="/index">Home'+
                            '<span class="sr-only">(current)</span>'+
                          '</a>'+
                        '</li>'+    
                      '</ul>'+
                    '</div>'+
                    '</div>'+
                  '</nav>';

    var bodycontent = '<div class="container">'+
                        '<div class="form-group input-group mb-">'+
                          '<div class="text-center card" style="width: 300rem;">'+
                            '<div class="card-body">'+
                              '<div>';

    var endbodycontent = '</div></div></div></div></div></body></html>';
    var dirpart = "";
    var temppath = fileserver + prepath ;
    if(prepath == "/")
          prepath = "";    
    for(var i=0;i<dirlist.length;i++)
    { 
       //var stats = fs.statSync(temppath+'/'+dirlist[i]);
       dirpart = dirpart + '<a href="/showdir?prepath='+prepath+'/'+dirlist[i]+'" >'+dirlist[i]+'</a></br>';

/*       if(stats.isDirectory())
       {        
          dirpart = dirpart + '<a href="/showdir?prepath='+prepath+'/'+dirlist[i]+'/" >'+dirlist[i]+'</a></br>';
       } else {
          dirpart = dirpart + '<a href="/showdir?prepath='+prepath+'/'+dirlist[i]+'" >'+dirlist[i]+'</a></br>';
       }*/
    }

    var htmlpage = header + body + bodycontent + dirpart + endbodycontent ;
    res.send(htmlpage);
}

app.get("/showdir",function(req,res){
    var postdata = req.query;
    var prepath = postdata.prepath;
    var finalpath = fileserver + prepath
    
    var flist = []

    var stats = fs.statSync(finalpath);
    if(stats.isDirectory())
    {
        fs.readdirSync(finalpath).forEach(file => {
          console.log(file);
          flist.push(file)
        });

        makepage(req,res,flist,prepath)                
    } else {
        res.sendFile(finalpath); 
    }   

});


app.get("/index",function(req,res){
  res.sendFile(folpath + "index.html");  
});

app.get("/",function(req,res){
  res.sendFile(folpath + "index.html");  
});

app.get("*",function(req,res){    
  res.sendFile(folpath + "error.html");  
});

/*router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});*/



module.exports = app;