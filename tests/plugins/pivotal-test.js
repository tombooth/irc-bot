
var sinon = require('sinon'),
    fs = require('fs'),
    testUtil = require('../util.js'),
    pivotalPlugin = require('../../src/plugins/pivotal.js');


var changeJSON = JSON.parse(fs.readFileSync(__dirname + '/fixtures/pivotal-change.json')),
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

  testUtil.webHookRequest(bot, { body: changeJSON });

  test.ok( bot.say.calledOnce );
  test.equal( bot.say.getCall(0).args[0],
      'Data In: Notify on 5xx errors (Tom Booth finished). http://www.pivotaltracker.com/story/show/55989114');

  test.done();

};


