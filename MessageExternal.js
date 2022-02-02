import React, { Component } from "react";
import { Grid } from "@material-ui/core";

export default  class MessageExternal extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Grid container spacing={0}>
                <Grid item xs={12} />
                <Grid item xs={9} className='message-external-box'>
                    <div className='message-external'>{this.props.content}</div>
                </Grid>
                <Grid item xs={3} />
                <Grid item xs={9}>
                    <div className='message-sender-external'>
                        {this.props.senderName}
                    </div>
                </Grid>
                <Grid item xs={3} />
            </Grid>
        )
    }
}