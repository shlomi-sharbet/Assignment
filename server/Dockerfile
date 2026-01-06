FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# We use a script to wait for DB before starting, or handle it in code. 
# For simplicity in this assignment, we'll let the app retry connection or use a wait script wrapper if needed.
# The code currently has a retry mechanism? No, it exits on fail. 
# We will likely need a restart policy in docker-compose.

CMD ["node", "server.js"]
