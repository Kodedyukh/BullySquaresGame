
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    create: function () {
        this.costOfSquare = 10;
        this.revenueFromSquare = 10;
        this.enemySteal = 100;

        this.field = new Field(this.game);

        this.shadowsGroup = this.add.group();
        this.enemiesGroup = this.add.group();
        this.squaresGroup = this.add.group();

        this.playersSpawner = new SquareSpawner(this.game, this, [4, 11], this.field);        

        //this.enemySpawner1 = new EnemySpawner(this.game, this, [1, -1], this.field);
        //this.enemySpawner2 = new EnemySpawner(this.game, this, [4, -1], this.field);
        //this.enemySpawner3 = new EnemySpawner(this.game, this, [7, -1], this.field);

        this.coins = 100;
        
        this.selectedSquare = null;

        this.input.onDown.add(this.manageMouse, this);

        mover.initiate(this.game, this.field);
        
        mover.launchTimer();

        // HUD

        this.coinsLabel = this.add.bitmapText(this.game.width*0.98, this.game.height*0.01, 'basicFont', ''+this.coins, 64);
        this.coinsLabel.anchor.setTo(1, 0);
        this.coinsLabel.tint = 0xffcc00;

        this.loseLabel = this.add.sprite(this.game.width/2, this.game.height/2, 'loseLabel');
        this.loseLabel.anchor.setTo(0.5, 0.5);
        this.loseLabel.alpha = 0;

        this.winLabel = this.add.sprite(this.game.width/2, this.game.height/2, 'winLabel');
        this.winLabel.anchor.setTo(0.5, 0.5);
        this.winLabel.alpha = 0;

        this.restartButton = this.add.button(this.game.width/2, this.game.height*0.95, 'restartButton', this.restartGame, this, 'out', 'out', 'down', 'out');
        this.restartButton.anchor.setTo(0.5, 0.5);
        this.restartButton.alpha = 0;
        this.restartButton.inputEnabled = false;

        // mentor speech sprite
        this.mentorSpeech = this.add.sprite(10, 30, 'mentorSpeech');
        this.mentorSpeech.alpha = 0;
        this.mentorSpeechLabel = this.add.bitmapText(220, 50, 'basicFont', 'Mentor speech', 32);
        this.mentorSpeechLabel.tint = 0x000000;
        this.mentorSpeechLabel.alpha = 0;
        this.mentorSpeaking = false;
        this.mentorOn = true;
        this.mentorOffButton = this.add.button(450, 190, 'turnOffMentorBut', this.turnOffMentor, this, 'out', 'out', 'down', 'out');
        this.mentorOffButton.alpha = 0;
        this.mentorOffButton.inputEnabled = false;


        // keyboard controls
        this.spawnRedKey = this.input.keyboard.addKey(Phaser.Keyboard.R);
        this.spawnRedKey.onUp.add(this.spawnRedSquare, this);

        this.spawnGreenKey = this.input.keyboard.addKey(Phaser.Keyboard.G);
        this.spawnGreenKey.onUp.add(this.spawnGreenSquare, this);

        this.spawnBlueKey = this.input.keyboard.addKey(Phaser.Keyboard.B);
        this.spawnBlueKey.onUp.add(this.spawnBlueSquare, this);

        this.restartGameKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        this.restartGameKey.onUp.add(this.restartGame, this);

        this.currentWaveIndex = 0;        
        this.wavesDepths = [1, 1, 2, 1, 2, 3, 1];

        this.setWaveTimer();

        // set music

        this.backgroundMusic = this.add.audio('backgroundMusic');
        this.backgroundMusic.loopFull(0.2);

        this.coinsSound = this.add.audio('coinsSound');
        this.explosionSound = this.add.audio('explosionSound');
        this.stepSound = this.add.audio('stepSound');
        this.tapSound = this.add.audio('tapSound');

        // voice acting
        this.winVoice = this.add.audio('winVoice');
        this.loseVoice = this.add.audio('loseVoice');
        this.getVoice1 = this.add.audio('getVoice1');
        this.getVoice2 = this.add.audio('getVoice2');
        this.getVoice3 = this.add.audio('getVoice3');
        this.getVoice4 = this.add.audio('getVoice4');
        this.getVoice5 = this.add.audio('getVoice5');
        this.getSoundsArray = [this.getVoice1, this.getVoice2, this.getVoice3, this.getVoice4, this.getVoice5];
        this.getSoundTextArray = ['That was unexpectedly bad', 'You are not trying', 'Very bad', 'I think that was all you capable of', 'My aunt does it better'];

        this.gamePaused = false;
    },

    update: function () {

        if (!this.gamePaused) {
            mover.checkMovePossiblity();    
        }        
    },

    manageMouse: function(pointer) {
        var newSelected = this.field.returnObjectAtPoint(pointer.position);
        if (newSelected && newSelected.holder==='player') {
            if (this.selectedSquare) {
                this.selectedSquare.diselect();
            }
            this.selectedSquare = newSelected;
            this.selectedSquare.select();
        } else {
            if (this.selectedSquare) {
                this.selectedSquare.definePath(pointer.position);
                this.time.events.add(500, function(){
                    if (this.selectedSquare) {
                        this.selectedSquare.diselect();    
                    }                    
                    this.selectedSquare = null;    
                }, this);
                
            }
        }
    },

    oneSquareExploded: function(square, reason) {
        //console.log('explosion of color '+square.color);
        if (square.selected) {
            this.selectedSquare = null;
        }
        if (reason==='defeated') {
            this.coins += this.revenueFromSquare;
            this.coinsLabel.text = ''+this.coins;

            var coinsGained = this.add.bitmapText(square.x, square.y, 'basicFont', '+'+this.revenueFromSquare, 30);
            coinsGained.anchor.setTo(0.5, 1);
            coinsGained.tint = 0xffcc00;
            var coinsGainedTween = this.add.tween(coinsGained).to({y: square.y-100}, 1000, Phaser.Easing.Linear.None, true);
            coinsGainedTween.onComplete.add(function(sprite){
                coinsGained.destroy();
            }, this); 
            if (!this.coinsSound.isPlaying) {
                this.coinsSound.play();
            }            
        } else {
            this.coins -= this.enemySteal;
            this.coinsLabel.text = ''+this.coins;

            var coinsStolen = this.add.bitmapText(square.x, square.y, 'basicFont', '-'+this.enemySteal, 30);
            coinsStolen.anchor.setTo(0.5, 1);
            coinsStolen.tint = 0x8c1602;
            var coinsStolenTween = this.add.tween(coinsStolen).to({y: square.y-100}, 1000, Phaser.Easing.Linear.None, true);
            coinsStolenTween.onComplete.add(function(sprite){
                coinsStolen.destroy();
            }, this);
            if (!this.coinsSound.isPlaying) {
                this.coinsSound.play();
            }
        }

        if (square.holder==='player') {
            this.squaresGroup.remove(square);            
        } else {
            this.enemiesGroup.remove(square);
        }

        this.shadowsGroup.remove(square.shadow);

        // play explosion sound
        if (!this.explosionSound.isPlaying) {
            this.explosionSound.play();
        }
        
        var enemiesLeft = this.enemiesGroup.children.length;
        if (enemiesLeft===0 && !this.gamePaused) {
            this.game.time.events.remove(this.waveTimer, this);
            if (this.currentWaveIndex<this.wavesDepths.length) {
                this.setWaveTimer();    
            } else {
                this.gameWon();
            }
            
        } else if(this.coins<this.costOfSquare) {
            this.gameLost();
        }
        if (coinsGained) {
            if (!this.mentorSpeaking) {
                this.giveMentorSpeech('getMoney');
            }
        }
    },

    gameWon: function() {
        this.gamePaused = true;
        this.winLabel.alpha = 1;
        this.restartButton.alpha = 1;
        this.restartButton.inputEnabled = true;
        this.giveMentorSpeech('win');
    },

    gameLost: function() {
        this.gamePaused = true;
        this.loseLabel.alpha = 1;
        this.restartButton.alpha = 1;
        this.restartButton.inputEnabled = true;
        this.giveMentorSpeech('lose');
    },

    restartGame: function() {

        this.loseLabel.alpha = 0;
        this.winLabel.alpha = 0;
        this.restartButton.alpha = 0;
        this.restartButton.inputEnabled = false;

        this.enemiesGroup.forEach(function(square){
            mover.deleteObject(square);
            this.field.deleteObject(square);
            square.marchFlag.destroy();
        }, this);
        this.squaresGroup.forEach(function(square){
            mover.deleteObject(square);
            this.field.deleteObject(square);
            square.marchFlag.destroy();
        }, this);

        this.enemiesGroup.removeAll();
        this.squaresGroup.removeAll();
        this.shadowsGroup.removeAll();

        this.coins = 100;
        this.coinsLabel.text = ''+this.coins;

        this.currentWaveIndex = 0;
        this.setWaveTimer();

        mover.clearTimer();
        mover.launchTimer();

        this.gamePaused = false;
    },

    spawnRedSquare: function() {
        if (this.coins>this.costOfSquare) {
            this.playersSpawner.spawn('red');
            this.coins -= this.costOfSquare;
            this.coinsLabel.text = ''+this.coins; 
            var coinsCost = this.add.bitmapText(this.playersSpawner.x, this.playersSpawner.y, 'basicFont', '-'+this.costOfSquare, 30);
            coinsCost.anchor.setTo(0.5, 1);
            coinsCost.tint = 0x8c1602;
            var coinsCostTween = this.add.tween(coinsCost).to({y: this.playersSpawner.y-100}, 1000, Phaser.Easing.Linear.None, true);
            coinsCostTween.onComplete.add(function(sprite){
                coinsCost.destroy();
            }, this);   
        }        
    },

    spawnGreenSquare: function() {
        if (this.coins>this.costOfSquare) {
            this.playersSpawner.spawn('green');
            this.coins -= this.costOfSquare;
            this.coinsLabel.text = ''+this.coins;
            var coinsCost = this.add.bitmapText(this.playersSpawner.x, this.playersSpawner.y, 'basicFont', '-'+this.costOfSquare, 30);
            coinsCost.anchor.setTo(0.5, 1);
            coinsCost.tint = 0x8c1602;
            var coinsCostTween = this.add.tween(coinsCost).to({y: this.playersSpawner.y-100}, 1000, Phaser.Easing.Linear.None, true);
            coinsCostTween.onComplete.add(function(sprite){
                coinsCost.destroy();
            }, this);      
        }        
    },

    spawnBlueSquare: function() {
        if (this.coins>this.costOfSquare) {
            this.playersSpawner.spawn('blue');
            this.coins -= this.costOfSquare;
            this.coinsLabel.text = ''+this.coins;   
            var coinsCost = this.add.bitmapText(this.playersSpawner.x, this.playersSpawner.y, 'basicFont', '-'+this.costOfSquare, 30);
            coinsCost.anchor.setTo(0.5, 1);
            coinsCost.tint = 0x8c1602;
            var coinsCostTween = this.add.tween(coinsCost).to({y: this.playersSpawner.y-100}, 1000, Phaser.Easing.Linear.None, true);
            coinsCostTween.onComplete.add(function(sprite){
                coinsCost.destroy();
            }, this);   
        }        
    },

    setWaveTimer: function() {
        if (this.currentWaveIndex < this.wavesDepths.length) {
            var currentWaveDepth = this.wavesDepths[this.currentWaveIndex];
            waveGenerator.generateWave(this.game, this, this.field, currentWaveDepth);

            this.currentWaveIndex++;
            this.waveTimer = this.game.time.events.add(40000, this.setWaveTimer, this);    
        }
        
    },

    turnOffMentor: function() {
        this.mentorOn = false;
    },

    giveMentorSpeech: function(reason) {
        if (this.mentorOn) {
            this.mentorSpeaking = true;
            switch (reason) {
                case 'win':
                    var text = 'So you did it by chance';
                    var voiceSound = this.winVoice;
                    this.getSoundsArray.forEach(function(getSound){
                        if (getSound.isPlaying) {
                            getSound.stop();
                        }
                    }, this);
                    break;
                case 'lose':
                    var text = 'As I expected you failed';
                    var voiceSound = this.loseVoice;
                    this.getSoundsArray.forEach(function(getSound){
                        if (getSound.isPlaying) {
                            getSound.stop();
                        }
                    }, this);
                    break;
                case 'getMoney':
                    var index = Math.floor(Math.random()*this.getSoundsArray.length);
                    var text = this.getSoundTextArray[index],
                        voiceSound = this.getSoundsArray[index];

                    break;
            }

            this.time.events.add(1000, function(){
                this.mentorSpeech.alpha = 1;
                this.mentorSpeechLabel.text = text;
                this.mentorSpeechLabel.alpha = 1;
                this.mentorOffButton.alpha = 1;
                this.mentorOffButton.inputEnabled = true;
                voiceSound.play();
                voiceSound.onStop.add(function(){
                    this.mentorSpeechLabel.alpha = 0;
                    this.mentorSpeech.alpha = 0;
                    this.mentorOffButton.alpha = 0;
                    this.mentorOffButton.inputEnabled = false;
                    this.mentorSpeaking = false;
                }, this);
            }, this);
        }
    },
    

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};

