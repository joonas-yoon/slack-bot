module.exports = function (req, res, next) {
  var stripedText = req.body.text.replace(/(\s)/gi, '');
  var showDetail = stripedText.match('자세히|\\+') != null;
  var problem_id = stripedText.replace(req.body.trigger_word, '').replace('자세히','').replace('\+','');
  
  console.log(req.body.user_name +' > '+ stripedText);
  
  // avoid infinite loop
  if (req.body.user_name !== 'slackbot' && isNaN(problem_id) == false) {
    // return res.status(200).json(botPayload);
  } else {
    return res.status(200).end();
  }
  
  var request = require('request');
  var cheerio = require('cheerio');
  
  var url = 'http://www.acmicpc.net/problem/' + problem_id;
  
  request(url, function(err, resp, body){
    $ = cheerio.load(body);
    var getTitle = $('title').text();
    
    var botPayload = null;
    
    if( showDetail === true ){
      var getInfo = $("table#problem-info tbody tr td");
      var getInfoHead = $("table#problem-info thead tr th");
      
      var infomations = [];
      
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
        value: $(getInfo[4]).text() + '/' + $(getInfo[2]).text() + ' ('+ $(getInfo[5]).text() +')',
        short: true
      });
      
      var description = $("#problem_description").text().replace(/(^\s*)|(\s*$)/gi, "");
      var descriptLimit = 200;
      
      botPayload = {
        notFound: getTitle !== 'Baekjoon Online Judge',
        attachments: [
            {
                fallback: getTitle + ' - ' + url,
                // "pretext": "New ticket from Andrea Lee",
                title: getTitle,
                title_link: url,
                fields: infomations,
                text: description.substr(0, descriptLimit)+(description.length > descriptLimit ? '...':''),
                color: "#7CD197",
            }
        ],
      };
    } else {
      botPayload = {
        notFound: getTitle !== 'Baekjoon Online Judge',
        attachments: [
            {
                fallback: getTitle + ' - ' + url,
                title: getTitle,
                title_link: url,
                color: "#36a64f",
            }
        ],
      };
    }
    
    if( botPayload.notFound )
      res.status(200).json(botPayload);
    else
      res.status(200).end();
  });
}