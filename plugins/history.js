
var fs = require('fs');

module.exports = function(config, irc, www) {

  if (!config.path) {
    console.error('You need to provide out_path on the config for this plugin, relative to the CWD.');
    return;
  }

  var outStream = fs.createWriteStream(
    process.cwd() + '/' + config.path, { 
      encoding: 'utf8',
      flags: 'a'
    });

  irc.addListener('message', function(nick, to, text, message) {
    
    var log = JSON.stringify({
      nick: nick,
      to: to,
      text: text,
      message: message
    });

    outStream.write(log + '\n', 'utf8');

  });

};


