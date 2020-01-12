import React, { Component } from 'react';
import { Redirect } from 'react-router';
import './rtsp-grid.css';
import { IURL } from '../../models/url.model';
const axios = require('axios');
var jsmpeg = require('jsmpeg');

export class RtspGrid extends Component<any, any> {

    private player: any;

    constructor(props: any) {
        super(props);

        this.state = {
            urls: []
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

        this.loadUrls();
        this.loadJsMpegPlayer();
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
                    <canvas id="videoCanvas" width="550" height="550">
                    </canvas>
                </div>

            </div>
        );
    }

    //TODO: add elipsis
    private renderUrlItem(urlItem: IURL) {
        return (
            <li className="urlItem" key={urlItem.id} onClick={this.streamUrl.bind(this)}>
                <div className="urlTitle" >{urlItem.url}</div>
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

    private streamUrl(): void {
        axios.put(`/rtsp/stream`, {
            url: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'
        })
            .then((response: any) => {
                
            })
            .catch((error: Error) => {
                console.log('error')
            });
    }

    private loadJsMpegPlayer(): void {
        const hostname: string = window.location.hostname;
        const port: string = window.location.port;
        const client = new WebSocket(`ws://${hostname}:${port}/`);
        const canvas: HTMLCanvasElement = document.getElementById('videoCanvas') as HTMLCanvasElement;
        this.player = new jsmpeg(client, { canvas });
        this.player.play();
    }

}