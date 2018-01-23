import React, {Component} from 'react';
import { Col, Form, FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap';
import { SketchPicker } from 'react-color';

import Main from './Main';

const Login = (props) => (
    <div className="col-sm-6 offset-sm-3">
    <Form horizontal style={{ width: '100%', border: '1' }}>
        <FormGroup controlId="username">
            <Col componentClass={ControlLabel} sm={2}>
                Username
            </Col>
            <Col sm={6}>
                <FormControl 
                    type="text"
                    placeholder="Username"
                    value={props.userName}
                    onChange={props.handleUsernameChange}
                />
            </Col>
        </FormGroup>

        <FormGroup controlId="color">
            <Col componentClass={ControlLabel} sm={2}>
                Color
            </Col>
            <Col sm={6}>
                <SketchPicker
                    color={props.color}
                    onChangeComplete={props.handleColorChange}
                />
            </Col>
        </FormGroup>

        <FormGroup>
            <Col smOffset={2} sm={10}>
                <Button 
                    type="submit"
                    onClick={props.handleSubmit}
                    disabled={!props.userName}
                >
                    Sign in
                </Button>
            </Col>
        </FormGroup>
    </Form>
    </div>
);

class App extends Component {
    state = {
        supportsWebSockets: true,
        signedIn: false,
        userName: '',
        color: '#fff'
    }

    async componentDidMount() {
        const supportsWebSockets = ('WebSocket' in window && window.WebSocket) || ('MozWebSocket' in window && window.MozWebSocket);
        if (!supportsWebSockets) {
            await this.setState({ supportsWebSockets });
        }
    }

    handleUsernameChange = (e) => this.setState({ userName: e.target.value });
    handleColorChange = (e) => this.setState({ color: e.hex });
    handleSubmit = () => this.setState({ signedIn: true });

    render() {
        if (!this.state.supportsWebSockets) {
            return (
                <div className="col-sm-6 offset-sm-3">
                    <h1> You're browser does not support web sockets, please download a newer browser to use this app. </h1>
                </div>
            );
        }

        const ComponentToRender = this.state.signedIn
            ? <Main { ...this.state } />
            : <Login 
                    handleColorChange={this.handleColorChange}
                    handleUsernameChange={this.handleUsernameChange}
                    handleSubmit={this.handleSubmit}
                    { ...this.state }
                />;

        return (
            <div className="App">
                {ComponentToRender}
            </div>
        );
    }
}

export default App;
