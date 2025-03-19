FROM node:18-alpine

WORKDIR /app

# Install OpenSSL which is required by Prisma
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client for linux-musl environment
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"] 