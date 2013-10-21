

module.exports = function(config, bot, done) {

  // currently only sends a response if addressed to bot
  Object.keys(config).forEach(function(word) {

    var response = config[word];

    bot.registerMessageHandler(new RegExp(word), function(channel) {
      channel.say(response);
    });

  });

  done();

};


