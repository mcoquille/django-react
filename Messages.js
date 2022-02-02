import React, { Component } from "react";
import { Grid, MessageInternal, MessageExternal } from "@material-ui/core";

export default class Messages extends Component {

    constructor(props) {
        super(props);
        this.state={
            last_index: 200
        }
    }

    scrollToBottom() {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {

        // Add reserved index
        var messages = this.props.messages;
        var reservedIndex = messages.length - 1;
        for (let i = 0; i < messages.length; i++) {
            messages[i]['reversedIndex'] = reservedIndex
            reservedIndex -=  1
        }

        // Filter based on index
        var messages = messages.filter(message => message.reversedIndex <= this.state.last_index);

        return (
            <Grid container spacing={2}>
                {
                    messages.length >= 1 ?
                        messages.map((message, index) => (
                            <Grid key={index} item xs={12}>
                                {
                                    (
                                        (this.props.user.email == joEmail && message.sender_email == joEmail)
                                        || (this.props.user.email != joEmail && message.sender_email != joEmail)
                                    ) ?
                                        <MessageInternal channelName={this.props.channelName}
                                            content={message.content}
                                            seenBy={message.seen_by}
                                            user={this.props.user}
                                        />
                                        : <MessageExternal content={message.content} senderName={message.sender_name} />
                                }
                            </Grid>
                        ))
                        : <Grid item xs={12} className='input-label'>No messages yet, start a conversation!</Grid>
                }
                <Grid item xs={12} ref={(el) => { this.messagesEnd = el; }} className={'messages-end'} />
            </Grid>
        )
    }
}