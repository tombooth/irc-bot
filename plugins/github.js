

module.exports = function(config, irc, www) {

  www.post('/github', function(request, response) {
    irc.say('Github POSTd');

    console.log(request.body);
  });

};
