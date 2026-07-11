(function () {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    window.location.replace("/");
    return;
  }

  const dest = "/?post=" + encodeURIComponent(slug);

  fetch("../content-lab/manifest.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (posts) {
      const post = posts.find(function (p) {
        return p.slug === slug;
      });
      if (post) {
        const fullTitle =
          post.title + " — AI System Designs for Production for Production";
        const desc =
          post.description || "Engineering playbooks for modern AI stacks.";
        const url =
          "https://sayan1999.github.io/articles/share.html?slug=" +
          encodeURIComponent(slug);

        document.title = fullTitle;
        document
          .querySelector('meta[name="description"]')
          .setAttribute("content", desc);
        document.getElementById("og-title").setAttribute("content", fullTitle);
        document.getElementById("og-desc").setAttribute("content", desc);
        document.getElementById("og-url").setAttribute("content", url);
        document.getElementById("tw-title").setAttribute("content", fullTitle);
        document.getElementById("tw-desc").setAttribute("content", desc);
      }
      window.location.replace(dest);
    })
    .catch(function () {
      window.location.replace(dest);
    });
})();