Field = function(game) {
    this.game = game;
    Phaser.Sprite.call(this, game, 0, 0, 'field');
    game.add.existing(this);
    this.idsArray = [];
    this.lastId = 0;
    this.objects = {};
};

Field.prototype = Object.create(Phaser.Sprite.prototype);
Field.prototype.constructor = Field;

Field.prototype.addObject = function(object, position) {
    this.lastId ++;
    this.objects[this.lastId] = object;
    object.id = this.lastId;
};

Field.prototype.deleteObject = function(obj) {
    delete this.objects[obj.id];
};

Field.prototype.findPath = function(object, targetPos) {
    var currentPos = this.objects[object.id].currentPos.slice();
    var path = [];
    //console.log(currentPos);
    //console.log(targetPos);

    while (!currentPos.equals(targetPos)) {
        if (currentPos[0]<targetPos[0]) {
            currentPos[0]++;
            path.push(currentPos.slice());
            //console.log(currentPos);
        } else if(currentPos[0]>targetPos[0]){
            currentPos[0]--;
            path.push(currentPos.slice());
            //console.log(currentPos);
        }

        if (currentPos[1]<targetPos[1]) {
            currentPos[1]++;
            path.push(currentPos.slice());
            //console.log(currentPos);
        } else if(currentPos[1]>targetPos[1]){
            currentPos[1]--;
            path.push(currentPos.slice());
            //console.log(currentPos);
        }
    }

    return path;
};

