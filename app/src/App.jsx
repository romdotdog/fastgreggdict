import { createSignal, onMount } from "solid-js";
import "./App.css";
import meta from "./meta.json";

function collect(results, node, path) {
    if (node["$"]) {
        results.push({ word: path, url: node["$"] });
    }
    for (const key in node) {
        if (key !== "$") {
            collect(results, node[key], path + key);
        }
    }
}

function findWordsStartingWith(prefix) {
    let node = meta;
    const results = [];

    for (const char of prefix) {
        if (!node[char]) {
            return [];
        }
        node = node[char];
    }

    collect(results, node, prefix);
    return results;
}

function App() {
    let inputRef;
    let preRef;
    const [img, setImg] = createSignal("");
    const [text, setText] = createSignal("");
    const [echoes, setEchoes] = createSignal([]);
    const [fileText, setFileText] = createSignal("");
    const [textIndex, setTextIndex] = createSignal(0);
    const [currentWord, setCurrentWord] = createSignal("");
    const [currentWordPos, setCurrentWordPos] = createSignal(0);
    const [highlightPos, setHighlightPos] = createSignal({top: 0, left: 0, width: 0, height: 0});
    const [offset, setOffset] = createSignal(0);

    const nextWordRegex = /\b[a-zA-Z]+\b/g;

    const findNextWord = () => {
        const src = fileText();
        nextWordRegex.lastIndex = textIndex();
        const match = nextWordRegex.exec(src);
        if (match) {
            const word = match[0];
            const startPos = match.index;

            setTextIndex(nextWordRegex.lastIndex);
            setCurrentWord(word);
            setCurrentWordPos(startPos);

            updateFromFile(word);
            setTimeout(updateHighlight, 0);
        }
    };

    const updateFromFile = (upperWord) => {
        if (!upperWord) return;
        const word = upperWord.toLowerCase();

        let prefix = "";
        let node = meta;
        for (const char of word) {
            const newNode = node[char];
            if (!newNode) break;
            prefix += char;
            node = newNode;
        }

        const matches = [];
        collect(matches, node, prefix);
        if (matches.length > 0) {
            setEchoes(matches.map((w) => w.word));
            setImg(matches[0].url);
        } else {
            setEchoes([]);
            setImg("");
        }
    };

    const handleInput = (e) => {
        const value = e.target.value;
        setText(value);
        if (value) {
            const words = findWordsStartingWith(value.toLowerCase());
            if (words.length > 0) {
                setEchoes(words.map((w) => w.word));
                setImg(words[0].url);
            }
        } else if (fileText()) {
            updateFromFile(currentWord());
            setTimeout(updateHighlight, 0);
        } else {
            setEchoes([]);
            setImg("");
        }
    };

    const updateHighlight = () => {
        if (!preRef) return;
        const range = document.createRange();
        const textNode = preRef.firstChild;
        if (!textNode) return;

        const startOffset = currentWordPos();
        const endOffset = startOffset + currentWord().length;

        range.setStart(textNode, startOffset);
        range.setEnd(textNode, endOffset);

        const rect = range.getBoundingClientRect();
        const level = 75 - rect.top;

        setOffset(offset => offset + level);

        setHighlightPos({
            top: rect.top + level - 2,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 4
        });
    };

    onMount(() => {
        const handleKeydown = (e) => {
            if (e.key === "/") {
                e.preventDefault();
                inputRef.value = "";
                inputRef.focus();
            } else if (e.key === " ") {
                if (text() === "" && fileText()) {
                    e.preventDefault();
                    findNextWord();
                }
            }
        };

        const handleDrop = (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result.trim();
                    setFileText(content);
                    setTextIndex(0);
                    setText("");
                    inputRef.value = "";
                    inputRef.blur();
                    findNextWord();
                };
                reader.readAsText(file);
            }
        };

        window.addEventListener("keydown", handleKeydown);
        window.addEventListener("dragover", (e) => e.preventDefault());
        window.addEventListener("drop", handleDrop);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("dragover", (e) => e.preventDefault());
            window.removeEventListener("drop", handleDrop);
        };
    });

    return (
        <>
            <div style={{ position: "relative" }} id="container">
                <input
                    ref={inputRef}
                    onInput={handleInput}
                    type="text"
                    placeholder={fileText() ? "" : "Word to look up, or drag and drop text..."}
                    spellCheck="false"
                    autoComplete="off"
                    id="search"
                    style={{ marginBottom: "20px" }}
                />
                {text() === "" && fileText() && (
                    <pre
                        ref={preRef}
                        style={{ position: "relative", top: `${offset()}px`, transition: "all 0.1s linear" }}
                        id="text"
                    >
                        {fileText()}
                    </pre>
            )}
                {text() !== "" && echoes().map((echo, index) => (
                    <div style={{ transform: `translateY(${index * 5}px)` }} className="suggestion">
                        {echo}
                    </div>
                ))}
            </div>

            {text() === "" && fileText() && (
                <div
                    id="highlight"
                    style={{
                        top: `${highlightPos().top}px`,
                        left: `${highlightPos().left}px`,
                        width: `${highlightPos().width}px`,
                        height: `${highlightPos().height}px`,
                    }}
                />
            )}
            {img() && (
                <img src={img()} />
            )}
        </>
    );
}

export default App;
