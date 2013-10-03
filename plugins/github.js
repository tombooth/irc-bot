

module.exports = function(config, irc, www) {

  www.post('/github', function(request, response) {
    client.say(config.irc.channel, 'Github POSTd');

    request.on('data', function(d) {
      if (d) { console.log(d.toString('utf8')); }
    });
    request.on('close', function() {
      response.end();
    });
  });

};