Field.prototype.returnNumberEnemies = function() {
    var enemiesLeft = 0;

    for (var o in this.objects) {
        if (this.objects[o].holder === 'enemy') {
            enemiesLeft ++;
        }
    }

    return enemiesLeft;
};

Field.prototype.checkCanGo = function() {
    var objectsArray = Object.values(this.objects).slice();

};

Field.prototype.checkCollisionManyVMany = function(objectsArray) {
    if (!objectsArray) {
        objectsArray = Object.values(this.objects).slice(); 
        objectsArray.sort(function(a, b){
            if (a.holder==='player' && b.holder==='enemy') {
                return -1;
            } else if (a.holder==='enemy' && b.holder==='player') {
                return 1;
            } else {
                return 0;
            }
        });
    }    

    if (objectsArray.length>2) {
        var currentObject = objectsArray.shift();
        this.checkCollisionOneVMany(currentObject, objectsArray);
        this.checkCollisionManyVMany(objectsArray);
    } else if (objectsArray.length===2) {
        this.checkCollisionOneVOne(objectsArray[0], objectsArray[1]);    
    }  
};

Field.prototype.checkCollisionOneVMany = function(obj, objArray) {

    objArray.forEach(function(obj1){
        this.checkCollisionOneVOne(obj, obj1);
    }, this); 

};

