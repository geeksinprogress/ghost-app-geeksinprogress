# ghost-app-geeksinprogress
Ghost App that allows the Geeks in Progress site to display podcasts differently than other posts and generate the correct rss feed for (http://geeksinprogress.com/tag/podcast/rss/)[http://geeksinprogress.com/tag/podcast/rss/]

## Install
sqlite3 content/data/ghost.db
> update settings set value = '["geeksinprogress"]' where key = 'activeApps';
