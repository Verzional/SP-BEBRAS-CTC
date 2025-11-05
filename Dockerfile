# Stage 1: The Builder
FROM node:20-alpine AS builder

# ------------------------------------------------------------
# 1. DECLARE BUILD ARGUMENTS (These accept values via --build-arg)
# These MUST be declared at the top of the stage.
# These are used for NEXT_PUBLIC variables that get baked into the app.
# ------------------------------------------------------------
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_UPLOAD_PRESET
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER

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

# ------------------------------------------------------------
# 2. SET ENV VARIABLES from ARGUMENTS (Required before 'pnpm build')
# This makes the ARG values available as ENV variables for the build process.
# ------------------------------------------------------------
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_UPLOAD_PRESET=$NEXT_PUBLIC_UPLOAD_PRESET
ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER

# Prisma needs a DATABASE_URL to generate the client, but it won’t connect to it.
# We provide a dummy one to avoid build errors.
ENV DATABASE_URL="postgresql://dummy:dummy@dummyhost:5432/dummy"

# Install dependencies and generate Prisma client
RUN pnpm install --offline
RUN pnpm prisma generate

# Build Next.js app (The NEXT_PUBLIC values are now correctly baked in here)
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
# NOTE: Only server-side variables (like DATABASE_URL) need to be passed at runtime.
CMD ["pnpm", "start", "-p", "6565"]