'use strict'

import cookies from 'js-cookie';
import qwest from 'qwest';

const API = ( () => {

	/* ==========================================================================
	 * SETTINGS
	 * ========================================================================== */

	let _APISettings = {};

	function setSettings(settings){		
		Object.assign(_APISettings, settings);
	}

	/* ==========================================================================
	 * AJAX
	 * ========================================================================== */

	function ajaxSendJquery( options ){
		
		return new Promise( (resolve, reject) => {

			if (!_APISettings.token) {reject('no token'); }

			let _options =	{
				url: '',
				type: 'GET',
				dataType: 'JSON',
				data: []
			};

			Object.assign(_options, options);

			const joinParam = options.url.indexOf('?') > -1 ? '&' : '?';

			function ajax(){

				$.ajax({
					url: _options.url + joinParam + _APISettings.token.substr(1),
					type: _options.type,
					dataType: _options.dataType,
					data: _options.data,
					success: (data) => { resolve(data); },
					error: (error) => { reject(error); }
				});	

			}

			if (_APISettings.develop){

				console.log(_options.url + joinParam + _APISettings.token.substr(1));

				setTimeout( () => {
					ajax();
				}, 500);
			
			}else{
			
				ajax();
			
			}


		});	
	}


	function ajaxSend( options ){

		return new Promise( (resolve, reject) => {

			if (!_APISettings.token) {reject('no token'); }

			let _options =	{
				url: '',
				type: 'GET',
				dataType: 'JSON',
				data: []
			};

			Object.assign(_options, options);

			const joinParam = options.url.indexOf('?') > -1 ? '&' : '?';

			if (_options.url.indexOf('https://api.' + _APISettings.server + '/') === -1 ){
				_options.url = 'https://api.' + _APISettings.server + '/' + _options.url;
			}

			_options.url += joinParam + _APISettings.token.substr(1);

			function ajax(){

				const method = _options.type.toLowerCase();
				const url = _options.url;
				const data = _options.data;
				const options = _options;

				return qwest[method]( url , data, options )
				     .then(function(xhr, response) {
				        resolve(response);
				     })
				     .catch(function(e, xhr, response) {
				       	reject(e, response);
				     });	

			}

			if (_APISettings.develop){

				console.log(_options.url);

				setTimeout( () => {
					return ajax();
				}, 500);
			
			}else{
			
				return ajax();
			
			}

		});	

	}


	/* ==========================================================================
	 * TOKEN
	 * ========================================================================== */
	

	//set _APISettings.token var from cookie
	function setToken() {
		_APISettings.token = cookies.get(_APISettings.cookieName);
	}	

	//chek if _APISettings.token exists
	function checkToken(){
		return new Promise( (resolve, reject) => {
			if (_APISettings.token ){
				resolve();
			}else{
				reject();
			}
		});
	}

	//check url and parse _APISettings.token from it
	function getTokenFromUrl( winObj ){

		if (winObj.location.hash.indexOf("#access_token") > -1) {
		
			_APISettings.token = winObj.location.hash;
			cookies.set(_APISettings.cookieName, _APISettings.token, { expires: 7, path: ''});
			winObj.location.hash = '';

			return true;
		
		}	

		return false;
		
	}

	function deleteToken(){
		cookies.remove(_APISettings.cookieName);
	}


	/* ==========================================================================
	 * AUTH
	 * ========================================================================== */

	//main method
	function auth() {
		if( navigator.userAgent.match(/Android/i)
			|| navigator.userAgent.match(/webOS/i)
			|| navigator.userAgent.match(/iPhone/i)
			|| navigator.userAgent.match(/iPad/i)
			|| navigator.userAgent.match(/iPod/i)
			|| navigator.userAgent.match(/BlackBerry/i)
			|| navigator.userAgent.match(/Windows Phone/i)
			|| ( navigator.userAgent.match(/Safari/i) && !navigator.userAgent.match(/Chrome/i) )
		){
			authExternal();
		}else{
			return authModal();
		}
	}

	//auth with external page
	function authExternal() {

		const protocol = window.location.href.indexOf('https:') === 0 ? 'https:' : 'http:';

		let url = 'https://login.' 		+ _APISettings.server + '/oauth2';
			url += '?response_type=' 	+ 'token';
			url += '&client_id=' 		+ _APISettings.clientId;
			url += '&client_secret=' 	+ _APISettings.clienSecret;
			url += '&scope=' 			+ _APISettings.scope;
			url += '&redirect_uri=' 	+ protocol + _APISettings.redirectUrl;

		if (_APISettings.develop){
			console.log(url);
		}

		window.location.replace(url);
	}
	
	//auth with modal popup
	function authModal() {

		return new Promise( (resolve, reject) => {		

			//check if we can get data from modal, it has to have the same domain
			function canAccessPopup(winObj) {
				let html = null;
				try { //try reading document
					html = winObj.document.body.innerHTML;
				} catch(err){
				// do nothing
				}
				return(html !== null);
			}

			const protocol = window.location.href.indexOf('https:') === 0 ? 'https:' : 'http:';

			let url = 'https://login.' 		+ _APISettings.server + '/oauth2';
				url += '?response_type=' 	+ 'token';
				url += '&client_id=' 		+ _APISettings.clientId;
				url += '&client_secret=' 	+ _APISettings.clienSecret;
				url += '&scope=' 			+ _APISettings.scope;
				url += '&redirect_uri=' 	+ protocol + _APISettings.modalRedirectUrl;


			if (_APISettings.develop){
				console.log(url);
			}

			const winObj = window.open(url, '_blank', 'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0');

			const checkConnect = setInterval( () => {

				if (winObj.closed){
					reject('window closed');
				}

				if (winObj && canAccessPopup(winObj)){
					
					//if _APISettings.token in url - get it and close window
					if (winObj.location.href.indexOf('access_token') > -1){
						
						if ( getTokenFromUrl(winObj) ){
							resolve();
						}else{
							reject(winObj.location.href);
						}
						
						clearInterval(checkConnect);
						
						winObj.close();				

					//if error in url - close window, no auth
					}else if ( winObj.location.href.indexOf('error') > -1){		        	
						
						clearInterval(checkConnect);

						winObj.close();

						reject(winObj.location.href);
					}
				}

			}, 30);
		});
	}


	/* ==========================================================================
	 * REQUESTS
	 * ========================================================================== */
	


	// 
	function getUserAjax(id = 'me') {

		if (!id) id = 'me';

		let url = 'https://api.' + _APISettings.server + '/v1';
			url +='/users/' + id;
			
		const _options = {
			url: url
		};

		return ajaxSend(_options);
	};

	function getCurrentUserAjax() {		
		return getUserAjax('me');
	};

	function getCurrentUser() {
		return _APISettings.user;
	};

	function getFiles( settings ){

		let _settings = {
			folderId: false					
		};

		Object.assign(_settings, settings);

		let url = 'https://api.' + _APISettings.server + '/v1';
			url +='/folder/' + _settings.folderId;
			url += '/files';

		const _options = {
			url: url
		}

		return ajaxSend( _options );
	}

	//invite to social entity
	function invite( settings ) {

		let _settings = {
			socialEntity: false,
			socialEntityId: false						
		};

		Object.assign(_settings, settings);

		let url = 'https://api.' + _APISettings.server + '/v1';
			url += _settings.socialEntity ? '/' + _settings.socialEntity : '';
			url += _settings.socialEntityId ? '/' + _settings.socialEntityId : '';
			url += '/invite';

		const _options = {
			type: 'POST',
			url: url
		}

		return ajaxSend( _options );

	}
	//invite to group
	function inviteToGroup(groupId){

		const settings = {
			socialEntity: 'groups',
			socialEntityId: groupId						
		};

		return invite( settings );

	}
	//invite to network
	function inviteToNetwork(networkId){

		const settings = {
			socialEntity: 'networks',
			socialEntityId: networkId						
		};

		return invite( settings );

	}


	//send message
	function sendMessage( message ) {

		let _message = 	{
			from: false,
			to: false,
			body: ''
		};

		Object.assign(_message, message);

		let url = 'https://api.' + _APISettings.server + '/v1';
			url += '/messages';

		const _options = {
			type: 'POST',
			url: url,
			data: _message
		}

		return ajaxSend( _options );
	}

	//invite to gpoup
	function getMarks( settings ) {

		let _settings = {
			userId: 'me',
			schoolId: false,
			from: false,
			to: false
		};

		Object.assign(_settings, settings);

		let url = 'https://api.' + _APISettings.server + '/v1';
			url += '/persons/' + _settings.userId;
			url += '/schools/' + _settings.schoolId;
			url += '/marks/' + _settings.from + '/' + _settings.to;

		const _options = {
			url: url
		};

		return ajaxSend( _options );

	}

	//get schools
	function getSchools(userId = 'me') {

		let url = 'https://api.' + _APISettings.server + '/v1';
			url += '/users/' + userId;
			url += '/schools';
			
		const _options = {
			url: url
		};

		return ajaxSend( _options );

	}

	//get relatices
	function getRelatives(userId = 'me') {

		let url = 'https://api.' 	+ _APISettings.server + '/v1';
			url += '/users/' 		+ userId;
			url += '/relatives';
			
		const _options = {
			url: url
		};

		return ajaxSend( _options );

	}
	
	//get children
	function getChildren(userId = 'me') {

		let url = 'https://api.' 	+ _APISettings.server + '/v1';
			url += '/users/' 		+ userId;
			url += '/children';
			
		const _options = {
			url: url
		};

		return ajaxSend( _options );

	}

	//get relatices
	function getMessages( settings ) {

		let _settings = {
			peer: 1,
			pageNumber: 0,
			pageSize: 100
		};

		Object.assign(_settings, settings);

		let url = 'https://api.' 	+ _APISettings.server + '/v1';
			url += '/messages?peer='+ _settings.peer;
			url += '&page_number=' 	+ _settings.pageNumber;
			url += '&page_size=' 	+ _settings.pageSize;
			
		const _options = {
			url: url
		};

		return ajaxSend( _options );

	}

	function uploadBase64(data, folderId, fileName = 'file'){

		let url = 'https://api.' + _APISettings.server + '/v1'
			url += '/folder/' + folderId;
			url += '/files/upload/base64';

		//old method for network for mosreg
		if (_APISettings.server === 'school.mosreg.ru'){
			url = 'https://api.' + _APISettings.server + '/v1'
			url += '/files/upload/base64';
		}

		const _options ={
			url: url,
			type: 'POST',
			data: {
				file: data,
				fileName: fileName
			}
		};

		return ajaxSend( _options );

	};

	/* ==========================================================================
	 * INIT
	 * ========================================================================== */
	

	function init(settings){

		setSettings(settings);

		setToken();

	}

	return{
		init: init,
		auth: auth,
		deleteToken: deleteToken,
		inviteToGroup: inviteToGroup,
		inviteToNetwork: inviteToNetwork,
		getFiles: getFiles,
		getUserAjax: getUserAjax,
		getCurrentUser: getCurrentUser,
		getCurrentUserAjax: getCurrentUserAjax,
		checkToken: checkToken,
		getMarks: getMarks,
		getSchools: getSchools,
		uploadBase64: uploadBase64,
		getTokenFromUrl: getTokenFromUrl,
		getRelatives: getRelatives,
		getChildren: getChildren,
		getMessages: getMessages,
		sendMessage: sendMessage,
		ajaxSend: ajaxSend
	}

})();

export default API;


