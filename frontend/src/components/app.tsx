import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Registration } from './registration/registration.cmp';
import { RtspGrid } from './rtsp-grid/rtsp-grid.cmp';
import { Login } from './login/login.cmp';
import { Home } from './home/home.cmp';
import './app.css';

export class App extends Component {

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/" exact component={Registration}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/home" component={Home}/>
                    <Route path="/grid" component={RtspGrid}/>
                </Switch>
            </Router>
        );
    }

}