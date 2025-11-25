from flask import Flask, request, Response, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os
from seedr_client import SeedrClient

# Serve static files from the React build folder (../dist)
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
dist_dir = os.path.join(root_dir, 'dist')
app = Flask(__name__, static_folder=dist_dir, static_url_path='')
CORS(app, supports_credentials=True)

BASE_URL = 'https://www.seedr.cc'
REST_URL = 'https://www.seedr.cc/rest'
YTS_BASE_URL = 'https://yts.lt/api/v2'

@app.route('/yts-api/<path:subpath>', methods=['GET'])
def yts_proxy(subpath):
    target_url = f"{YTS_BASE_URL}/{subpath}"
    
    try:
        resp = requests.get(
            url=target_url,
            params=request.args,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'} 
        )
        
        try:
            return jsonify(resp.json())
        except Exception:
            return jsonify({'error': 'Failed to decode YTS response', 'content': resp.text[:200]}), 502

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seedr/login', methods=['POST'])
def seedr_login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'error': 'Missing credentials'}), 400

    # New client for login
    client = SeedrClient()
    result = client.login(username, password)
    
    resp = jsonify(result)
    if result.get('success') and result.get('cookies'):
        for cookie_str in result['cookies']:
            # cookie_str is "name=value"
            if '=' in cookie_str:
                name, value = cookie_str.split('=', 1)
                resp.set_cookie(name, value, samesite='Lax', secure=False) # Secure=False for localhost
    
    return resp

@app.route('/api/seedr/files', methods=['GET'])
def seedr_files():
    cookies = request.headers.get('Cookie')
    if not cookies:
        return jsonify({'error': 'Not logged in'}), 401
        
    try:
        client = SeedrClient(cookies=cookies)
        data = client.list_root() # Use list_root for folder 0
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seedr/folder/<folder_id>', methods=['GET'])
def seedr_folder(folder_id):
    cookies = request.headers.get('Cookie')
    if not cookies:
        return jsonify({'error': 'Not logged in'}), 401
        
    try:
        client = SeedrClient(cookies=cookies)
        data = client.list_folder(folder_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seedr/torrent', methods=['POST'])
def seedr_add_torrent():
    cookies = request.headers.get('Cookie')
    if not cookies:
        return jsonify({'error': 'Not logged in'}), 401
        
    magnet = request.form.get('magnet')
    if not magnet:
        return jsonify({'error': 'Missing magnet link'}), 400
        
    try:
        client = SeedrClient(cookies=cookies)
        result = client.add_torrent(magnet)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seedr/delete', methods=['POST'])
def seedr_delete():
    cookies = request.headers.get('Cookie')
    if not cookies:
        return jsonify({'error': 'Not logged in'}), 401
        
    try:
        delete_arr = request.json.get('delete_arr')
        if not delete_arr:
             # Try form data if json is empty
             delete_arr_str = request.form.get('delete_arr')
             if delete_arr_str:
                 import json
                 delete_arr = json.loads(delete_arr_str)
        
        if not delete_arr:
            return jsonify({'error': 'Missing delete_arr'}), 400
            
        client = SeedrClient(cookies=cookies)
        result = client.delete_items(delete_arr)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/seedr/video/<file_id>', methods=['GET'])
def seedr_video(file_id):
    cookies = request.headers.get('Cookie')
    if not cookies:
        return jsonify({'error': 'Not logged in'}), 401
        
    try:
        client = SeedrClient(cookies=cookies)
        data = client.get_video_url(file_id)
        if data and 'url' in data:
            return jsonify({'url': data['url']})
        return jsonify({'error': 'Failed to get video URL'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seedr/settings', methods=['GET'])
def seedr_settings():
    cookies = request.headers.get('Cookie')
    if not cookies:
        return jsonify({'error': 'Not logged in'}), 401
        
    try:
        client = SeedrClient(cookies=cookies)
        data = client.get_settings()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def serve():
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return "React build not found. Please run 'npm run build' first.", 404

@app.route('/<path:path>')
def static_proxy(path):
    # Check if file exists in static folder
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Fallback to index.html for React Router (SPA)
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return "Not Found", 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)
