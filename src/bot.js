
var util = require('util'),
    events = require('events'),
    domain = require('domain'),
    fs = require('fs');


function Bot(ircClient, ircNick, ircChannel, www) {

  events.EventEmitter.call(this);
 
  this.ircClient = ircClient;
  this.ircNick = ircNick;
  this.ircChannel = ircChannel;
  this.www = www;

  this._messageHandlers = [ ];

  this.ircClient.on('message', this._listenForMe.bind(this));
  this.ircClient.on('pm', this._listenForPM.bind(this));

  this.on('to-bot', this._matchMessageHandler.bind(this));

}

util.inherits(Bot, events.EventEmitter);

Bot.prototype.registerPlugins = function(pluginConfig) {

  var pluginNames = Object.keys(pluginConfig),
      bot = this;

  function registerPlugin(i) { 
    if (i >= pluginNames.length) return;
    else {
      var pluginName = pluginNames[i],
          plugin;

      console.log('Registering ' + pluginName + '...');

      plugin = Bot.PLUGINS[pluginName];
      plugin(pluginConfig[pluginName], bot, function() {
        console.log('Registered.');
        registerPlugin(++i);
      });
    }
  }

  registerPlugin(0);

};

Bot.prototype.registerWebHook = function(path, fn) {

  this.www.post(path, function(request, response) {

    var d = domain.create();

    d.add(request);
    d.add(response);

    d.on('error', function(err) {
      console.error('Web Hook Domain Error:', request.originalUrl);
      console.error(request.query);
      console.error(request.body);
      console.error(err.stack);
      response.end();
    });

    d.run(function() {
      try {
        fn(request.body);
      } catch (err) {
        console.error('Web Hook Run Error:', request.originalUrl);
        console.error(request.body);
        console.error(err.stack);
      }
      response.end();
    });

  });
};

Bot.prototype.registerMessageHandler = function(pattern, fn) {
  this._messageHandlers.push({
    pattern: pattern,
    fn: fn
  });
};

Bot.prototype.say = function(message) {
  this.ircClient.say(this.ircChannel, message);
};


Bot.prototype._matchMessageHandler = function(chan, nick, text, message) {

  var messageHandler, match;

  for (var i = 0; i < this._messageHandlers.length; i++) {
    messageHandler = this._messageHandlers[i];
    match = messageHandler.pattern.exec(text);

    if (match) {
      messageHandler.fn(chan, nick, text, match, message);
    }
  }

};

Bot.prototype._listenForMe = function(nick, to, text, message) {
  if (text.indexOf(this.ircNick) >= 0) {
    this.emit('to-bot',
      { say: this.say.bind(this) },
      nick,
      text,
      message
    );
  }
};

Bot.prototype._listenForPM = function(nick, text, message) {
  this.emit('to-bot',
    { say: this.ircClient.say.bind(this.ircClient, nick) },
    nick,
    text,
    message
  );
};

Bot.PLUGINS = fs.readdirSync(__dirname + '/plugins')
                .filter(function(path) { return /.*\.js$/.test(path); })
                .reduce(function(map, path) { 
                  map[path.substring(0, path.length - 3)] = 
                    require(__dirname + '/plugins/' + path);
                  return map;
                }, {});

module.exports = Bot;



