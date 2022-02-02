import React, { Component } from "react";
import { Grid, Tooltip } from "@material-ui/core";

export default  class MessageInternal extends Component {
    constructor(props) {
        super(props);
    }

    checkIfReadBySelf() {
        if (this.props.seenBy != this.props.user.email) {
            return (<div id='read'>{this.props.seenBy ? '✓ Read' : null}</div>)
        } else {
            return (<div id='read'></div>)
        }
    }

    render() {

        var readBySentence = 'Read by ' + this.props.seenBy;
        var isGroup = this.props.channelName.includes('@') ? false : true;

        return (
            <Grid container spacing={0}>
                <Grid item xs={12} />
                <Grid item xs={3} />
                <Grid item xs={9} className='message-internal-box'>
                    <div className='message-internal'>{this.props.content}</div>
                    <Tooltip title={isGroup ? readBySentence : ''}>
                        {this.checkIfReadBySelf()}
                    </Tooltip>
                </Grid>
            </Grid>

        )
    }
}