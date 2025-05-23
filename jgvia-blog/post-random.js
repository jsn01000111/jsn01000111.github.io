
window.onload = function() { // Run after elements are loaded
  var posts = document.querySelectorAll('.story, .post-outer-container');

  posts.forEach(p => {
    var parent = p.parentElement;
    p.remove();
    var position = Math.floor(Math.random() * parent.children.length - 1);
    parent.insertBefore(p, parent.children[position]);
  });
};
