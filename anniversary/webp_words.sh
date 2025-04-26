for img in words/*.png; do
    filename=$(basename "$img" .png)
    cwebp -lossless -m 6 "$img" -o "webp/$filename.webp"
done