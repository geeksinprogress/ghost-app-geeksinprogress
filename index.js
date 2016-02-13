var GhostApp = require('ghost-app'),
    Showdown = require('showdown-ghost'),
    converter = new Showdown.converter({extensions: ['ghostgfm', 'footnotes', 'highlight']}),
    frontMatter = require('gray-matter');

var delimeter = '+++';
var frontMatterOptions = {
    delims: [delimeter,delimeter]
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
	var regexDelimeter = delimeter.replace(/\+/g,'\\+');
	var regexString = '<p>'+regexDelimeter+'[\\S\\s]*'+regexDelimeter+'<\\/p>';
	console.log(regexString);
	var finder = new RegExp(regexString,'m');
	return text.replace(finder,"");
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

		//cleanup front matter from description and content
		var contentEncoded = item.custom_elements[0]['content:encoded'];
		contentEncoded._cdata = ignore(contentEncoded._cdata);
		item.description = ignore(item.description);
        return item;
    },
    rssFeedFrontMatter: function(feed) {

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
    },
    deactivate: function () {}
});

module.exports = GeeksInProgress;
