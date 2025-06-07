document.getElementById("loadRSS").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript( // to exceute and inject the content js file
            {
                target: { tabId: tabId },
                files: ["content.js"],
            },
            () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "FIND_RSS" }, async (response) => {
                    if (!response || !response.feeds.length) {
                        document.getElementById("rssResults").innerText = "No RSS feed found.";
                        return;
                    }

                    const rssUrl = response.feeds[0]; // take first feed
                    document.getElementById("rssResults").innerText = `Found RSS: ${rssUrl}`;

                    const res = await fetch(rssUrl);
                    const xmlText = await res.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                    const items = xmlDoc.querySelectorAll("item");

                    const feed = [...items].map((item) => ({
                        title: item.querySelector("title")?.textContent,
                        link: item.querySelector("link")?.textContent,
                        pubDate: item.querySelector("pubDate")?.textContent,
                        description: item.querySelector("description")?.textContent,
                    }));

                    const container = document.getElementById("rssResults");
                    container.innerHTML = feed
                        .map(
                            (entry) =>
                                `<div style="margin-bottom:10px">
                             <strong>${entry.title}</strong><br/>
                             <a href="${entry.link}" target="_blank">Read more</a>
                          </div>`
                        )
                        .join("");
                });
            })
    });
});

document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value;
    const container = document.getElementById("results");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        chrome.scripting.executeScript( // to exceute and inject the content js file
            {
                target: { tabId: tabId },
                files: ["content.js"],
            },
            () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "CREATE_FEED" }, (response) => {
                    if (chrome.runtime.lastError || !response) {
                        console.error("Parse error:", chrome.runtime.lastError?.message);
                        container.innerText = "Not able to parse the Page.";
                        return;
                      }
                    if (response?.content?.length) {
                        console.log(Array.isArray(response.content))
                        let structuredData = response.content.map((item) =>{
                            return `<div style="margin-bottom:10px">
                              <strong>${item.title}</strong><br/>
                              ${item.summary}<br/>
                              <a href="${item.link}" target="_blank">Go to page</a>
                            </div>`
                        }).join("")

                        container.innerHTML = structuredData
                        


                        // Placeholder for NLP/LLM integration
                        // const result = response.content.includes(query)
                        //     ? "Match found!"
                        //     : "No match found.";
                        // document.getElementById("results").innerText = result;
                    } else {
                        document.getElementById("results").innerText = "Not able to parse the Page.";
                    }
                });
            });
    })
});
