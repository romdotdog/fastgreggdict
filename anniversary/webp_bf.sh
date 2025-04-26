for img in bf/*.png; do
    filename=$(basename "$img" .png)
    cwebp -q 80 -m 6 "$img" -o "webp/$filename.webp"
done