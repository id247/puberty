'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { emit } from './flux/dispatcher';
import actions from './flux/actions';
import { getState, addChangeListener } from './flux/store';

//pages
// import Loading from './components/pages/loading';


//import 'babel-polyfill';

const app = (settings) => {

	const App = React.createClass({
		getInitialState() {

			return getState();
		},
		componentDidMount() {

			addChangeListener(this._update);

			emit(actions.SET_SETTINGS, {
				settings: this.props.settings,
				page: 'greeting'			
			});
		},
		_update() {

			this.setState(getState());
		},
		render() {

			console.log('RENDER');

			let page;

			switch(this.state.page){
				// case 'result': page = <Result 	pers={this.state.pers}
				// 								server={this.state.settings.server}
				// 								shares={this.state.shares}
				// 								/>; 
				// 	break;

				// default: page = <ErrorPage />;
			}

			return (
				<div>
				</div>
			)
		}
	});

	ReactDOM.render(
		<App 	settings={settings} 
		/>, 
		document.getElementById('app')
	);

};

export default app;
