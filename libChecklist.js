function Task( id, reward, sector, location, title, details ) {
    // PROPERTIES
    this.id = id;
    this.sector = sector;
    this.reward = reward;
    this.location = location;
    this.title = title;
    this.details = details;
    this.completed = false;
    this.subtasks = [];
    this.aliases = [ id ];
}

// TASK METHODS
Task.prototype.check = function ( value ) {
    if( value ) {
        this.completed = ( value == true );
    } else {
        this.completed = !this.completed;
    }
    this.update();
    this.save();
};

Task.prototype.isComplete = function () {
    var allComplete = true;

    if( this.subtasks.length > 0 ) {
        for( idx in this.subtasks ) {
            allComplete = allComplete && this.subtasks[idx].isComplete();
        }
    } else {
        allComplete = this.completed;
    }

    return allComplete;
};

Task.prototype.save = function () {
    if( !localStorage ) {
        return;
    }

    if( this.completed ) {
        localStorage.setItem( this.id, "" );
    } else {
        localStorage.removeItem( this.id );
    }
};

Task.prototype.update = function () {
    this.completed = this.isComplete();

    if( this != ROOT ) {
        for( var idx in this.aliases ) {
            var element = document.getElementById( generateCheckboxId( this.aliases[idx] ) );
            if (element) {
                element.checked = this.completed;
            }
            parentForId( this.aliases[idx] ).update();
        }
    }
};

// HTML IDENTIFIER GENERATORS
function generateCheckboxId( objectId ) {
    return objectId + "/check";
}

function generateDivId( objectId ) {
    return objectId + "/div";
}

function generateLabelId( objectId ) {
    return objectId + "/label";
}

function generateListId( objectId ) {
    return objectId + "/ul";
}

function generateListItemId( objectId ) {
    return objectId + "/li";
}

function parentForId( task_id ) {
    var id_comps = task_id.split( "/" );
    var leaf = id_comps.pop();

    if( id_comps.length == 0 ) {
        return ROOT;
    } else {
        return TASKS[id_comps.join( "/" )];
    }
}

function addTask( id, aliasid, reward, sector, location, title, details ) {
    var task;

    if( TASKS[id] != null ) {
        alert( "Can't add new Task " + id + ". Already exists." );
        return;
    }

    if( aliasid && TASKS[aliasid] ) {
        task = TASKS[aliasid];
        // Sanity check aliasing task
        if( ( reward   && ( reward   != task.reward   ) )
         || ( sector   && ( sector   != task.sector   ) )
         || ( location && ( location != task.location ) )
         || ( title    && ( title    != task.title    ) )
         || ( details  && ( details  != task.details  ) ) )
        {
            alert( id + " is not idential to " + aliasid + ". Will not alias." );
            return;
        }
        task.aliases.push( id );
    } else {
        var task = new Task( id, reward, sector, location, title, details );
    }

    var parent = parentForId( id );
    if( parent == null ) {
        alert( "Can't add new Task " + id + ". No parent." );
        return;
    }

    TASKS[id] = task;
    parent.subtasks.push( task );
}

function applyLocalStorage() {
    if( !localStorage ) {
        alert( "This browser does not support the LocalStorage feature of HTML5. "
             + "Data cannot be saved. Please consider updating your browser." );
    }

    for( var i = 0; i < localStorage.length; i++ ) {
        var key = localStorage.key( i );
        if( key == null ) {
            continue;
        }

        var task = TASKS[key];
        if( task == null ) {
            continue;
        }

        task.check( true );
    }
}

function clearChildren( elementID ) {
    var element = document.getElementById( elementID );
    if( !element ) {
        return;
    }

    while( element.hasChildNodes() ) {
        element.removeChild( element.firstChild );
    }
}

function createTaskTable( task_array ) {
    var taskTable = document.createElement( "table" );
    taskTable.setAttribute( "border", "1" );
    taskTable.className = "task-table";
    var rows = new Array();
    for( idx in task_array ) {
        var task = task_array[idx];
        rows = rows.concat( createTaskRows( task ) );
    }
    for( idx in rows ) {
        if( rows[idx] )
            taskTable.appendChild( rows[idx] );
    }
    return taskTable;
}

function createTaskRows( task, indent ) {
    var rows = new Array();

    if( !indent ) {
        indent = 0;
    }

    rows.push( createTaskTitleRow( task, indent ) );
    rows.push( createTaskDetailsRow( task, indent + 1 ) );
    rows.push( createTaskLocationRow( task, indent + 1 ) );
    rows.push( createTaskRewardRow( task, indent + 1 ) );

    for( idx in task.subtasks ) {
        rows = rows.concat( createTaskRows( task.subtasks[idx], indent + 1 ) );
    }

    return rows;
}

