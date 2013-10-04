
var util = require('util'),
    events = require('events');


function Bot(ircClient, ircChannel, www) {

  events.EventEmitter.call(this);
 
  this.ircClient = ircClient;
  this.ircChannel = ircChannel;
  this.www = www;

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

      plugin = require(process.cwd() + '/plugins/' + pluginName + '.js')
      plugin(pluginConfig[pluginName], bot, function() {
        console.log('Registered.');
        registerPlugin(++i);
      });
    }
  }

  registerPlugin(0);

};

Bot.prototype.say = function(message) {
  this.ircClient.say(this.ircChannel, message);
};


module.exports = Bot;



