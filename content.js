chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CREATE_FEED") {
      let entries = [];
      const articles = document.querySelectorAll("article");
      if (articles.length > 0) {
        articles.forEach(article => {
          const title = article.querySelector("h1, h2")?.innerText || "Untitled";
          const summary = article.querySelector("p")?.innerText || article.innerText.slice(0, 200);
          entries = [...entries,{
            title,
            summary,
            link: window.location.href,
            timestamp: new Date().toISOString(),
          }]
        });
      } else {
        // Fallback for generic pages (no <article>)
        const paragraphs = [...document.querySelectorAll("h1, h2, p")];
        for (let i = 0; i < paragraphs.length; i += 2) {
          const title = paragraphs[i]?.innerText || "Section";
          const summary = paragraphs[i + 1]?.innerText || "";
          entries = [...entries,{
            title,
            summary,
            link: window.location.href,
            timestamp: new Date().toISOString(),
          }]
        }
      }
      sendResponse({ content: entries });
      return true; // keep message channel open
    }
  });

function getInternalLinks() {
  const anchors = [...document.querySelectorAll('a[href]')];
  const base = location.origin;

  const urls = new Set();

  for (let a of anchors) {
    try {
      const href = new URL(a.href, base);
      if (href.origin === base) {
        urls.add(href.href.split('#')[0]); // remove fragments
      }
    } catch {}
  }

  return [...urls];
}

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "FIND_RSS") {
      try {
        const links = document.querySelectorAll("link[rel='alternate'][type='application/rss+xml']");
        const feeds = [...links].map(link => link.href);
        sendResponse({ feeds });
      } catch (e) {
        sendResponse({ feeds: [] });
      }
    }
  });