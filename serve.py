#!/usr/bin/env python3
"""Local preview server that resolves URLs the way nginx.conf does.

`python3 -m http.server` serves files verbatim, so /about 404s while the
deployed site serves about.html for it. This mirrors the production
try_files chain — $uri, $uri.html, $uri/, then /index.html — so what you
see locally is what Coolify will serve.

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
        # SPA-style fallback, matching the last entry in try_files
        return os.path.join(ROOT, "index.html")

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
