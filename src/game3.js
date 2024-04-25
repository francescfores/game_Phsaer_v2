// Smoothed horizontal controls helper. This gives us a value between -1 and 1 depending on how long
// the player has been pressing left or right, respectively.
class SmoothedHorionztalControl {
    constructor(speed) {
        this.msSpeed = speed;
        this.value = 0;
    }

    moveLeft(delta) {
        if (this.value > 0) { this.reset(); }
        this.value -= this.msSpeed * delta;
        if (this.value < -1) { this.value = -1; }
    }

    moveRight(delta) {
        if (this.value < 0) { this.reset(); }
        this.value += this.msSpeed * delta;
        if (this.value > 1) { this.value = 1; }
    }

    reset() {
        this.value = 0;
    }
}

class Example extends Phaser.Scene
{
    playerController;
    cursors;
    text;
    cam;
    smoothedControls;
    debugGraphics;
    Terrain32x32Layer;
    background;
    background2;
    background3;
    background4;
    backgroundLayer;
    debugRect;
    image1;
    image0;
    iter = 0;
    tween;
    preload ()
    {
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/matter-platformer2.json');
        this.load.image('kenney_redux_64x64', 'assets/environment/kenney_redux_64x64.png');
        this.load.image('Terrain32x32', 'assets/environment/Terrain32x32.png');
        this.load.image('fantasy-tiles', 'assets/tilemaps/tiles/fantasy-tiles.png');
        this.load.image('wario-tiles', 'assets/tilemaps/tiles/wario-tiles.png');
        this.load.image('PR_TileSet', '/assets/tilemaps/tiles/Pyramid Ruins/PR_TileSet 16x16.png');
        this.load.image('1560', 'assets/tilemaps/tiles/1560.png');
        this.load.spritesheet('player', 'assets/sprites/dude-cropped.png', { frameWidth: 32, frameHeight: 42 });
        this.load.image('box', 'assets/sprites/box-item-boxed.png');
        this.load.image("background", "assets/bg_parallax/background.png");
        this.load.image("background2", "assets/bg_parallax/trees.png");
        this.load.image("background3", "assets/bg_parallax/foreground.png");
        this.load.image("background4", "assets/bg_parallax/fog.png");
        this.load.aseprite('paladin', 'assets/animations/aseprite/wario/wario_animations2.png', 'assets/animations/aseprite/aseprite/02_Char_Eadal_Paladin.json');

    }

    create ()
    {



        this.image0 = this.add.tileSprite(0, 0, 0, 0, 'background').setScale(2).setOrigin(0.1,0.1);
        this.image1 = this.add.tileSprite(0, 0, 0, 0, 'background3').setScale(2).setOrigin(0.1,0.1);
         this.image0.displayWidth = this.sys.game.config.width*2;
         this.image0.displayHeight = this.sys.game.config.height*2;
        this.image1.displayWidth = this.sys.game.config.width*2;
        this.image1.displayHeight = this.sys.game.config.height*2;
        // this.tween = this.tweens.addCounter({
        //     from: 1,
        //     to: 4,
        //     duration: 500,
        //     ease: 'Sine.easeInOut',
        //     yoyo: true,
        //     repeat: -1
        // });

        // this.backgroundLayer = this.add.group().setOrigin(0);
        // this.backgroundLayer.displayWidth = this.sys.game.config.width;
        // this.backgroundLayer.displayHeight = this.sys.game.config.height;
        // this.debugRect = this.add.rectangle(0, 0,
        //     this.sys.game.config.width,  this.sys.game.config.height, 0xff0000, 0.5);
        // this.debugRect.setOrigin(0);
        // this.backgroundLayer.add(this.debugRect);
        // Añadimos las imágenes de fondo directamente al grupo
        // this.backgroundLayer.create(200, 0, 'background').setOrigin(0);
        // this.backgroundLayer.create(400, 0, 'background2').setOrigin(0);
        // this.backgroundLayer.create(600, 0, 'background3').setOrigin(0);

        // this.background = this.add.image(0, 0, 'background').setOrigin(0);
        // this.background.displayWidth = this.sys.game.config.width;
        // this.background.displayHeight = this.sys.game.config.height;

        const map = this.make.tilemap({ key: 'map' });
        console.log('Ancho del mapa:', map.widthInPixels);
        console.log('Alto del mapa:', map.heightInPixels);
        console.log('Ancho del tile:', map.tileWidth);
        console.log('Alto del tile:', map.tileHeight);

        const layer2 = map.createLayer('Capa de patrones 2',  [
            map.addTilesetImage('Terrain32x32','Terrain32x32',64, 64),
            map.addTilesetImage('fantasy-tiles','fantasy-tiles',64, 64),
            map.addTilesetImage('1560','1560',32, 32),
            map.addTilesetImage('wario-tiles','wario-tiles',64, 64),
            map.addTilesetImage('PR_TileSet','PR_TileSet',32, 32),
        ]);
        const layer =map.createLayer('Tile Layer 1', [
            map.addTilesetImage('kenney_redux_64x64','kenney_redux_64x64',64, 64)]);
        layer.visible = false;

        // Set up the layer to have matter bodies. Any colliding tiles will be given a Matter body.
        map.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer);
        this.matter.world.convertTilemapLayer(layer2);

