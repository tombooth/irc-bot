
var sinon = require('sinon'),
    fs = require('fs'),
    testUtil = require('../util.js'),
    pivotalPlugin = require('../../src/plugins/pivotal.js');


var finishedJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/pivotal-finished.json')),
    startedJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/pivotal-started.json')),
    bot;



exports.setUp = function(done) {

  bot = testUtil.mockBot();
  done();

};

exports.testBinding = function(test) {

  pivotalPlugin({ }, bot, function() { });

  test.ok( bot.www.post.calledOnce );
  test.ok( bot.www.post.getCall(0).calledWith('/pivotal') );

  test.done();

};

exports.testChange = function(test) {

  pivotalPlugin({ }, bot, function() { });

  testUtil.webHookRequest(bot, { body: finishedJSON });

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'Data In: Notify on 5xx errors (Tom Booth finished). http://www.pivotaltracker.com/story/show/55989114');

  test.done();

};

exports.testChangeAllowed = function(test) {

  pivotalPlugin({ allow: ['started'] }, bot, function() { });

  testUtil.webHookRequest(bot, { body: finishedJSON });
  testUtil.webHookRequest(bot, { body: startedJSON });

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'Data In: Notify on 5xx errors (Tom Booth started). http://www.pivotaltracker.com/story/show/55989114');

  test.done();

};


