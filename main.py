#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for GitHub API calls
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    PORT = int(os.environ.get('PORT', 8080))
    
    # Change to the directory containing the HTML files
    web_dir = Path(__file__).parent
    os.chdir(web_dir)
    
    print(f"🚀 Singh Studios Portfolio Server")
    print(f"📂 Serving files from: {web_dir}")
    print(f"🌐 Server running on: http://localhost:{PORT}")
    print(f"🔗 Access your portfolio at: http://localhost:{PORT}")
    print(f"💡 Type 'enter' in the terminal to access the site!")
    print(f"⏱️  Repository data updates every 30 seconds")
    print("=" * 50)
    
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), CustomHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()