
var fs = require('fs'),
    configPath = process.cwd() + '/config.json',
    config;

if (!fs.existsSync(configPath)) {
  console.error("No config file found, exiting.");
  return;
}

try {
  config = JSON.parse(fs.readFileSync(configPath).toString('utf8'));
} catch (ex) {
  console.error("Failed to parse config file, exiting.");
  return;
}

var irc = require('irc'),
    clientConfig = { autoConnect: false },
    client;

if (config.irc.nick_password) {
  clientConfig.sasl = true;
  clientConfig.userName = config.irc.nick;
  clientConfig.password = config.irc.nick_password;
}

client = new irc.Client(config.irc.host, config.irc.nick, clientConfig);

client.addListener('error', function(m) { console.error('ERROR: ', m) });

client.connect(3, function() {

  console.log('Connected to irc server, joining channel...');
  client.join(config.irc.channel + 
    (config.irc.channel_password ? (' ' + config.irc.channel_password) : ''));
  console.log('Joined channel.');

  var express = require('express'),
      www = express();

  www.use(express.bodyParser());
  www.listen(config.www.port || 80);

  var Bot = require('./bot.js'),
      bot = new Bot(client, config.irc.channel, www);

  if (config.plugins) bot.registerPlugins(config.plugins);

});




