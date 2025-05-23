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
