
var read = require('read'),
    GitHubApi = require('github');


/**
 * Parse the github post-receive hook
 * Should read like:
   * "testing: Garen Torikian -
   * Rename madame-bovary.txt to words/madame-bovary.txt
   * https://github.com/octokitty/testing/commit/1481a2de7b2a7d02428ad93446ab166be7793fbb"
   * and
   * "Hello-World: octocat - Please pull these awesome changes
   * https://api.github.com/octocat/Hello-World/pulls/1"
 */

var gitty = {};

gitty.parser = {

  parsePullReq: function(json){
    var pullReq = json.pull_request,
        mergable = json.mergeable ? ' (Mergable)' : '';
    message = [
      'Pull request ',
      '[',
      json.action,
      '] ',
      pullReq.base.repo.name,
      ": ",
      pullReq.user.login,
      " - ",
      pullReq.title,
      " ",
      pullReq.html_url,
      mergable
    ].join('');

    return message;
  },
  parsePush: function(json){
    var ref = json.ref.split('/').pop();
    message = [
      json.repository.name,
      " [",ref,"]",
      ": ",
      json.pusher.name,
      " - ",
      json.head_commit.message,
      " ",
      json.head_commit.url
    ].join('');

    return message;
  }
}

function setupHooks(github, repos, host, done) {

  if (!repos || repos.length === 0) { done(); return; }

  var splitRepos = repos.map(function(name) { return name.split('/'); });

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

module.exports = function(config, bot, done) {

  var github = new GitHubApi({ version: "3.0.0" });

  if (!config.token) {
    read({ prompt: 'GitHub username: ' }, function(err, username) {
      read({ prompt: 'GitHub password: ', silent: true }, function(err, password) {
        github.authenticate({ username: username, password: password, type: 'basic' });
        setupHooks(github, config.repos, config.host, done);
      });
    });
  } else {
    console.log("Authenticating with OAuth token");
    github.authenticate({ type: 'oauth', token: config.token });
    setupHooks(github, config.repos, config.host, done);
  }

  bot.www.post('/github', function(request, response) {
    var json = request.body;

    if(json){
      if(json.pusher)
        bot.say(gitty.parser.parsePush(json));
      if(json.pull_request)
        bot.say(gitty.parser.parsePullReq(json));
    }

    response.end();

  });

};
