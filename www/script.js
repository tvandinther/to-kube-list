function getLists() {
    callApi("todolists", "GET", null, function(response) {
        let listNode = document.getElementById("lists");
        let listItems = response.items.map(generateToDoListNode);
        listNode.replaceChildren(...listItems);
    });
}

function createList() {
    var listName = document.getElementById("listName").value;
    callApi("todolists", "POST", {
        "apiVersion": "tokubelist.com/v1",
        "kind": "TodoList",
        "metadata": {
            "generateName": "list-"
        },
        "spec": {
            "title": listName
        }
    }, function() {
        getLists();
    });
}

function callApi(endpoint, method, body, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            let responseJson = JSON.parse(this.responseText);
            if (callback) {
                callback(responseJson);
            }
        }
    };
    xhttp.open(method, `/apis/tokubelist.com/v1/namespaces/default/${endpoint}`, true);
    xhttp.setRequestHeader("Authorization", "Bearer super-secret-token")

    if (body) {
        xhttp.setRequestHeader("Content-Type", "application/json")
        xhttp.send(JSON.stringify(body));
    } else {
        xhttp.send();
    }
}

function generateToDoListNode(list) {
    let node = document.createElement("li");
    node.classList.add("listItem");

    let name = document.createElement("span");
    name.classList.add("listTitle");
    name.innerText = list.spec.title;

    let title = document.createElement("span");
    title.classList.add("listName");
    title.innerText = list.metadata.name;

    let button = document.createElement("button");
    button.innerText = "Delete";
    button.onclick = function() {
        callApi(`todolists/${list.metadata.name}`, "DELETE", null, function() {
            getLists();
        });
    }

    node.appendChild(name);
    node.appendChild(title);
    node.appendChild(button);

    return node;
}

window.onload = function() {
    getLists();
}