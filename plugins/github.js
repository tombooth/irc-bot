
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
	mergable = json.mergeable ? '(Mergable)' : '';
    message = [
      pullReq.base.repo.name,
      ": ",
      pullReq.user.login,
      " - ",
      pullReq.title,
      " ",
      pullReq.html_url,
      " ",
      mergable
    ].join('');

    return message;
  },
  parsePush: function(json){
    message = [
      json.repository.name,
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

    if(json){
      if(json.pusher)
        irc.say(gitty.parser.parsePush(json));
      if(json.pull_request)
        irc.say(gitty.parser.parsePullReq(json));
    }

  });

};
