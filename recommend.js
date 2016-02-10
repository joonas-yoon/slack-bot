module.exports = function (req, res, next) {
  var user_name = req.body.text.replace(req.body.trigger_word, '').replace(/(\s)/gi, '');
  
  if(user_name == '')
    user_name = req.body.user_name;
  
  console.log(req.body.user_name +'(for recommed)> '+ user_name);
  
  // avoid infinite loop
  if (req.body.user_name === 'slackbot') {
    return res.status(200).end();
  }
  
  var url = 'http://cubelover.pe.hu/acmicpc/?user=' + user_name;
  
  var request = require('request');
  var cheerio = require('cheerio');
  
  request(url, function(err, resp, body){
    $ = cheerio.load(body);
    
    var botPayload = null;
    var getPid = $("table tr td a[href]");
    var getStar = $("table tr td .bg .fg");
    var result = '';
    var notFound = false;
    for(var i=0; i<3; ++i){
      var temp = getStar[i];
      if(temp && temp.attribs) temp = temp.attribs;
      if(temp && temp.style)   temp = temp.style.toString();
      if(temp && temp.attribs) temp = temp.match(/width\:([0-9]+)/i);
      var getStarStyle = temp;
      
      var getProblemUrl = getPid[i].attribs.href;
      var getStarSize = 0;
      if(getStarStyle != null) getStarSize = parseInt(getStarStyle[1])*.5;
      
      if(getProblemUrl == 'http://icpc.me/1000'){
        notFound = true;
        break;
      }
      
      result += getProblemUrl +' (★ '+ getStarSize +'/100)\n';
    }
    
    var botPayload = {
      attachments: [
          {
              fallback: user_name+'님을 위한 문제 추천',
              pretext: '이 문제를 풀어보세요!',
              text: result + '\n\n<' + url +'|문제 추천 더 보기>',
              color: "#9b59b6",
              mrkdwn_in: ["text"]
          }
      ],
    };
    
    if( notFound )
      res.status(200).end();
    else
      res.status(200).json(botPayload);
      
  });
};