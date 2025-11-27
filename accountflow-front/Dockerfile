FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install
RUN npm install --save-dev typescript

COPY . .

EXPOSE 3000

# Clean any stale build artifacts (mounted from host) and ensure dev static dir exists to avoid ENOENT
# Use polling in container for reliable file watching and avoid Turbopack issues in Docker
ENV CHOKIDAR_USEPOLLING=1 \
	WATCHPACK_POLLING=true \
	NEXT_TELEMETRY_DISABLED=1

# Clean any stale build artifacts and ensure dev static dir exists to avoid ENOENT
CMD ["sh", "-c", "rm -rf .next && mkdir -p .next/static/development && npx next dev -H 0.0.0.0"]
