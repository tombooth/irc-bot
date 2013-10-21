
var fs = require('fs');

module.exports = function(config, bot, done) {

  if (!config.path) {
    console.error('You need to provide out_path on the config for this plugin, relative to the CWD.');
    return;
  }

  var outStream = fs.createWriteStream(
    process.cwd() + '/' + config.path, { 
      encoding: 'utf8',
      flags: 'a'
    });

  outStream.on('open', function() {

    bot.ircClient.addListener('message', function(nick, to, text, message) {
      
      var log = JSON.stringify({
        nick: nick,
        to: to,
        text: text,
        message: message
      });

      outStream.write(log + '\n', 'utf8');

    });

  });

  outStream.on('error', function(err) {
    console.error('History writer error:');
    console.error(err);
  });

  done();

};


