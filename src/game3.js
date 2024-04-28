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

class Example extends Phaser.Scene {
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
    rocksGroup;
    layer;
    layer2;

    tilesCollisionInfo = {
        113: "ramp",
        114: "Azulejo especial 2",
        115: "Azulejo especial 3",
        13: "flat"
    };

    preload() {
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/matter-platformer2.json');
        this.load.image('kenney_redux_64x64', 'assets/environment/kenney_redux_64x64.png');
        this.load.image('Terrain32x32', 'assets/environment/Terrain32x32.png');
        this.load.image('fantasy-tiles', 'assets/tilemaps/tiles/fantasy-tiles.png');
        this.load.image('wario-tiles', 'assets/tilemaps/tiles/wario-tiles.png');
        this.load.image('1560', 'assets/tilemaps/tiles/1560.png');
        this.load.image('PR_TileSet', '/assets/tilemaps/tiles/Pyramid Ruins/PR_TileSet 16x16.png');
        this.load.spritesheet('player', 'assets/sprites/dude-cropped.png', {frameWidth: 32, frameHeight: 42});
        this.load.image('box', 'assets/sprites/box-item-boxed.png');
        this.load.image("background", "assets/bg_parallax/background.png");
        this.load.image("background2", "assets/bg_parallax/trees.png");
        this.load.image("background3", "assets/bg_parallax/foreground.png");
        this.load.image("background4", "assets/bg_parallax/fog.png");
        // this.load.aseprite('paladin', 'assets/animations/aseprite/aseprite/paladin.png', 'assets/animations/aseprite/aseprite/paladin.json');
        this.load.aseprite('paladin', 'assets/animations/aseprite/wario/wario_animations2.png', 'assets/animations/aseprite/aseprite/02_Char_Eadal_Paladin.json');
        this.load.spritesheet('rock1', 'assets/tilemaps/tiles/rock_1.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock2', 'assets/tilemaps/tiles/rock_2.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock3', 'assets/tilemaps/tiles/rock_3.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock_small_object', 'assets/tilemaps/tiles/wario/rock_small_object.png', {frameWidth: 32, frameHeight: 32});
    }
    createPlayer(x,y){
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
                run: 5,
                jump: 7
            }
        };
        const M = Phaser.Physics.Matter.Matter;
        const w = this.playerController.matterSprite.width * 1.5;
        const h = this.playerController.matterSprite.height * 1.5;
        // El cuerpo del jugador va a ser un cuerpo compuesto:
        // - playerBody es el cuerpo sólido que interactuará físicamente con el mundo. Tiene un
        // chaflán (bordes redondeados) para evitar el problema de los vértices fantasma: http://www.iforce2d.net/b2dtut/ghost-vertices
        // - Sensores izquierdo/derecho/inferior que no interactuarán físicamente pero nos permitirán comprobar si
        // el jugador está parado sobre suelo sólido o empujado contra un objeto sólido.
        // Move the sensor to player center
        let sx = w / 2;
        let sy = h / 2;
        // The player's body is going to be a compound body.
        let playerBody = M.Bodies.rectangle(sx, sy, w * 0.75, h, {chamfer: {radius: 10}});
        this.playerController.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
        this.playerController.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy, 5, h * 0.25, {isSensor: true});
        this.playerController.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy, 5, h * 0.25, {isSensor: true});
        let compoundBody = M.Body.create({
            parts: [
                playerBody, this.playerController.sensors.bottom, this.playerController.sensors.left,
                this.playerController.sensors.right
            ],
            friction: 0.5,
            restitution: 0.05 // Prevent body from sticking against a wall
        });
        this.playerController.matterSprite.play({key: 'delay', repeat: -1})
            .setExistingBody(compoundBody)
            .setFixedRotation() // Sets max inertia to prevent rotation
            .setPosition(x,y);
    }
    create() {
        this.rocksGroup=[];
        this.createTileMap()
        // this.decorWorld()
        this.createPlayer(200, 200);
        // this.createRocks();
        // this.populate();
        // this.decorWorldFront();
        // this.createCarrots();
        // this.camFollow();
        // this.bindKeys();
        // this.createStars();
        // this.startMusic();
        // this.addAudios();
        // this.createHud();

        this.smoothMoveCameraTowards(this.playerController.matterSprite);

        // Use matter events to detect whether the player is touching a surface to the left, right or
        // bottom.
        // Before matter's update, reset the player's count of what surfaces it is touching.
        this.matter.world.on('beforeupdate', function (event) {
            this.playerController.numTouching.left = 0;
            this.playerController.numTouching.right = 0;
            this.playerController.numTouching.bottom = 0;
        }, this);
        // Loop over the active colliding pairs and count the surfaces the player is touching.
       //collisionactive
        this.matter.world.on('collisionactive', function (event) {
            const playerBody = this.playerController.matterSprite.body;
            for (let i = 0; i < event.pairs.length; i++) {
                const bodyA = event.pairs[i].bodyA;
                const bodyB = event.pairs[i].bodyB;

                    const playerBody = this.playerController.matterSprite.body;
                    const left = this.playerController.sensors.left;
                    const right = this.playerController.sensors.right;
                    const bottom = this.playerController.sensors.bottom;

                if (bodyA.gameObject.tile instanceof Phaser.Tilemaps.Tile &&
                    this.tilesCollisionInfo.hasOwnProperty(bodyA.gameObject.tile.index)) {
                    const tileDescription = this.tilesCollisionInfo[bodyA.gameObject.tile.index];
                    console.log('colisionandsssssso con:', tileDescription);
                }
                if (bodyB.gameObject.tile instanceof Phaser.Tilemaps.Tile &&
                    this.tilesCollisionInfo.hasOwnProperty(bodyB.gameObject.tile.index)) {
                    const tileDescription = this.tilesCollisionInfo[bodyB.gameObject.tile.index];
                    console.log('colisionandosssssssss conss:', tileDescription);
                }

                if (bodyA === playerBody || bodyB === playerBody)
                {
                    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeee')
                    continue;
                }else if (bodyA === bottom || bodyB === bottom) {
                    // Standing on any surface counts (e.g. jumping off of a non-static crate).
                    this.playerController.numTouching.bottom += 1;
                // } else if ((bodyA === left && bodyB.isStatic) || (bodyB === left && bodyA.isStatic)) {
                }
                else if ((bodyA === left ) || (bodyB === left )) {
                    console.log('objetoEncontrado')
                    // Only static objects count since we don't want to be blocked by an object that we
                    // can push around.
                    this.playerController.numTouching.left += 1;
                    const rock = this.rocksGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
                    if (rock) {
                        this.breakRock(rock);
                        // Se encontró una roca en la colisión, eliminarla del grupo

                    }
                }
                else if ((bodyA === right ) || (bodyB === right )) {
                    console.log('objetoEncontrado',bodyB.isStatic)
                    this.playerController.numTouching.right += 1;

                    // Verificar si uno de los cuerpos colisionando pertenece al grupo de rocas
                    const rock = this.rocksGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
                    if (rock) {
                        this.breakRock(rock);
                    }
                }


            }
        }, this);

        // Update over, so now we can determine if any direction is blocked
        this.matter.world.on('afterupdate', function (event) {
            this.playerController.blocked.right = this.playerController.numTouching.right > 0 ? true : false;
            this.playerController.blocked.left = this.playerController.numTouching.left > 0 ? true : false;
            this.playerController.blocked.bottom = this.playerController.numTouching.bottom > 0 ? true : false;
        }, this);


        this.updateText();
        this.createRocks();
        this.enableDebug();
        // Configurar colisiones
        this.setCollisions();
    }

    exitZone(obj) {
        console.log('eeeeeeeeeee');
        
        if (obj.kind == "player") {
            console.log('eeeeeeeeeee');
            // this.music.stop();
            // this.game.state.start("GameOver");

        }
    }

    update (time, delta)
    {
        this.image0.x= this.cam.scrollX;
        this.image1.x= this.cam.scrollX;
        // Ajustamos la posición del fondo en relación con la cámara
        // this.background.tilePositionX = this.cameras.main.scrollX * 0.3;
        // this.background.tilePositionY = this.cameras.main.scrollY * 0.3;
        const matterSprite = this.playerController.matterSprite;

        // Horizontal movement
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;

        // if (this.cursors.left.isDown && !this.playerController.blocked.left)
        if (this.cursors.left.isDown && !this.playerController.blocked.left)
        {
            this.smoothedControls.moveLeft(delta);
            this.playerController.matterSprite.anims.play('step', true);
            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = -this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);

            matterSprite.setVelocityX(newVelocityX);
            // console.log(matterSprite)
            this.playerController.matterSprite.setFlipX(true);

            this.image0.tilePositionX-=0.5 ;
            this.image1.tilePositionX-=2 ;
        }
        // else if (this.cursors.right.isDown && !this.playerController.blocked.right)
        else if (this.cursors.right.isDown && !this.playerController.blocked.right)
        {
            this.smoothedControls.moveRight(delta);
            this.playerController.matterSprite.anims.play('step', true);

            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);

            matterSprite.setVelocityX(newVelocityX);
            this.playerController.matterSprite.setFlipX(false);
            this.image0.tilePositionX+=0.5 ;
            this.image1.tilePositionX+=2 ;
        }
        else if (this.cursors.down.isDown ) {
            if (this.cursors.down.isDown && !this.scalingDone) {

            const Matter = Phaser.Physics.Matter.Matter;

            // Modificar el alto del sprite
                // Modificar el alto del sprite
                // Modificar el alto del sprite
                const newHeight = this.playerController.matterSprite.height * 0.5; // Reducir el alto al 75%

                // Escalar el cuerpo físico
                const currentBody = this.playerController.matterSprite.body;
                const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
                const newBodyHeight = newHeight * 1.5;
                Matter.Body.scale(currentBody, 1, newBodyHeight / currentHeight);

                // Actualizar la posición visual del sprite
                const newPositionY = this.playerController.matterSprite.y - (newHeight - this.playerController.matterSprite.height) / 2;
                this.playerController.matterSprite.y = newPositionY;

                // Actualizar el tamaño del sprite
                this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);

                // Marcar que la acción de escalar se ha realizado
                this.scalingDone = true;

                this.playerController.matterSprite.anims.play('morte', true);
                // Lerp the velocity towards the max run using the smoothed controls. This simulates a
                // player controlled acceleration.
                oldVelocityX = matterSprite.body.velocity.x;
                targetVelocityX = this.playerController.speed.run;
                newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
                matterSprite.setVelocityX(newVelocityX);
        }
        }
        else
        {
            // matterSprite.anims.play('SHit', true);

            this.smoothedControls.reset();
            // matterSprite.anims.play('idle', true);

        }
        if (this.cursors.down.isUp && this.scalingDone) {
            const Matter = Phaser.Physics.Matter.Matter;

            // Modificar el alto del sprite
            // Modificar el alto del sprite
            const newHeight = this.playerController.matterSprite.height * 1; // Reducir el alto al 75%

            // Modificar el alto del cuerpo físico
            const currentBody = this.playerController.matterSprite.body;
            const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
            const newBodyHeight = newHeight * 1.5;

            // Calcular la nueva posición Y del cuerpo físico
            const newPositionY = currentBody.position.y + (currentHeight - newBodyHeight) / 2;

            // Escalar el cuerpo físico
            Matter.Body.scale(currentBody, 1, newBodyHeight / currentHeight);

            // Actualizar la posición Y del cuerpo físico
            Matter.Body.setPosition(currentBody, { x: currentBody.position.x+1, y: newPositionY });

            // Actualizar el tamaño del sprite
            this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);

            // Marcar que la acción de escalar se ha realizado
            // this.scalingDone = true;
            this.scalingDone = false;
        }
        // Jumping & wall jumping

        // Add a slight delay between jumps since the sensors will still collide for a few frames after
        // a jump is initiated
        const canJump = (time - this.playerController.lastJumpedAt) > 250;
        if (this.cursors.up.isDown && canJump)
        {

            if (this.playerController.blocked.bottom)
            {
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                this.playerController.lastJumpedAt = time;
                matterSprite.anims.play('Delay', true);

            }
            else if (this.playerController.blocked.left)
            {
                // Jump up and away from the wall
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                matterSprite.setVelocityX(this.playerController.speed.run);
                this.playerController.lastJumpedAt = time;
                matterSprite.anims.play('Delay', true);

            }
            else if (this.playerController.blocked.right)
            {

                // Jump up and away from the wall
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                matterSprite.setVelocityX(-this.playerController.speed.run);
                this.playerController.lastJumpedAt = time;
                matterSprite.anims.play('Delay', true);

            }
        }

        this.smoothMoveCameraTowards(matterSprite, 0.9);
        this.updateText();
    }

    createTileMap(){
        this.image0 = this.add.tileSprite(0, 0, 0, 0, 'background').setScale(2).setOrigin(0.1, 0.1);
        this.image1 = this.add.tileSprite(0, 0, 0, 0, 'background3').setScale(2).setOrigin(0.1, 0.1);
        this.image0.displayWidth = this.sys.game.config.width * 2;
        this.image0.displayHeight = this.sys.game.config.height * 2;
        this.image1.displayWidth = this.sys.game.config.width * 2;
        this.image1.displayHeight = this.sys.game.config.height * 2;

        // const map = this.make.tilemap({key: 'map'});
        const map = this.add.tilemap("map");

        const layer3 = map.createLayer('Tile Layer 2', [

                map.addTilesetImage('wario-tiles', 'wario-tiles', 32, 32),

            ],
        );
        const layer4 = map.createLayer('Tile Layer 3', [
                map.addTilesetImage('wario-tiles', 'wario-tiles', 32, 32),

            ],
        );
        const layer2 = map.createLayer('Capa de patrones 2', [
            map.addTilesetImage('kenney_redux_64x64', 'kenney_redux_64x64', 64, 64),
            map.addTilesetImage('Terrain32x32', 'Terrain32x32', 32, 32),
            map.addTilesetImage('Terrain32x32', 'Terrain32x32', 32, 32),
            map.addTilesetImage('fantasy-tiles', 'fantasy-tiles', 32, 32),
            map.addTilesetImage('1560', '1560', 32, 32),
            map.addTilesetImage('wario-tiles', 'wario-tiles', 32, 32),
            map.addTilesetImage('PR_TileSet', 'PR_TileSet', 32, 32),
        ]);

        this.layer = map.createLayer('Tile Layer 1', [
            map.addTilesetImage('kenney_redux_64x64', 'kenney_redux_64x64', 32, 32),
            map.addTilesetImage('PR_TileSet', 'PR_TileSet', 32, 32),],
        );
        this.layer.visible = false;
        this.layer2 = map.createLayer('Tile Layer 1', [],
        );

        // Set up the layer to have matter bodies. Any colliding tiles will be given a Matter body.
        map.setCollisionByProperty({collides: true});
        this.matter.world.convertTilemapLayer(this.layer);
        this.matter.world.convertTilemapLayer(layer4);
        this.matter.world.convertTilemapLayer(layer2);
        this.matter.world.convertTilemapLayer(layer3);
        this.matter.world.setBounds(map.widthInPixels, map.heightInPixels);
        this.matter.world.createDebugGraphic();
        this.matter.world.drawDebug = false;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.smoothedControls = new SmoothedHorionztalControl(0.0005);
        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
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

    enableDebug(){
        //for debug
        // Crear un contenedor para el texto y el borde
        const uiContainer = this.add.container(0, 0);
        // Crear el texto y agregarlo al contenedor
        // const text = this.add.text(100, 100, "Texto fijo", { fontSize: '24px', fill: '#FFF' });
        // uiContainer.add(text);
        // Obtener las dimensiones de la pantalla
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        // Crear un rectángulo que cubra el borde de la pantalla
        const borderRect = this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight);
        borderRect.setStrokeStyle(2, 0xff0000); // Establecer el grosor del borde y el color
        // Alinear el contenedor y el rectángulo al mundo del juego
        uiContainer.setScrollFactor(0);
        borderRect.setScrollFactor(0);
        // Agregar el contenedor y el rectángulo a la escena
        this.add.existing(uiContainer);
        this.add.existing(borderRect);

        this.layer.forEachTile(tile => {
            const tileWorldPos = this.layer.tileToWorldXY(tile.x, tile.y);
            const text = this.add.text(tileWorldPos.x + 16, tileWorldPos.y + 16, tile.index.toString(), {
                fontSize: '10px',
                fill: '#000'
            });
            text.setOrigin(0.5);
        }, this);
        this.input.on('pointerdown', function () {
            this.matter.world.drawDebug = !this.matter.world.drawDebug;
            this.matter.world.debugGraphic.visible = this.matter.world.drawDebug;
        }, this);

        const tags = this.anims.createFromAseprite('paladin');
        for (let i = 0; i < tags.length; i++) {
            const label = this.add.text(32, 32 + (i * 16), tags[i].key, { color: '#00ff00' });
            uiContainer.add(label);
            label.setInteractive();
            label.setScrollFactor(0); // Asegúrate de que el texto no se mueva con la cámara
        }

        this.input.on('gameobjectdown', (pointer, obj) => {
            this.playerController.matterSprite.play({
                key: obj.text,
                repeat: -1,
                toggleFlipX: false,
                flipX: false,
                flipY: false
            });

        });
        this.input.on('gameobjectover', (pointer, obj) => {obj.setColor('#ff00ff');});
        this.input.on('gameobjectout', (pointer, obj) => {obj.setColor('#00ff00');});
    }
    // Función para crear rocas
    // createRocks() {
    //     const M = Phaser.Physics.Matter.Matter;
    //     for (let i = 0; i < 1; i++) {
    //         const idDeseado = 9;
    //         // Recorre todas las celdas del layer para buscar el ID deseado
    //         this.layer.forEachTile(tile => {
    //             // Verifica si el ID de la celda coincide con el ID deseado
    //             if (tile.index === idDeseado) {
    //                 let item = {
    //                     matterSprite: this.matter.add.sprite(100 * i, 200, 'rock_small_object', 0).setBounce(0).setFriction(0, 0, 0).setCollisionGroup(this.matter.world.nextGroup()).setVelocityY(2),
    //                     // matterSprite: this.matter.add.sprite(200, 200, 'paladin', 0).setScale(1.5),
    //                     blocked: {
    //                         left: false,
    //                         right: false,
    //                         bottom: false
    //                     },
    //                     numTouching: {
    //                         left: 0,
    //                         right: 0,
    //                         bottom: 0
    //                     },
    //                     sensors: {
    //                         bottom: null,
    //                         left: null,
    //                         right: null
    //                     },
    //                     time: {
    //                         leftDown: 0,
    //                         rightDown: 0
    //                     },
    //                     lastJumpedAt: 0,
    //                     speed: {
    //                         run: 10,
    //                         jump: 17
    //                     }
    //                 };
    //                 const w = item.matterSprite.width ;
    //                 const h = item.matterSprite.height;
    //                 let sx = w / 2;
    //                 let sy = h / 2;
    //                 let playerBody = M.Bodies.rectangle(sx, sy, w * 0.75, h, {chamfer: {radius: 10}});
    //                 item.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
    //                 item.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy, 5, h * 0.25, {isSensor: true});
    //                 item.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy, 5, h * 0.25, {isSensor: true});
    //                 let compoundBody = M.Body.create({
    //                     parts: [
    //                         playerBody, item.sensors.bottom, item.sensors.left,
    //                         item.sensors.right
    //                     ],
    //                 });
    //                 item.matterSprite
    //                     .setExistingBody(compoundBody)
    //                     .setFixedRotation() // Sets max inertia to prevent rotation
    //                     .setPosition(200,200);
    //                 // La celda tiene el ID deseado, por lo que agregamos una roca en su posición
    //                 const x = tile.getCenterX(); // Obtén la coordenada X del centro de la celda
    //                 const y = tile.getCenterY(); // Obtén la coordenada Y del centro de la celda
    //                 item.matterSprite
    //                     .setExistingBody(compoundBody)
    //                     .setFixedRotation() // Sets max inertia to prevent rotation
    //                     .setPosition(x
    //                         ,y);
    //                 this.rocksGroup.push(item)
    //             }
    //         });
    //     }
    // }

    createRocks() {
        const M = Phaser.Physics.Matter.Matter;
        const idDeseado = 9;
        this.layer.forEachTile(tile => {
            if (tile.index === idDeseado) {
                const item = this.createRockSprite(tile.getCenterX(), tile.getCenterY());
                this.rocksGroup.push(item);
            }
        });
    }

    createRockSprite(x, y) {
        const M = Phaser.Physics.Matter.Matter;

        const w = 32; // Ancho deseado para la roca
        const h = 32; // Alto deseado para la roca
        const playerBody = M.Bodies.rectangle(w / 2, h / 2, w * 0.75, h, { chamfer: { radius: 10 } });
        const sensors = {
            bottom: M.Bodies.rectangle(w / 2, h, w / 2, 5, { isSensor: true }),
            left: M.Bodies.rectangle(w / 2 - w * 0.45, h / 2, 5, h * 0.25, { isSensor: true }),
            right: M.Bodies.rectangle(w / 2 + w * 0.45, h / 2, 5, h * 0.25, { isSensor: true })
        };
        const compoundBody = M.Body.create({
            parts: [playerBody, sensors.bottom, sensors.left, sensors.right]
        });
        const matterSprite = this.matter.add.sprite(x, y, 'rock_small_object', 0).setBounce(0).setFriction(0, 0, 0).setCollisionGroup(this.matter.world.nextGroup()).setVelocityY(2);
        matterSprite
            .setExistingBody(compoundBody)
            .setFixedRotation()
            .setPosition(x, y);
        return {
            matterSprite: matterSprite,
            blocked: { left: false, right: false, bottom: false },
            numTouching: { left: 0, right: 0, bottom: 0 },
            sensors: sensors,
            time: { leftDown: 0, rightDown: 0 },
            lastJumpedAt: 0,
            speed: { run: 10, jump: 17 }
        };
    }

    // Configurar colisiones
    setCollisions() {
    }

    // Función para romper la roca
    breakRock(rock) {
        const index = this.rocksGroup.indexOf(rock);
        if (index !== -1) {
            this.addParticleEffect(rock.matterSprite.x, rock.matterSprite.y);
            this.rocksGroup.splice(index, 1);
            rock.matterSprite.body.gameObject.destroy();
        }
    }

    addParticleEffect(x, y) {
        // Crear un emisor de partículas en la posición de la roca destruida

        // this.explode = this.add.particles(0, 0, 'rock1', {
        //     // angle: { start: 0, end: 360, steps: 32 },
        //     // lifespan: 1500,
        //     speed: 400,
        //     quantity: 32,
        //     // scale: { start: 0.5, end: 0 },
        //     emitting: false,
        //     gravityY:300
        // });
        // this.explode.emitParticleAt(x,y);
        //
        const explode = this.add.particles(0, 0, "rock1", {
            speed: { min: 0, max: 250 },
            quantity: 8,
            scale: { start:1.5, end: 0 },
            rotate: { start: 0, end: 0 },
            gravityY: 400,
            emitting: false,
            lifespan:500,

        });
        explode.emitParticleAt(x,y);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 576,
    height:320,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 1
            },            enableSleep: false,
            debug: true
        }
    },
    scene: Example
};

const game = new Phaser.Game(config);

