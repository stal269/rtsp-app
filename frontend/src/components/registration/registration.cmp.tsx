import React, { Component } from 'react';
import './registration.css';
import { validate } from 'email-validator';
import { withRouter, Redirect } from 'react-router-dom';
import { Login } from '../login/login.cmp';
const axios = require('axios');

export class Registration extends Component<any, any> {

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
            confirmPassword: {
                value: '',
                isValid: false,
                isVisited: false
            },
            firstName: {
                value: ''
            },
            lastName: {
                value: ''
            }
        };
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect.path}/>
        } 

        return (
            <div className="formContainer">

                <header className="formHeader">Registration</header>

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

                <div className="controlContainer">
                    <div className="controlName requiredControl">Confirm Password</div>
                    <div className="controlInputContainer">
                        <input
                            type="password"
                            name="confirmPassword"
                            onChange={this.confirmPasswordChange.bind(this)}
                            onBlur={this.handleInputBlur.bind(this)}
                            className="controlInput" />
                    </div>
                    {
                        this.isConfirmPasswordError() ?
                            <div className="controlError">
                                passwords must match
                        </div> : ''
                    }
                </div>

                <div className="controlContainer">
                    <div className="controlName">First Name</div>
                    <div className="controlInputContainer">
                        <input
                            className="controlInput"
                            name="firstName"
                            value={this.state.firstName.value}
                            onChange={this.handleInputChange.bind(this)}
                        />
                    </div>
                </div>

                <div className="controlContainer">
                    <div className="controlName">Last Name</div>
                    <div className="controlInputContainer">
                        <input
                            className="controlInput"
                            name="lastName"
                            value={this.state.lastName.value}
                            onChange={this.handleInputChange.bind(this)}
                        />
                    </div>
                </div>
                <div className="buttonContainer">
                    <button 
                        className="submitButton" 
                        disabled={!this.isSubmitEnabled()}
                        onClick={this.onSubmit.bind(this)}
                        >
                        Register
                    </button>
                </div>
            </div>
        );
    }

    private onSubmit(): void {
        axios.post('/rtsp/users' ,{
            email: this.state.email.value,
            password: this.state.password.value,
            firstName: this.state.firstName.value,
            lastName: this.state.lastName.value
        })
        .then(() => {
            this.setState({
                ...this.state,
                redirect: {
                    path: '/login'
                }
            });
        })
        .catch((error: Error) => {
            const status: number = (error as any).response.status;

            if (status === 403) {
                window.alert('user with this email already exists');
            }
        });
    }

    private confirmPasswordChange(event: { target: HTMLInputElement }): void {
        this.state.confirmPassword.value = event.target.value;
        this.state.confirmPassword.isValid = (event.target.value === this.state.password.value);
        this.setState(this.state);
    }

    private handlePasswordChange(event: { target: HTMLInputElement }): void {
        this.state.password.value = event.target.value;
        this.state.confirmPassword.isValid = (this.state.confirmPassword.value === this.state.password.value);
        this.setState(this.state);
    }

    private handleEmailChange(event: { target: HTMLInputElement }): void {
        this.state.email.value = event.target.value;
        this.state.email.isValid = validate(event.target.value);
        this.setState(this.state);
    }

    private handleInputChange(event: { target: HTMLInputElement }): void {
        this.state[event.target.name].value = event.target.value;
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

    private isConfirmPasswordError(): boolean {
        return !this.state.confirmPassword.isValid &&
            this.state.confirmPassword.isVisited
    }

    private isPasswordError(): boolean {
        return !this.state.password.value.length && this.state.password.isVisited;
    }

    private isSubmitEnabled(): boolean {
        return this.state.email.isValid &&
            !!this.state.password.value.length &&
            this.state.confirmPassword.isValid;
    }

}