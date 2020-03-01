import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
	render() {
		return (
			<div id="App" className="App">
				<div id="App-header" className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
				</div>
			</div>
		);
	}
	componentDidMount() {}
}

export default App;