Field.prototype.checkCollisionOneVOne = function(obj1, obj2) {    
    /*if (obj1.nextPos && obj1.nextPos.length>0) {
        var obj1IntentPos = obj1.nextPos;
        var obj1Going = true;        
    } else {
        var obj1IntentPos = obj1.currentPos;
        var obj1Going = false;
    }

    if (obj2.nextPos && obj2.nextPos.length>0) {
        var obj2IntentPos = obj2.nextPos;
        var obj2Going = true;        
    } else {
        var obj2IntentPos = obj2.currentPos;
        var obj2Going = false;
    }

    if (obj1IntentPos.equals(obj2IntentPos)) {
        if (obj1Going && obj2Going) {
            obj1.canGo = true;
            obj2.canGo = false;
        } else {
            obj1.canGo = false;
            obj2.canGo = false;
        }
    }

    if (obj1IntentPos.equals(obj2.currentPos) && obj2IntentPos.equals(obj1.currentPos)) {
        obj1.canGo = false;
        obj2.canGo = false;
    }

    if (obj2.canGo===false && obj1IntentPos.equals(obj2.currentPos)) {
        obj1.canGo = false;
    }

    if (obj1.canGo===false && obj2IntentPos.equals(obj1.currentPos)) {
        obj2.canGo = false;
    }*/

    /*if (obj1.nextPos && obj1.nextPos.length>0) {
        if (obj1.nextPos.equals(obj2.currentPos)) {
            obj1.canGo = false;
        }
    }
    if (obj2.nextPos && obj2.nextPos.length>0) {
        if (obj2.nextPos.equals(obj1.currentPos)) {
            obj2.canGo = false;
        }
    }

    if ((obj1.nextPos && obj1.nextPos.length>0) && (obj2.nextPos && obj2.nextPos.length>0)) {
        if (obj2.nextPos.equals(obj1.nextPos)) {
            if ((obj1.holder==='player' && obj2.holder==='player') || 
                    (obj1.holder==='enemy' && obj2.holder==='enemy')) {
                obj1.canGo = true;
                obj2.canGo = false;    
            } else if (obj1.holder==='enemy' && obj2.holder==='player') {
                obj2.canGo = true;
                obj1.canGo = false;
            } else if (obj1.holder==='player' && obj2.holder==='enemy') {
                obj1.canGo = true;
                obj2.canGo = false;
            }
            
        }
    }*/

    if ((obj1.nextPos && obj1.nextPos.length>0) && obj1.canGo) {
        if (obj2.canGo) {
            if (obj2.nextPos && obj2.nextPos.length>0) {
                if (obj1.nextPos.equals(obj2.nextPos)) {
                    obj2.canGo = false;
                } else if (obj2.currentPos.equals(obj1.nextPos)&&(obj1.currentPos.equals(obj2.nextPos))) {
                    obj1.canGo = false;
                    obj2.canGo = false;
                } else if (obj1.frequency===1 && (obj2.moveCount%obj2.frequency)!=0 && obj1.nextPos.equals(obj2.currentPos)) {
                    obj1.canGo = false;
                }
            } else if (obj1.nextPos.equals(obj2.currentPos)) {
                obj1.canGo = false;
            }
        } else if (obj1.nextPos.equals(obj2.currentPos)) {
            obj1.canGo = false;
        }
    } else if (obj2.nextPos && obj2.nextPos.length>0 && obj2.nextPos.equals(obj1.currentPos)) {
        obj2.canGo = false;
    }
};

Field.prototype.checkVicinityManyVMany = function(objectsArray) {
    if (!objectsArray) {
        objectsArray = Object.values(this.objects).slice();    
    }    

    if (objectsArray.length>2) {
        var currentObject = objectsArray.shift();
        this.checkVicinityOneVMany(currentObject, objectsArray);
        this.checkVicinityManyVMany(objectsArray);
    } else if (objectsArray.length===2) {
        this.checkVicinityOneVOne(objectsArray[0], objectsArray[1]);    
    }    
};

