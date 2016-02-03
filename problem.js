module.exports = function (req, res, next) {
  var problem_id = req.body.text.replace(req.body.trigger_word+' ', '');
  
  var request = require('request');
  var cheerio = require('cheerio');
  
  var url = 'http://www.acmicpc.net/problem/' + problem_id;
  
  request(url, function(err, resp, body){
    $ = cheerio.load(body);
    getTitle = $('title').text();
    getInfo = $("table#problem-info tbody tr td");
    getInfoHead = $("table#problem-info thead tr th");
    
    infomations = [];
    
    // $(getInfoHead).each(function(i, head){
    //   infomations.push({
    //     title: $(head).text(),
    //     short: true
    //   })
    // });
      
    // $(getInfo).each(function(i, info){
    //   infomations[i].value = $(info).text();
    // });
    
    infomations.push({
      title: "시간/메모리 제한",
      value: $(getInfo[0]).text() + '/' + $(getInfo[1]).text(),
      short: true
    });
    
    infomations.push({
      title: "맞은 사람/제출 (비율)",
      value: $(getInfo[2]).text() + '/' + $(getInfo[4]).text() + ' ('+ $(getInfo[5]).text() +')',
      short: true
    });
    
    description = $("#problem_description").text().replace(/(^\s*)|(\s*$)/gi, "");
    descriptLimit = 200;
    
    var botPayload = {
      notFound: getTitle !== 'Baekjoon Online Judge',
      attachments: [
          {
              // "fallback": "New ticket from Andrea Lee - Ticket #1943: Can't rest my password - https://groove.hq/path/to/ticket/1943",
              // "pretext": "New ticket from Andrea Lee",
              title: getTitle,
              title_link: url,
              fields: infomations,
              text: description.substr(0, descriptLimit)+(description.length > descriptLimit ? '...':''),
              color: "#7CD197",
          }
      ],
    };
    
    if (req.body.user_name !== 'slackbot' && isNaN(problem_id) == false) {
      if( botPayload.notFound )
        res.status(200).json(botPayload);
      else
        res.status(200).end();
    }
  });
  
  // avoid infinite loop
  if (req.body.user_name !== 'slackbot' && isNaN(problem_id) == false) {
    // return res.status(200).json(botPayload);
  } else {
    return res.status(200).end();
  }
}