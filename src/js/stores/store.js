import { listen, emit } from '../lib/dispatcher';
import actions from '../lib/actions';

//settings
import questions from '../settings/questions';
import results from '../settings/results';

//helpers
import { shuffle } from '../lib/helpers';

let state = {
	page: 'greeting',
	quiz: {
		step : 0,
		questionsCount: 0,	
	},
	quizAnswers: {},
	sex: 'boy',
	questions: questions,
	results: results,
	settings: {},
	loading: false,
	buttons: {
		buttonNextDisabled: true
	}
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


//UI elements
listen(actions.BUTTON_SEX_NEXT_ENABLE, (sex) => {
	updateState({
		buttons: Object.assign({}, state.buttons, {
			buttonNextDisabled: false
		})
	});	
	notify();
});


//sex
listen(actions.SET_SEX, (sex) => {
	
	updateState({
		sex: sex
	});

});


//routing
listen(actions.SHOW_PAGE, (page) => {
	if (page === 'quiz'){
		emit(actions.QUIZ_START);
	}
	updateState({page: page});	
	notify();
});

//shares
listen(actions.SET_SHARES, (persId) => {

	const shares = [
		{
			id: 'ok',
			link: 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=https://ad.' + state.settings.server + '/promo/wolves-share-' + persId,
		},
		{
			id: 'fb',
			link: 'https://www.facebook.com/sharer/sharer.php?u=https://ad.' + state.settings.server + '/promo/wolves-share-' + persId,
		},
		{
			id: 'vk',
			link: 'https://vk.com/share.php?url=https://ad.' + state.settings.server + '/promo/wolves-share-' + persId,
		}
	];
	updateState({shares: shares});	
});

listen(actions.PUBLIC_SHARE, (href) => {
	window.open(	
		href, 
		'_blank', 
		'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0'
	);
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


//quiz
listen(actions.QUIZ_START, () => {
	updateState({
		quiz: Object.assign({}, state.quiz,{
			step: 0,
			questionsCount: state.questions[state.sex].length,
		}),
		quizAnswers: {},
	});	
});

listen(actions.QUIZ_NEXT_STEP, (answer) => {

	if (state.quiz.step === state.quiz.questionsCount - 1){
		emit(actions.SHOW_RESULTS);
	}else{
		updateState({
			quiz: Object.assign({}, state.quiz,{
				step: state.quiz.step + 1,
			}),
			quizAnswers: Object.assign({}, state.quizAnswers, {
				[answer]: state.quizAnswers[answer] ? state.quizAnswers[answer] + 1 : 1
			}),
		});	
		notify();
	}
	
});

//results
listen(actions.SHOW_RESULTS, () => {
	//loager before show result
	emit(actions.SHOW_LOADER);

	let topAnswer;
	let topAnswers = [];
	let topAnswerResult = 0;

	//get top answer
	Object.keys(state.quizAnswers).forEach( (answer) => { 

		if ( state.quizAnswers[answer] > topAnswerResult){
			topAnswerResult = state.quizAnswers[answer];
			topAnswer = answer;
		}

	});

	//get all answers with top value (if equal answers)
	Object.keys(state.quizAnswers).forEach( (answer) => {
		if ( state.quizAnswers[answer] === topAnswerResult){
			topAnswers.push(answer);
		}
	});

	//get random pers if multiple
	const persId = topAnswers.length > 1 ? shuffle(topAnswers)[0] : topAnswers[0];
	const pers =  state.results[persId];

	updateState({
		pers: pers,
	});

	emit(actions.SET_SHARES, pers.id);	

	//preload image and show page
	let image = new Image();
	image.onload = () => {
		emit(actions.HIDE_LOADER);
		emit(actions.SHOW_PAGE, 'result');
	};
	image.src = (state.settings.server === 'local' ? pers.image : pers.imageRemote);
});





