import React, { Component } from "react";
import { Slide, Button } from "@material-ui/core";


export default  class ChatIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatBoxIsOpen: false
        }
    }

    render() {
        return (
            <Slide direction='left' in={true} timeout={1000}>
                <Button
                    id={this.props.cssChatIcon}
                    onClick={this.props.changeChatBoxFunction}
                >
                    <div id='chat-icon-div'>
                        <i className="fas fa-comment-alt"  id='icon-button-chat-box'></i>
                    </div>
                    {this.props.notification ? <div id='notification' className='notification-position'/> : null}
                </Button>											
            </Slide>
        )
    }

}