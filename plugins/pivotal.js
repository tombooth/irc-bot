
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

module.exports = function(config, irc, www) {

  www.post('/pivotal', function(request, response) {
    irc.say(parsePivotal(request.body));
    response.end();
  });

};
