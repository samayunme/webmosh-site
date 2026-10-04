# WEBMOSH — static site served by nginx.
# Coolify: set Build Pack = "Dockerfile". Nothing else to configure.

# The web root is assembled here rather than listed file by file. A named
# COPY list meant every new page had to be added twice — once to the repo and
# once here — and a page missed in the second place deployed as a 404.
FROM alpine:3.20 AS site
WORKDIR /site
COPY . .
RUN rm -rf Dockerfile nginx.conf security-headers.conf serve.py .dockerignore .git .github

FROM nginx:1.27-alpine

COPY nginx.conf            /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY --from=site /site/    /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
