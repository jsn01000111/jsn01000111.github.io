function include(file) {

	let script = document.createElement('script');
	script.src = file;
	script.type = 'text/javascript';
	script.defer = true;

	document.getElementsByTagName('head').item(0).appendChild(script);

}

include(
'https://cdn.jsdelivr.net/gh/jsn01000111/jsn01000111.github.io@refs/heads/main/jgvia-blog/x-timeago.js');
include(
'https://cdn.jsdelivr.net/gh/jsn01000111/jsn01000111.github.io@main/jgvia-blog/post-random.js');
include(
'https://cdn.jsdelivr.net/gh/jsn01000111/jsn01000111.github.io@refs/heads/main/jgvia-blog/random-feed.js');



