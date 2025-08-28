
output = document.getElementById("output");
input = document.getElementById("file");

text = "";
allWords = [];
/*
words are saved as a text and what other words come after, as well as their frequency.
There are two speciel words: START, that actually only stores what other words are sentences started with,
and END, which only marks the end of a sentence
*/

function learn() {
    if (input.files.length == 0) {
        output.innerHTML = "No file found";
        return;
    }

    //read the file (if there is any)
    const reader = new FileReader();
    filePath = input.files[0];

    reader.onload = function (e) {
        text = e.target.result;
        //create sentences
        const sentences = text.replace(/\r?\n+/g, '. ')
            .split(/(?<=[.?!])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        output.innerHTML = "";
        for (let i = 0; i < sentences.length; i++) {
            newElement = document.createElement("p");
            newElement.innerHTML = sentences[i];
            output.appendChild(newElement);
        }
        sentences.forEach(saveSentence);
    }

    reader.readAsText(filePath);

    //save sentences
    function saveSentence(sentence) {
        sentence = sentence.toLowerCase();

        //create words
        const words = sentence.replace(/[^\w'-]+/g, ' ')
            .split(/\s+/)
            .map(w => w.trim())
            .filter(w => w.length > 0);

        console.log(words);
        //save words
        addWord("START", words[0]);
        for (let i = 0; i < words.length; i++) {
            if (i + 1 >= words.length) {
                addWord(words[i], "END")
            } else {
                addWord(words[i], words[i + 1]);
            }
        }
    }
}

function generate() {
    //create a chain of words from random nexts from the start word
    let currentWord = findWord("START");
    let newSentence = "";
    while (currentWord.text != "END") {
        console.log("Generating " + currentWord.text);
        currentWord = currentWord.getRandomNextWord();
        if (currentWord.text != "END") {
            newSentence += " " + currentWord.text;
        }
    }
    output.innerHTML = newSentence;
}

function findWord(wordText) {
    for (let i = 0; i < allWords.length; i++) {
        if (allWords[i].text == wordText) {
            return allWords[i];
        }
    }
    return new Word("END", "END");
}

function addWord(wordText, nextWord) {
    if (isWordNew(wordText)) {
        allWords.push(new Word(wordText, nextWord))
    } else {
        allWords[findWordIndex(wordText)].addNextWord(nextWord);
    }
}

function findWordIndex(wordText) {
    for (let i = 0; i < allWords.length; i++) {
        if (allWords[i].text == wordText) {
            return i;
        }
    }
}

function isWordNew(wordText) {
    for (const word of allWords) {
        if (word.text === wordText) {
            return false; // exits the entire function
        }
    }
    return true;
}

class Word {
    text;
    nexts = [];

    constructor(wordText, nextWord) {
        this.text = wordText;
        this.addNextWord(nextWord);
    }

    getRandomNextWord() {
        let total = 0;
        for (let i = 0; i < this.nexts.length; i++) {
            total += this.nexts[i].ammount;
        }
        const newIndex = Math.floor(Math.random() * total);
        total = 0;
        for (let i = 0; i < this.nexts.length; i++) {
            total += this.nexts[i].ammount;
            if (total >= newIndex) {
                return findWord(this.nexts[i].text);
            }
        }
    }

    findNextWordIndex(nextWordText) {
        for (let i = 0; i < this.nexts.length; i++) {
            if (this.nexts[i].text == nextWordText) {
                return i;
            }
        }
        return -1;
    }

    addNextWord(newNextWord) {
        let index = this.findNextWordIndex(newNextWord);

        if (index === -1) {
            // word not found, add new
            this.nexts.push(new NextWord(newNextWord));
        } else {
            // word found, increase frequency
            this.nexts[index].increaseFrequency();
        }
    }
}

class NextWord {
    constructor(wordText) {
        this.text = wordText;
        this.ammount = 1;
    }

    increaseFrequency() {
        this.ammount++;
    }
}

//Onload for further testing
learn();