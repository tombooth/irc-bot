
var sinon = require('sinon'),
    Bot = require('../src/bot.js');

var bot, fakePlugin, ircClient, wwwServer;

exports.setUp = function(done) {

  fakePlugin = sinon.stub();
  ircClient = {
    on: sinon.stub(),
    say: sinon.stub()
  };
  wwwServer = {
    post: sinon.stub()
  };

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

  var toBotHandler = sinon.stub()
      allHandler = ircClient.on.getCall(0).args[1],
      pmHandler = ircClient.on.getCall(1).args[1];

  bot.on('to-bot', toBotHandler);

  allHandler('foo', null, 'hello', null);
  allHandler('foo', null, 'hello nick', null);
  pmHandler('foo', 'hello', null);

  test.ok( toBotHandler.calledTwice );
  test.ok( toBotHandler.getCall(0).calledWithExactly('foo', 'hello nick', null) );
  test.ok( toBotHandler.getCall(1).calledWithExactly('foo', 'hello', null) );

  test.done();

};


