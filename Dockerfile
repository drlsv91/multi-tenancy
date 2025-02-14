FROM node:18-slim
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 9003
CMD ["npm", "run", "start"]
