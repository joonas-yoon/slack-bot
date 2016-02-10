module.exports = function (req, res, next) {
  var user_name = req.body.text.replace(req.body.trigger_word, '').replace(/(\s)/gi, '');
  
  if(user_name == '')
    user_name = req.body.user_name;
  
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
    var getStarStyle = (getStar[0]).attribs.style.toString();
    getStarStyle = getStarStyle.match(/width\:([0-9]+)/i);
    
    var getProblemUrl = getPid[0].attribs.href;
    var getStarSize = 0;
    if(getStarStyle != null) getStarSize = parseInt(getStarStyle[1])*.5;
    
    var botPayload = {
      attachments: [
          {
              fallback: user_name+'님을 위한 문제 추천',
              pretext: '이 문제를 풀어보세요!',
              title: getProblemUrl +' (난이도 '+ getStarSize +'/100)',
              title_link: getProblemUrl,
              color: "#9b59b6",
          }
      ],
    };

    if( botPayload.notFound )
      res.status(200).end();
    else
      res.status(200).json(botPayload);
  });
};