Field.prototype.checkVicinityOneVMany = function(obj, objArray) {

    objArray.forEach(function(obj1){
        this.checkVicinityOneVOne(obj, obj1);
    }, this);    
};

Field.prototype.checkVicinityOneVOne = function(obj1, obj2) {
    if (obj1.color == obj2.color) {
        if (obj1.currentPos[0]===obj2.currentPos[0]) {

            if (obj1.currentPos[1]===obj2.currentPos[1]+1) {

                obj1.numberOfSameNeighbours++;
                obj1.tSameNeighbour = obj2;
                obj2.numberOfSameNeighbours++;
                obj2.bSameNeighbour = obj1;

            } else if (obj1.currentPos[1]===obj2.currentPos[1]-1) {

                obj1.numberOfSameNeighbours++;
                obj1.bSameNeighbour = obj2;
                obj2.numberOfSameNeighbours++;
                obj2.tSameNeighbour = obj1;

            }
        } else if (obj1.currentPos[1]===obj2.currentPos[1]){

            if (obj1.currentPos[0]===obj2.currentPos[0]+1) {

                obj1.numberOfSameNeighbours++;
                obj1.lSameNeighbour = obj2;
                obj2.numberOfSameNeighbours++;
                obj2.rSameNeighbour = obj1;

            } else if (obj1.currentPos[0]===obj2.currentPos[0]-1){

                obj1.numberOfSameNeighbours++;
                obj1.rSameNeighbour = obj2;
                obj2.numberOfSameNeighbours++;
                obj2.lSameNeighbour = obj1;

            }
        }
    }
};

Field.prototype.markForExplosion = function() {
    var objectsCopy = Object.values(this.objects).slice();

    objectsCopy.sort(function(a, b){
        if (a.numberOfSameNeighbours>b.numberOfSameNeighbours) {
            return -1;
        }
        return 1;
    });

    objectsCopy.forEach(function(obj){
        if (obj.explode) {
            if (obj.lSameNeighbour) {
                obj.lSameNeighbour.explode = true;
            }
            if (obj.rSameNeighbour) {
                obj.rSameNeighbour.explode = true;
            }
            if (obj.tSameNeighbour) {
                obj.tSameNeighbour.explode = true;
            }
            if (obj.bSameNeighbour) {
                obj.bSameNeighbour.explode = true;
            }
        } else {
            if (obj.numberOfSameNeighbours>1) {
                
                if ((obj.lSameNeighbour && obj.rSameNeighbour) || (obj.tSameNeighbour && obj.bSameNeighbour)) {

                    obj.explode = true;
                    if (obj.lSameNeighbour) {
                        obj.lSameNeighbour.explode = true;
                    }
                    if (obj.rSameNeighbour) {
                        obj.rSameNeighbour.explode = true;
                    }
                    if (obj.tSameNeighbour) {
                        obj.tSameNeighbour.explode = true;
                    }
                    if (obj.bSameNeighbour) {
                        obj.bSameNeighbour.explode = true;
                    }
                }
            }
        }

        //console.log(obj);

        obj.resetNeighbours();
    }, this);
};

Field.prototype.updateObjectPos = function(object, newPos) {
    this.objects[object.id][1] = newPos;
};

Field.prototype.returnObjectAtPoint = function(point) {
    var mousePos = [Math.floor(point.x/80), Math.floor(point.y/80)];
    for (var o in this.objects) {
        if (this.objects[o] && this.objects[o].currentPos.equals(mousePos)) {
            return this.objects[o];
        }
    }
    return null;
}

