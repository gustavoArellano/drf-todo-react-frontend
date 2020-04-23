import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: '',
        completed: false
      },
      editing: false,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if ( cookie.substring(0, name.length +1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length +1));
                break;
            }
        }
    }
    return cookieValue;
}

  componentDidMount() {
    this.fetchTasks()
  }

  fetchTasks() {
    console.log('Fetching...')

    fetch('http://localhost:8000/api/task-list/')
    .then(response => response.json())
    .then(data => 
      this.setState({todoList: data})
      )
  }

  handleChange(e) {
    var value = e.target.value

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handleSubmit(e) {

    e.preventDefault();

    var csrftoken = this.getCookie('csrftoken')
    var url = 'http://localhost:8000/api/task-create/'
    if(this.state.editing === true) {
      url = `http://localhost:8000/api/task-update/${ this.state.activeItem.id }/`
      this.setState({
        editing: false
      })
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          completed: false
        }
      })
    }).catch(function(error) {
      console.log('ERROR: ', error)
    })
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true
    })
  }

  deleteItem(task) {
    var csrftoken = this.getCookie('csrftoken')
    fetch(`http://localhost:8000/api/task-delete/${ task.id }/`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
    }).then((response) => {
      this.fetchTasks()
    })
  }

  strikeUnstrike(task){

    task.completed = !task.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://localhost:8000/api/task-update/${task.id}/`

      fetch(url, {
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'X-CSRFToken':csrftoken,
        },
        body:JSON.stringify({'completed': task.completed, 'title':task.title})
      }).then(() => {
        this.fetchTasks()
      })

    console.log('TASK:', task.completed)
  }


  render() {
    var tasks = this.state.todoList
    var self = this
    return(
      <div className="container">

        <form id="form" onSubmit={this.handleSubmit}>
          <input id="title" onChange={this.handleChange} value={this.state.activeItem.title} name="title" type="text" placeholder="Add a ToDo!" />
          <input id="submit" name="add" type="submit" />
        </form>

        <div id="list-wrapper">
          {tasks.map(function(task, index){
            return(
              <div key={index} className="task-wrapper">

                <div className="task" onClick={() => self.strikeUnstrike(task)}>

                  {task.completed === false ? (
                    <span>{task.title}</span>
                    ) : (
                     <strike>{task.title}</strike>
                    )}
                  
                </div>

                <div className="task">
                  <button onClick={() => self.startEdit(task)}>Edit</button>
                </div>

                <div className="task">
                  <button onClick={() => self.deleteItem(task)}>-</button>
                </div>

              </div>
            )
          })}
        </div>

      </div>

    )
  }
}

export default App;
