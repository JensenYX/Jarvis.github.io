#!/usr/bin/env python3
"""Local preview server.

`python -m http.server` answers one request at a time and ignores the HTTP
Range header. The demo videos need both: the page asks for posters, fonts and a
video at once, and Chrome will not seek inside a video whose server answers a
Range request with the whole file. This is the standard handler with threading
turned on and single-range (206) responses added.

    python3 tools/serve.py [port] [--host HOST]
"""

from __future__ import annotations

import os
import re
import sys
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$")


class SliceReader:
    """File wrapper that stops after `length` bytes, for copyfileobj."""

    def __init__(self, handle, length: int) -> None:
        self.handle = handle
        self.remaining = length

    def read(self, size: int = -1) -> bytes:
        if self.remaining <= 0:
            return b""
        if size < 0 or size > self.remaining:
            size = self.remaining
        data = self.handle.read(size)
        self.remaining -= len(data)
        return data

    def close(self) -> None:
        self.handle.close()


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mp4": "video/mp4",
        ".svg": "image/svg+xml",
        ".vtt": "text/vtt",
        ".webp": "image/webp",
    }

    def end_headers(self) -> None:
        # Always re-read during a preview; assets change on every rebuild.
        self.send_header("Cache-Control", "no-store")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def send_head(self):
        header = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not header or not os.path.isfile(path):
            return super().send_head()
        match = RANGE_RE.match(header.strip())
        if not match:
            # Multi-range and malformed requests fall back to the whole file,
            # which RFC 9110 allows.
            return super().send_head()

        size = os.path.getsize(path)
        first, last = match.groups()
        if first:
            start = int(first)
            end = min(int(last), size - 1) if last else size - 1
        elif last:
            start = max(size - int(last), 0)
            end = size - 1
        else:
            return super().send_head()
        if start >= size or start > end:
            self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None

        handle = open(path, "rb")
        handle.seek(start)
        length = end - start + 1
        self.send_response(HTTPStatus.PARTIAL_CONTENT)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(length))
        self.send_header("Last-Modified", self.date_time_string(int(os.path.getmtime(path))))
        self.end_headers()
        return SliceReader(handle, length)

    def log_message(self, fmt: str, *args) -> None:
        status = args[1] if len(args) > 1 else ""
        if status and not str(status).startswith("2"):
            super().log_message(fmt, *args)


class Server(ThreadingHTTPServer):
    def handle_error(self, request, client_address) -> None:
        # Browsers abort video requests whenever the user seeks; that is not
        # worth a traceback.
        if isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            return
        super().handle_error(request, client_address)


def main() -> None:
    args = sys.argv[1:]
    host = "127.0.0.1"
    if "--host" in args:
        index = args.index("--host")
        host = args[index + 1]
        del args[index : index + 2]
    port = int(args[0]) if args else 8811
    handler = partial(Handler, directory=str(ROOT))
    with Server((host, port), handler) as server:
        print(f"serving {ROOT} at http://{host}:{port}/  (ctrl-c to stop)", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
