// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 375;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 75;
var MAX_ENEMIES = 3;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;
var PLAYER_HEALTH = 150;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var SPACE_BAR_CODE = 32;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';

// Preload game images
var images = {};
['enemy.png', 'stars.png', 'player.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});


// GLOBAL MUSIC VARIABLE AND CONSTRUCTOR

var myMusic;

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}





// This section is where you will be doing most of your coding

class Entity {

 render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}
class Enemy extends Entity {

    constructor(xPos) {
    super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }

   //  render(ctx) {
//         ctx.drawImage(this.sprite, this.x, this.y);
//     }
}

class Player extends Entity {

    constructor() {
    super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
        this.health = PLAYER_HEALTH;
    }

    // This method is called by the game engine when left/right arrows are pressed
   move(direction) {
//         if (direction === MOVE_LEFT && this.x > 0) {
//             this.x = this.x - PLAYER_WIDTH;
//         }
//         else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
//             this.x = this.x + PLAYER_WIDTH;
//         }
//     }

 if (direction === MOVE_LEFT) {
         if (this.x === 0){ //i.e. if we are in the leftmost position which at 0 px, 2nd leftmost position is 75 px as we are adding width of player
            this.x = GAME_WIDTH - PLAYER_WIDTH;
         }
         else if (this.x > 0){ //normal situation
            this.x = this.x - PLAYER_WIDTH;
         }
         // console.log(this.x); //debugging
      }
     else if (direction === MOVE_RIGHT) {
         if ( this.x < GAME_WIDTH - PLAYER_WIDTH ){ //normal situation
            this.x = this.x + PLAYER_WIDTH;
         }
         else if (this.x === (GAME_WIDTH - PLAYER_WIDTH)){ //most rightmost position (dynamic to game width and player width)
            this.x = 0;
         }
       }

     }
}

class Ramen extends Enemy {

  constructor(xPos) {
  super();
      this.x = xPos;
      this.y = -ENEMY_HEIGHT;
      this.sprite = images['ramen2.png'];

      // Each ramen should have a different speed
      this.speed = Math.random() / 2 + 0.25;
  }

  update(timeDiff) {
      this.y = this.y + timeDiff * this.speed;
  }
}

/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH;

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (!enemySpots || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

    	// MUSIC STARTS

    	myMusic = new sound("gametheme.mp3");
    	myMusic.play();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player

		// INCREASE SPEED OF PLAYER

		   this.enemies.forEach((enemy, enemyIdx) => {
            enemy.speed = enemy.speed + this.score/350000;
            });


        // Check if any enemies should die


        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });




        this.setupEnemies();

        // Check if player is touched and decrease health

        if (this.isPlayerDead() && this.player.health > 0){
           this.player.health--;
        }

        if (this.player.health === 0) {

        // STOP THE MUSIC

        myMusic.stop();

           // If they are dead, then it's game over!


            this.player.health = PLAYER_HEALTH;  //reset the health
            this.ctx.font = 'bold 22px sans-serif';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + ' SCORE ', 120, 150);
            this.ctx.fillText(' PRESS SPACE TO RESTART ', 40, 190);

            // LISTEN FOR SPACE BAR TO RESTART

            document.addEventListener('keydown', e => {
             if (e.keyCode === SPACE_BAR_CODE) {
             location.reload();

        }
             });
        }
        else {

          //  If player is not dead, then draw the score


            this.ctx.font = 'bold 30px sans-serif';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + " score", 5, 30);
            if (this.player.health < 50){
               this.ctx.fillStyle = 'red';
            }
            else {
               this.ctx.fillStyle = 'green';
            }
            this.ctx.fillText(this.player.health + " health", 5, 70);

           // Set the time marker and redraw
            this.lastFrame = Date.now();
           requestAnimationFrame(this.gameLoop);
        }
        }


 // KEEP ABOVE it is the health code


//         if (this.isPlayerDead()) {
//             // If they are dead, then it's game over!
//             // AND STOP THE MUSIC
//
//
//             myMusic.stop();
//             this.ctx.font = 'bold 30px sans-serif';
//             this.ctx.fillStyle = '#ffffff';
//         	this.ctx.fillText(this.score + ' GAME OVER', 5, 30);
//             this.ctx.fillText('PRESS SPACE TO PLAY AGAIN', 20, 250);
//
//
//         	document.addEventListener('keydown', e => {
//             if (e.keyCode === SPACE_BAR_CODE) {
//             location.reload();
//              //this.start();
//             }
//             });
//
//
//
//         }
//         else {
//             // If player is not dead, then draw the score
//             this.ctx.font = 'bold 30px sans-serif';
//             this.ctx.fillStyle = '#ffffff';
//             this.ctx.fillText(this.score, 5, 30);
//
//             // Set the time marker and redraw
//             this.lastFrame = Date.now();
//             requestAnimationFrame(this.gameLoop);
//         }
//     }

// ABOVE IS STANDARD CODE for review

    isPlayerDead() {

    	var dead = false;

    	this.enemies.forEach((enemy) => {

            if (enemy.x === this.player.x && enemy.y + ENEMY_HEIGHT >= this.player.y){
            dead = true;
            var audio = new Audio("sfx_deathscream_human4.wav");
            audio.play();
            return;
            }
        });

    return dead;
	}
}

// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();
