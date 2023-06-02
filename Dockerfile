FROM node:20-alpine
WORKDIR /api
COPY . .
RUN ["npm", "i"]
RUN ["npm", "run", "build"]
CMD [ "npm", "start" ]
EXPOSE 8000
