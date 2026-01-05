FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
# Build requires devDependencies (tailwindcss, postcss, etc.)
RUN npm ci

FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/src ./src
COPY --from=build /app/assets ./assets
RUN mkdir -p /app/uploads

EXPOSE 3000
CMD ["npm","start"]
