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

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "SCAN_SITE_FOR_EMBEDDINGS") {
        // let data = await fetch("http://localhost:8000/extract?url=https://nytimes.com&scanType=brief")
        // sendResponse({feeds : data});
        // data.then(async (res) => {
        //   // let result = await res.json()
        // }).catch(err => {
        //   sendResponse({feeds : []});
        // })
      }
  });