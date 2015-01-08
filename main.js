var data = {"tasks":[]};

window.onload = function() {

  $('#main').css('height', ($(window).height()));
  $('#toDoInput').css('width', (($('#list-container').innerWidth()) - 11));
  $('#toDoList').height(function(index, height) {
    return window.innerHeight - $(this).offset().top - 12;
  });

  window.onresize = function() {
    $('#main').css('height', ($(window).height()));
    $('#toDoInput').css('width', (($('#list-container').innerWidth()) - 11));
    $('#toDoList').height(function(index, height) {
      return window.innerHeight - $(this).offset().top - 12;
    });

  }

  loadToDoTasks(function() {
    console.log(data.tasks);
    outputToDoItems(function() {

    });
  });

  $("#toDoInput").change(addToDo);
  $("#deleteAll").click(deleteAllPersist);
  $('#toDoList').on('click', 'li', function() {
    var arrIndex = data.tasks.indexOf($(this).text());

    console.log($(this).text())
    $(this).remove();
    if (arrIndex > -1) {
      data.tasks.splice(arrIndex, 1);
    }

    console.log(data.tasks);

    writeSyncFS(function() {

    });
  });

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

  data.tasks.push($("#toDoInput").val());
  $("#toDoInput").val("");

  outputToDoItems(function() {
    writeSyncFS(function() {

    });
  });

}

function outputToDoItems(callback) {
  deleteAll();
  for (var i in data.tasks) {
    $("#toDoList").append("<li>"+data.tasks[i]+"</li>");
  }
  callback();
}

function deleteAll() {
  $("#toDoList").empty();
}

function deleteAllPersist() {
  data.tasks = [];
  deleteAll();
  writeSyncFS(function() {

  });
}

$(document).ready(function(){
  $('.img-zoom').hover(function() {
    $(this).addClass('transition');
  }, function() {
    $(this).removeClass('transition');
  });
});