function createTaskTitleRow( task, indent ) {
    var row = document.createElement( "tr" );

    var check = document.createElement( "td" );
    check.className = "task-check";
    check.appendChild( createTaskCheck( task.id ) );
    row.appendChild( check );

    var title = document.createElement( "td" );
    title.colSpan = 2;
    var titleText;
    if( task.title )
        titleText = createTaskTitle( task.id, task.title, indent );
    else if( task.reward )
        titleText = createTaskTitle( task.id, task.reward, indent );
    else
        titleText = createTaskTitle( task.id, task.id, indent );
    title.appendChild( titleText );
    row.appendChild( title );

    return row;
}

function createTaskLocationRow( task, indent ) {
    if( task.location == null )
        return null;

    var row = document.createElement( "tr" );

    var check = document.createElement( "td" );
    check.className = "task-check";
    check.innerHTML = "&nbsp;";
    row.appendChild( check );

    var key = document.createElement( "td" );
    key.className = "task-key";
    key.appendChild( createTaskKey( task.id, "Location:", indent ) );
    row.appendChild( key );

    var value = document.createElement( "td" );
    value.className = "task-value";
    value.appendChild( createTaskValue( task.id, task.location, indent ) );
    row.appendChild( value );

    return row;
}

function createTaskRewardRow( task, indent ) {
    if( task.reward == null )
        return null;

    var row = document.createElement( "tr" );

    var check = document.createElement( "td" );
    check.className = "task-check";
    check.innerHTML = "&nbsp;";
    row.appendChild( check );

    var key = document.createElement( "td" );
    key.className = "task-key";
    key.appendChild( createTaskKey( task.id, "Reward:", indent ) );
    row.appendChild( key );

    var value = document.createElement( "td" );
    value.className = "task-value";
    value.appendChild( createTaskValue( task.id, task.reward, indent ) );
    row.appendChild( value );

    return row;
}

function createTaskDetailsRow( task, indent ) {
    if( task.details == null )
        return null;

    var row = document.createElement( "tr" );

    var check = document.createElement( "td" );
    check.className = "task-check";
    check.innerHTML = "&nbsp;";
    row.appendChild( check );

    var value = document.createElement( "td" );
    value.className = "task-value";
    value.colSpan = 2;
    value.appendChild( createTaskDetails( task.id, task.details, indent ) );
    row.appendChild( value );

    return row;
}

function createTaskCheck( task_id ) {
    var task = TASKS[task_id];
    var taskCheck = document.createElement( "input" );
    taskCheck.id = generateCheckboxId( task_id );
    taskCheck.type = "checkbox";
    taskCheck.className = "task-check";
    if( task.subtasks.length > 0 ) {
        taskCheck.disabled = true;
    } else {
        taskCheck.onclick = function () {
            task.check();
        };
    }
    taskCheck.checked = task.completed;
    return taskCheck;
}

function createTaskTitle( task_id, text, indent ) {
    var taskTitleDiv = document.createElement( "div" );
    taskTitleDiv.className = "task-title";
    taskTitleDiv.style.marginLeft = indent + "em";
    taskTitleDiv.appendChild( createTaskLabel( task_id, text, "0.5" ) );
    return taskTitleDiv;
}

function createTaskKey( task_id, text, indent ) {
    var taskLabel = document.createElement( "div" );
    taskLabel.className = "task-key";
    taskLabel.style.marginLeft = indent + "em";
    taskLabel.appendChild( createTaskLabel( task_id, text, "0.5" ) );
    return taskLabel;
}

function createTaskValue( task_id, text, indent ) {
    var taskLabel = document.createElement( "div" );
    taskLabel.className = "task-value";
    // taskLabel.style.marginLeft = indent + "em";
    taskLabel.appendChild( createTaskLabel( task_id, text, "0.5" ) );
    return taskLabel;
}

function createTaskDetails( task_id, text, indent ) {
    var taskLabel = document.createElement( "div" );
    taskLabel.className = "task-value";
    taskLabel.style.marginLeft = indent + "em";
    taskLabel.appendChild( createTaskLabel( task_id, text, "0.5" ) );
    return taskLabel;
}

function createTaskLabel( task_id, text, indent ) {
    var taskLabel = document.createElement( "label" );
    taskLabel.id = generateLabelId( task_id );
    taskLabel.className = "task-label";
    taskLabel.setAttribute( "for", generateCheckboxId( task_id ) );
    taskLabel.style.marginLeft = indent + "em";
    taskLabel.textContent = text;
    return taskLabel;
}

function showTasks( /* task_array */ ) {
    clearChildren( "tasks" );
    document.getElementById( "tasks" ).appendChild( createTaskTable( arguments ) );
}

var ROOT = new Task( "" );
var TASKS = {};
var SECTORS = {};
