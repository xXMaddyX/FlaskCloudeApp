const fetchDataButton = document.querySelector("#load-data-button");
const fileData = document.querySelector('.file-box-data');
const uploadButton = document.querySelector('#uploadBtn');

const DataSystem = {
    foldersInSystem: [],
    filesInSystem: [],
    defaultFolder: "files",
    prevFolder: "",
    currentFolder: ""
}

//TODO_ADD FOLDER AND FILE LOAD

const setCurrentFolder = (folder) => {
    DataSystem.currentFolder = folder
};

const fetchFiles = async () => {
    setCurrentFolder(DataSystem.defaultFolder)
    console.log(DataSystem.currentFolder)
    const responceDate = await fetch(`http://127.0.0.1:3000/${DataSystem.currentFolder}`)
    const files = await responceDate.json();
    files.forEach((file) => {
        if (DataSystem.filesInSystem.includes(file)) {
            return
        } else {
            DataSystem.filesInSystem.push(file);
        };
    });
    fileData.innerHTML = "";
    createListItem("files");
};

const createFileList = () => {
    for (const fileItem of DataSystem.filesInSystem) {
        const elementBox = document.createElement("div");
        elementBox.classList.add("element-box");

        const element = document.createElement("li");
        element.innerHTML = `<a class="files" href="/download/${fileItem}">${fileItem}</a>`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete File";
        deleteButton.addEventListener('click', async () => {
            const response = await fetch(`/delete/${fileItem}`, {
                method: 'DELETE',  
            });
            if (response.ok) {
                alert(`${fileItem} deleted successfully`);
                DataSystem.filesInSystem = DataSystem.filesInSystem.filter(file => file !== fileItem);
                await fetchFiles()
            } else {
                alert('File deletion failed');
            }
        })
        elementBox.appendChild(element);
        elementBox.appendChild(deleteButton);
        fileData.appendChild(elementBox);
    };
}

const createFolderList = () => {
    for (const fileItem of DataSystem.filesInSystem) {
        const elementBox = document.createElement("div");
        elementBox.classList.add("element-box");

        const element = document.createElement("li");
        element.innerHTML = `<a class="files" href="/download/${fileItem}">${fileItem}</a>`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete File";
        deleteButton.addEventListener('click', async () => {
            const response = await fetch(`/delete/${fileItem}`, {
                method: 'DELETE',  
            });
            if (response.ok) {
                alert(`${fileItem} deleted successfully`);
                filesInSystem = filesInSystem.filter(file => file !== fileItem);
                await fetchData()
            } else {
                alert('File deletion failed');
            }
        })
        elementBox.appendChild(element);
        elementBox.appendChild(deleteButton);
        fileData.appendChild(elementBox);
    };
}

const createListItem = (typeOfData) => {
    switch (typeOfData) {
        case "files":
            createFileList();
            break
        case "folders":
            createFolderList();
            break
        default:
            return
    };
 };


const uploadFile = async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file.');
            return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const result = await response.text();
                alert(result);
        } else {
            alert('File upload failed.');
        }
        } catch (error) {
            alert('Error during file upload: ' + error);
        };
 };


document.addEventListener("DOMContentLoaded", async() => {
    fetchDataButton.addEventListener('click', async () => {
        await fetchFiles();

    });

    uploadButton.addEventListener('click', async () => {
        await uploadFile();
        await fetchFiles();
    });

    await fetchFiles();
});