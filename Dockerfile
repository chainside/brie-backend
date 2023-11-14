FROM node:16-alpine as builderBe

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
RUN yarn build

# ---

FROM node:16-alpine

USER node
WORKDIR /home/node

COPY --from=builderBe --chown=node:node /home/node/docker/docker-entrypoint.sh ./
COPY --from=builderBe --chown=node:node /home/node/package*.json ./
COPY --from=builderBe --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builderBe --chown=node:node /home/node/dist/ ./dist/
COPY --from=builderBe --chown=node:node /home/node/ormconfig.ts ./
COPY --from=builderBe --chown=node:node /home/node/src/test/test.pdf ./src/test/test.pdf
COPY --from=builderBe --chown=node:node /home/node/src/test/test.txt ./src/test/test.txt

RUN chmod 755 ./docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
