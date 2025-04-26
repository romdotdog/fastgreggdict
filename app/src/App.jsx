import { createSignal, onMount } from "solid-js";
import "./App.css";
import meta from "../../anniversary/meta.json";

function findWordsStartingWith(prefix) {
    let node = meta;
    const results = [];

    for (const char of prefix) {
        if (!node[char]) {
            return [];
        }
        node = node[char];
    }

    function collect(node, path) {
        if (node["$"]) {
            results.push({ word: prefix + path, url: node["$"] });
        }
        for (const key in node) {
            if (key !== "$") {
                collect(node[key], path + key);
            }
        }
    }

    collect(node, "");
    return results;
}

function App() {
    let inputRef;
    const [img, setImg] = createSignal("");
    const [text, setText] = createSignal("");
    const [echoes, setEchoes] = createSignal([]);

    onMount(() => {
        const handleKeydown = (e) => {
            if (e.key === "/") {
                e.preventDefault();
                inputRef.value = "";
                inputRef.focus();
            }
        };

        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    });

    const handleInput = (e) => {
        setText(e.target.value);
        if (e.target.value) {
            const words = findWordsStartingWith(e.target.value);
            if (words.length > 0) {
                setEchoes(words.map((w) => w.word));
                setImg(words[0].url);
            }
        } else {
            setEchoes([]);
            setImg("");
        }
    };

    return (
        <div>
            <input
                ref={inputRef}
                onInput={handleInput}
                type="text"
                placeholder="Word to look up..."
                spellCheck="false"
            />
            <div>
                {echoes().map((echo, index) => (
                    <div
                        style={{
                            transform: `translateY(${index * 5}px)`,
                        }}
                    >
                        {echo}
                    </div>
                ))}
            </div>
            {img() && <img src={img()} />}
        </div>
    );
}

export default App;
