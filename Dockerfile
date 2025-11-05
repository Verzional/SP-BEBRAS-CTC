# Stage 1: The Builder
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install deps first (to leverage caching)
RUN pnpm fetch

# Copy the full app (after deps)
COPY . .

# Prisma needs a DATABASE_URL to generate the client, but it won’t connect to it.
# We provide a dummy one to avoid build errors. Use a non-existent host to prevent connection attempts.
ENV DATABASE_URL="postgresql://dummy:dummy@dummyhost:5432/dummy"

# Install dependencies and generate Prisma client
RUN pnpm install --offline
RUN pnpm prisma generate

# Build Next.js app
RUN pnpm build

# Remove dev dependencies
RUN pnpm prune --prod


# Stage 2: The Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm (needed for CMD)
RUN npm install -g pnpm

# Copy only what’s needed for production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

# Expose the port
EXPOSE 6565

# On runtime, you’ll provide the REAL DATABASE_URL via environment
CMD ["pnpm", "start", "-p", "6565"]