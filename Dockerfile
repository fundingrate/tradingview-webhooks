FROM node as build
WORKDIR /app
COPY . .
RUN yarn install

FROM node:latest
COPY --from=build /app /
CMD ["node", "index.js"]