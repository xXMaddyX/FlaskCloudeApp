from flask import Flask, send_file, jsonify, send_from_directory, request, url_for
import os
import urllib.parse

app = Flask(__name__, static_folder="static")
UPLOAD_FOLDER = "./files"

#--------------------------------->>>>MIDDEL_WARE<<<<------------------------------------
@app.route("/")
def index():
    return send_file(os.path.join(app.static_folder, "index.html"))
#----------------------------------------------------------------------------------------
#------------------------------>>>>FILE_AND_DIR_LOAD<<<<---------------------------------
@app.route("/files")
def list_root_dir():
    dir_and_files = os.listdir(UPLOAD_FOLDER)
    files = []
    folders = []
    try:
        for item in dir_and_files:
            item_path = os.path.join(UPLOAD_FOLDER, item)
            if os.path.isdir(item_path):
                folders.append(item)
            if os.path.isfile(item_path):
                files.append(item)
        return jsonify({
            "files": files,
            "folders": folders
        })
    except Exception as e:
        return jsonify({"error", str(e)}), 500      

@app.route("/files/<path:subdir>")
def list_items_in_selected_dir(subdir):
    targetDir = os.path.join(UPLOAD_FOLDER, subdir)
    files = []
    folders = []
    try:
        dir_and_files = os.listdir(targetDir)
        for item in dir_and_files:
            item_path = os.path.join(targetDir, item)
            if os.path.isdir(item_path):
                folders.append(item)
            if os.path.isfile(item_path):
                files.append(item)
        return jsonify({
            "files": files,
            "folders": folders
        })
    except Exception as e:
        return jsonify({"error", str(e)}), 500
#----------------------------------------------------------------------------------------
#------------------------------>>>>DOWNLOAD_FILES<<<<------------------------------------
@app.route('/download/<path:file>')
def download_file(file):
    try:
        decoded_file = urllib.parse.unquote(file)
        file_path = os.path.join(UPLOAD_FOLDER, decoded_file)
        return send_file(file_path, as_attachment=True)
    except FileNotFoundError:
        return "File not Found", 404
#----------------------------------------------------------------------------------------
#------------------------------>>>>DELETE_FILES<<<<--------------------------------------
import shutil 
@app.route('/delete/<path:file>', methods=["DELETE"])
def delete_file(file):
    try:
        decoded_file = urllib.parse.unquote(file)
        file_path = os.path.join(UPLOAD_FOLDER, decoded_file)
        
        if os.path.isfile(file_path):
            os.remove(file_path)
            return jsonify({"message": "File deleted"}), 200
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
            return jsonify({"message": "Directory deleted"}), 200
        else:
            return jsonify({"error": "File or directory not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#----------------------------------------------------------------------------------------
#--------------------------------->>>>CREATE_FOLDER<<<<----------------------------------
@app.route("/createFolder/<path:dirName>", methods=["POST"])
def createDir(dirName):
    directory_path = os.path.join(UPLOAD_FOLDER, dirName)
    if os.path.exists(directory_path):
        return jsonify({"error": "Dir allready exists"}), 400
    else:
        os.mkdir(directory_path)
        return jsonify({"msg": "Directory created"})
#----------------------------------------------------------------------------------------
#---------------------------------->>>>UPLOAD_FILES<<<<----------------------------------
@app.route("/upload", defaults={'subdir': ''}, methods=["POST"])
@app.route("/upload/<path:subdir>", methods=["POST"])
def upload_file(subdir):
    target_folder = os.path.join(UPLOAD_FOLDER, subdir)
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    file_path = os.path.join(target_folder, file.filename)
    file.save(file_path)
    
    return jsonify({"msg": "File uploaded successfully", "filename": file.filename}), 200
#----------------------------------------------------------------------------------------
#-------------------------------->>>>RENAME_FILES<<<<------------------------------------
@app.route("/rename_file", methods=["POST"])
def rename_file():
    try:
        data = request.get_json()
        _ ,fileEnding = os.path.splitext(data["currentFilePath"])

        if data["nameToChange"] == "":
            return jsonify({"msg": "You didnt Enter new FileName!!!"})
        
        current_file_path = os.path.join(UPLOAD_FOLDER, data["currentFilePath"].lstrip("/"))
        change_to_path = os.path.join(UPLOAD_FOLDER, data["currentPath"].lstrip("/"), data["nameToChange"] + fileEnding)
        os.rename(current_file_path, change_to_path)

        return jsonify({"msg": "File Renamed"})
    except Exception as e:
        return jsonify({"msg": e})
#-----------------------------------------------------------------------------------------
#-------------------------------->>>>RENAME_FOLDERS<<<<-----------------------------------
@app.route("/rename_folders", methods=["POST"])
def rename_folders():
    try:
        data = request.get_json()

        if data["nameToChange"] == "":
            return jsonify({"msg": "You didnt Enter a new Folder Name!!!"})
        
        current_folder_path = os.path.join(UPLOAD_FOLDER, data["folderName"].lstrip("/"))
        change_to_folder = os.path.join(UPLOAD_FOLDER, data["nameToChange"])

        os.rename(current_folder_path, change_to_folder)
        return jsonify({"msg": "Folder Renamed"})
    except Exception as e:
        return jsonify({"msg": e})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000)