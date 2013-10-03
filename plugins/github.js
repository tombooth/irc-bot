
var read = require('read'),
    GitHubApi = require('github');

function setupHook(user, repo, done) {
}

function setupHooks(username, password, repos, host, done) {
  var splitRepos = repos.map(function(name) { return name.split('/'); }),
      github = new GitHubApi({ version: "3.0.0" });

  github.authenticate({ username: username, password: password, type: 'basic' });

  function setupHook(i) {
    if (i >= splitRepos.length) done();
    else {
      var splitRepo = splitRepos[i],
          user = splitRepo[0],
          repo = splitRepo[1];
 
      console.log('Setting up GitHub hooks for ' + user + '/' + repo);
      
          github.repos.createHook({
            user: user,
            repo: repo,
            name: 'web',
            config: {
              "url": host + "/github",
              "content_type": "json"
            },
            events: ['push', 'issues', 'issue_comment', 'commit_comment', 'pull_request', 'pull_request_review_comment', 'gollum', 'watch', 'release', 'fork', 'member', 'public', 'team_add', 'status' ],
            active: true,
          }, function(err, back) {
            console.log(err ? 'Hook exists' : 'Added hook');
            setupHook(++i);
          });
    }
  }

  setupHook(0);

}

module.exports = function(config, irc, www, done) {

  if (!config.repos || config.repos.length === 0) {
    console.error('No repos defined so exiting early');
    done();
  }

  read({ prompt: 'GitHub username: ' }, function(err, username) {
    read({ prompt: 'GitHub password: ', silent: true }, function(err, password) { 
      setupHooks(username, password, config.repos, config.host, done);
    });
  });

  www.post('/github', function(request, response) {
    var json = request.body;

    console.log(json);
  });

};
