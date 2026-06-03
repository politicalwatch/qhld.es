# build stage
FROM node:lts-alpine AS build-stage

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# production stage
FROM node:lts-alpine AS production-stage

WORKDIR /app
COPY --from=build-stage --chown=node:node /app/.output .output

ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
