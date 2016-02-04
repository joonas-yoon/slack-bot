module.exports = function (req, res, next) {
  var stripedText = req.body.text.replace(/(\s)/gi, '');
  
  console.log(req.body.user_name +' > '+ stripedText);
  
  var showDetail = stripedText.match('자세히|\\+') != null;
  var botQueryString = stripedText.replace(req.body.trigger_word, '').replace('자세히','').replace('\+','');
  
  // avoid infinite loop
  if (req.body.user_name === 'slackbot') {
    return res.status(200).end();
  }
  
  var searchQuery = null;
    
  if( isNaN(botQueryString) == true ){
    searchQuery = stripedText.replace(req.body.trigger_word, '');
  }
  
  var request = require('request');
  var cheerio = require('cheerio');
    
  // 문제 번호가 입력된 상황
  if( !searchQuery ){
    
    var problem_id = botQueryString;
    
    if( isNaN(problem_id) ) res.status(200).end();
    
    var url = 'https://www.acmicpc.net/problem/' + problem_id;
    
    console.log(url);
    
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
        var descriptLimit = 500;
        
        botPayload = {
          notFound: getTitle !== 'Baekjoon Online Judge',
          attachments: [
              {
                  fallback: getTitle + ' - ' + url,
                  // "pretext": "New ticket from Andrea Lee",
                  title: getTitle,
                  title_link: url,
                  fields: infomations,
                  text: '&gt;&gt;&gt; '+ description.substr(0, descriptLimit)+(description.length > descriptLimit ? '...':''),
                  color: "#7CD197",
                  mrkdwn_in: ["text", "pretext"],
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
  else {
    req.headers['referer'] = 'https://www.acmicpc.net/search';
    // console.log(req.headers);
    
    var url = 'https://aewewtnd4p-dsn.algolia.net/1/indexes/*/queries?x-algolia-api-key=40fa3b88d4994a18f89e692619c9f3f3&x-algolia-application-id=AEWEWTND4P&x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.11.0';
    
    var requestBody = {requests:[
      {
        "indexName":"Problems",
        "params":"query=" + searchQuery + "&page=0&facets=%5B%5D&tagFilters="
      }
    ]};

    var options = {
      url: url,
      method: "POST",
      json: true,
      headers: {
        referer: 'https://www.acmicpc.net/search'
      },
      
      body: requestBody
    };

    request(options, function(err, resp, body){
      $ = cheerio.load(body);
      var getResults = body.results[0];
      var problemObject = getResults.hits[0];
      
      // console.log(problemObject);
      
      if( getResults.nbHits < 1 ){
        res.status(200).json({
          text: '검색 결과가 없습니다.'
        });
      }
      else {
        // var description = problemObject.description;
        var description = problemObject._snippetResult.description.value;
        var descriptLimit = 150;
        
        var botPayload = {
          attachments: [
              {
                  fallback: '\''+searchQuery+'\'에 대한 문제 검색',
                  pretext: '혹시 이 문제를 찾고 계신가요?',
                  title: problemObject.id + '번 - ' + problemObject.title,
                  title_link: 'https://www.acmicpc.net/problem/' + problemObject.id,
                  text:
                    description.replace(/<\/?strong>/g, '*').substr(0, descriptLimit)+(description.length > descriptLimit ? '...':'')
                    + '\n\n<' + encodeURI('https://www.acmicpc.net/search#q=' + searchQuery + '&c=Problems')
                    + '|검색 결과 더보기 ('+ getResults.nbHits + '개)>',
                  color: "#9b59b6",
                  mrkdwn_in: ["text"]
              }
          ],
        };
        
        res.status(200).json(botPayload);
      }
    });
  }
};