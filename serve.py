#!/usr/bin/env python3
"""
Simple HTTP server for testing the Owlbear Rodeo extension locally.
Run with: python3 serve.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Serving Owlbear Rodeo Extension at http://localhost:{PORT}")
        print(f"Manifest URL: http://localhost:{PORT}/manifest.json")
        print(f"Extension URL: http://localhost:{PORT}/index.html")
        print("\nTo add to Owlbear Rodeo:")
        print(f"1. Go to Extensions in Owlbear Rodeo")
        print(f"2. Click 'Add Extension'")
        print(f"3. Enter: http://localhost:{PORT}/manifest.json")
        print(f"4. Click 'Add'")
        print("\nPress Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            sys.exit(0)

if __name__ == "__main__":
    main()