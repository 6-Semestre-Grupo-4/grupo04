FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install
RUN npm install --save-dev typescript

COPY . .

EXPOSE 3000

CMD ["npx", "next", "dev", "--turbopack", "-H", "0.0.0.0"]
