var config = {
    pack: {
        files: [{
            type: 'plugin',
            key: 'rexawaitloaderplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexawaitloaderplugin.min.js',
            start: true
        }]
    },
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}


var game = new Phaser.Game(config)
    var player;
    var objectCollect;
    var objectAvoid;
    var platforms;
    var cursors;
    var score = 0;
    var gameOver = false;
    var scoreText;
    var loseText;
    var newGame;
    var endScore;
    var highScore;
    var tempValue;

    fetch('https://api.openweathermap.org/data/2.5/weather?q=Cincinnati&appid=aff65e532f1fd8e7148b913a5de1a196')
    .then(response => response.json())
    .then(data => {
         tempValue = (data.main["temp"] - 273.15) * (9/5) + 32;
        console.log(tempValue);
         })
    .catch(err => alert("The URL is wrong"))

    function preload ()
    { 
        getLocation();
        // this.plugins.get('rexawaitloaderplugin').addToScene(this);
        // var callback = function(successCallback, failureCallback) {
        //     setTimeout(successCallback, 1000);
        // }
        // this.load.rexAwait(callback);
            if (tempValue > 90){
                this.load.image('background','assets/backgrounds/rock.png');
                console.log("this hit1")
            }
            else if (tempValue > 32 && tempValue < 90){
                this.load.image('background', 'assets/backgrounds/background0.png');
                console.log("this hit2")
            }
            else {
                this.load.image('background','assets/backgrounds/snow.png');
                console.log("this hit3")
            }
            this.load.image('background','assets/backgrounds/rock.png');
            this.load.image('ground', 'assets/world/ground.png');
            this.load.image('platform', 'assets/world/platform.png');
            this.load.image('objectCollect', 'assets/other/diamond.png');
            this.load.image('objectAvoid', 'assets/other/leaf.png');
            this.load.spritesheet('character', 'assets/other/sprite.png', { frameWidth: 28, frameHeight: 50 });

    }
    
    function create ()
    {
        this.add.image(400, 300, 'background');
        platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(140, 410, 'platform'); 
        platforms.create(690, 390, 'platform');
        platforms.create(50, 250, 'platform'); 
        platforms.create(730, 220, 'platform');
        player = this.physics.add.sprite(100, 450, 'character');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'character', frame: 4 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('character', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
  
        cursors = this.input.keyboard.createCursorKeys();
    
        objectCollect = this.physics.add.group({
            key: 'objectCollect',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
    
        objectCollect.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    
        objectAvoid = this.physics.add.group();
        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(objectCollect, platforms);
        this.physics.add.collider(objectAvoid, platforms);
        this.physics.add.collider(objectAvoid, objectAvoid);
        this.physics.add.overlap(player, objectCollect, collectLeaf, null, this);
        this.physics.add.collider(player, objectAvoid, collideLeaf, null, this);
    }
    
    function update ()
    {
        if (gameOver)
        {
            saveHighScore(score);
            loseText = this.add.text(300, 200, 'You are Trash LUL!', { fontSize: '40px', fill: '#000' });
            endScore = this.add.text(240, 250, 'Score: ' + score, { fontSize: '32px', fill: '#000' });
            highScore = this.add.text(270, 300, 'High Score: ' + localStorage.getItem("highScore"),  { fontSize: '32px', fill: '#000' });
            newGame = this.add.text(350, 350, 'Restart', { fontSize: '32px', fill: '#000' })
                .setInteractive()
                .on('pointerdown', function(){
                    location.reload();
                });
                };
    
        if (cursors.left.isDown)
        {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
    
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
    }
    
    function collectLeaf (player, leaf)
    {
        leaf.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);
        if (objectCollect.countActive(true) === 0)
        {
            objectCollect.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            var leaf = objectAvoid.create(x, 16, 'objectAvoid');
            leaf.setBounce(1);
            leaf.setCollideWorldBounds(true);
            leaf.setVelocity(Phaser.Math.Between(-200, 200), 20);
            leaf.allowGravity = false;
    
        }
    }
    
    function collideLeaf (player, leaf)
    {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;
    }
    
    function saveHighScore(score)
    {
        let hs = localStorage.getItem("highScore");
        if(score > hs)
        {
        localStorage.setItem('highScore', score);
        }
    }
    function progressBarFunction(){
        
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        var width = this.cameras.main.width;
            var height = this.cameras.main.height;
            var loadingText = this.make.text({
                x: width / 2,
                y: height / 2 - 50,
                text: 'Loading...',
                style: {
                    font: '20px monospace',
                    fill: '#ffffff'
                }
            });
            loadingText.setOrigin(0.5, 0.5);
            
            var percentText = this.make.text({
                x: width / 2,
                y: height / 2 - 5,
                text: '0%',
                style: {
                    font: '18px monospace',
                    fill: '#ffffff'
                }
            });
            percentText.setOrigin(0.5, 0.5);
            
            var assetText = this.make.text({
                x: width / 2,
                y: height / 2 + 50,
                text: '',
                style: {
                    font: '18px monospace',
                    fill: '#ffffff'
                }
            });
            assetText.setOrigin(0.5, 0.5);
            
            this.load.on('progress', function (value) {
                percentText.setText(parseInt(value * 100) + '%');
                progressBar.clear();
                progressBar.fillStyle(0xffffff, 1);
                progressBar.fillRect(250, 280, 300 * value, 30);
            });
            
            this.load.on('fileprogress', function (file) {
                assetText.setText('Loading asset: ' + file.key);
            });

            this.load.on('complete', function () {
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();
                percentText.destroy();
                assetText.destroy();
            })
    }
    function getLocation(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(editTitle);
        }
    }
    function editTitle (position){
        document.title = "You Coordinates: " + position.coords.latitude + ", " + position.coords.longitude;
    }
    function myFunction(){
        return "You Coordinates: " + position.coords.latitude + ", " + position.coords.longitude;
    }