Square = function(game, pos, color, field, state) {
    //console.log('square called');
    this.game = game;
    this.holder = 'player';

    // create and set shadow

    var shadowGraph = this.game.make.graphics(0, 0);

    shadowGraph.beginFill(0x000000, 0.5);
    shadowGraph.drawRoundedRect(0, 0, 55, 20, 10);
    shadowGraph.endFill();

    this.shadow = this.game.add.sprite(40 + pos[0]*80, 10 + pos[1]*80 + 60, shadowGraph.generateTexture());
    this.shadow.anchor.setTo(0.5, 1);
    this.shadow.leader = this;

    this.shadow.update = followLead;

    // choose color

    switch (color) {
        case 'red':
            var key = 'redSquare';
            break;
        case 'blue':
            var key = 'blueSquare';
            break;
        case 'green':
            var key = 'greenSquare';
            break;
    }

    this.color = color;

    Phaser.Sprite.call(this, game, 40 + pos[0]*80, 10 + pos[1]*80, key);
    game.add.existing(this);
    this.anchor.setTo(0.5, 0);
    this.currentPos = pos.slice();
    this.nextPos = [];
    this.targetPos = [];
    this.path = [];
    this.moveCount = 0;
    this.frequency = 1;
    this.state = state;
    //console.log(this.currentPos);

    this.field = field;

    this.field.addObject(this, this.currentPos);

    // set select outline
    var outlineGraph = this.game.make.graphics(0, 0);

    outlineGraph.lineStyle(4, 0xf3fdab, 1);
    outlineGraph.drawRoundedRect(0, 0, 70, 70, 5);

    this.selectOutline = this.game.make.sprite(0, 30, outlineGraph.generateTexture());
    this.selectOutline.anchor.setTo(0.5, 0.5);
    this.addChild(this.selectOutline);
    this.selectOutline.alpha = 0;

    // set weapons and thier tweens
    this.shield = this.game.make.sprite(-30, 45, 'shield');
    this.shield.anchor.setTo(0.5, 0.5);
    this.shield.rotation = -Math.PI*0.1
    this.addChild(this.shield);
    this.shieldTween = this.game.add.tween(this.shield).to({rotation: -Math.PI*0.2}, 200, Phaser.Easing.Linear.None, true, 0, -1).yoyo(true);

    this.sword = this.game.make.sprite(30, 45, 'sword');
    this.sword.anchor.setTo(0.5, 1);
    this.sword.rotation = Math.PI*0.1;
    this.addChild(this.sword);
    this.swordTween = this.game.add.tween(this.sword).to({rotation: Math.PI*0.2}, 200, Phaser.Easing.Linear.None, true, 0, -1).yoyo(true);

    // same colored neighbours
    this.lSameNeighbour = null;
    this.rSameNeighbour = null;
    this.tSameNeighbour = null;
    this.bSameNeighbour = null;
    this.numberOfSameNeighbours = 0;

    this.explode = false;
    this.selected = false;
    this.explosionSignal = new Phaser.Signal();
    this.canGo = true;

    // set initial tweens

    this.leftMoveTween = this.game.add.tween(this).to({x: this.x-80}, 300, Phaser.Easing.Linear.None, false);
    this.jumpTween = this.game.add.tween(this).to({y: this.y-20}, 150, Phaser.Easing.Linear.None, false).yoyo(true);
    this.rightMoveTween = this.game.add.tween(this).to({x: this.x+80}, 300, Phaser.Easing.Linear.None, false);
    this.upMoveTween = this.game.add.tween(this).to({y: this.y-80}, 300, Phaser.Easing.Linear.None, false);            
    this.downMoveTween = this.game.add.tween(this).to({y: this.y+80}, 300, Phaser.Easing.Linear.None, false);

    // can't go sign

    this.cantGoSign = this.game.make.sprite(this.width/2, -10, 'cantGoSign');
    this.cantGoSign.anchor.setTo(0.5, 1);
    this.addChild(this.cantGoSign);
    this.cantGoSign.alpha = 0;

    this.cantGoTween = this.game.add.tween(this.cantGoSign).to({alpha: 1}, 300, Phaser.Easing.Linear.None, false).yoyo(true);

    // march flag

    this.marchFlag = this.game.add.sprite(this.x, this.y-30, 'marchFlag');
    this.marchFlag.anchor.setTo(0, 1);
    this.marchFlag.alpha = 0;
    

};

Square.prototype = Object.create(Phaser.Sprite.prototype);
Square.prototype.constructor = Square;

Square.prototype.definePath = function(position) {
    var targetPosX = Math.floor(position.x/80),
        targetPosY = Math.floor(position.y/80);

    this.path = this.field.findPath(this, [targetPosX, targetPosY]);
    //console.log(this.path);
    this.nextPos = this.path.shift();

    if (this.holder==='player') {
        this.marchFlag.position.set(targetPosX*80+40, targetPosY*80+40);
        this.marchFlag.alpha = 1;
        this.state.tapSound.play();
    }

    
};

Square.prototype.move = function() {
    //console.log('move called at '+this.id);
    this.moveCount++;
    if (this.explode) {

        this.makeExplosion('defeated');

    } else {

        if (this.nextPos && this.nextPos.length>0 && this.canGo && (this.moveCount%this.frequency)===0) {
            //console.log(this.currentPos);
            //console.log(this.nextPos);
            if (this.nextPos[0]<this.currentPos[0]) {

                this.leftMoveTween = this.game.add.tween(this).to({x: this.x-80}, 300, Phaser.Easing.Linear.None, true);
                this.jumpTween = this.game.add.tween(this.scale).to({y: 0.8}, 150, Phaser.Easing.Linear.None, true).yoyo(true);

                //console.log('tween called');

            } else if (this.nextPos[0]>this.currentPos[0]) {

                this.rightMoveTween = this.game.add.tween(this).to({x: this.x+80}, 300, Phaser.Easing.Linear.None, true);;
                this.jumpTween = this.game.add.tween(this.scale).to({y: 0.8}, 150, Phaser.Easing.Linear.None, true).yoyo(true);

                //console.log('tween called');
            }
            if (this.nextPos[1]<this.currentPos[1]) {

                this.upMoveTween = this.game.add.tween(this).to({y: this.y-80}, 300, Phaser.Easing.Linear.None, true);         
                this.jumpTween = this.game.add.tween(this.scale).to({y: 0.8}, 150, Phaser.Easing.Linear.None, true).yoyo(true);   

                //console.log('tween called');

            } else if (this.nextPos[1]>this.currentPos[1]) {

                this.downMoveTween = this.game.add.tween(this).to({y: this.y+80}, 300, Phaser.Easing.Linear.None, true);
                this.jumpTween = this.game.add.tween(this.scale).to({y: 0.8}, 150, Phaser.Easing.Linear.None, true).yoyo(true);

                //console.log('tween called');

            }

            this.jumpTween.onComplete.add(function(){
                if (!this.state.stepSound.isPlaying) {
                    this.state.stepSound.play();
                }
            }, this);

            this.currentPos = this.nextPos.slice();
            this.nextPos = this.path.shift();
            //console.log(this.nextPos);
        } else if (!this.canGo) {

            this.cantGoTween.start();

        }
    }
    this.canGo = true;

    if (!this.explode && this.holder==='enemy' && this.y >= 11*80+10) {
        this.game.time.events.add(300, function(){
            //console.log('enemy reached edge');
            this.makeExplosion('enemyReached');    
        }, this);
        
    }
};

