const fetchDataButton = document.querySelector("#load-data-button");
const fileData = document.querySelector('.file-box-data');
const folderData = document.querySelector('.folder-box-data');
const uploadButton = document.querySelector('#uploadBtn');
const createFolderButton = document.querySelector('#createFolderBtn');
const folderInput = document.querySelector('#folderInput');
const folderBackButton = document.querySelector('#folder-back-button');

const renameBox = document.querySelector('.app-rename-file-box');
const renameBoxOkBtn = document.querySelector('#file-rename-ok-btn');
const renameBoxCancelBtn = document.querySelector('#file-rename-c-button');
const renameBoxInput = document.querySelector('#file-rename-input');

const renamefolderBox = document.querySelector('.app-rename-folder-box');
const renameFolderBoxOkBtn = document.querySelector('#folder-rename-ok-btn');
const renameFolderBoxCancelBtn = document.querySelector('#folder-rename-c-button');
const ranameFolderBoxInput = document.querySelector('#folder-rename-input');
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


const STATES = {
    renameBoxState: false,
    renameBoxFilePath: "",
    currentFileName: "",

    folderRenameBoxState: false,
    folderRenameBoxFolderPath: "",
    currentFolder: "",
};
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
    return;
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

        const folderBtnBox = document.createElement("div");
        folderBtnBox.classList.add("folder-element-btn-box");


        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener('click', async () => {
            console.log(DataSystem.currentFolder)
            const response = await fetch(`/delete${DataSystem.currentDownloadLink}/${item}`, {
                method: 'DELETE',  
            });
            if (response.ok) {
                alert(`${item} deleted successfully`);
                reFetchCurrent(DataSystem.currentFolder);
            } else {
                alert('File deletion failed');
            };
            return;
        });

        const renameButton = document.createElement("button");
        renameButton.textContent = "Rename";
        renameButton.addEventListener("click", () => {
            STATES.folderRenameBoxState = showAndHideBox(renamefolderBox, STATES.folderRenameBoxState);
            STATES.folderRenameBoxFolderPath = DataSystem.currentDownloadLink + `/${item}`
        });

        folderBtnBox.append(renameButton, deleteButton)
        folderBox.append(element, folderBtnBox)
        folderData.appendChild(folderBox)
    });
};

const showFiles = () => {
    DataSystem.filesInSystem.forEach((item) => {
        const fileBox = document.createElement("div");
        fileBox.classList.add("file-element");
    
        const element = document.createElement("li");
        element.innerHTML = `<a class="file" href="/download${DataSystem.currentDownloadLink}/${item}">${item}</a>`

        const fileBtnBox = document.createElement("div");
        fileBtnBox.classList.add("file-element-btn-box");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
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
            return;
        });

        const renameButton = document.createElement("button");
        renameButton.textContent = "Rename";
        renameButton.addEventListener("click", () => {
            STATES.renameBoxState = showAndHideBox(renameBox, STATES.renameBoxState);
            STATES.renameBoxFilePath = DataSystem.currentDownloadLink + `/${item}`
        });

        fileBtnBox.append(renameButton, deleteButton);
        fileBox.append(element, fileBtnBox);
        fileData.appendChild(fileBox);
    });
};
const resetFileContainers = () => {
    fileData.innerHTML = "";
    folderData.innerHTML = "";
};

const showAndHideBox = (target_box, target_State) => {
    target_State = !target_State
            if (target_State) {
                target_box.classList.add("open")
            } else {
                target_box.classList.remove("open")
            }
    return target_State
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
    };
    return;
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

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/upload${DataSystem.currentDownloadLink}`, true);

        // Fortschrittsanzeige
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                const progressBar = document.getElementById("uploadProgressBar");
                progressBar.style.width = `${percentComplete}%`;
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                alert(result.msg);
                const progressBar = document.getElementById("uploadProgressBar");
                progressBar.style.width = "0%"
                reFetchCurrent(DataSystem.currentFolder);
            } else {
                alert('Upload failed.');
            }
        };

        xhr.onerror = function () {
            alert('Upload error.');
        };

        xhr.send(formData);
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
        return;
    });

    renameBoxOkBtn.addEventListener('click', async () => {
        STATES.renameBoxState = showAndHideBox(renameBox, STATES.renameBoxState);
        let inputVal = renameBoxInput.value;
        renameBoxInput.value = "";

        const testFetchObj = {
            currentFilePath: STATES.renameBoxFilePath,
            currentPath: DataSystem.currentDownloadLink,
            fileName: STATES.renameBoxFilePath.split("/").pop(),
            nameToChange: inputVal,
        };
        
        const responce = await fetch(`/rename_file`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testFetchObj)
        });
        await reFetchCurrent(DataSystem.currentFolder);
        let data = await responce.json();
        alert(data.msg);
        return;
    });

    renameBoxCancelBtn.addEventListener('click', () => {
        STATES.renameBoxState = showAndHideBox(renameBox, STATES.renameBoxState);
    });

    renameFolderBoxOkBtn.addEventListener('click', async () => {
        STATES.folderRenameBoxState = showAndHideBox(renamefolderBox, STATES.folderRenameBoxState);
        let inputVal = ranameFolderBoxInput.value;
        ranameFolderBoxInput.value = "";

        const postData = {
            currentFolderPath: STATES.folderRenameBoxFolderPath,
            currentPath: DataSystem.currentDownloadLink,
            folderName: STATES.folderRenameBoxFolderPath,
            nameToChange: inputVal
        };

        const responce = await fetch(`/rename_folders`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        await reFetchCurrent(DataSystem.currentFolder);

        let data = await responce.json();
        alert(data.msg);
        return;
    });
    renameFolderBoxCancelBtn.addEventListener('click', () => {
        STATES.folderRenameBoxState = showAndHideBox(renamefolderBox, STATES.folderRenameBoxState);
    });
});