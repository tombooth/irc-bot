var irc = require('irc'),
    client = new irc.Client('chat.freenode.net', 'gds-infobot', {
       autoConnect: false,
       sasl: true, userName: 'gds-infobot', password: 'iamabot' 
    });

client.addListener('error', function(m) { console.error('ERROR: ', m) });

client.connect(3, function() {

  console.log('Connected to freenode, joining channel...');
  client.join('#gds-performance datababes');
  console.log('Joined channel.');

  var express = require('express'),
      www = express();

  www.post('/pivotal', function(request, response) {
    client.say('#gds-performance', 'Pivotal POSTd');
    
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




