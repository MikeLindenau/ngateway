FROM mhart/alpine-node:10.16.0
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache --update make gcc g++ python git openssh && \
  npm ci --prod && \
  apk del make gcc g++ python git openssh && \
  rm -rf /tmp/* /var/cache/apk/*

# FROM mhart/alpine-node:base-8
FROM mhart/alpine-node:slim-10.16.0
COPY --from=0 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
WORKDIR /app
COPY --from=0 /app .
COPY . .
CMD [ "node", "ngateway.js" ]