        this.matter.world.setBounds(map.widthInPixels, map.heightInPixels);
        this.matter.world.createDebugGraphic();
        this.matter.world.drawDebug = false;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.smoothedControls = new SmoothedHorionztalControl(0.0005);
        // Itera sobre cada tile en el layer
        // layer2.forEachTile(tile => {
        //     // Obtener la posición del tile en píxeles
        //     const tileWorldPos = layer2.tileToWorldXY(tile.x, tile.y);
        //
        //     // Crear un rectángulo para el borde del cuadro
        //
        //     // Crear texto con el ID del tile
        //     const text = this.add.text(tileWorldPos.x + 32, tileWorldPos.y + 32, tile.index.toString(), {
        //         fontSize: '12px',
        //         fill: '#ffffff'
        //     });
        //
        //     // Centrar el texto en el tile
        //     text.setOrigin(0.5);
        // }, this);
        // The player is a collection of bodies and sensors
        const tags = this.anims.createFromAseprite('paladin');

        const sprite = this.add.sprite(200, 200).play({ key: 'Magnum Break', repeat: -1 }).setScale(6);

        for (let i = 0; i < tags.length; i++)
        {
            const label = this.add.text(32, 32 + (i * 16), tags[i].key, { color: '#00ff00' });

            label.setInteractive();
        }

        this.input.on('gameobjectdown', (pointer, obj) =>
        {

            sprite.play({
                key: obj.text,
                repeat: -1
            });
            this.playerController.matterSprite.play({
                key: obj.text,
                repeat: -1,
                toggleFlipX:false,
                flipX:false,
                flipY:false
            });

        });

        this.input.on('gameobjectover', (pointer, obj) =>
        {

            obj.setColor('#ff00ff');

        });

        this.input.on('gameobjectout', (pointer, obj) =>
        {

            obj.setColor('#00ff00');

        });
        this.playerController = {
            matterSprite: this.matter.add.sprite(200, 200, 'paladin', 0).setScale(1.5),
            blocked: {
                left: false,
                right: false,
                bottom: false
            },
            numTouching: {
                left: 0,
                right: 0,
                bottom: 0
            },
            sensors: {
                bottom: null,
                left: null,
                right: null
            },
            time: {
                leftDown: 0,
                rightDown: 0
            },
            lastJumpedAt: 0,
            speed: {
                run: 7,
                jump: 10
            }
        };

        const M = Phaser.Physics.Matter.Matter;
        const w = this.playerController.matterSprite.width*1.5;
        const h = this.playerController.matterSprite.height*1.5;

        // The player's body is going to be a compound body:
        //  - playerBody is the solid body that will physically interact with the world. It has a
        //    chamfer (rounded edges) to avoid the problem of ghost vertices: http://www.iforce2d.net/b2dtut/ghost-vertices
        //  - Left/right/bottom sensors that will not interact physically but will allow us to check if
        //    the player is standing on solid ground or pushed up against a solid object.

        // Move the sensor to player center
        const sx = w / 2;
        const sy = h / 2;

