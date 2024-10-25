const fetchDataButton = document.querySelector("#load-data-button");
const fileData = document.querySelector('.file-box-data');
const folderData = document.querySelector('.folder-box-data');
const uploadButton = document.querySelector('#uploadBtn');
const createFolderButton = document.querySelector('#createFolderBtn');
const folderInput = document.querySelector('#folderInput');
const folderBackButton = document.querySelector('#folder-back-button');
//---------------------------------------------------------------------------------
const DataSystem = {
    foldersInSystem: [],
    filesInSystem: [],
    rootFolder: "/files",
    prevFolders: [],
    currentFolder: "",
    currentDownloadLink: "",
};
DataSystem.currentFolder = DataSystem.rootFolder
//---------------------------------------------------------------------------------
//----------------------------->>>>FETCH_FUNCTIONS<<<<-----------------------------
const fetchOntartup = async () => {
    const resp = await fetch(`http://127.0.0.1:3000${DataSystem.rootFolder}`)
    const data = await resp.json(resp)
    DataSystem.foldersInSystem = data["folders"]
    DataSystem.filesInSystem = data["files"]
    showDirs();
    showFiles();
};

const reFetchCurrent = async (newfolder) => {
    const newFetchData = await fetch(newfolder);
    const data = await newFetchData.json();
    DataSystem.foldersInSystem = data["folders"]
    DataSystem.filesInSystem = data["files"]
    resetFileContainers();
    showDirs();
    showFiles();
};
//---------------------------------------------------------------------------------
//------------------------------>>>>RENDER_DIRS/FILES<<<<--------------------------
const showDirs = () => {
    DataSystem.foldersInSystem.forEach((item) => {
        const folderBox = document.createElement("div");
        folderBox.classList.add("folder-element");
    
        const element = document.createElement("li");
        element.innerHTML = `<a class="folder">(DIR): ${item}</a>`
        element.addEventListener("click", async () => {
            DataSystem.prevFolders.push(item);

            const newFolder = DataSystem.currentFolder + `/${item}`;
            DataSystem.currentFolder = newFolder;
            DataSystem.currentDownloadLink = DataSystem.currentDownloadLink + `/${item}`
            reFetchCurrent(newFolder)
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Folder";

        deleteButton.addEventListener('click', async () => {
            console.log(DataSystem.currentFolder)
            const response = await fetch(`/delete${DataSystem.currentDownloadLink}/${item}`, {
                method: 'DELETE',  
            });
            if (response.ok) {
                alert(`${item} deleted successfully`);
                await reFetchCurrent(DataSystem.currentFolder);
            } else {
                alert('File deletion failed');
            };
        });
        folderBox.append(element, deleteButton)
        folderData.appendChild(folderBox)
    });
};

const showFiles = () => {
    DataSystem.filesInSystem.forEach((item) => {
        const fileBox = document.createElement("div");
        fileBox.classList.add("file-element");
    
        const element = document.createElement("li");
        element.innerHTML = `<a class="file" href="/download${DataSystem.currentDownloadLink}/${item}">${item}</a>`

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete File";

        deleteButton.addEventListener('click', async () => {
            const response = await fetch(`/delete${DataSystem.currentDownloadLink}/${item}`, {
                method: 'DELETE',  
            });
            if (response.ok) {
                alert(`${item} deleted successfully`);
                await reFetchCurrent(DataSystem.currentFolder);
            } else {
                alert('File deletion failed');
            };
        });
        fileBox.append(element, deleteButton)
        fileData.appendChild(fileBox)
    });
};
const resetFileContainers = () => {
    fileData.innerHTML = "";
    folderData.innerHTML = "";
};
//----------------------------------------------------------------------------------
//---------------------------->>>>CREATE_FOLDERS<<<<--------------------------------
const createFolder = async () => {
    const folderValue = folderInput.value.trim();
    folderInput.value = "";

    if (folderValue) {
        const response = await fetch(`/createFolder${DataSystem.currentDownloadLink}/${folderValue}`, {
            method: "POST"
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.msg);
            await reFetchCurrent(DataSystem.currentFolder);
        } else {
            alert(result.error);
        }
    } else {
        alert("Folder name cannot be empty.");
    }
};
//----------------------------------------------------------------------------------
//----------------------------->>>>UPLOAD_FILES<<<<---------------------------------
const uploadFiles = async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    console.log(DataSystem.currentDownloadLink)
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/upload${DataSystem.currentDownloadLink}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.msg);
            await reFetchCurrent(DataSystem.currentFolder);
        } else {
            alert(result.error);
        }
    } else {
        alert('Please select a file to upload.');
    }
};
//----------------------------------------------------------------------------------
//------------------------->>>>ON_DOM_CONETENT_LOADED<<<<---------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await fetchOntartup()

    uploadButton.addEventListener('click', () => {
        uploadFiles();
    });

    createFolderButton.addEventListener('click', () => {
        createFolder();
    });

    folderBackButton.addEventListener("click", async () => {
        if (DataSystem.prevFolders.length > 0) {
            const lastFolder = DataSystem.prevFolders.pop();
    
            DataSystem.currentFolder = DataSystem.rootFolder;
            DataSystem.prevFolders.forEach(folder => {
                DataSystem.currentFolder += `/${folder}`;
            });
    
            if (DataSystem.currentDownloadLink.endsWith(`/${lastFolder}`)) {
                DataSystem.currentDownloadLink = DataSystem.currentDownloadLink.slice(0, -(`/${lastFolder}`).length);
            };
    
            await reFetchCurrent(DataSystem.currentFolder);
        } else {
            alert("You are already at the root folder!");
        };
    });
});