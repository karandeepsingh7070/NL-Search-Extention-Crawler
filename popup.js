document.getElementById("scan-site").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const siteURL = tabs[0].url;
        document.getElementById("status").textContent = "🔍 Scanning " + siteURL;

        try {
            const response = await fetch(`http://localhost:8000/extract?url=${siteURL}&scanType=full`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            let jsonResults = await response.json()
            let completeData = []
            let totalScans = jsonResults?.data?.reduce((acc, cur) => {
                completeData.push(cur?.content)
                return acc + (cur?.content?.length || 0);
            }, 0)
            const contentList = document.getElementById("contentList");
            document.getElementById("status").textContent = `Scanned ${totalScans} sections & ${jsonResults?.data?.length} Pages`;
            let visibleChunks = completeData[0]?.slice(0, 20)
            visibleChunks?.length && visibleChunks.forEach(item => {
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

document.getElementById("search-site").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value;
    if (!query) return alert("Please enter a query");
    try {
        const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(query)}`);
        const results = await response.json();
        const resultsContainer = document.getElementById("contentList");
        resultsContainer.innerHTML = ''; 
    
        results.forEach(item => {
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
        console.error('Search failed:', err);
        alert('Something went wrong.');
      }

});

document.getElementById("search-ask").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value;
    if (!query) return alert("Please enter a query");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const siteUrl = new URL(tab.url);
  
    const response = await fetch(`http://localhost:8000/ask?url=${siteUrl}&query=${encodeURIComponent(query)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  
    const data = await response.json();
    const contentList = document.getElementById("contentList");
    contentList.innerHTML = `<li><strong>AI:</strong> ${data.answer}</li>`;
  });
