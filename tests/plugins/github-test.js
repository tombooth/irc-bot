
var sinon = require('sinon'),
    fs = require('fs'),
    githubPlugin = require('../../src/plugins/github.js');


var commitJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/github-commit.json')),
    pullreqJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/github-pullreq.json')),
    response = { end: function() { } },
    bot;



exports.setUp = function(done) {

  bot = {
    www: {
      post: sinon.stub()
    },
    say: sinon.stub()
  };

  done();

};

exports.testBinding = function(test) {

  githubPlugin({ token: 'foo' }, bot, function() { });

  test.ok( bot.www.post.calledOnce );
  test.ok( bot.www.post.getCall(0).calledWith('/github') );

  test.done();

};

exports.testCommit = function(test) {

  githubPlugin({ token: 'foo' }, bot, function() { });

  var webhookHandler = bot.www.post.getCall(0).args[1],
      request = { body: commitJSON };

  webhookHandler(request, response);

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'irc-bot [master]: tombooth - Enable travis for project https://github.com/tombooth/irc-bot/commit/8ecbbfe71de3660b28c9ad8c85ed7eec91cec3ca');

  test.done();

};

exports.testPullRequest = function(test) {

  githubPlugin({ token: 'foo' }, bot, function() { });

  var webhookHandler = bot.www.post.getCall(0).args[1],
      request = { body: pullreqJSON };

  webhookHandler(request, response);

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'Pull request [opened] test: knabar - Modified README.md https://github.com/knabar/test/pull/4');

  test.done();

};


