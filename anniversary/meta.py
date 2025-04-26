import json

with open("reference.json", "r") as f:
    reference_data = json.load(f)

word_map = {}

for page in reference_data:
    for word_info in page["words"]:
        word = word_info["t"]
        word_map[word] = f"{word}.webp"

with open("bf.json", "r") as f:
    bf_data = json.load(f)

for entry in bf_data:
    if len(entry) >= 3:
        keys_string = entry[0]
        value = entry[2]
        keys = [k.strip() for k in keys_string.split(",")]
        for key in keys:
            word_map[key] = value

trie = {}

for word, url in word_map.items():
    node = trie
    for char in word:
        if char not in node:
            node[char] = {}
        node = node[char]
    node["$"] = url

with open("meta.json", "w") as f:
    json.dump(trie, f, separators=(",", ":"))

print(f"collected {len(word_map)} words")