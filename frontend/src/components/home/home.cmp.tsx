import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
const axios = require('axios');

export class Home extends Component<any, any> {

    //TODO: move this to external file
    private urlRegex: RegExp = /(rtsp?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi; 

    constructor(props: any) {
        super(props);

        this.state = {
            url: {
                value: '',
                isValid: false,
                isVisited: false
            }
        };
    }

    componentDidMount(): void {
        if (!this.props.location.state) {
            this.setState({
                ...this.state,
                redirect: {
                    pathname: '/login',    
                }
            });
        }
    }

    render() {
        if (this.state.redirect) {
            return (<Redirect to={this.state.redirect} push={true}/>)
        }

        return (
            <div className="formContainer">
                <header className="formHeader">Home</header>
                <div className="controlContainer">
                    <div className="controlName requiredControl">RTSP URL</div>
                    <div className="controlInputContainer">
                        <input
                            className="controlInput"
                            name="url"
                            value={this.state.url.value}
                            onChange={this.handleUrlChange.bind(this)}
                            onBlur={this.handleInputBlur.bind(this)}
                        />
                    </div>
                    {
                        this.isError('url') ?
                            <div className="controlError">
                                invalid url
                            </div> : ''
                    }
                </div>

                <div className="buttonContainer">
                    <button 
                        className="submitButton" 
                        disabled={!this.isSubmitEnabled()}
                        onClick={this.onSubmit.bind(this)}
                        >
                        Add
                    </button>
                </div>
            </div>
        );
    }

    private onSubmit(): void {
        const id: string = this.props.location.state.id;

        axios.post(`/rtsp/users/${id}/urls`, {
            url: this.state.url.value
        })
        .then(() => {
            this.setState({
                ...this.state,
                redirect: {
                    pathname: '/grid',
                    state: {
                        id
                    }
                }
            });
        })
        .catch((error: Error) => {
            //TODO: handle error
        });
    }

    private handleUrlChange(event: { target: HTMLInputElement }): void {
        const value: string = event.target.value;
        this.state.url.value = value;
        this.state.url.isValid = value.match(this.urlRegex);
        this.setState(this.state);
    }

    private handleInputBlur(event: { target: HTMLInputElement }): void {
        const fieldState = this.state[event.target.name];

        if (!fieldState.isVisited) {
            fieldState.isVisited = true;
            this.setState(this.state);
        }
    }

    private isError(field: string): boolean {
        return !this.state[field].isValid && this.state[field].isVisited;
    }

    private isSubmitEnabled(): boolean {
        return this.state.url.isValid
    }

}