        // The player's body is going to be a compound body.
        const playerBody = M.Bodies.rectangle(sx, sy, w * 0.75, h, { chamfer: { radius: 10 } });
        this.playerController.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, { isSensor: true });
        this.playerController.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy, 5, h * 0.25, { isSensor: true });
        this.playerController.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy, 5, h * 0.25, { isSensor: true });
        const compoundBody = M.Body.create({
            parts: [
                playerBody, this.playerController.sensors.bottom, this.playerController.sensors.left,
                this.playerController.sensors.right
            ],
            friction: 0.01,
            restitution: 0.05 // Prevent body from sticking against a wall
        });

        this.playerController.matterSprite.play({ key: 'delay', repeat: -1 })
            .setExistingBody(compoundBody)
            .setFixedRotation() // Sets max inertia to prevent rotation
            .setPosition(50 , 100);

        this.matter.add.image(630, 750, 'box');
        this.matter.add.image(630, 650, 'box');
        this.matter.add.image(630, 550, 'box');

        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.smoothMoveCameraTowards(this.playerController.matterSprite);

        // this.anims.create({
        //     key: 'left',
        //     frames: this.anims.generateFrameNumbers('paladin', { start: 0, end: 12 }),
        //     frameRate: 10,
        //     repeat: -1,
        // });
        // this.anims.create({
        //     key: 'right',
        //     frames: this.anims.generateFrameNumbers('paladin', { start: 5, end: 8 }),
        //     frameRate: 10,
        //     repeat: -1
        // });
        // this.anims.create({
        //     key: 'idle',
        //     frames: this.anims.generateFrameNumbers('paladin', { start: 4, end: 4 }),
        //     frameRate: 10,
        //     repeat: -1
        // });

        // Use matter events to detect whether the player is touching a surface to the left, right or
        // bottom.

        // Before matter's update, reset the player's count of what surfaces it is touching.
        this.matter.world.on('beforeupdate', function (event) {
            this.playerController.numTouching.left = 0;
            this.playerController.numTouching.right = 0;
            this.playerController.numTouching.bottom = 0;
        }, this);

        // Loop over the active colliding pairs and count the surfaces the player is touching.
        this.matter.world.on('collisionactive', function (event)
        {
            const playerBody = this.playerController.body;
            const left = this.playerController.sensors.left;
            const right = this.playerController.sensors.right;
            const bottom = this.playerController.sensors.bottom;

            for (let i = 0; i < event.pairs.length; i++)
            {
                const bodyA = event.pairs[i].bodyA;
                const bodyB = event.pairs[i].bodyB;

                if (bodyA === playerBody || bodyB === playerBody)
                {
                    continue;
                }
                else if (bodyA === bottom || bodyB === bottom)
                {
                    // Standing on any surface counts (e.g. jumping off of a non-static crate).
                    this.playerController.numTouching.bottom += 1;
                }
                else if ((bodyA === left && bodyB.isStatic) || (bodyB === left && bodyA.isStatic))
                {
                    // Only static objects count since we don't want to be blocked by an object that we
                    // can push around.
                    this.playerController.numTouching.left += 1;
                }
                else if ((bodyA === right && bodyB.isStatic) || (bodyB === right && bodyA.isStatic))
                {
                    this.playerController.numTouching.right += 1;
                }
            }
        }, this);

        // Update over, so now we can determine if any direction is blocked
        this.matter.world.on('afterupdate', function (event) {
            this.playerController.blocked.right = this.playerController.numTouching.right > 0 ? true : false;
            this.playerController.blocked.left = this.playerController.numTouching.left > 0 ? true : false;
            this.playerController.blocked.bottom = this.playerController.numTouching.bottom > 0 ? true : false;
        }, this);

        this.input.on('pointerdown', function () {
            this.matter.world.drawDebug = !this.matter.world.drawDebug;
            this.matter.world.debugGraphic.visible = this.matter.world.drawDebug;
        }, this);

        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            padding: { x: 20, y: 10 },
            backgroundColor: '#ffffff',
            fill: '#000000'
        });
        this.text.setScrollFactor(0);
        this.updateText();
        // console.log(this.backgroundLayer)
        // console.log(this.backgroundLayer.x)
    }

    update (time, delta)
    {
        // this.image0.tilePositionX = Math.cos(this.iter) * 700;
        // this.image0.tilePositionY = Math.sin(this.iter) * 500;
        //
        // this.image0.tileScaleX = this.tween.getValue();
        // this.image0.tileScaleY = this.tween.getValue();
        //
        // this.image1.tilePositionY = Math.sin(-this.iter) * 400;
        // this.image0.tilePositionX= this.cam.scrollX;

        this.image0.x= this.cam.scrollX;
        // this.image0.Y= this.cam.scrollY;
        this.image1.x= this.cam.scrollX;
        // this.image1.y= this.cam.scrollY;



        //  this.backgroundLayer.y = this.cam.scrollY;
        this.iter += 0.01;
        // Ajustamos la posición del fondo en relación con la cámara
       // this.background.x += 0.5 ;
       //  this.backgroundLayer.x = this.cam.scrollX;
       //  this.backgroundLayer.y = this.cam.scrollY;
       //  console.log(this.backgroundLayer.x)
       //
       //  this.backgroundLayer.children.iterate(child => {
       //      child.x = this.backgroundLayer.x;
       //  });
       //  this.backgroundLayer.children.iterate(child => {
       //      child.x += 0.6;
       //  });
        //
        // this.background.tilePositionX = this.cameras.main.scrollX * 0.3;
        // this.background.tilePositionY = this.cameras.main.scrollY * 0.3;
        const matterSprite = this.playerController.matterSprite;

        // Horizontal movement
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;

        if (this.cursors.left.isDown && !this.playerController.blocked.left)
        {
            this.smoothedControls.moveLeft(delta);
            matterSprite.anims.play('step', true);

            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = -this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);

            matterSprite.setVelocityX(newVelocityX);


            // this.image0.tilePositionX-=0.2 ;
            // this.image1.tilePositionX-=0.8 ;
        }
        else if (this.cursors.right.isDown && !this.playerController.blocked.right)
        {
            this.smoothedControls.moveRight(delta);
            matterSprite.anims.play('step', true);


            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);

            matterSprite.setVelocityX(newVelocityX);

            // this.image0.tilePositionX+=0.2 ;
            // this.image1.tilePositionX+=0.8 ;
        }
        else
        {
            matterSprite.anims.play('Delay', true);

            // this.smoothedControls.reset();
            // matterSprite.anims.play('idle', true);

        }

        // Jumping & wall jumping

        // Add a slight delay between jumps since the sensors will still collide for a few frames after
        // a jump is initiated
        const canJump = (time - this.playerController.lastJumpedAt) > 250;
        if (this.cursors.up.isDown & canJump)
        {
            if (this.playerController.blocked.bottom)
            {
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                this.playerController.lastJumpedAt = time;
            }
            else if (this.playerController.blocked.left)
            {
                // Jump up and away from the wall
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                matterSprite.setVelocityX(this.playerController.speed.run);
                this.playerController.lastJumpedAt = time;
            }
            else if (this.playerController.blocked.right)
            {
                // Jump up and away from the wall
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                matterSprite.setVelocityX(-this.playerController.speed.run);
                this.playerController.lastJumpedAt = time;
            }
        }

        this.smoothMoveCameraTowards(matterSprite, 0.9);
        this.updateText();
    }

    updateText ()
    {
        // this.text.setText([
        //     'Arrow keys to move. Press "Up" to jump.',
        //     'You can wall jump!',
        //     'Click to toggle rendering Matter debug.'
        //     // 'Debug:',
        //     // '\tBottom blocked: ' + this.playerController.blocked.bottom,
        //     // '\tLeft blocked: ' + this.playerController.blocked.left,
        //     // '\tRight blocked: ' + this.playerController.blocked.right
        // ]);
    }

    smoothMoveCameraTowards (target, smoothFactor)
    {
        if (smoothFactor === undefined) { smoothFactor = 0; }
        this.cam.scrollX = smoothFactor * this.cam.scrollX + (1 - smoothFactor) * (target.x - this.cam.width * 0.5);
        this.cam.scrollY = smoothFactor * this.cam.scrollY + (1 - smoothFactor) * (target.y - this.cam.height * 0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 512,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            enableSleep: false,
            debug: true
        }
    },
    scene: Example
};

const game = new Phaser.Game(config);
