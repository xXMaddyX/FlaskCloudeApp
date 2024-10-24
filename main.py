from flask import Flask, send_file, jsonify, send_from_directory, request, url_for
import os
import urllib.parse

app = Flask(__name__, static_folder="static", static_url_path="/")

UPLOAD_FOLDER = "./files"

@app.route("/")
def index():
    return send_file(os.path.join(app.static_folder, "index.html"))

@app.route('/files')
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify(files)

@app.route('/download/<path:file>')
def download_file(file):
    try:
        decoded_file = urllib.parse.unquote(file)
        return send_from_directory(UPLOAD_FOLDER, decoded_file, as_attachment=True)
    except FileNotFoundError:
        return "File not Found", 404

@app.route('/delete/<path:file>', methods=["DELETE"])
def delete_file(file):
    try:
        decoded_file = urllib.parse.unquote(file)
        file_path = os.path.join(UPLOAD_FOLDER, decoded_file)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"message": "File deleted"}), 200
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return "No File Part"
    file = request.files["file"]
    if file.filename == "":
        return "no file selected"
    if file:
        file.save(os.path.join(UPLOAD_FOLDER, file.filename))
        return "File uploaded"


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000)
