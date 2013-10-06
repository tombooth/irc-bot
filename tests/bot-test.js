
var sinon = require('sinon'),
    testUtil = require('./util.js'),
    Bot = require('../src/bot.js');

var bot, fakePlugin, ircClient, wwwServer;

exports.setUp = function(done) {

  fakePlugin = sinon.stub();
  ircClient = testUtil.mockIRC();
  wwwServer = testUtil.mockWWW();

  Bot.PLUGINS = { "fake-plugin": fakePlugin };
  bot = new Bot(ircClient, 'nick', '#chan', wwwServer);

  done();

}

exports.testPluginRegistration = function(test) {

  bot.registerPlugins({ "fake-plugin": { "foo": "bar" } });

  test.ok( fakePlugin.calledOnce );
  test.equal( fakePlugin.getCall(0).args[0]["foo"], "bar" );
  test.equal( fakePlugin.getCall(0).args[1], bot);

  test.done();

};

exports.testSay = function(test) {

  bot.say('hello!');

  test.ok( ircClient.say.calledOnce );
  test.ok( ircClient.say.calledWithExactly('#chan', 'hello!') );

  test.done();

};

exports.testToBot = function(test) {

  var toBotHandler = sinon.stub(),
      allHandler = ircClient.on.getCall(0).args[1],
      pmHandler = ircClient.on.getCall(1).args[1];

  bot.on('to-bot', toBotHandler);

  allHandler('foo', null, 'hello', null);
  allHandler('foo', null, 'hello nick', null);
  pmHandler('foo', 'hello', null);

  test.ok( toBotHandler.calledTwice );
  test.ok( toBotHandler.getCall(0).calledWithExactly(
        sinon.match.object, 'foo', 'hello nick', null) );
  test.ok( toBotHandler.getCall(1).calledWithExactly(
        sinon.match.object, 'foo', 'hello', null) );

  test.done();

};

exports.testToBotReplyChannel = function(test) {

  var toBotHandler = sinon.stub(),
      allHandler = ircClient.on.getCall(0).args[1];

  bot.on('to-bot', toBotHandler);

  allHandler('foo', null, 'hello nick', null);

  test.ok( toBotHandler.calledOnce );

  channel = toBotHandler.getCall(0).args[0];
  channel.say('hi!');

  test.ok( ircClient.say.calledOnce );
  test.ok( ircClient.say.getCall(0)
      .calledWithExactly('#chan', 'hi!') );

  test.done();

};

exports.testToBotReplyPM = function(test) {

  var toBotHandler = sinon.stub(),
      pmHandler = ircClient.on.getCall(1).args[1],
      channel;

  bot.on('to-bot', toBotHandler);

  pmHandler('foo', 'hello nick', null);

  test.ok( toBotHandler.calledOnce );

  channel = toBotHandler.getCall(0).args[0];
  channel.say('hi!');

  test.ok( ircClient.say.calledOnce );
  test.ok( ircClient.say.getCall(0)
      .calledWithExactly('foo', 'hi!') );

  test.done();

};

exports.testRegisterWebHook = function(test) {

  var hookStub = sinon.stub(),
      json = { },
      response;

  bot.registerWebHook('/hook', hookStub);
       
  response = testUtil.webHookRequest(bot, { body: json });

  test.ok( hookStub.calledOnce);
  test.ok( hookStub.getCall(0).calledWithExactly(json) );
  test.ok( response.end.calledOnce );

  test.done();

};

exports.testRegisterWebHookExploding = function(test) {

  bot.registerWebHook('/hook', function(json) {
    throw new Error('exploded');
  });

  var response = testUtil.webHookRequest(bot, { body: { } });

  test.ok( response.end.calledOnce );

  test.done();

};

exports.testRegisterMessageHandler = function(test) {

  var handler = sinon.stub(),
      allHandler = ircClient.on.getCall(0).args[1];

  bot.registerMessageHandler(/foo/, handler);

  allHandler('user', null, 'nick: foo', null);
  allHandler('user', null, 'nick: foa', null);

  test.ok( handler.calledOnce );
  test.ok( handler.getCall(0).calledWithExactly(
        sinon.match.object, 'user', 'nick: foo', sinon.match.array, null) );

  test.done();

};





