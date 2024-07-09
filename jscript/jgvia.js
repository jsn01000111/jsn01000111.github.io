        // Function to convert timestamp to "X minutes ago" or formatted date
function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    
    var interval = Math.floor(seconds / 60);
    if (interval < 1) {
        return "just now";
    }
    if (interval < 60) {
        return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    }

    interval = Math.floor(interval / 60);
    if (interval < 24) {
        return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }

    interval = Math.floor(interval / 24);
    if (interval === 1) {
        return "yesterday";
    }
    if (interval < 7) {
        return interval + " days ago";
    }

    // Handle years
    interval = Math.floor(interval / 7);
    if (interval < 52) {
        return interval + " weeks ago";
    }

    interval = Math.floor(interval / 52);
    if (interval === 1) {
        return "1 year ago";
    }

    // For older dates, return the actual date
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month = date.getMonth();
    var day = date.getDate();
    var year = date.getFullYear().toString().substr(-2); // Last two digits of the year

    return months[month] + ' ' + day + ', ' + year;
}
        
        // Apply this function to each timestamp element
        document.addEventListener('DOMContentLoaded', function() {
            var elements = document.getElementsByClassName('published');
            for (var i = 0; i < elements.length; i++) {
                var timestamp = new Date(elements[i].getAttribute('datetime'));
                elements[i].textContent = timeSince(timestamp);
            }
        });

//<![CDATA[
function showLucky(root){
    var feed = root.feed;
    var entries = feed.entry || [];
    var entry = feed.entry[0];
      for (var j = 0; j < entry.link.length; ++j) {
       if (entry.link[j].rel == "alternate") {
       window.location = entry.link[j].href;
       }
      }
   }

function fetchLuck(luck){
    script = document.createElement('script');
    script.src = '/feeds/posts/summary?start-index='+luck+'&max-results=1&alt=json-in-script&callback=showLucky';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
   }
function readLucky(root){
    var feed = root.feed;
    var total = parseInt(feed.openSearch$totalResults.$t,10);
    var luckyNumber = Math.floor(Math.random()*total);
    luckyNumber++;
    fetchLuck(luckyNumber);
    }
function feelingLucky(){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/feeds/posts/summary?max-results=0&alt=json-in-script&callback=readLucky';
    document.getElementsByTagName('head')[0].appendChild(script);
    }
//]]>
