import React, { Component } from "react";
import { Grid, ButtonGroup, Button, TextField, Drawer } from "@material-ui/core";

import Chat from './Chat';
import ChatIcon from './ChatIcon';

export default class ChatBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

            chatBoxIsOpen: false,
            notification: false,
            channels: {},

            channelName: this.props.channelName,
            messages: [],
            isTyping: false,
            messagesLoadingDone: false,
            channelUserName: '',
            channelCompanies: '',

            filteredChannels: {},
            filterPhrase: ''

        }

        this.changeChatBox = this.changeChatBox.bind(this);
        this.changeChannel = this.changeChannel.bind(this);
        this.checkIfNewMessagesInChat = this.checkIfNewMessagesInChat.bind(this);
        this.getChatsWithNewMessages = this.getChatsWithNewMessages.bind(this);
        this.getChannels = this.getChannels.bind(this);
        this.setMessagesAsRead = this.setMessagesAsRead.bind(this);
        this.handleNewMessages = this.handleNewMessages.bind(this);
        this.getPreviousMessages = this.getPreviousMessages.bind(this);
        this.handleNewMessagesWaiting = this.handleNewMessagesWaiting.bind(this);
        this.makeIsTypingFalse = this.makeIsTypingFalse.bind(this);
        this.handleNotification = this.handleNotification.bind(this);
        this.handleNewChannels = this.handleNewChannels.bind(this);
        this.getChatDetails = this.getChatDetails.bind(this);
        this.handleRead = this.handleRead.bind(this);
        this.renderChannelsList = this.renderChannelsList.bind(this);

    }

    async componentDidMount() {

        if (this.state.channelName) {

            var channelExists = await this.checkIfChannelExists()
            if (channelExists) {
                var newMessagesWaiting = await this.checkIfNewMessagesInChat(this.state.channelName)
                this.setState({ notification: newMessagesWaiting })
                await this.getPreviousMessages()
            } else {
                await this.createChannel()
                this.setState({ messagesLoadingDone: true })
            }

            await this.handleNewMessages(this.state.channelName)
            await this.handleRead(this.state.channelName)
            await this.handleTyping(this.state.channelName)
            await this.getChatDetails(this.state.channelName)

        } else {
            await this.getChannels()
            await this.handleNotification()
            for (const channelName in this.state.channels) {
                this.handleNewMessages(channelName)
                this.handleRead(channelName)
                this.handleTyping(channelName)
            }
            this.handleNewChannels()

        }
    }

    async getChatDetails() {

        if (this.state.channelName.includes('@')) {

            var url = '/get_individual_channel_details_/' + this.state.channelName
            var response = await fetch(url)
            var data = await response.json()
            var details = data.details

            this.setState({
                channelUserName: details.username,
                channelCompanies: details.companies,
            })

        } else {

            var url = '/get_group_channel_details_/' + this.state.channelName
            var response = await fetch(url)
            var data = await response.json()
            var details = data.details

            this.setState({
                channelCompanies: details.company,
            })
        }
    }

    makeIsTypingFalse() {
        this.setState({
            isTyping: false
        })
    }

    async checkIfChannelExists() {
        var url = '/check_if_channel_exists_/' + this.props.channelName
        var response = await fetch(url)
        var data = await response.json()
        return data.channel_exists
    }

    async createChannel() {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channelName: this.state.channelName,
                userName: this.state.channelName.includes('@') ? this.props.user.name : ''
            })
        }
        var response = await fetch('/create_channel_', requestOptions)
        var data = await response.json()

    }

    async handleNewChannels() {

        var channel = pusher.subscribe('handleCreationChannel');

        await channel.bind('create-channel', async function (data) {

            var channelName = data.channelName;
            var userName = data.userName;
            var companies = data.companies;
            var channels = Object.assign({}, this.state.channels)

            channels[channelName] = {
                user_name: userName,
                companies: companies,
                newMessagesWaiting: false,
                last_date: ''
            }
            await this.setState({ channels: channels })
        }.bind(this));
    }

    async handleRead(channelName) {

        var channel = pusher.subscribe(channelName);

        await channel.bind('read', async function (data) {
            if (data.senderEmail == this.props.user.email) {
                await this.handleNewMessagesWaiting(channelName, false);
            } else {
                if (channelName == this.state.channelName) {
                    this.setMessagesAsRead(data.senderEmail)
                }
            }

        }.bind(this));
    }

    async handleTyping(channelName) {

        var channel = pusher.subscribe(channelName);
        await channel.bind('isTyping', async function (data) {

            if (data.senderEmail != this.props.user.email) {

                this.setState({
                    isTyping: true,
                    userTyping: data.senderName
                })
            }
        }.bind(this));
    }

    async getPreviousMessages() {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel: this.state.channelName,
                sender_email: this.props.user.email
            })
        }
        var response = await fetch('/get_channel_messages_', requestOptions)
        var data = await response.json()
        this.setState({
            messages: data.messages,
            messagesLoadingDone: true
        })
    }

    setMessagesAsRead(email) {

        var messages = [...this.state.messages]

        for (let i = 0; i < messages.length; i++) {
            if (messages[i]['sender_email'] != email) {
                if (messages[i]['seen_by']) {
                    if (!messages[i]['seen_by'].includes(email)) {
                        messages[i]['seen_by'] += ', ' + email
                    }
                } else {
                    messages[i]['seen_by'] = email
                }
            }
        }
        this.setState({ messages: messages })
    }


    async handleNewMessages(channelName) {

        var channel = pusher.subscribe(channelName);
        await channel.bind('new-message', async function (data) {

            if (channelName == this.state.channelName) {

                var messages = [...this.state.messages];
                messages = messages.concat({
                    content: data.content,
                    sender_name: data.senderName,
                    sender_email: data.senderEmail,
                    seen_by: data.seen_by
                })
                this.setState({ messages: messages });
            }
            if (data.senderEmail != this.props.user.email) {
                await this.handleNewMessagesWaiting(data.channelName, true);
            }

        }.bind(this));
    }

    changeChatBox() {
        this.setState({
            chatBoxIsOpen: !this.state.chatBoxIsOpen
        })
    }

    async changeChannel(e) {

        // Admin only
        var previousChannelName = this.state.channelName;
        await this.setState({ channelName: e.currentTarget.value })
        if (this.state.channelName) {

            var newMessagesWaiting = await this.checkIfNewMessagesInChat(this.state.channelName)
            this.setState({ notification: newMessagesWaiting })
            await this.getPreviousMessages()

            if (this.state.channelName in pusher.channels.channels) {
            } else {
                await this.handleNewMessages(this.state.channelName)
                await this.handleRead(this.state.channelName)
                await this.handleTyping(this.state.channelName)
            }
        } else {

            await this.getChannels()
            await this.handleNotification()
            for (const channelName in this.state.channels) {
                if (channelName in pusher.channels.channels) {
                } else {
                    this.handleNewMessages(channelName)
                    this.handleRead(channelName)
                    this.handleTyping(channelName)
                }
            }
        }
    }

    async getChannels() {
        var response = await fetch('/get_channels_')
        var data = await response.json()
        await this.setState({
            channels: data.channels,
            filteredChannels: data.channels
        })
    }

    async checkIfNewMessagesInChat(channelName) {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel: channelName,
                sender_email: this.props.user.email
            })
        }
        var response = await fetch('/check_if_new_messages_in_chat_', requestOptions)
        var data = await response.json()
        return data.new_messages_waiting

    }

    async getChatsWithNewMessages() {
        var url = '/check_if_new_messages_in_chat_/' + this.props.user.email
        var response = await fetch(url)
        var data = await response.json()
        return data.chats_with_new_messages
    }

    async handleNotification() {

        // Admin only
        var notification = false;
        var channels = Object.assign({}, this.state.channels);
        var chatsWithNewMessages = this.getChatsWithNewMessages()

        for (const channelName in channels) {
            channels[channelName]['newMessagesWaiting'] = chatsWithNewMessages;
            if (!notification && newMessagesWaiting) {
                notification = true
            }
        }
        this.setState({
            notification: notification,
            channels: channels
        })
    }

    async handleNewMessagesWaiting(channelName, newMessagesWaiting) {

        if (this.props.user.email == joEmail) {
            var channels = Object.assign({}, this.state.channels)
            // Count the number of channels with new messages waiting, before change
            var n_channels_with_notif = 0
            for (const channel in channels) {
                if (channels[channel]['newMessagesWaiting']) {
                    n_channels_with_notif += 1
                }
            }
            channels[channelName]['newMessagesWaiting'] = newMessagesWaiting
            await this.setState({
                channels: channels
            })
            if (!this.state.notification && newMessagesWaiting) {
                this.setState({
                    notification: true
                })
            } else if (n_channels_with_notif == 1 && !newMessagesWaiting) {
                this.setState({
                    notification: false
                })
            }
        } else {
            if (
                (this.state.notification && !newMessagesWaiting)
                || (!this.state.notification && newMessagesWaiting)
            ) {
                this.setState({
                    notification: !this.state.notification
                })
            }
        }
    }

    renderChannelsList() {
        return (
            <Grid container spacing={2} align='center' justifyContent='center'>

                <Grid item xs={12}>
                    <ButtonGroup fullWidth>
                        {['Filter by company', 'Filter by username'].map((label, index) => (
                            <Button
                                key={index}
                                variant={this.state.filterPhrase == label ? 'outlined' : 'contained'}
                                onClick={(e) => {

                                    var value = e.target.innerText;

                                    if (this.state.filterPhrase == value) {
                                        value = ''
                                    }

                                    this.setState({ filterPhrase: value });
                                }}
                            >
                                <div className='no-text-transform'>{label}</div>
                            </Button>
                        ))}
                    </ButtonGroup>
                </Grid>
                {
                    this.state.filterPhrase ?

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                onChange={(e) => {

                                    var event_value = e.target.value;
                                    event_value = event_value.toLowerCase()

                                    if (event_value) {

                                        var channels = Object.assign({}, this.state.channels);

                                        var filterType = this.state.filterPhrase == 'Filter by company' ? 'companies' : 'user_name';

                                        channels = Object.fromEntries(
                                            Object.entries(channels).filter(
                                                ([channelName, channel_values]) => channel_values[filterType].toLowerCase().startsWith(event_value)
                                            ))

                                        this.setState({ filteredChannels: channels })

                                    } else {
                                        this.setState({ filteredChannels: this.state.channels })
                                    }

                                }}
                                placeholder="Type..."
                            />
                        </Grid>
                        : null
                }
                <Grid item xs={12} id='channels'>
                    {
                        Object.keys(this.state.filteredChannels).length > 0 ?

                            Object.keys(this.state.filteredChannels).map((channelName, i) => (

                                <Button
                                    onClick={this.changeChannel}
                                    value={channelName}
                                    fullWidth
                                >
                                    <Grid container className='no-text-transform' id='channel-in-list'>

                                        <Grid item xs={2}>
                                            {
                                                this.state.filteredChannels[channelName].newMessagesWaiting ?
                                                    <div id='notification' />
                                                    : null
                                            }

                                        </Grid>
                                        <Grid item xs={10}>
                                            <Grid container className='chatbox-banner-text'>

                                                {
                                                    this.state.filteredChannels[channelName].user_name ?

                                                        <Grid item xs={12}>
                                                            {this.state.filteredChannels[channelName].user_name}
                                                        </Grid>

                                                        : null
                                                }
                                                <Grid item xs={12}>
                                                    {this.state.filteredChannels[channelName].companies}
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </Grid>
                                </Button>

                            ))
                            : <Grid item xs={12}>No chat available.</Grid>
                    }
                </Grid>
            </Grid>
        )
    }

    render() {

        return (
            <div>

                <ChatIcon
                    cssChatIcon={this.props.cssChatIcon}
                    changeChatBoxFunction={this.changeChatBox}
                    notification={this.state.notification}
                />

                <Drawer
                    open={this.state.chatBoxIsOpen}
                    onClose={this.changeChatBox}
                    anchor='right'
                >

                    <div id='drawer-content'>
                        {
                            this.state.channelName ?
                                <Chat
                                    user={this.props.user}
                                    channelName={this.state.channelName}
                                    changeChannelFunction={this.changeChannel}
                                    messagesLoadingDone={this.state.messagesLoadingDone}
                                    messages={this.state.messages}
                                    isTyping={this.state.isTyping}
                                    userTyping={this.state.userTyping}
                                    makeIsTypingFalseFunction={this.makeIsTypingFalse}
                                    userName={
                                        this.props.user.email == joEmail ?
                                            this.state.channels[this.state.channelName]['user_name']
                                            : this.state.channelUserName
                                    }
                                    companies={
                                        this.props.user.email == joEmail ?
                                            this.state.channels[this.state.channelName]['companies']
                                            : this.state.channelCompanies
                                    }
                                />
                                : this.renderChannelsList()
                        }
                    </div>
                </Drawer>
            </div>
        )
    }
}