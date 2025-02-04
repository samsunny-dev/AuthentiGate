const fs = require('fs');
const csv = require('csv-parser');
const natural = require('natural');
const stopwords = require('stopword');

const files = [
    "gossipcop_fake.csv",
    "gossipcop_real.csv",
    "politifact_fake.csv",
    "politifact_real.csv"
]

const cleanedData = [];

function cleanText(text) {
    if(!text) return "";

    text = text.replace(/<[^>]*>/g, '');

    text = text.replace(/[^a-zA-Z ]/g, '');

    text = text.toLowerCase();

    let words = text.split(" ");
    words = stopwords.removeStopwords(words);

    return words.join(" ");
}

function processFile(filePath, label) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(`./Backend/data/${filePath}`)
        .pipe(csv())
        .on('data', (row) => {
            if (row.text) {
                results.push({
                    text: cleanText(row.text),
                    label: label
                });
            }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
}

async function preprocessData() {
    const fakeNews = await processFile(files[0], "fake");
    const realNews = await processFile(files[1], "real");
    const fakeNews2 = await processFile(files[2], "fake");
    const realNews2 = await processFile(files[3], "real");

    cleanedData.push(...fakeNews, ...realNews, ...fakeNews2, ...realNews2);

    fs.writeFileSync("./Backend/data/preprocessed_data.json", JSON.stringify(cleanedData, null, 2));
    console.log("✅ Preprocessed data saved to preprocessed_data.json");
}

preprocessData();