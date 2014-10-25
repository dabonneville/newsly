var restify = require('restify');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var db = mongoose.connection;
var request = require('request');
var unirest = require('unirest');
var count = 1;

db.on('error', console.error);
db.once('open', function() {
	// Create your schemas and models here.
	var ArticleSchema = new mongoose.Schema({
		id: String,
		picurl: String,
		headline: String,
		trailtext: String,
		url: String
	});

	Article = mongoose.model('Article', ArticleSchema);

	var PreferenceSchema = new mongoose.Schema({
		key: String
	});

	Preference = mongoose.model('Preference', PreferenceSchema);
});

mongoose.connect('mongodb://localhost/test');


function saveNewsToDb(obj){
	console.log(obj.fields.trailText);
	var $, trail;
	try {
		$ = cheerio.load(obj.fields.trailText);
		trail = $.text();
	}
	catch(err){
		//console.log(err);
	}
	var article = new Article({
		id: obj.id,
		picurl: extractImageURI(obj.fields.main),
		headline: obj.fields.headline,
		trailtext: trail,
		url: obj.webUrl
	});

	article.save(function(err, article) {
		if (err) return console.error(err);
	});
}

function fetchNews(req,res){
	var prefs = Preference.find(function(err, preference){
		if (err) console.log();
		var strarray= [];
		for (var i = 0; i< preference.length; i++){
			strarray.push(preference[i].key);
		}
		if (preference.length < 1){
			var data = request('http://content.guardianapis.com/search?api-key=t3myqd7scnfu4t5w8zp7jx4v&show-fields=headline,trailText,main&page='+count+'&page-size=100', function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var jsonData = JSON.parse(body);			
					for (var i = 0; i < jsonData.response.results.length; i++){
						console.log(i);
						saveNewsToDb(jsonData.response.results[i]);
					}
					res.send("write successful");
					count++;
				} else {
					res.send("something went wrong...");

				}
			});
		} else {
			var data = request('http://content.guardianapis.com/search?api-key=t3myqd7scnfu4t5w8zp7jx4v&show-fields=headline,trailText,main&page='+count+'&page-size=100&q='+strarray.toString(), function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var jsonData = JSON.parse(body);			
					for (var i = 0; i < jsonData.response.results.length; i++){
						console.log(i);
						saveNewsToDb(jsonData.response.results[i]);
					}
					res.send("write successful");
					count++;
				} else {
					res.send("something went wrong...");

				}
			});
		}
	});
}

function getAllNews(req,res){
	Article.find(function(err,data){
		res.send(data);
	});
}

function addPrefs(req, res){
	var incomingID = req.params.id;
	Article.findOne( {"_id": incomingID}, function(err, data) {
		var searchtext = data.headline + " " + data.trailtext;
			return getKeywords(searchtext);
	});
	res.send(incomingID);
}


function getKeywords(text){
	var data;
	unirest.post("https://joanfihu-article-analysis-v1.p.mashape.com/text")
	.header("X-Mashape-Key", "2LKLhCuMs2mshs6s3OxvtL2325czp1JNAz8jsnz6QtbmGesuEv")
	.header("Content-Type", "application/x-www-form-urlencoded")
	.field("text", text)
	.field("title", " ")
	.end(function (result) {
		data = result.body.keywords[0];
		var preference = new Preference({
				key:data
		});
		preference.save(function(err, preference){
			if (err) console.error(err);
			console.dir(preference);
			console.log("pref saved");
		});
		return data;
	});
}

function extractImageURI(main){
	try{
		$ = cheerio.load(main);
		var imgurl = $('figure img').attr('src');
		imgurl = imgurl.substring(0, imgurl.length);
		return imgurl;
	}
	catch(err){
		return " ";
	}
}

var server = restify.createServer();

server.get('/getallnews', getAllNews);
server.get('/fetchnews', fetchNews);
server.get('/addPrefs/:id', addPrefs)


server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});



