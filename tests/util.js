
var sinon = require('sinon');

module.exports = {

  mockBot: function() {
    return {
      www: {
        post: sinon.stub()
      },
      say: sinon.stub()
    };
  },

  webHookRequest: function(bot, request) {
    var webhookHandler = bot.www.post.getCall(0).args[1],
        response = { end: function() { } };

    webhookHandler(request, response);
  }

};
