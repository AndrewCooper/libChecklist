function Task( id, reward, sector, location, details ) {
    // PROPERTIES
    this.id = id
    this.sector = sector
    this.reward = reward
    this.location = location
    this.details = details
    this.completed = false
    this.subtasks = []
    this.aliases = [ id ]

    // METHODS
    this.check = Task__check
    this.isComplete = Task__isComplete
    this.save = Task__save
    this.update = Task__update
}

// TASK METHODS
function Task__check( value ) {
    if( value ) {
        this.completed = ( value == true )
    } else {
        this.completed = !this.completed
    }
    this.update()
    this.save()
}

function Task__isComplete() {
    var allComplete = true

    if( this.subtasks.length > 0 ) {
        for( idx in this.subtasks ) {
            allComplete = allComplete && this.subtasks[idx].isComplete()
        }
    } else {
        allComplete = this.completed
    }

    return allComplete
}

function Task__save() {
    if( !localStorage ) {
        return
    }

    if( this.completed ) {
        localStorage.setItem( this.id, "" )
    } else {
        localStorage.removeItem( this.id )
    }
}

function Task__update() {
    this.completed = this.isComplete()

    if( this != ROOT ) {
        for( var idx in this.aliases ) {
            var element = document.getElementById( generateCheckboxId( this.aliases[idx] ) )
            if( element )
                element.checked = this.completed
            parentForId( this.aliases[idx] ).update()
        }
    }
}

// HTML IDENTIFIER GENERATORS
function generateCheckboxId( objectId ) {
    return objectId+"/check"
}

function generateDivId( objectId ) {
    return objectId+"/div"
}

function generateLabelId( objectId ) {
    return objectId+"/label"
}

function generateListId( objectId ) {
    return objectId+"/ul"
}

function generateListItemId( objectId ) {
    return objectId+"/li"
}

function parentForId( task_id ) {
    var id_comps = task_id.split("/")
    var leaf = id_comps.pop()

    if( id_comps.length == 0 ) {
        return ROOT
    } else {
        return TASKS[id_comps.join("/")]
    }
}

function addTask( id, aliasid, reward, sector, location, details ) {
    var task

    if( TASKS[id] != null ) {
        alert( "Can't add new Task " + id + ". Already exists." )
        return
    }

    if( aliasid && TASKS[aliasid] ) {
        task = TASKS[aliasid]
        // Sanity check aliasing task
        if( (reward   && reward   != task.reward)
         || (sector   && sector   != task.sector)
         || (location && location != task.location)
         || (details  && details  != task.details) )
        {
            alert( id + " is not idential to " + aliasid + ". Will not alias.")
            return
        }
        task.aliases.push( id )
    } else {
        var task = new Task( id, reward, sector, location, details )
    }

    var parent = parentForId( id )
    if( parent == null ) {
        alert( "Can't add new Task " + id + ". No parent." )
        return
    }

    TASKS[id] = task
    parent.subtasks.push( task )
}

function applyLocalStorage() {
    if( !localStorage ) {
        alert( "This browser does not support the LocalStorage feature of HTML5. Data cannot be saved. Please consider updating your browser." )
    }

    for( var i = 0; i < localStorage.length; i++ ) {
        var key = localStorage.key(i)
        if( key == null ) {
            continue
        }

        var task = TASKS[key]
        if( task == null ) {
            continue
        }

        task.check( true )
    }
}

function clearChildren( elementID ) {
    var element = document.getElementById(elementID)
    if( !element ) {
        return
    }

    while( element.hasChildNodes() ) {
        element.removeChild( element.firstChild )
    }
}

function createTaskList( task_array ) {
    var taskList = document.createElement("ul")
    taskList.className = "task-ul"
    for( idx in task_array ) {
        var task = task_array[idx]
        var subItem = document.createElement("li")
        subItem.className = "task-li"
        subItem.id = generateListItemId( task.id )
        subItem.appendChild( createTaskDiv( task.id ) )
        taskList.appendChild( subItem )
    }
    return taskList
}

function createTaskCheck( task_id ) {
    var task = TASKS[task_id]
    var taskCheck = document.createElement("input")
    taskCheck.id = generateCheckboxId( task_id )
    taskCheck.type = "checkbox"
    taskCheck.className = "task-check"
    if( task.subtasks.length > 0 ) {
        taskCheck.disabled = true
    } else {
        taskCheck.onclick = function() { task.check() }
    }
    taskCheck.checked = task.completed
    return taskCheck
}

function createTaskLabel( task_id ) {
    var task = TASKS[task_id]
    var taskLabel = document.createElement("label")
    taskLabel.id = generateLabelId( task_id )
    taskLabel.className = "task-label"
    taskLabel.setAttribute( "for", generateCheckboxId( task_id ) )
    if( task.reward == null ) {
        taskLabel.textContent = task.details
    } else {
        taskLabel.textContent = task.reward
    }
    return taskLabel
}

function createTaskDiv( task_id ) {
    var task = TASKS[task_id]
    var taskDiv = document.createElement("div")
    taskDiv.className = "task-div"
    taskDiv.id = generateDivId( task_id )
    taskDiv.appendChild( createTaskCheck( task_id ) )
    taskDiv.appendChild( createTaskLabel( task_id ) )
    if( task.subtasks.length > 0 ) {
        taskDiv.appendChild( createTaskList( task.subtasks ) )
    }
    return taskDiv
}

function showTasks( /* task_array */ ) {
    clearChildren("tasks")
    document.getElementById("tasks").appendChild( createTaskList( arguments ) )
}
