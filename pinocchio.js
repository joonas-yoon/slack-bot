module.exports = function (req, res, next) {
  var user_name = req.body.user_name;
  
  // avoid infinite loop
  if (user_name === 'slackbot') {
    return res.status(200).end();
  }
  
  var botPayload = null;
  var notFound = false;
  var fs = require('fs');
  var fakeMessages = JSON.parse(fs.readFileSync('pinocchio.dat', 'utf8'));
  
  var rand = function(){return Math.floor(Math.random() * 100000);}
  
  var botPayload = {
    attachments: [
        {
            fallback: user_name+'님을 위한 사실',
            pretext: '그거 아셨나요?',
            text: fakeMessages[rand()%fakeMessages.length],
            color: "#DFA13C",
            mrkdwn_in: ["text"]
        }
    ],
  };
  
  if( notFound )
    res.status(200).end();
  else
    res.status(200).json(botPayload);
};