Square.prototype.setReadyToMove = function() {
    this.readyToMove = true;
};

Square.prototype.checkMoveDone = function() {
    return (!this.leftMoveTween.isRunning && !this.rightMoveTween.isRunning && !this.upMoveTween.isRunning && !this.downMoveTween.isRunning);
};

Square.prototype.select = function() {
    this.selectOutline.alpha = 1;
    this.selected = true;
    if (this.nextPos && this.nextPos.length>0) {
        this.marchFlag.alpha = 1;
    }
};

Square.prototype.diselect = function() {
    this.selectOutline.alpha = 0;
    this.selected = false;
    this.marchFlag.alpha = 0;
};

Square.prototype.resetNeighbours = function() {
    this.lSameNeighbour = null;
    this.rSameNeighbour = null;
    this.tSameNeighbour = null;
    this.bSameNeighbour = null;
    this.numberOfSameNeighbours = 0;
};

Square.prototype.makeExplosion = function(reason) {
    //console.log('explosion');
    this.explosionSignal.dispatch(this, reason);
    if (this.selected) {
        this.diselect();
    }

    var explosion = this.game.add.sprite(this.x, this.y, 'explosion');
    explosion.anchor.setTo(0.5, 0);
    var explAnimation = explosion.animations.add('main', null, 20, false);
    explAnimation.play();
    explAnimation.onComplete.add(function(sprite){

        sprite.destroy();

    }, this);

    mover.deleteObject(this);
    this.field.deleteObject(this);
    this.shadow.destroy();    
    this.marchFlag.destroy();
    this.destroy();
};

EnemySquare = function(game, pos, color, field, state) {
    Square.call(this, game, pos, color, field, state);
    this.holder = 'enemy';
    switch (color) {
        case 'red':
            var key = 'redEnemySquare';
            break;
        case 'blue':
            var key = 'blueEnemySquare';
            break;
        case 'green':
            var key = 'greenEnemySquare';
            break;
    }
    this.loadTexture(key);
    this.frequency = 12;
};

EnemySquare.prototype = Object.create(Square.prototype);
EnemySquare.prototype.constructor = EnemySquare;

SquareSpawner = function(game, state, pos, field) {
    this.game = game;
    this.field = field;
    this.pos = pos;
    this.state = state;
    Phaser.Sprite.call(this, game, 40 + pos[0]*80, 40 +pos[1]*80, 'spawner');
    game.add.existing(this);

    this.anchor.setTo(0.5, 0.5);

    this.cantSpawnSign = this.game.add.sprite(this.x, this.y, 'cantSpawn');
    this.cantSpawnSign.alpha =0;

    this.cantSpawnTween = this.game.add.tween(this.cantSpawnSign).to({alpha: 1}, 500, Phaser.Easing.Linear.None, false).yoyo(true);


};

SquareSpawner.prototype = Object.create(Phaser.Sprite.prototype);
SquareSpawner.prototype.constructor = SquareSpawner;

SquareSpawner.prototype.spawn = function(color) {
    if (!this.field.returnObjectAtPoint(this.position)) {
        var square = new Square(this.game, this.pos, color, this.field, this.state);
        square.definePath(new Phaser.Point(this.position.x, this.position.y-80));            
        square.explosionSignal.add(this.state.oneSquareExploded, this.state);
        mover.addObject(square);
        this.state.squaresGroup.add(square);
        this.state.shadowsGroup.add(square.shadow);
    } else {
        this.cantSpawnTween.start();
    }    
};

EnemySpawner = function(game, state, pos, field) {
    SquareSpawner.call(this, game, state, pos, field);
    //console.log(this.field);

    this.timer = this.game.time.events.add(6000, this.setSpawnParameters, this);
};

EnemySpawner.prototype = Object.create(SquareSpawner.prototype);
EnemySpawner.prototype.constructor = EnemySpawner;

EnemySpawner.prototype.spawn = function(color) {
    if (!this.field.returnObjectAtPoint(this.position)) {
        var square = new EnemySquare(this.game, this.pos, color, this.field);
        square.definePath(new Phaser.Point(this.game.width/2, this.game.height*0.9)); 
        square.explosionSignal.add(this.state.oneSquareExploded, this.state); 
        mover.addObject(square); 
    } else {
        this.cantSpawnTween.start();
    }
};

