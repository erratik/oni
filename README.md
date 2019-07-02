
## Description


### Oni Documentation
[Swagger documentation](https://oni.datawhore.erratik.ca/documentation)

---

## INSTALLATION

```bash
$ npm i
```

## Running the app
```bash
# development
$ npm run start:local

```

## Test

```bash
# unit tests
$ npm run test


# test coverage
$ npm run test:cov
```


### Backup MongoDB
```bash
./scripts/mongo.dump.sh -c mongodb-geisha -db datawhore --network oni_mongo_net
