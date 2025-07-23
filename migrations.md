# Migrations

*** Always commit your schema before running: ***
```
migrate dev
migrate reset
db pull
```


# Migrate

Get latest live schema
```bash
npx prisma db pull
```

```bash
npx prisma migrate dev --name add-user-model
```
& `Approve` changes
for production and shared DB:
```bash
migrate deploy
```

# CI/CD / containerized

```bash
npx prisma generate
```