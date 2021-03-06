import React from 'react';
import { Link } from 'react-router-dom';

export default class EditBoat extends React.Component {

  constructor (props) {
    super(props);
    this.boatId = this.props.match.params.boatId;
    this.state = {
      errMsg: '',
      boatData: '',

      //Form
      name: '',
      type: '',
      photo: '',
      length: '',
      work_description: '',
      arrival_date: '',
      delivery_date: '',
      status: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount () {
    this._fetchData(this.boatId).then(boat => {
      this.setState({
        boatData: boat,
        name: boat.name,
        type: boat.type,
        photo: boat.photo,
        length: boat.length,
        work_description: boat.work_description,
        arrival_date: boat.arrival_date,
        delivery_date: boat.delivery_date,
        status: boat.status
      });
    }).catch(err => {
      this.setState({
        notFound: true,
      });
    });
  }

  /**
   * Return boat object containing related workers' data
   * @param id
   * @returns {Promise.<TResult>}
   * @private
   */
  _fetchData (id) {
    //First retrieve boat data
    return fetch(`http://localhost:3000/boats/${id}`, {
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.ok) {
        return res.json();
      }
      else {
        throw new Error(res.statusText);
      }
    }).then(boat => {
      //Retrieve all workers to filter by boat id assigned to them
      return fetch('http://localhost:3000/workers', {
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (res.ok) {
          return res.json();
        }
      }).then(workers => {
        let assignedWorkers = workers.filter((worker) => {
          return worker.boatIds.includes(parseInt(id));
        });
        //Merge worker data to boat object
        return Object.assign(boat, {'workers': assignedWorkers});
      });
    });
  }

  _convertDate (dateString) {
    let regex = /\d{4}-\d{2}-\d{2}/;
    return regex.exec(dateString);
  }

  handleChange (event) {
    const inputName = event.target.name;
    const inputValue = event.target.value;
    this.setState({
      [inputName]: inputValue,
    });
  }

  handleDelete () {
    fetch(`http://localhost:3000/boats/${this.boatId}`, {
      method: 'DELETE',
    }).then(res => {
      if (res.ok) {
        alert('Deleted');
        this.props.history.push('/');
      }
      else {
        throw new Error(res.statusText);
      }
    }).catch(err => {
      alert('Error: ', err);
    });
  }

  handleSubmit (event) {
    event.preventDefault();

    //Collect data
    let form = document.getElementById('edit-boat-form');
    const formData = new FormData(form); //multipart/form-data format

    fetch(`http://localhost:3000/boats/${this.boatId}`, {
      method: 'PATCH',
      body: JSON.stringify(this._convertToObj(formData)),
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => {
      if (res.ok) {
        alert('Updated');
        this.props.history.push('/');
      }
      else {
        throw new Error(res.statusText);
      }
    }).catch(err => {
      alert('Error: ', err);
    });
  }

  _convertToObj (formData) {
    let jsonFormData = {};
    for (let entry of formData.entries()) {
      jsonFormData[entry[0]] = entry[1];
    }
    return jsonFormData;
  }

  render () {
    const {boatData} = this.state;
    let assignedWorkers = {};
    if(boatData.workers){
      assignedWorkers=boatData.workers.map((worker, i)=>{
        return(
          <li key={i}>{worker.name}</li>
        )
      })
    }


    if (boatData !== '') {
      return (
        <div>
          <h2>View and Update</h2>
          <hr/>

          <div className="row">
            <div className="col-md-3">
              <div className="text-center">
                <img src={`${this.state.photo}`} className="img img-fluid"
                     alt="Boat image"/>
              </div>

              <h4>Workers assigned:</h4>
              <ul>
                {assignedWorkers}
              </ul>
            </div>

            <div className="col-md-9 ">
              <form id="edit-boat-form" onSubmit={this.handleSubmit}
                    encType="multipart/form-data">
                <p style={{color: 'red'}}>{this.state.errMsg}</p>

                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" name="name" className="form-control"
                         id="name"
                         placeholder="Boat name"
                         onChange={this.handleChange} value={this.state.name}
                         required/>
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <input type="text" name="type" className="form-control"
                         id="type" placeholder="Boat type"
                         onChange={this.handleChange} value={this.state.type}
                         required/>
                </div>

                <div className="form-group">
                  <label htmlFor="length">Length</label>
                  <input type="number" name="length" className="form-control"
                         id="length" placeholder="Boat length"
                         onChange={this.handleChange}
                         value={this.state.length}/>
                </div>

                <div className="form-group">
                  <label htmlFor="work-description">Work description</label>
                  <input type="text" name="work_description"
                         className="form-control"
                         id="work-description" placeholder="Work description"
                         onChange={this.handleChange}
                         value={this.state.work_description}/>
                </div>

                <div className="form-group">
                  <label htmlFor="arrival-date">Arrive date</label>
                  <input type="date" name="arrival_date"
                         className="form-control"
                         id="arrival-date"
                         placeholder="yyyy/mm/dd"
                         onChange={this.handleChange}
                         value={this._convertDate(this.state.arrival_date)[0]}/>
                </div>

                <div className="form-group">
                  <label htmlFor="delivery-date">Delivery date</label>
                  <input type="date" name="delivery_date"
                         className="form-control"
                         id="delivery-date"
                         placeholder="yyyy/mm/dd"
                         onChange={this.handleChange}
                         value={this._convertDate(
                           this.state.delivery_date)[0]}/>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <input type="text" name="status" className="form-control"
                         id="status" placeholder="Status"
                         onChange={this.handleChange}
                         value={this.state.status}/>
                </div>

                <button type="submit" className="btn btn-primary"
                        onClick={(e) => {this.handleSubmit(e);}}>Update
                </button>
                <Link to='/boats' className="btn btn-secondary">Cancel</Link>
                <button type="button" className="btn btn-danger float-right"
                        onClick={this.handleDelete}>Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
    else if (this.state.notFound) {
      return (
        <h1>Sorry, boat does not exist</h1>
      );
    }
    else {
      return (
        <h1>Loading...</h1>
      )
    }
  }
}




