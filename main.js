var irc = require('irc'),
    client = new irc.Client('chat.freenode.net', 'gds-infobot', {
       autoConnect: false,
       sasl: true, userName: 'gds-infobot', password: 'iamabot'
    });

/**
 * Should come out like
 * Data In: Notify on 5xx errors (Ralph Cowling finished)
 * http://www.pivotaltracker.com/story/show/55989114
 */
var parsePivotal = function(json){
  m = json;
  message = [
    m.project.name,
    ": ",
    m.changes[0].name,
    " (",
    m.performed_by.name,
    " ",
    m.highlight,
    ")",
    ". ",
    m.primary_resources[0].url,
  ].join('');

  return message;
}

client.addListener('error', function(m) { console.error('ERROR: ', m) });

client.connect(3, function() {

  console.log('Connected to freenode, joining channel...');
  client.join('#gds-performance datababes');
  console.log('Joined channel.');

  var express = require('express'),
      www = express();

  www.post('/pivotal', function(request, response) {
    client.say('#gds-performance', parsePivotal(response));

    request.on('data', function(d) {
      if (d) { console.log(d.toString('utf8')); }
    });
    request.on('close', function() {
      response.end();
    });
  });

  www.post('/github', function(request, response) {
    client.say('#gds-performance', 'Github POSTd');

    request.on('data', function(d) {
      if (d) { console.log(d.toString('utf8')); }
    });
    request.on('close', function() {
      response.end();
    });
  });

  www.listen(9876);

});




