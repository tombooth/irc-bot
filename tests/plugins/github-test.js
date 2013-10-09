
var sinon = require('sinon'),
    fs = require('fs'),
    testUtil = require('../util.js'),
    githubPlugin = require('../../src/plugins/github.js');


var commitJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/github-commit.json')),
    pullreqJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/github-pullreq.json')),
    pullreqNoActionJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/github-pullreq-no-action.json')),
    bot;



exports.setUp = function(done) {

  bot = testUtil.mockBot();
  done();

};

exports.testBinding = function(test) {

  githubPlugin({ token: 'foo' }, bot, function() { });

  test.ok( bot.registerWebHook.calledOnce );
  test.ok( bot.registerWebHook.getCall(0).calledWith('/github') );

  test.done();

};

exports.testCommit = function(test) {

  githubPlugin({ token: 'foo' }, bot, function() { });

  testUtil.webHookBodyRequest(bot, commitJSON);

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'irc-bot [master]: tombooth - Enable travis for project https://github.com/tombooth/irc-bot/commit/8ecbbfe71de3660b28c9ad8c85ed7eec91cec3ca');

  test.done();

};

exports.testPullRequest = function(test) {

  githubPlugin({ token: 'foo' }, bot, function() { });

  testUtil.webHookBodyRequest(bot, pullreqJSON);

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'Pull request [opened] test: knabar - Modified README.md https://github.com/knabar/test/pull/4');

  test.done();

};

exports.testPullRequestNoAction = function(test) {

  githubPlugin({ token: 'foo' }, bot, function() { });

  testUtil.webHookBodyRequest(bot, pullreqNoActionJSON);

  test.ok( bot.say.called == false );

  test.done();

};

