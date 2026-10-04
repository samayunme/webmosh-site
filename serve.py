#!/usr/bin/env python3
"""Local preview server that resolves URLs the way nginx.conf does.

`python3 -m http.server` serves files verbatim, so /about 404s while the
deployed site serves about.html for it. This mirrors the production
try_files chain — $uri, $uri.html, $uri/, then a real 404 rendered with
404.html — so what you see locally is what Coolify will serve.

    python3 serve.py            # http://localhost:8000
    python3 serve.py 3000
"""
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class TryFilesHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path.split("?", 1)[0].split("#", 1)[0])
        if os.path.isdir(local):
            index = os.path.join(local, "index.html")
            return index if os.path.exists(index) else local
        if os.path.exists(local):
            return local
        with_html = local + ".html"
        if os.path.exists(with_html):
            return with_html
        # a miss is a miss — nginx ends its try_files chain with =404, and
        # send_error below turns this sentinel into the styled 404 page
        return os.path.join(ROOT, "__404__")

    def _redirect_from_html(self):
        """Mirror the nginx rule: /page.html sends a 301 to /page."""
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if not path.endswith(".html"):
            return False
        clean = path[:-len(".html")]
        if clean.endswith("/index"):
            clean = clean[:-len("index")]
        if not clean:
            clean = "/"
        self.send_response(301)
        self.send_header("Location", clean + self.path[len(path):])
        self.send_header("Content-Length", "0")
        self.end_headers()
        return True

    def do_GET(self):
        if self._redirect_from_html():
            return
        SimpleHTTPRequestHandler.do_GET(self)

    def do_HEAD(self):
        if self._redirect_from_html():
            return
        SimpleHTTPRequestHandler.do_HEAD(self)

    def send_error(self, code, message=None, explain=None):
        """Serve 404.html for a 404, the way nginx's error_page does."""
        page = os.path.join(ROOT, "404.html")
        if code == 404 and os.path.exists(page):
            with open(page, "rb") as fh:
                body = fh.read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-cache, must-revalidate")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(TryFilesHandler, directory=ROOT)
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print("WEBMOSH preview on http://localhost:%d  (Ctrl+C to stop)" % port)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
