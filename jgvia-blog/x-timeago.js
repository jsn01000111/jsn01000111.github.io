
function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) {
        return "just now";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days === 1) {
        return "yesterday";
    }
    if (days < 7) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 52) {
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(weeks / 52);
    if (years >= 1) {
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    }

    // Fallback to formatted short date
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2); // e.g., '24'

    return `${months[month]} ${day}, '${year}`;  // ← this line had missing quote
}

document.addEventListener('DOMContentLoaded', function () {
    const elements = document.getElementsByClassName('published');
    Array.from(elements).forEach(el => {
        const datetimeAttr = el.getAttribute('datetime');
        const timestamp = new Date(datetimeAttr);
        if (!isNaN(timestamp)) {
            el.textContent = timeSince(timestamp);
        } else {
            console.warn(`Invalid date: ${datetimeAttr}`);
        }
    });
});

