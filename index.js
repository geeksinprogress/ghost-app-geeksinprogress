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
		var data = getData(post.markdown);
		if(data.layout == 'podcast') {
			item.custom_elements.some(function(element) {
				if(element['content:encoded']) {
					item.description = ignore(element['content:encoded']._cdata);
					return true;
				}
			});
			if(data.crew) {
				item.description += " <p>Crew: "+data.crew.join([separator = ', '])+"</p>";
			}
			if(data.guid) {
				item.guid = data.guid;
			}
			item.enclosure = {
			  'url'  : data.file,
			  'size' : data.size,
			  'type' : 'audio/mpeg'
			}
			item.custom_elements = [
				{'itunes:subtitle': data.subtitle ||  post.meta_description || downsize(item.description, {words: 15})},
				{'itunes:duration': data.duration},
				{'itunes:explicit': data.explicit || 'yes'}
			];
			if(post.image) {
				item.custom_elements.push({'itunes:image': {_attr: {href: post.image}}});
			}
		} else {
			item.custom_elements[0]['content:encoded']._cdata = ignore(item.custom_elements[0]['content:encoded']._cdata);
			item.description = ignore(item.description);
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
        return feed;
    },
    install: function () {},
    uninstall: function () {},
    activate: function () {
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
	    this.ghost.helpers.register('join', function(items, block) {
		var delimiter = block.hash.delimiter || ",", 
			start = start = block.hash.start || 0, 
			len = items ? items.length : 0,
			end = block.hash.end || len,
			out = "";

		if(end > len) end = len;

		if ('function' === typeof block) {
			for (i = start; i < end; i++) {
				if (i > start) out += delimiter;
				if('string' === typeof items[i])
					out += items[i];
				else
					out += block(items[i]);
			}
			return out;
		} else { 
			return [].concat(items).slice(start, end).join(delimiter);
		}
	});
    },
    deactivate: function () {}
});

module.exports = GeeksInProgress;
