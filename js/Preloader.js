
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
		this.load.image('titlepage', 'assets/images/background.png');		
		this.load.image('field', 'assets/images/field.png');		
		this.load.image('redSquare', 'assets/images/redSquare.png');		
		this.load.image('blueSquare', 'assets/images/blueSquare.png');		
		this.load.image('greenSquare', 'assets/images/greenSquare.png');		
		this.load.image('blueEnemySquare', 'assets/images/blueEnemySquare.png');		
		this.load.image('greenEnemySquare', 'assets/images/greenEnemySquare.png');		
		this.load.image('redEnemySquare', 'assets/images/redEnemySquare.png');		
		this.load.image('shield', 'assets/images/shield.png');		
		this.load.image('sword', 'assets/images/sword.png');		
		this.load.image('cantGoSign', 'assets/images/cantGoSign.png');	
		this.load.image('cantSpawn', 'assets/images/cantSpawn.png');	
		this.load.image('enemySquare', 'assets/images/enemySquare.png');	
		this.load.image('spawner', 'assets/images/spawner.png');	
		this.load.image('loseLabel', 'assets/images/loseLabel.png');	
		this.load.image('winLabel', 'assets/images/winLabel.png');	
		this.load.image('marchFlag', 'assets/images/marchFlag.png');
		this.load.image('mentorSpeech', 'assets/images/mentorSpeech.png');

		this.load.atlas('playButton', 'assets/images/playButton.png', 'assets/images/playButton.json');
		this.load.atlas('restartButton', 'assets/images/restartBut.png', 'assets/images/restartBut.json');
		this.load.atlas('turnOffMentorBut', 'assets/images/turnOffBut.png', 'assets/images/turnOffBut.json');

		this.load.spritesheet('explosion', 'assets/images/explosion.png', 60, 60);
		
		this.load.bitmapFont('basicFont', 'assets/fonts/font.png', 'assets/fonts/font.fnt');
		this.load.audio('backgroundMusic', ['assets/music/background.wav']);
		this.load.audio('coinsSound', ['assets/music/cash.mp3']);
		this.load.audio('explosionSound', ['assets/music/explosion.wav']);
		this.load.audio('stepSound', ['assets/music/step.wav']);
		this.load.audio('tapSound', ['assets/music/tap.mp3']);
		this.load.audio('getVoice1', ['assets/music/getVoice1.mp3']);
		this.load.audio('getVoice2', ['assets/music/getVoice2.mp3']);
		this.load.audio('getVoice3', ['assets/music/getVoice3.mp3']);
		this.load.audio('getVoice4', ['assets/music/getVoice4.mp3']);
		this.load.audio('getVoice5', ['assets/music/getVoice5.mp3']);
		this.load.audio('winVoice', ['assets/music/winVoice.mp3']);
		this.load.audio('loseVoice', ['assets/music/loseVoice.mp3']);
		/*this.load.audio('titleMusic', ['audio/main_menu.mp3']);
		this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');*/
		//	+ lots of other required assets here

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		/*if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		{
			this.ready = true;*/
			this.state.start('MainMenu');
		/*}*/

	}

};
