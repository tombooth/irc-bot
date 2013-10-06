
/**
 * Should come out like
 * Data In: Notify on 5xx errors (Ralph Cowling finished)
 * http://www.pivotaltracker.com/story/show/55989114
 */
var parsePivotal = function(json){
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
}

module.exports = function(config, bot, done) {

  var allowedHighlights = config.allow;

  bot.registerWebHook('/pivotal', function(json) {

    if (json) {
      if (!allowedHighlights || allowedHighlights.indexOf(json.highlight) >= 0) {
	bot.say(parsePivotal(json));
      } else {
        console.log('Pivotal update rejected: ' + json.highlight);
      }
    } else {
      console.log('Bad pivotal request');
    }

  });

  done();

};