EnemySpawner.prototype.setSpawnParameters = function() {
    var colorIndex = Math.round(Math.random()*2),
        colors = [0xff0000, 0x00ff00, 0x0000ff],
        color = colors[colorIndex],
        nextTime = 10000 + Math.round(Math.random()*1500);

    this.spawn(color);

    this.timer = this.game.time.events.add(nextTime, this.setSpawnParameters, this);

};

followLead = function() {
    this.x = this.leader.x;
    this.y = this.leader.y + 60;
};

waveGenerator = {

    generateWave: function(game, state, field, depth) {
        var waveStructure = {};

        waveStructure = this.generateWaveStructure(depth); 
        //console.log(waveStructure);

        for (var i=0; i<depth; i++) {
            for (var j=0; j<8; j++) {
                var key = ''+j+'-'+i;
                var color = waveStructure[key];                
                var square = new EnemySquare(game, [j, -i], color, field, state);
                square.definePath(new Phaser.Point(j*80+40, 940)); 
                square.explosionSignal.add(state.oneSquareExploded, state); 
                mover.addObject(square);
                state.enemiesGroup.add(square);
                state.shadowsGroup.add(square.shadow);
            }
        }
    },

    generateWaveStructure: function(depth) {
        var structure = {};
        //console.log('generate wave structure called');
        //console.log(depth);

        /*for (var i=0; i<depth; i++) {
            for (var j = 0; j<8; j++) {
                var key = ''+j+'-'+i;
                structure[key] = null;
            }
        }*/

        //console.log(structure);

        for (var i=0; i<depth; i++) {
            for (var j = 0; j<8; j++) {
                var colors = ['red', 'green', 'blue'],
                    leftPrevColor = null,
                    leftPrevPrevColor = null,
                    bottomPrevColor = null,
                    bottomPrevPrevColor = null,
                    currentKey = ''+j+'-'+i,
                    leftPrevKey = ''+(j-1)+'-'+i,
                    leftPrevPrevKey = ''+(j-2)+'-'+i,
                    bottomPrevKey = ''+j+'-'+(i-1),
                    bottomPrevPrevKey = ''+j+'-'+(i-2);

                // exclude colors if we have the same on two left or bottom cells

                if (structure[leftPrevKey]) {
                    leftPrevColor = structure[leftPrevKey];
                }
                if (structure[leftPrevPrevKey]) {
                    leftPrevPrevColor = structure[leftPrevPrevKey];
                }

                if (leftPrevColor && leftPrevPrevColor && (leftPrevColor===leftPrevPrevColor)) {
                    var excludeIndex = colors.indexOf(leftPrevColor);
                    if (excludeIndex>=0) {
                        colors.splice(excludeIndex, 1);    
                    }                    
                }

                if (structure[bottomPrevKey]) {
                    bottomPrevColor = structure[bottomPrevKey];
                }
                if (structure[bottomPrevPrevKey]) {
                    bottomPrevPrevColor = structure[bottomPrevPrevKey];
                }

                if (bottomPrevColor && bottomPrevPrevColor && (bottomPrevColor===bottomPrevPrevColor)) {
                    var excludeIndex = colors.indexOf(bottomPrevColor);
                    if (excludeIndex>=0) {
                        colors.splice(excludeIndex, 1);    
                    }                    
                }

                var colorIndex = Math.floor(Math.random()*colors.length),
                    color = colors[colorIndex];                   

                structure[currentKey] = color;
                /*console.log('this color '+color);
                console.log('all colors '+ colors);
                console.log('______________________________________________');*/
            }
        }

        return structure;
    }
}

mover = {
    objects: [],
    timePassed: false,
    timer: null,

    initiate: function(game, field) {
        this.game = game;
        this.field = field;
    },

    addObject: function(obj) {
        this.objects.push(obj);
    },

    deleteObject: function(obj) {                
        var objectIndex = this.objects.indexOf(obj);
        if (objectIndex>=0) {
            this.objects.splice(objectIndex, 1);
        }
    },

    launchTimer: function() {
        this.timer = this.game.time.events.add(600, function(){
            this.timePassed = true;
        }, this);
    },

    clearTimer: function() {
        this.game.time.events.remove(this.timer, this);
        this.timePassed = false;
    },

    checkMovePossiblity: function() {
        var allMoved = true;
        //console.log('move posibillity check called');

        this.objects.forEach(function(obj){
            allMoved = allMoved && obj.checkMoveDone();
        }, this);

        if (this.timePassed && allMoved) {
            this.timePassed = false;
            this.launchTimer();
            this.field.checkVicinityManyVMany();
            this.field.markForExplosion();
            this.field.checkCollisionManyVMany();
            var objectsCopy = this.objects.slice();
            objectsCopy.forEach(function(obj){
                obj.move();
            }, this);
        }
    }
}


//below code is taken from https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }
        else if (typeof this[i]==="number" && typeof array[i]==="number") {
            if (Math.abs(this[i]-array[i])>0.01) {
                return false;
            }            
        }
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

