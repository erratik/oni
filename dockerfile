FROM node:9.6.1-alpine

COPY  . /dist
WORKDIR /dist

EXPOSE 4529
HEALTHCHECK --interval=30s --timeout=30s --retries=3 --start-period=45s \
  CMD wget -O- http://127.0.0.1:4529/status | grep 'dependenciesCheckSuccess":true' || exit 1

CMD [ "npm", "run", "serve" ]
