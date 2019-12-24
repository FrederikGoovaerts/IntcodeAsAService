# Build container
FROM node:13-alpine as builder
COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build

# Output container
FROM node:13-alpine
COPY --from=builder /app/lib /app/lib
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
COPY --from=builder /app/static /app/static
WORKDIR /app
RUN npm install --production
CMD ["node", "lib/app.js"]