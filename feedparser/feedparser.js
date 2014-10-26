var FeedParser = require('feedparser')
  , request = require('request')
  , count = 0;

function getKeywords(text, title){
 request.post({
url:'https://joanfihu-article-analysis-v1.p.mashape.com/text',
form: {
text: text,
title: title
},
headers: {
"X-Mashape-Key": "LuRENlOH2AmshyBQhe4hTZac6X8Tp1fSgfRjsnM48q2IVoqe2d"
}
}, function(err, httpResponse, body) {
var response = JSON.parse(body);
console.log(response.keywords[0]);
});
}


/***********************************************************************************************************************
 * FEED FROM NEW YORK TIMES
 ***********************************************************************************************************************/

var reqNYT = request('http://rss.nytimes.com/services/xml/rss/nyt/InternationalHome.xml')
  , feedparserNYT = new FeedParser();

reqNYT.on('error', function (error) {
  console.log('something went wrong...');

});
reqNYT.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparserNYT);
});


feedparserNYT.on('error', function(error) {
  console.log('something went wrong...');
  console.log(error);

});

feedparserNYT.on('readable', function() {
    
  var stream = this
    , meta = this.meta 
    , item;
  //for now i have just printed the output, if you want to insert to db, do it within the while loop below
  while (item = stream.read()) {
    //count++;
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ' + item.meta.image.title +' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('title : ' + item.title);
    var regex = /(<([^>]+)>)/ig
    ,   body = item.summary
    ,   description = body.replace(regex, "");
    console.log('description : ' + description);
    console.log('url : ' + item.guid);
    console.log('keywords : ' + getKeywords(item.title,description) );
    console.log('picURL : ' + item.meta.image.url);
    console.log('news source : ' + item.meta.copyright);
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< '+ item.meta.image.title + ' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('\n');
  }
});

/***********************************************************************************************************************
 * FEED FROM TECH CRUNCH
 ***********************************************************************************************************************/

var reqTC = request('http://feeds.feedburner.com/TechCrunch/')
  , feedparserTC = new FeedParser();

reqTC.on('error', function (error) {
  console.log('something went wrong...');

});
reqTC.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparserTC);
});


feedparserTC.on('error', function(error) {
  console.log('something went wrong...');

});

feedparserTC.on('readable', function() {
    
  var stream = this
    , meta = this.meta 
    , item;
  //for now i have just printed the output, if you want to insert to db, do it within the while loop below
  while (item = stream.read()) {
    //count++;
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< '+ item.meta.title +' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('title : ' + item.title);
    var regex = /(<([^>]+)>)/ig
    ,   body = item.summary
    ,   description = body.replace(regex, "");
    console.log('description : ' + description);
    console.log('url : ' + item.guid);
    console.log('keywords : ' + getKeywords(item.title, description));
    console.log('picURL : ' + item.image.url);
    console.log('news source : ' + item.meta.title);
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< '+ item.meta.title +' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('\n');
  }
});

//setTimeout(function(){console.log(count)},2000);









