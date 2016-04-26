'use strict'

import app from './app';

const appSettings = {

	API: {
		groupId: 316373,
		folderId: 2631891,
		server: 'dnevnik.ru',
		cookieName: 'dnevnik_project_token',
		scope: 'Files,SocialEntityMembership',	
		clientId: '3f2ab9e67e1d48248db8adf9b1fd11b1',
		clienSecret: 'b31824a66cc24f4eb4e05ed85496dc3a',		
		modalRedirectUrl: '//ad.dnevnik.ru/promo/oauth',
		redirectUrl: '//ad.dnevnik.ru/promo/folder',
		develop: true
	}
}

//start the magic
document.addEventListener('DOMContentLoaded', () => {

	app(appSettings);

});   
