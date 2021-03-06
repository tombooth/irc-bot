
function Pivotal(bot, pivotal, config) {

  this._allowedHighlights = config.allow;
  this._bot = bot;
  this._pivotal = pivotal;
  this._projectId = config.projectId
  
  if (!config.token || !config.projectId) {
    console.error("Requires a token and a projectId");
  } else {
    pivotal.useToken(config.token);

    bot.registerWebHook('/pivotal', 
        this._webHookHandler.bind(this));

    bot.registerMessageHandler(/list backlog/, 
        this._listBacklog.bind(this));
  }

}

Pivotal.prototype._listBacklog = function(channel) {

  this._pivotal.getCurrentBacklogIterations(this._projectId,
      this._parseIterations.bind(this, channel));

};

Pivotal.prototype._parseIterations = function(channel, err, json) {

  if (err || !json) console.error("Failed to parse iterations");
  else {
    var out = [];

    json.iteration.forEach(function(iteration) {
      out.push(iteration.start + ' -> ' + iteration.finish);

      iteration.stories.story.forEach(function(story) {
        out.push(
          '[' + story.id + ']' +
          '[' + story.current_state + '] ' + 
          story.name + ' ' + story.url);
      });
    });

    channel.say(out);
  }

};

Pivotal.prototype._webHookHandler = function(json) {

  if (json) {
    if (!this._allowedHighlights || 
        this._allowedHighlights.indexOf(json.highlight) >= 0) {
      this._bot.say(this._parse(json));
    } else {
      console.log('Pivotal update rejected: ' + json.highlight);
    }
  } else {
    console.log('Bad pivotal request');
  }

};

Pivotal.prototype._parse = function(json){
  message = [
    json.project.name,
    ": ",
    json.changes[0].name,
    " (",
    json.performed_by.name,
    " ",
    json.highlight,
    ")",
    ". ",
    json.primary_resources[0].url,
  ].join('');

  return message;
};


module.exports = function(config, bot, done) {

  new Pivotal(bot, require('pivotal'), config);

  done();

};

module.exports.Pivotal = Pivotal;



