import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { IURL } from '../../models/url.model';
import './rtsp-grid.css';
const axios = require('axios');
declare let JSMpeg: any;

export class RtspGrid extends Component<any, any> {

    private player: any;

    constructor(props: any) {
        super(props);

        this.state = {
            urls: [],
            urlSelected: false
        };
    }

    componentDidMount(): void {
        this.checkStateAndRedirect();
        this.loadUrls();
    }

    render() {
        if (this.state.redirect) {
            return (<Redirect to={this.state.redirect} push={true} />)
        }

        return (
            <div className="gridContainer">

                <div className="listContainer">
                    <ul className="list">
                        {this.state.urls.map((url: IURL) => this.renderUrlItem(url))}
                    </ul>
                </div>

                <div className="playerContainer">
                    <canvas id="videoCanvas" width="550" height="550"></canvas>
                    {
                        !this.state.urlSelected ?
                            <div className="playerPlaceholder" >
                                Select RTSP URL
                            </div> : ''
                    }
                </div>
            </div>
        );
    }

    private checkStateAndRedirect(): void {
        if (!this.props.location.state) {
            this.setState({
                ...this.state,
                redirect: {
                    pathname: '/login',
                }
            });
        }
    }

    private renderUrlItem(urlItem: IURL) {
        return (
            <li className="urlItem" key={urlItem.id} onClick={this.streamUrl.bind(this, urlItem.url)}>
                <div className="urlTitle" title={urlItem.url}>{urlItem.url}</div>
            </li>
        );
    }

    private loadUrls(): void {
        const id: string = this.props.location.state.id;

        axios.get(`/rtsp/users/${id}/urls`)
            .then((response: { data: { urls: IURL[] } }) => {
                this.setState({
                    urls: response.data.urls
                });
            })
            .catch((error: Error) => {
                console.log('error')
            });
    }

    private streamUrl(url: string): void {
        axios.put(`/rtsp/stream`, { url })
            .then((response: any) => {
                this.loadJsMpegPlayer();
                this.setState({
                    ...this.state,
                    urlSelected: true
                });
            })
            .catch((error: Error) => {
                console.log(error);
            });
    }

    private loadJsMpegPlayer(): void {
        const hostname: string = window.location.hostname;
        const canvas: HTMLCanvasElement = document.getElementById('videoCanvas') as HTMLCanvasElement;
        this.player = new JSMpeg.Player(`ws://${hostname}:5000/`, { canvas, });
        this.player.play();
    }

}