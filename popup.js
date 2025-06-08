document.getElementById("scan-site").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const siteURL = tabs[0].url;
        document.getElementById("status").textContent = "🔍 Scanning " + siteURL;

        try {
            const response = await fetch(`http://localhost:8000/extract?url=${siteURL}&scanType=brief`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ url: siteURL, siteType: "brief" })
            });
            let jsonResults = await response.json()
            let completeData = []
            let totalScans = jsonResults?.data?.reduce((acc,cur) => {
                completeData.push(cur?.content)
                return acc + (cur?.content?.length || 0);
              }, 0)
            const contentList = document.getElementById("contentList");
            document.getElementById("status").textContent = `Scanned ${totalScans} sections & ${jsonResults?.data?.length} Pages`;
              let visibleChunks = completeData[0]?.slice(0,20)
              visibleChunks.forEach(item => {
              const li = document.createElement("li");
              li.innerHTML = `
                <strong>${item.sectionTitle}</strong><br/>
                <p>${item.sectionSummary}</p>
                ${item.sectionURL ? `<a href="${item.sectionURL}" target="_blank">Read more</a>` : ""}
                <hr/>
              `;
              contentList.appendChild(li);
            });
          } catch (err) {
            console.error(err);
            document.getElementById("status").textContent = "❌ Failed to Scan the Site.";
          }
})
});

document.getElementById("search-site").addEventListener("click", () => {
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
