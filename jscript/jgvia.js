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
