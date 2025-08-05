//                    <<--------color mode change logic------------>>

const modeIcon = document.getElementById("modeicon");
let isDark = false;

modeIcon.addEventListener("click", () => {
    modeIcon.innerHTML = "";
    const newIcon = document.createElement("span");
    newIcon.className = "material-symbols-outlined";
    newIcon.textContent = isDark ? "dark_mode" : "light_mode";
    isDark = !isDark;
    modeIcon.appendChild(newIcon);
    document.body.style.backgroundColor = isDark ? "#1a1a1a" : "#ffffff";
    document.body.style.color = isDark ? "#ffffff" : "#000000";
    modeIcon.style.backgroundColor = isDark ? "#dddddf" : "#515164";
});

//         <<------------ color mode change logic ends ----------->>

//                  <<---- main functioning------->>

function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["geminiApiKey"], (result) => {
            if (!result.geminiApiKey) {
                reject("Gemini API key not found. Please set your API key in the extension");
            } else {
                resolve(result.geminiApiKey);
            }
        });
    });
}

document.getElementById("summarize").addEventListener("click", async () => {
    const resultDiv = document.getElementById("result");
    const summaryType = document.getElementById("summary-type").value;
    resultDiv.innerHTML = '<div class="loading"><div class="loader"></div></div>';

    try {
        const apikey = await getApiKey(); // ✅ fetch apiKey properly

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (res) => {
                if (chrome.runtime.lastError || !res || !res.text) {
                    resultDiv.innerText = "Couldn't extract text from this page.";
                    return;
                }

                try {
                    const summary = await getGeminiSummary(res.text, summaryType, apikey);
                    resultDiv.innerText = summary;
                } catch (error) {
                    resultDiv.innerText = `Error: ${error.message || "Failed to generate summary."}`;
                }
            });
        });
    } catch (err) {
        resultDiv.innerText = err;
    }
});

async function getGeminiSummary(rawText, type, apikey) {
    const max = 20000;
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

    const promptMap = {
        brief: `Summarize in 3-4 sentences: \n\n ${text}`,
        detailed: `Give a detailed Summary: \n\n ${text}`,
        bullets: `Summarize in 5-7 bullet points (start each line with "- ") : \n\n${text}`,
    };

    const prompt = promptMap[type] || promptMap.brief;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 },
            }),
        }
    );

    const data = await res.json();
    if (!res.ok) {
        const error = data.error;
        throw new Error(error?.message || "API Request failed");
    }

    return (
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No Summary available."
    );
}

//                 <<---- Copy Button ----->

document.getElementById("copy-btn").addEventListener("click", () => {
    const txt = document.getElementById("result").innerText;
    if (!txt) return;

    navigator.clipboard.writeText(txt).then(() => {
        const btn = document.getElementById("copy-btn");
        const old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = old), 2000);
    });
});
