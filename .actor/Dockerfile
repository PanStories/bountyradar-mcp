FROM node:22-slim
WORKDIR /app

# Install runtime deps first (express + @modelcontextprotocol/sdk + apify are optionalDependencies).
COPY package.json ./
RUN npm install --include=optional --no-audit --no-fund

COPY . .

# Standby-safe: the main process (src/http.mjs) binds the port itself.
EXPOSE 8000
CMD ["node", "src/http.mjs"]