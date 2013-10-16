

module.exports = function(config, bot, done) {

  Object.keys(config).forEach(function(word) {

    var response = config[word];

    bot.registerMessageHandler(new RegExp(word), function(channel) {
      channel.say(response);
    });

  });

  done();

};


