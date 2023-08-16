function getLists() {
    callApi("todolists", "GET", null, function(response) {
        let listNode = document.getElementById("lists");
        let listItems = response.items.map(generateToDoListNode);
        listNode.replaceChildren(...listItems);
    });
}

function getItems(listName, callback) {
    callApi(`todoitems?labelSelector=tokubelist.com/list=${listName}`, "GET", null, function(response) {
        let listItems = response.items.map((item) => generateToDoItemNode(item, listName));
        if (typeof callback === "function") callback(listItems);
    });
}

function createList() {
    var listTitle = document.getElementById("listTitle").value;
    callApi("todolists", "POST", {
        "apiVersion": "tokubelist.com/v1",
        "kind": "TodoList",
        "metadata": {
            "generateName": "list-"
        },
        "spec": {
            "title": listTitle
        }
    }, function() {
        getLists();
    });
}

function createItem(itemTitle, listName) {
    callApi("todoitems", "POST", {
        "apiVersion": "tokubelist.com/v1",
        "kind": "TodoItem",
        "metadata": {
            "generateName": "item-",
            "labels": {
                "tokubelist.com/list": listName
            }
        },
        "spec": {
            "title": itemTitle,
            "description": "This is a description"
        }
    }, function() {
        getItems(listName, (items) => renderItems(listName, items));
    });
}

function callApi(endpoint, method, body, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            let responseJson = JSON.parse(this.responseText);
            if (typeof callback === "function") callback(responseJson);
        }
    };
    xhttp.open(method, `/apis/tokubelist.com/v1/namespaces/default/${endpoint}`, true);
    xhttp.setRequestHeader("Authorization", "Bearer super-secret-token")

    if (body) {
        if (method === "PATCH") {
            xhttp.setRequestHeader("Content-Type", "application/merge-patch+json")
        } else {
            xhttp.setRequestHeader("Content-Type", "application/json")
        }
        xhttp.send(JSON.stringify(body));
    } else {
        xhttp.send();
    }
}

function generateToDoListNode(list) {
    let node = document.createElement("li");
    node.classList.add("listItem");

    let detailsNode = document.createElement("div");
    detailsNode.classList.add("details");

    let name = document.createElement("span");
    name.classList.add("listTitle");
    name.innerText = list.spec.title;

    let title = document.createElement("span");
    title.classList.add("listName");
    title.innerText = list.metadata.name;

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.onclick = function() {
        callApi(`todoitems?labelSelector=tokubelist.com/list=${list.metadata.name}`, "DELETE", null, function() {});

        callApi(`todolists/${list.metadata.name}`, "DELETE", null, function() {
            getLists();
        });
    }

    detailsNode.appendChild(name);
    detailsNode.appendChild(title);
    detailsNode.appendChild(deleteButton);

    let itemsWrapper = document.createElement("div");

    let itemsNode = document.createElement("ul");
    itemsNode.classList.add("items");
    itemsNode.id = `items-${list.metadata.name}`;

    let newItemNode = document.createElement("li");
    newItemNode.classList.add("item");
    newItemNode.classList.add("newItem");

    let addItemInput = document.createElement("input");
    addItemInput.type = "text";
    addItemInput.id = `itemTitle-${list.metadata.name}`;
    addItemInput.placeholder = "Item Title";

    let addItemButton = document.createElement("button");
    addItemButton.innerText = "Add Item";
    addItemButton.onclick = function() {
        var itemTitle = document.getElementById(`itemTitle-${list.metadata.name}`).value;
        createItem(itemTitle, list.metadata.name);
        addItemInput.value = "";
    }

    getItems(list.metadata.name, (items) => renderItems(list.metadata.name, items));

    newItemNode.appendChild(addItemInput);
    newItemNode.appendChild(addItemButton);

    itemsWrapper.appendChild(newItemNode);
    itemsWrapper.appendChild(itemsNode);

    node.appendChild(detailsNode);
    node.appendChild(itemsWrapper);

    return node;
}

function generateToDoItemNode(item, listName) {
    let node = document.createElement("li");
    node.classList.add("item");
    
    let titleNode = document.createElement("span");
    titleNode.classList.add("itemTitle");
    titleNode.innerText = item.spec.title;

    let descriptionNode = document.createElement("span");
    descriptionNode.classList.add("itemDescription");
    descriptionNode.innerText = item.spec.description;

    let completedNode = document.createElement("input");
    completedNode.type = "checkbox";
    completedNode.classList.add("itemCompleted");
    completedNode.checked = item.spec.completed;
    completedNode.onchange = function() {
        callApi(`todoitems/${item.metadata.name}`, "PATCH", {
            "spec": {
                "completed": completedNode.checked
            }
        }, function() {
            getItems(listName, (items) => renderItems(listName, items));
        });
    }

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.onclick = function() {
        callApi(`todoitems/${item.metadata.name}`, "DELETE", null, function() {
            getItems(listName, (items) => renderItems(listName, items));
        });
    }

    node.appendChild(titleNode);
    node.appendChild(descriptionNode);
    node.appendChild(completedNode);
    node.appendChild(deleteButton);

    return node;
}

function renderItemsHeader() {
    let node = document.createElement("div");
    // node.classList.add("item");
    node.classList.add("header");

    let titleNode = document.createElement("span");
    titleNode.classList.add("itemTitle");
    titleNode.innerText = "Title";

    let descriptionNode = document.createElement("span");
    descriptionNode.classList.add("itemDescription");
    descriptionNode.innerText = "Description";

    let completedNode = document.createElement("span");
    completedNode.classList.add("itemCompleted");
    completedNode.innerText = "Completed";

    node.appendChild(titleNode);
    node.appendChild(descriptionNode);
    node.appendChild(completedNode);

    return node;
}

function renderItems(listName, listItems) {
    let itemsNode = document.getElementById(`items-${listName}`);
    itemsNode.replaceChildren(renderItemsHeader(), ...listItems);
}

document.getElementById("createListButton").onclick = function() {
    let listTitle = document.getElementById("listTitle");
    createList(listTitle.value);
    listTitle.value = "";
}

window.onload = function() {
    getLists();
}