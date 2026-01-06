FROM nginx:alpine

COPY . /usr/share/nginx/html

# Custom nginx config if needed, but default is fine for static files
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
