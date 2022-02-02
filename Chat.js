import React, { Component } from "react";
import { Grid, IconButton, Input, CircularProgress } from "@material-ui/core";

import Messages from './Messages';
import Expire from './Expire';

export default class Chat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            newInternalMessage: '',
            isDuringWorkingHours: 8 < new Date().getHours() < 18 ? true : false,
            isTyping_Internal: false,
        }
    }

    componentDidMount() {
        this.sendRead()
    }

    async sendMessage(content) {

        var data = {
            content: content,
            channelName: this.props.channelName,
            senderEmail: this.props.user.email,
            senderName: this.props.user.name
        }

        var APIRequest = new XMLReq();
        APIRequest.sendData("POST", '/send_message_', data, false, false);

        await this.setState({
            newInternalMessage: ''
        })
    }

    async sendTyping() {

        var data = {
            channelName: this.props.channelName,
            senderEmail: this.props.user.email,
            senderName: this.props.user.name 
        }

        var APIRequest = new XMLReq();
        APIRequest.sendData("POST", '/send_typing', data, false, false);

    }

    async sendRead() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channelName: this.props.channelName,
                senderEmail: this.props.user.email
            })
        }
        var response = await fetch('/send_read', requestOptions)
    }

    render() {
        return (
            <div>
                <Grid container spacing={0} align='center' justifyContent='center' id='chatbox-banner'>
                    <Grid item xs={2}>
                        {
                            this.props.user.email == joEmail ?
                                <IconButton onClick={this.props.changeChannelFunction}>
                                    <i className="fas fa-chevron-left leave-channel-icon"></i>
                                </IconButton>
                                : this.state.isDuringWorkingHours ?
                                    <i className="fas fa-circle green-icon"></i>
                                    : <i className="fas fa-circle" id='offline-icon'></i>
                        }
                    </Grid>
                    <Grid item xs={10}>
                        {
                            this.props.user.email != joEmail && this.props.channelName.includes('@') ?
                                <div className='chatbox-banner-text'>Adsum</div>
                                :
                                <Grid container className='chatbox-banner-text'>
                                    {
                                        this.props.userName ?
                                            <Grid item xs={12}>
                                                {this.props.userName}
                                            </Grid>
                                            : null
                                    }
                                    <Grid item xs={12}>
                                        {this.props.companies}
                                    </Grid>

                                </Grid>
                        }
                    </Grid>
                </Grid>
                <Grid container align='center' justifyContent='center'>
                    <Grid item xs={12} id='messages'>
                        {
                            this.props.messagesLoadingDone ?
                                <Messages
                                    user={this.props.user}
                                    channelName={this.props.channelName}
                                    messages={this.props.messages}
                                />
                                : <CircularProgress />
                        }
                    </Grid>
                </Grid>
                <div className='send-message-box'>
                    <div id='text-area'>
                        <Input
                            fullWidth
                            value={this.state.newInternalMessage}
                            onChange={(e) => {
                                this.setState({
                                    newInternalMessage: e.target.value,
                                })
                                if (!this.state.isTyping_Internal) {
                                    this.setState({
                                        isTyping_Internal: true
                                    })
                                    this.sendTyping()
                                    this.sendRead()
                                }
                            }}
                            onKeyDown={(e) => {

                                if (e.key == "Enter") {
                                    if (!check_if_only_whitespaces(this.state.newInternalMessage)) {
                                        this.sendMessage(this.state.newInternalMessage)
                                    }
                                }
                            }}
                        />
                    </div>
                    <div id='send-icon'>
                        <IconButton
                            onClick={() => {
                                if (!check_if_only_whitespaces(this.state.newInternalMessage)) {
                                    this.sendMessage(this.state.newInternalMessage)
                                }
                            }}
                        >
                            <i className="fas fa-paper-plane send-message-icons"></i>
                        </IconButton>
                    </div>
                    <div>
                        {this.props.isTyping ?
                            <Expire makeIsTypingFalseFunctionForExpire={this.props.makeIsTypingFalseFunction} delay={2000}>
                                <div className='message-sender-external'>{this.props.userTyping} is typing...</div>
                            </Expire>
                            : null}
                    </div>
                </div>
            </div>
        )
    }
}