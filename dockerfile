FROM erratik/ci-k8s

COPY  . /dist
WORKDIR /dist

EXPOSE 10011
HEALTHCHECK --interval=30s --timeout=30s --retries=3 --start-period=45s \
  CMD wget -O- http://127.0.0.1:10011/status | grep 'dependenciesCheckSuccess":true' || exit 1

CMD [ "npm", "run", "serve" ]
