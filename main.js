var data = {"tasks":[]};

window.onload = function() {

  loadToDoTasks(function() {
    console.log(data.tasks);
    outputToDoItems(function() {

    });
  });

  document.querySelector("#toDoInput").addEventListener("change", addToDo);

  document.querySelector("#deleteAll").addEventListener("click", deleteAllPersist);

  //document.querySelector("#test").addEventListener("click", firstRun);

}

function loadToDoTasks(callback) {
  chrome.syncFileSystem.requestFileSystem(function(fs) {
    fs.root.getFile("tasks.json", {create:false}, function() {
      fs.root.getFile('tasks.json', {create: false}, function(file) {
        file.file(function(readFile) {

          var reader = new FileReader();

          reader.onerror = function(e) {
            console.log(e);
          }

          reader.onloadend = function(e) {
            data = JSON.parse(this.result);
            callback();
          }

          reader.readAsText(readFile);

        })
      })
    }, function() {
      fs.root.getFile("tasks.json", {create:true}, function() {
        console.log("File missing, creating new tasks file.");
        writeSyncFS(function() {
          console.log("tasks.json successfully created");
        });
      });
    });
  })
}

function writeSyncFS(callback) {
  chrome.syncFileSystem.requestFileSystem(function(fs) {
    fs.root.getFile('tasks.json', {create: false}, function(file) {

      file.createWriter(function(writer) {

        writer.onwriteend = function(e) {
          writer.onwriteend = null;
          jsonString = JSON.stringify(data);
          var blob = new Blob([jsonString]);
          writer.write(blob);
          console.log("File successfully written");

        }

        writer.onerror = function(e) {

          console.log("Error:" + e);

        }

        writer.seek(writer.length);
        writer.truncate(0);



      })
    })
  })
}

function addToDo() {
  data.tasks.push(document.querySelector("#toDoInput").value);
  document.querySelector("#toDoInput").value = "";
  outputToDoItems(function() {
    writeSyncFS(function() {

    });
  });

}

function outputToDoItems(callback) {
  deleteAll();
  for (var i in data.tasks) {
    node = document.createTextNode(data.tasks[i]);
    parentElement = document.querySelector("#toDoList");
    listElement = document.createElement("li");
    listElement.appendChild(node);
    parentElement.appendChild(listElement);
  }
  callback();
}

function deleteAll() {
  var myNode = document.querySelector("#toDoList");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
}

function deleteAllPersist() {
  data.tasks = [];
  deleteAll();
  writeSyncFS(function() {

  });
}
