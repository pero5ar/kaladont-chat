import React, {Component} from 'react';
import { Grid, Row, FormGroup, InputGroup, FormControl, ListGroup, ListGroupItem, Button } from 'react-bootstrap';

import * as socket from './socketApi';

const getTextColor = (color) => (('0x' + color.replace('#', '').trim().slice(-6)) > '0x888888') ? '#000' : '#fff';

const Strong = (props) => <strong style={{ fontWeight: '900' }}>{ props.children }</strong>

class Main extends Component {
    state = {
        messages: [],
        newMessage: ''
    };

    componentWillMount() {
        socket.connect();
        socket.subscribeToMessages((msg) => this.setState({ messages: [ ...this.state.messages, msg ] }));
        window.addEventListener('beforeunload', () => socket.disconnect());
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload');
    }

    handleInputChange = (e) => this.setState({ newMessage: e.target.value });

    handleSubmit = async () => {
        socket.sendMessage({ 
            message: this.state.newMessage,
            userName: this.props.userName,
            color: this.props.color
        });
        await this.setState({ newMessage: '' });
    }

    onEnter = (e) => (e.key === 'Enter') && this.handleSubmit();

    render() {
        const messageList = this.state.messages.map((_msgObj, _i) => (
            <ListGroupItem 
                key={_i}
                style={{ 
                    backgroundColor: _msgObj.color,
                    color: getTextColor(_msgObj.color),
                    fontWeight: '100'
                }}
                header={ _msgObj.message }
            >
                Sent by <Strong>{ _msgObj.userName }</Strong> on <em>{ _msgObj.date ? new Date(_msgObj.date).toTimeString() : 'unknown' }</em>
            </ListGroupItem>
        ));

        return (
            <Grid>
                <Row>
                    <ListGroup style={{ width: '100%' }}>
                        {messageList}
                    </ListGroup>
                </Row>
                <Row>
                    <FormGroup style={{ width: '100%' }}>
                        <InputGroup>
                            <FormControl
                                type="text"
                                value={this.state.newMessage}
                                onChange={this.handleInputChange}
                                onKeyPress={this.onEnter}
                                style={{ 
                                    backgroundColor: this.props.color,
                                    color: getTextColor(this.props.color)
                                }}
                                placeholder="New Message"/>
                            <InputGroup.Button>
                                <Button onClick={this.handleSubmit}>Add</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Row>
            </Grid>
        );
    }
}

export default Main;
