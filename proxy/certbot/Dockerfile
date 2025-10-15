FROM certbot/certbot:latest

# Install the GoDaddy DNS plugin
RUN pip install --no-cache-dir certbot-dns-godaddy

# Keep default entrypoint for interactive runs; users will run "docker-compose run --rm certbot ..."

