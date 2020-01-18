import React, { Component } from 'react';
import { validate } from 'email-validator';
import { Redirect } from 'react-router-dom';
const axios = require('axios');

export class Login extends Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            email: {
                value: '',
                isValid: false,
                isVisited: false
            },
            password: {
                value: '',
                isVisited: false
            },
        };
    }

    render() {
        if (this.state.redirect) {
            return (
                <Redirect to={this.state.redirect} push={true} />
            );
        }

        return (
            <div className="formContainer">
                <header className="formHeader">Login</header>
                <div className="controlContainer">
                    <div className="controlName requiredControl">Email</div>
                    <div className="controlInputContainer">
                        <input
                            className="controlInput"
                            name="email"
                            value={this.state.email.value}
                            onChange={this.handleEmailChange.bind(this)}
                            onBlur={this.handleInputBlur.bind(this)}
                        />
                    </div>
                    {
                        this.isError('email') ?
                            <div className="controlError">
                                invalid email
                            </div> : ''
                    }
                </div>

                <div className="controlContainer">
                    <div className="controlName requiredControl">Password</div>
                    <div className="controlInputContainer">
                        <input
                            type="password"
                            className="controlInput"
                            name="password"
                            value={this.state.password.value}
                            onChange={this.handlePasswordChange.bind(this)}
                            onBlur={this.handleInputBlur.bind(this)}
                        />
                    </div>
                    {
                        this.isPasswordError() ?
                            <div className="controlError">
                                password is required
                            </div> : ''
                    }
                </div>

                <div className="buttonContainer">
                    <button
                        className="submitButton"
                        disabled={!this.isSubmitEnabled()}
                        onClick={this.onSubmit.bind(this)}
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    private onSubmit(): void {
        axios.post('/rtsp/users/login', {
            email: this.state.email.value,
            password: this.state.password.value
        })
            .then((response: any) => {
                this.setState({
                    ...this.state,
                    redirect: {
                        pathname: '/home',
                        state: {
                            id: response.data.id
                        }
                    }
                });
            })
            .catch((error: Error) => {
                window.alert('password or email do not match');
            });
    }

    private handlePasswordChange(event: { target: HTMLInputElement }): void {
        this.state.password.value = event.target.value;
        this.setState(this.state);
    }

    private handleEmailChange(event: { target: HTMLInputElement }): void {
        this.state.email.value = event.target.value;
        this.state.email.isValid = validate(event.target.value);
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

    private isPasswordError(): boolean {
        return !this.state.password.value.length && this.state.password.isVisited;
    }

    private isSubmitEnabled(): boolean {
        return this.state.email.isValid &&
            !!this.state.password.value.length
    }

}