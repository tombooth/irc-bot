
var sinon = require('sinon'),
    fs = require('fs'),
    testUtil = require('../util.js'),
    pivotalPlugin = require('../../src/plugins/pivotal.js');


var finishedJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/pivotal-finished.json')),
    startedJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/pivotal-started.json')),
    iterationsJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/pivotal-iterations.json')),
    bot, config;



exports.setUp = function(done) {

  bot = testUtil.mockBot();
  config = { token: 't', projectId: 1 };
  done();

};

exports.testBinding = function(test) {

  pivotalPlugin(config, bot, function() { });

  test.ok( bot.registerWebHook.calledOnce );
  test.ok( bot.registerWebHook.getCall(0).calledWith('/pivotal') );

  test.done();

};

exports.testChange = function(test) {

  pivotalPlugin(config, bot, function() { });

  testUtil.webHookBodyRequest(bot, finishedJSON);

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'Data In: Notify on 5xx errors (Tom Booth finished). http://www.pivotaltracker.com/story/show/55989114');

  test.done();

};

exports.testChangeAllowed = function(test) {

  config.allow = ['started'];

  pivotalPlugin(config, bot, function() { });

  testUtil.webHookBodyRequest(bot, finishedJSON);
  testUtil.webHookBodyRequest(bot, startedJSON);

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'Data In: Notify on 5xx errors (Tom Booth started). http://www.pivotaltracker.com/story/show/55989114');

  test.done();

};

exports.testBacklogRetrieval = function(test) {

  var pivotal = testUtil.mockPivotal(),
      pluginInstance = new pivotalPlugin.Pivotal(bot, pivotal, config),
      channel = { say: sinon.stub() },
      messageHandler;

  test.ok( bot.registerMessageHandler.calledOnce );

  messageHandler = bot.registerMessageHandler.getCall(0).args[1];
  messageHandler(channel);

  test.ok( pivotal.getCurrentBacklogIterations.calledOnce );

  pivotal.getCurrentBacklogIterations.getCall(0)
    .callArgWith(1, null, iterationsJSON);

  test.equals( channel.say.callCount, 46 );
  test.equals( channel.say.getCall(0).args[0],
      '2013/09/27 00:00:00 BST -> 2013/10/11 00:00:00 BST');
  test.equals( channel.say.getCall(1).args[0],
      '[57913332][accepted] Create a glossary for Backdrop technology http://www.pivotaltracker.com/story/show/57913332');

  test.done();

};








