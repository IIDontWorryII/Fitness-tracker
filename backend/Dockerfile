# 1 Base image: official Node.js LTS
FROM node:20-alpine

# 2️ Create app directory inside the container
WORKDIR /app

# 3️ Copy dependency definitions first (better caching)
COPY package.json package-lock.json* ./

# 4️ Install dependencies
RUN npm install

# 5️ Copy the rest of the source code
COPY . .

# 6️ Build TypeScript -> JavaScript
RUN npm run build

# 7️ Expose the API port
EXPOSE 4000

# 8️ Start the server
CMD ["npm", "start"]
