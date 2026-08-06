#!/usr/bin/env python3
"""Local debug server for the birthday game.
Serves the game files and provides an API to save/load sprite editor changes to MySQL.

Usage:  python3 tools/debug-server.py
Then:   http://localhost:8083/8-3.html?debug

API endpoints:
  POST /api/sprite-positions    — save sprite position/size from editor
  GET  /api/sprite-positions    — get all saved positions for a scene
  GET  /api/sprite-positions/all — get everything
  DELETE /api/sprite-positions  — clear positions for a scene
"""

import json, os, sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import pymysql

DB_CONFIG = dict(host='127.0.0.1', user='root', database='birthday_info', charset='utf8mb4')
PORT = 8083

def get_db():
    return pymysql.connect(**DB_CONFIG, cursorclass=pymysql.cursors.DictCursor)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=os.path.join(os.path.dirname(__file__), '..'), **kw)

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/sprite-positions':
            self._get_positions(parse_qs(parsed.query))
        elif parsed.path == '/api/sprite-positions/all':
            self._get_all_positions()
        elif parsed.path == '/api/sprite-anchors':
            self._get_anchors()
        elif parsed.path == '/api/sprite-fps':
            self._get_fps()
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/sprite-positions':
            self._save_position()
        elif parsed.path == '/api/sprite-flags':
            self._save_flag()
        elif parsed.path == '/api/sprite-anchors':
            self._save_anchor()
        elif parsed.path == '/api/sprite-fps':
            self._save_fps()
        else:
            self.send_error(404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/sprite-positions':
            self._clear_positions(parse_qs(urlparse(self.path).query))
        else:
            self.send_error(404)

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _json_response(self, data, code=200):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def _save_position(self):
        data = self._read_body()
        scene = data.get('scene')
        sprite = data.get('sprite')
        x = data.get('x')
        y = data.get('y')
        size = data.get('size')
        phase = data.get('phase', 'actors')
        if not scene or not sprite or x is None or y is None:
            self._json_response({'error': 'scene, sprite, x, y required'}, 400)
            return
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("""
                    INSERT INTO sprite_positions (scene, sprite_name, x, y, size, phase)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE x=%s, y=%s, size=%s, phase=%s, applied=0
                """, (scene, sprite, x, y, size, phase, x, y, size, phase))
            db.commit()
            self._json_response({'ok': True})
        finally:
            db.close()

    def _get_positions(self, params):
        scene = params.get('scene', [None])[0]
        db = get_db()
        try:
            with db.cursor() as cur:
                if scene:
                    cur.execute("SELECT * FROM sprite_positions WHERE scene=%s", (scene,))
                else:
                    cur.execute("SELECT * FROM sprite_positions")
                rows = cur.fetchall()
            # Convert datetime to string
            for r in rows:
                if r.get('created_at'):
                    r['created_at'] = str(r['created_at'])
            self._json_response(rows)
        finally:
            db.close()

    def _get_all_positions(self):
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("SELECT * FROM sprite_positions ORDER BY scene, sprite_name")
                rows = cur.fetchall()
            for r in rows:
                if r.get('created_at'):
                    r['created_at'] = str(r['created_at'])
            self._json_response(rows)
        finally:
            db.close()

    def _save_fps(self):
        data = self._read_body()
        sprite = data.get('sprite')
        fps = data.get('fps')
        if not sprite or fps is None:
            self._json_response({'error': 'sprite, fps required'}, 400)
            return
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("""
                    INSERT INTO sprite_fps (sprite_name, fps)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE fps=%s, applied=0
                """, (sprite, fps, fps))
            db.commit()
            self._json_response({'ok': True})
        finally:
            db.close()

    def _save_flag(self):
        data = self._read_body()
        sprite = data.get('sprite')
        flag = data.get('flag', '')
        notes = data.get('notes', '')
        src = data.get('src', '')
        cols = data.get('cols')
        fps = data.get('fps')
        default_size = data.get('defaultSize')
        if not sprite:
            self._json_response({'error': 'sprite required'}, 400)
            return
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("""
                    INSERT INTO sprite_flags (sprite_name, flag, notes, src, cols, fps, default_size)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE notes=%s, src=%s, cols=%s, fps=%s, default_size=%s, resolved=0
                """, (sprite, flag, notes, src, cols, fps, default_size, notes, src, cols, fps, default_size))
            db.commit()
            self._json_response({'ok': True})
        finally:
            db.close()

    def _get_anchors(self):
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("SELECT sprite_name, anchor_x, anchor_y, no_anchor, reason FROM sprite_anchors")
                rows = cur.fetchall()
            self._json_response(rows)
        finally:
            db.close()

    def _get_fps(self):
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("SELECT sprite_name, fps FROM sprite_fps")
                rows = cur.fetchall()
            self._json_response(rows)
        finally:
            db.close()

    def _save_anchor(self):
        data = self._read_body()
        sprite = data.get('sprite')
        ax = data.get('anchorX')
        ay = data.get('anchorY')
        if not sprite or ax is None or ay is None:
            self._json_response({'error': 'sprite, anchorX, anchorY required'}, 400)
            return
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("""
                    INSERT INTO sprite_anchors (sprite_name, anchor_x, anchor_y)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE anchor_x=%s, anchor_y=%s, applied=0
                """, (sprite, ax, ay, ax, ay))
            db.commit()
            self._json_response({'ok': True})
        finally:
            db.close()

    def _clear_positions(self, params):
        scene = params.get('scene', [None])[0]
        db = get_db()
        try:
            with db.cursor() as cur:
                if scene:
                    cur.execute("DELETE FROM sprite_positions WHERE scene=%s", (scene,))
                else:
                    cur.execute("DELETE FROM sprite_positions")
            db.commit()
            self._json_response({'ok': True, 'deleted': cur.rowcount})
        finally:
            db.close()

if __name__ == '__main__':
    # Verify DB connection
    try:
        db = get_db()
        db.close()
        print(f"DB connected. Starting server at http://localhost:{PORT}/8-3.html?debug")
    except Exception as e:
        print(f"DB error: {e}")
        sys.exit(1)

    server = HTTPServer(('', PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
