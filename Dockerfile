# Su dung image Node.js Alpine nhe nhat
FROM node:18-alpine

# Thiet lap thu muc lam viec
WORKDIR /app

# Copy package.json truoc de tan dung Docker Cache
COPY package*.json ./

# Cai dat dependencies
RUN npm install

# Copy toan bo source code
COPY . .

# Mo port 3000
EXPOSE 3000

# Lenh chay server
CMD ["node", "server.js"]
