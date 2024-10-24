const fetchDataButton = document.querySelector("#load-data-button");
const fileData = document.querySelector('.file-box-data');
const uploadButton = document.querySelector('#uploadBtn');

let filesInSystem = []

const fetchData = async () => {
    const responceDate = await fetch("http://127.0.0.1:3000/files")
    const files = await responceDate.json();
    files.forEach((file) => {
        if (filesInSystem.includes(file)) {
            return
        } else {
            filesInSystem.push(file);
        };
    });
    fileData.innerHTML = "";
    createListItem();
};

const createListItem = () => {
    for (const fileItem of filesInSystem) {
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
        await fetchData();

    });

    uploadButton.addEventListener('click', async () => {
        await uploadFile();
        await fetchData();
    });

    await fetchData();
});