
var sinon = require('sinon'),
    fs = require('fs'),
    testUtil = require('../util.js'),
    wordResponsePlugin = require('../../src/plugins/wordResponse.js');


exports.setUp = function(done) {

  bot = testUtil.mockBot();
  done();

};


exports.testResponse = function(test) {

  var channel = { say: sinon.stub() },
      messageHandler;

  wordResponsePlugin({ 'bucket': 'http://www.youtube.com/watch?v=ZhFw8OlCBJw'},
      bot, function() { });

  test.ok( bot.registerMessageHandler.calledOnce );

  messageHandler = bot.registerMessageHandler.getCall(0).args[1];
  messageHandler(channel);

  test.ok( channel.say.calledOnce );
  test.equals( channel.say.getCall(0).args[0], 'http://www.youtube.com/watch?v=ZhFw8OlCBJw' );

  test.done();


};


