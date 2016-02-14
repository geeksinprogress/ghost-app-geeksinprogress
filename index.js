var GhostApp = require('ghost-app'),
	downsize = require('downsize'),
	Promise = require('bluebird'),
    Showdown = require('showdown-ghost'),
    converter = new Showdown.converter({extensions: ['ghostgfm', 'footnotes', 'highlight']}),
    frontMatter = require('gray-matter');

var frontMatterOptions = {
    delims: ['<!---','--->']
};

var parse = function(post) {
	var extract = frontMatter(post.markdown, frontMatterOptions);
    post.markdown = extract.content;
    post.html = converter.makeHtml(post.markdown);
    post.data = extract.data;
};

var getData = function(text) {
	return frontMatter(text, frontMatterOptions).data;
};

var ignore = function(text) {
	return text.replace(/^<!---[\S\s]*--->/m, "");
};

var GeeksInProgress = GhostApp.extend({
	filters: {
       prePostsRender: [5, 'postFrontMatter'],
       "rss.item": [5, 'rssItemFrontMatter'],
       "rss.feed": [5, 'rssFeedFrontMatter']
    },
    postFrontMatter: function (posts) {
        if (posts instanceof Array) {
            posts.forEach(function(post) {
                parse(post);
            });
        } else {
            parse(posts);
        }
        return posts;
    },
    rssItemFrontMatter: function(item, post) {
    	console.log(post);
		var data = getData(post.markdown);
		console.log(data);
		item.custom_elements[0]['content:encoded']._cdata = ignore(item.custom_elements[0]['content:encoded']._cdata);
		item.description = ignore(item.description);
		if(data.type == 'podcast') {
			if(data.guid) {
				item.guid = data.guid;
			}
			item.enclosure = {
			  'url'  : data.file,
			  'size' : data.size,
			  'type' : 'audio/mpeg'
			}
			item.custom_elements = [
				{'itunes:subtitle': post.meta_description || downsize(ignore(post.html), {words: 15})},
				{'itunes:duration': data.duration},
				{'itunes:explicit': data.explicit || 'yes'}
			];
			if(post.image) {
				item.custom_elements.append({'itunes:image': {_attr: {href: post.image}}});
			}
		}
        return item;
    },
    rssFeedFrontMatter: function(feed) {
		var siteData = {};
		feed.copyright = '© & Ⓟ '+new Date().getFullYear()+' '+feed.title;
    	feed.language = 'en-us';
    	feed.image_url = feed.site_url+'files/logo.jpg';
    	var feedParts = feed.feed_url.split("/");
    	var secure = feedParts[0] == 'https';
    	var domain = feedParts[2];
    	var path = feedParts[3];
    	if('tag' == path) {
    		var type = feedParts[4];
    		if('podcast' == type) {
    			feed.pubDate = new Date().toUTCString();
	    		feed.custom_namespaces = {
	    			itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd"
	    		};
				feed.custom_elements = [
					{'itunes:subtitle': 'Listen in on the geeks in progress'},
					{'itunes:author': feed.title},
					{'itunes:summary': feed.description},
					{'itunes:owner': [
						{'itunes:name': 'Michael Chinn'},
						{'itunes:email': 'apple@mechinn.com'}
					]},
					{'itunes:image': {_attr: {href: feed.image_url}}},
					{'itunes:category': [
						{_attr: {text: 'Games & Hobbies'}},
						{'itunes:category': {_attr: {text: 'Video Games'}}}
					]},
					{'itunes:category': {_attr: {text: 'TV & Film'}}},
					{'itunes:category': [
						{_attr: { text: 'Games & Hobbies' }},
						{'itunes:category': { _attr: { text: 'Hobbies' } }}
					]},
					{'itunes:explicit': 'yes'}
				];
	    	} 
    	}
    	console.log(feed);
        return feed;
    },
    install: function () {},
    uninstall: function () {},
    activate: function () {
    	console.log(this);
    	this.ghost.helpers.register('cond', function (v1, operator, v2, options) {
	        switch (operator) {
	            case '==':
	                return (v1 == v2) ? options.fn(this) : options.inverse(this);
	            case '!=':
	                return (v1 == v2) ? options.fn(this) : options.inverse(this);
	            case '===':
	                return (v1 === v2) ? options.fn(this) : options.inverse(this);
	            case '<':
	                reaturn (v1 < v2) ? options.fn(this) : options.inverse(this);
	            case '<=':
	                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
	            case '>':
	                return (v1 > v2) ? options.fn(this) : options.inverse(this);
	            case '>=':
	                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
	            case '&&':
	                return (v1 && v2) ? options.fn(this) : options.inverse(this);
	            case '||':
	                return (v1 || v2) ? options.fn(this) : options.inverse(this);
	            default:
	                return options.inverse(this);
	        }
	    });
	    this.ghost.helpers.register('eq', function (v1, v2, options) {
	        return (v1 == v2) ? options.fn(this) : options.inverse(this);
	    });
	    this.ghost.helpers.register('ne', function (v1, v2, options) {
	        return (v1 != v2) ? options.fn(this) : options.inverse(this);
	    });
	    this.ghost.helpers.register('lt', function (v1, v2, options) {
	        return (v1 < v2) ? options.fn(this) : options.inverse(this);
	    });
	    this.ghost.helpers.register('le', function (v1, v2, options) {
	        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
	    });
	    this.ghost.helpers.register('gt', function (v1, v2, options) {
	        return (v1 > v2) ? options.fn(this) : options.inverse(this);
	    });
	    this.ghost.helpers.register('ge', function (v1, v2, options) {
	        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
	    });
	    this.ghost.helpers.register('and', function (v1, v2, options) {
	        return (v1 && v2) ? options.fn(this) : options.inverse(this);
	    });
	    this.ghost.helpers.register('or', function (v1, v2, options) {
	        return (v1 || v2) ? options.fn(this) : options.inverse(this);
	    });
    },
    deactivate: function () {}
});

module.exports = GeeksInProgress;
