let scanTime
document.getElementById("scan-site").addEventListener("click", (e) => {
    let currentElm = e.target
    let originalText = currentElm.innerText
    currentElm.innerText = ""
    currentElm.classList.add("loader")
    let timer = document.getElementById("timer")
    if(timer) {
        let time = 0
        scanTime = setInterval(() => {
            time = time + 0.1
            timer.innerText = time.toFixed(1) + "s"
        },100) 
    }
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const siteURL = tabs[0].url;
        document.getElementById("status").textContent = "🔍 Scanning " + siteURL;

        try {
            const response = await fetch(`http://localhost:8000/extract?url=${siteURL}&scanType=full`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            let jsonResults = await response.json()
            clearInterval(scanTime)
            currentElm.classList.remove("loader")
            currentElm.innerText = originalText
            let completeData = []
            let totalScans = jsonResults?.data?.reduce((acc, cur) => {
                completeData.push(cur?.content)
                return acc + (cur?.content?.length || 0);
            }, 0)
            const contentList = document.getElementById("datawrap");
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
            clearInterval(scanTime)
            currentElm.classList.remove("loader")
            currentElm.innerText = originalText
            document.getElementById("status").textContent = "❌ Failed to Scan the Site.";
        }
    })
});

document.getElementById("search-site").addEventListener("click", async (e) => {
    let currentElm = e.target
    let originalText = currentElm.innerText
    currentElm.innerText = ""
    currentElm.classList.add("loader")
    const query = document.getElementById("searchInput").value;
    if (!query) return alert("Please enter a query");
    try {
        const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(query)}`);
        const results = await response.json();
        currentElm.classList.remove("loader")
        currentElm.innerText = originalText
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
        currentElm.classList.remove("loader")
        currentElm.innerText = originalText
        console.error('Search failed:', err);
        alert('Something went wrong.');
      }

});

document.getElementById("search-ask").addEventListener("click", async (e) => {
    let currentElm = e.target
    let originalText = currentElm.innerText
    currentElm.innerText = ""
    currentElm.classList.add("loader")
    const query = document.getElementById("searchInput").value;
    if (!query) return alert("Please enter a query");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const siteUrl = new URL(tab.url);
  
    const response = await fetch(`http://localhost:8000/ask?url=${siteUrl}&query=${encodeURIComponent(query)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  
    const data = await response.json();
    currentElm.classList.remove("loader")
    currentElm.innerText = originalText
    const contentList = document.getElementById("contentList");
    contentList.innerHTML = `<li><strong>AI:</strong> ${data.answer}</li>`;
  });
  



  // TAB

  let tabs = document.querySelectorAll(".tab")
  if(tabs.length) {
      tabs.forEach((tab,i) => {
        tab.addEventListener("click",(e) => {
            let element = e.target
            element.classList.add("active")
            const nextSibling = element.nextElementSibling;
            const previousSibling = element.previousElementSibling;
            if(nextSibling) nextSibling.classList.remove("active")
            if(previousSibling) previousSibling.classList.remove("active")
            let scanTab = document.getElementById("scan")
            let searchTab = document.getElementById("search")
            let dataAttr = element.attributes[1].nodeValue
            let clickedTab = document.getElementById(dataAttr)
            clickedTab.classList.remove("hide")
            clickedTab.classList.add("active")
            if(dataAttr == "scan") {
                searchTab.classList.remove("active")
                searchTab.classList.add("hide")
            }else {
                scanTab.classList.remove("active")
                scanTab.classList.add("hide")
            }
          })
      })
  }
