🧪 Step 3: Run Locally with Docker

```bash
docker build -t link-shortener .
docker run -p 3000:3000 --env-file=.env link-shortener
```