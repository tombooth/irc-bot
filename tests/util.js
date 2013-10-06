
var sinon = require('sinon');

function mockIRC() {
  return {
    on: sinon.stub(),
    say: sinon.stub()
  };
}

function mockWWW() {
  return {
    post: sinon.stub()
  };
}

module.exports = {

  mockIRC: mockIRC,
  mockWWW: mockWWW,

  mockBot: function() {
    return {
      www: mockWWW(),
      ircClient: mockIRC(),
      registerWebHook: sinon.stub(),
      say: sinon.stub()
    };
  },

  webHookRequest: function(bot, request) {
    var webhookHandler = bot.www.post.getCall(0).args[1],
        response = { end: sinon.stub() };

    webhookHandler(request, response);

    return response;
  },

  webHookBodyRequest: function(bot, body) {
    var handler = bot.registerWebHook.getCall(0).args[1];
    handler(body);
  }

};
