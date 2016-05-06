import { listen, emit } from './dispatcher';
import actions from './actions';

//helpers
//import { shuffle } from '../lib/helpers';

let state = {
	page: 'greeting',
	settings: {},
	loading: false,
};

const listeners = [];

export function getState() {

	return state;
}

export function addChangeListener(fn) {

	listeners.push(fn);
}

function updateState(data){
	state = Object.assign({}, state, data);
	
}

function notify() {
	listeners.forEach((fn) => fn());
}

//settings
listen(actions.SET_SETTINGS, (settings) => {
	updateState(settings);	
	notify();
});


//routing
listen(actions.SHOW_PAGE, (page) => {
	if (page === 'quiz'){
		emit(actions.QUIZ_START);
	}
	updateState({page: page});	
	notify();
});


//loader
listen(actions.SHOW_LOADER, () => {
	updateState({loading: true});	
	notify();
});
listen(actions.HIDE_LOADER, () => {
	updateState({loading: false});	
	notify();
});




