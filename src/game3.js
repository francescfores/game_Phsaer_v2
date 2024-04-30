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
    time;
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
    enemiesGroup;
    layer;
    layer2;

    //moves
    run;
    jump;
    look;
    punch;
    punch2;
    ground_pound;
    ground_pound2;
    dash;
    defeat;
    crouch;
    MAX_SPEED=2;
    NORMAL_SPEED=1;
    MIN_SPEED=1;

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
        // this.load.aseprite('paladin', 'assets/animations/aseprite/wario/wario_animations3.png', 'assets/animations/aseprite/wario/wario_animations3.json');

        this.load.aseprite('enemi_1', 'assets/animations/aseprite/wario/enemi_1.png', 'assets/animations/aseprite/wario/enemi_1.json');
        this.load.spritesheet('rock1', 'assets/tilemaps/tiles/rock_1.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock2', 'assets/tilemaps/tiles/rock_2.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock3', 'assets/tilemaps/tiles/rock_3.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock_small_object', 'assets/tilemaps/tiles/wario/rock_small_object.png', {frameWidth: 32, frameHeight: 32});
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
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // Tecla "S"
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); // Tecla "S"

        this.smoothedControls = new SmoothedHorionztalControl(0.0005);
        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }
    parallaxBg(direction){

        this.image0.tilePositionX=this.image0.tilePositionX + 1.2 * direction;
        this.image1.tilePositionX=this.image0.tilePositionX + 0.8 * direction;
    }
    parallaxBgReset(){
        this.image0.x= this.cam.scrollX;
        this.image1.x= this.cam.scrollX;
    }


    create() {
        this.rocksGroup=[];
        this.enemiesGroup=[];
        this.createTileMap()
        // this.decorWorld()
        this.createPlayer(200, 0);
        this.populate();

        this.matterEventsPlayer();
        this.matterEventsEnemies();
        this.enableDebug();
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
        // Configurar colisiones
        // this.setCollisions();
        // this.updateText();
    }
    update (time, delta)
    {


        // Ajustamos la posición del fondo en relación con la cámara
        this.parallaxBgReset();
        this.movePlayer(time, delta);
        this.moveEnemies(time, delta);
        const matterSprite = this.playerController.matterSprite;
        // Horizontal movement
        this.smoothMoveCameraTowards(matterSprite, 0.9);


    }
    movePlayer(time, delta){
        const M = Phaser.Physics.Matter.Matter;

        const matterSprite = this.playerController.matterSprite;
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;



        if(this.cursors.left.isDown &&
            !this.playerController.blocked.left &&
            !this.cursors.down.isDown &&
            this.playerController.blocked.bottom &&
            !this.keyS.isDown
        ) {
            this.playerController.matterSprite.anims.play('run', true);

        }else  if(this.cursors.right.isDown &&
            !this.playerController.blocked.right &&
            !this.cursors.down.isDown &&
            this.playerController.blocked.bottom &&
            !this.keyS.isDown
        ) {
            this.playerController.matterSprite.anims.play('run', true);

        }
        if(this.cursors.left.isDown &&
            !this.playerController.blocked.left &&
            !this.cursors.down.isDown
        ) {
            // this.playerController.matterSprite.anims.play('step', true);
            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = -this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);
            if (newVelocityX > this.MAX_SPEED) {
                newVelocityX = this.MAX_SPEED;
                // matterSprite.body.velocity.x *= ratio;
                // matterSprite.body.velocity.y *= ratio;
            }
            //realisitic vel
            // matterSprite.setVelocityX(newVelocityX);
            matterSprite.setVelocityX(-this.MAX_SPEED);
            this.playerController.matterSprite.setFlipX(true);
            this.parallaxBg(-1);
            this.smoothedControls.moveLeft(delta);

        }
        else if (this.cursors.right.isDown &&
            !this.playerController.blocked.right  &&
            !this.cursors.down.isDown
        ){
            // this.playerController.matterSprite.anims.play('step', true);
            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
            if (newVelocityX > this.MAX_SPEED) {
                newVelocityX = this.MAX_SPEED ;
                // matterSprite.body.velocity.x *= ratio;
                // matterSprite.body.velocity.y *= ratio;
            }
            //realisitic vel
            // matterSprite.setVelocityX(newVelocityX);
            matterSprite.setVelocityX(this.MAX_SPEED);
            this.playerController.matterSprite.setFlipX(false);
            this.parallaxBg(1);
            this.smoothedControls.moveRight(delta);

        }
        else if (this.cursors.down.isDown )
        {
            if (this.cursors.down.isDown && !this.scalingDone) {
                const newHeight = this.playerController.matterSprite.height * 0.5; // Reducir el alto al 75%
                const currentBody = this.playerController.matterSprite.body;
                const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
                const newBodyHeight = newHeight * 1.5;
                M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);

                // Actualizar la posición visual del sprite
                const newPositionY = this.playerController.matterSprite.y - (newHeight - this.playerController.matterSprite.height) / 2;
                this.playerController.matterSprite.y = newPositionY;

                // Actualizar el tamaño del sprite
                this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);

                // Marcar que la acción de escalar se ha realizado
                this.scalingDone = true;

                // this.playerController.matterSprite.anims.play('morte', true);
                // Lerp the velocity towards the max run using the smoothed controls. This simulates a
                // player controlled acceleration.
                oldVelocityX = matterSprite.body.velocity.x;
                targetVelocityX = this.playerController.speed.run;
                newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
                matterSprite.setVelocityX(newVelocityX);
                this.playerController.matterSprite.anims.play('crouch', true);
            }
        }
        else if(
            this.playerController.blocked.bottom &&
            !this.cursors.up.isDown
        ){
            this.smoothedControls.reset();

            // this.playerController.matterSprite.anims.play('look', true);
        }
        if (this.keyS.isDown){
            this.playerController.matterSprite.anims.play('dash', true);
        }
        if (this.cursors.down.isUp && this.scalingDone) {
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
            M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);
            // Actualizar la posición Y del cuerpo físico
            M.Body.setPosition(currentBody, { x: currentBody.position.x+1, y: newPositionY });
            // Actualizar el tamaño del sprite
            this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);
            // Marcar que la acción de escalar se ha realizado
            this.scalingDone = false;
            // this.playerController.matterSprite.anims.play('SHit', true);

        }

        const canJump = (time - this.playerController.lastJumpedAt) > 450;

        if(this.cursors.up.isDown && !this.cursors.down.isDown){
            if (this.playerController.blocked.bottom)
            {
                this.playerController.matterSprite.anims.play('jump', true);

            }
            else if (this.playerController.blocked.left)
            {
                this.playerController.matterSprite.anims.play('jump', true);
                this.playerController.matterSprite.setFlipX(false);

            }
            else if (this.playerController.blocked.right)
            {
                this.playerController.matterSprite.anims.play('jump', true);
                this.playerController.matterSprite.setFlipX(true);
            }
        }
        if (this.cursors.up.isDown && canJump)
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
    }

    // Método para manejar el ataque del enemigo
    enemyAttack(enemy, player) {
        // Reproducir la animación de ataque del enemigo
        // enemy.playAttackAnimation();
        //
        // Reducir la salud del jugador (esto es solo un ejemplo, puedes tener tu propia lógica aquí)
        // player.reduceHealth(enemy.attackDamage);
    }

    moveEnemies(time, delta){
        this.enemiesGroup.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.playerController.matterSprite.x,
                0,
                enemy.matterSprite.x, 0);

            const visionRange = 100; // Definir el rango de visión deseado

            const inVisionRange = distance < visionRange;
            //
            // if (enemy.visionRectangle) {
            //     // Actualizar la visibilidad y posición del rectángulo de visión
            //     enemy.visionRectangle.setVisible(inVisionRange);
            //     enemy.visionRectangle.setPosition(enemy.matterSprite.x, enemy.matterSprite.y);
            //     if (distance < visionRange) {
            //         // El jugador está dentro del rango de ataque
            //         if (!enemy.isAttacking) {
            //             // El enemigo no está actualmente atacando, así que comienza la animación de ataque
            //             // enemy.isAttacking = true;
            //             enemy.matterSprite.anims.play('dash_enemi', true);
            //
            //             // Establece un temporizador para detener la animación de ataque después de cierto tiempo
            //             this.time.delayedCall(1000, () => {
            //                 // Detener la animación de ataque y cambiar a la animación de caminar
            //                 // enemy.isAttacking = false;
            //                 enemy.matterSprite.anims.play('run_enemi', true);
            //             }, [], this);
            //         }
            //     } else {
            //         // El jugador está fuera del rango de ataque, así que el enemigo debería caminar
            //         enemy.matterSprite.anims.play('run_enemi', true);
            //     }
            // } else {
            //     // Crear el rectángulo de visión si aún no existe
            //     enemy.visionRectangle = this.add.rectangle(
            //         enemy.matterSprite.x,
            //         enemy.matterSprite.y,
            //         visionRange*2,
            //         visionRange*2, // Reducir la altura a la mitad para representar el área de visión
            //         0x00ff00, // Color verde para el área de visión
            //         0.5 // Opacidad del rectángulo
            //     );
            //     enemy.visionRectangle.setStrokeStyle(2, 0x00ff00); // Color del borde verde
            //     enemy.visionRectangle.setOrigin(0.5); // Establecer el punto de origen en el centro
            // }
            // const attackRange1 =120; // Definir el rango de ataque deseado
            //
            // const showAttackRangeRectangle = distance < attackRange1;
            // if (enemy.attackRangeRectangle) {
            //     enemy.attackRangeRectangle.setVisible(showAttackRangeRectangle);
            //     enemy.attackRangeRectangle.setPosition(enemy.matterSprite.x, enemy.matterSprite.y);
            //         enemy.attackRangeRectangle.setSize(attackRange1 , attackRange1/2, true);
            //
            // } else {
            //     enemy.attackRangeRectangle = this.add.rectangle(
            //         enemy.matterSprite.x,
            //         enemy.matterSprite.y,
            //         attackRange1 , attackRange1/2, 0xff0000, 0.5);
            //     enemy.attackRangeRectangle.setStrokeStyle(2, 0xff0000);
            //     enemy.attackRangeRectangle.setOrigin(0.5);
            // }
            // const showAttackRangeRectangle = distance < attackRange;
            // if (enemy.attackRangeRectangle) {
            //     enemy.attackRangeRectangle.setVisible(showAttackRangeRectangle);
            //     enemy.attackRangeRectangle.setPosition(enemy.matterSprite.x, enemy.matterSprite.y);
            //     // Ajustar el tamaño del rectángulo de ataque
            //     enemy.attackRangeRectangle.setSize(attackRange * 2, attackRange, true);
            // } else {
            //     enemy.attackRangeRectangle = this.add.rectangle(enemy.matterSprite.x, enemy.matterSprite.y, attackRange * 2, attackRange, 0xff0000, 0.5);
            //     enemy.attackRangeRectangle.setStrokeStyle(2, 0xff0000);
            //     enemy.attackRangeRectangle.setOrigin(0.5);
            // }
            // const inAttackRange = Phaser.Geom.Rectangle.ContainsPoint(enemy.attackRangeRectangle.getBounds(),
            //     this.playerController.matterSprite.x, this.playerController.matterSprite.x);
            //
            // // Cambiar la animación del enemigo dependiendo de si el jugador está dentro del rectángulo de ataque
            // if (inAttackRange) {
            //     // Si el jugador está dentro del rectángulo de ataque, reproducir la animación de ataque
            //         if (!enemy.isAttacking) {
            //             // El enemigo no está actualmente atacando, así que comienza la animación de ataque
            //             enemy.isAttacking = true;
            //             enemy.matterSprite.anims.play('dash_enemi', true);
            //
            //             // Establece un temporizador para detener la animación de ataque después de cierto tiempo
            //             this.time.delayedCall(700, () => {
            //                 // Detener la animación de ataque y cambiar a la animación de caminar
            //                 enemy.isAttacking = false;
            //                 enemy.matterSprite.anims.play('run_enemi', true);
            //             }, [], this);
            //         }
            // } else {
            //     // Si el jugador no está dentro del rectángulo de ataque, reproducir la animación de caminar
            //     enemy.matterSprite.anims.play('dash_enemi', true);
            // }

            if (enemy.blocked.left) {
                // Si está bloqueado en el lado izquierdo, cambia la dirección a la derecha
                enemy.direction.x = 1;
            } else if (enemy.blocked.right) {
                // Si está bloqueado en el lado derecho, cambia la dirección a la izquierda
                enemy.direction.x = -1;
            }

            if (enemy.blocked.attack) {
                // Reproducir la animación de ataque si está en modo de ataque
                enemy.matterSprite.anims.play('dash_enemi', true);
            } else {
                // Reproducir la animación de carrera y ajustar la velocidad y orientación del sprite
                enemy.matterSprite.anims.play('run_enemi', true);

                const velocityX = this.NORMAL_SPEED * enemy.direction.x;
                enemy.matterSprite.setVelocityX(velocityX);

                // Voltear el sprite horizontalmente según la dirección
                if (enemy.direction.x === 1) {
                    enemy.matterSprite.setFlipX(false); // No voltear
                } else {
                    enemy.matterSprite.setFlipX(true); // Voltear horizontalmente
                }
            }

            // if(enemy.blocked.attack){
            //     // this.time.delayedCall(100, () => {
            //     //     // Detener la animación de ataque y cambiar a la animación de caminar
            //     //     enemy.isAttacking = false;
            //     // }, [], this);
            //     const velocityX =2* (enemy.direction.y);
            //     enemy.matterSprite.setVelocityY(this.NORMAL_SPEED);
            // }

        });
    }
    createPlayer(x,y){
        // this.matter.add.sprite(200, 200, 'enemi_1', 0).setScale(1.5)
        this.playerController = {
            matterSprite: this.matter.add.sprite(200, 200, 'paladin', 0)
                .setBounce(0)
                .setFriction(0, 0, 0)
                .setCollisionGroup(this.matter.world.nextGroup())
                .setVelocityY(2)
                .setScale(1.5)
            // .setDisplaySize(45, 45)
            ,
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
                jump: 8
            }
        };

        const M = Phaser.Physics.Matter.Matter;
        const w = this.playerController.matterSprite.width *1.5;
        const h = this.playerController.matterSprite.height *1.5;
        // El cuerpo del jugador va a ser un cuerpo compuesto:
        // - playerBody es el cuerpo sólido que interactuará físicamente con el mundo. Tiene un
        // chaflán (bordes redondeados) para evitar el problema de los vértices fantasma: http://www.iforce2d.net/b2dtut/ghost-vertices
        // - Sensores izquierdo/derecho/inferior que no interactuarán físicamente pero nos permitirán comprobar si
        // el jugador está parado sobre suelo sólido o empujado contra un objeto sólido.
        // Move the sensor to player center
        let sx = w / 2;
        let sy = h / 2;
        // The player's body is going to be a compound body.

        // let playerBody = M.Bodies.rectangle(sx, sy*1.5, w * 0.5, h/2, {chamfer: {radius: 0}});
        // this.playerController.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
        // this.playerController.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy*1.5, 5, h * 0.25, {isSensor: true});
        // this.playerController.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy*1.55, 5, h * 0.25, {isSensor: true});
        // this.playerController.sensors.up = M.Bodies.rectangle(sx, sy+0.1, sx, 5, {isSensor: true});

        let playerBody = M.Bodies.rectangle(sx, sy * 1.1, w * 0.5, h/1.1, {chamfer: {radius: 0}});
        this.playerController.sensors.bottom = M.Bodies.rectangle(sx, h, sx/2, 5, {isSensor: true});
        this.playerController.sensors.left = M.Bodies.rectangle(sx - w * 0.25, sy, 5, h * 0.25, {isSensor: true});
        this.playerController.sensors.right = M.Bodies.rectangle(sx + w * 0.25, sy, 5, h * 0.25, {isSensor: true});
        this.playerController.sensors.up = M.Bodies.rectangle(sx, h-h/1.1, sx, 5, {isSensor: true});

        let compoundBody = M.Body.create({
            parts: [
                playerBody,
                this.playerController.sensors.up,
                this.playerController.sensors.bottom,
                this.playerController.sensors.left,
                this.playerController.sensors.right
            ],
            friction: 0.1,
            restitution: 0.05 // Prevent body from sticking against a wall
        });
        this.playerController.matterSprite.play({key: 'delay', repeat: -1})
            .setExistingBody(compoundBody)
            .setFixedRotation() // Sets max inertia to prevent rotation
            .setPosition(x,y);
        this.playerController.matterSprite.body.gravityScale.y =2; // Define la gravedad específica para este sprite

        this.smoothMoveCameraTowards(this.playerController.matterSprite);

    }
    createEnemies(){
        const idDeseado = 11;
        this.layer.forEachTile(tile => {
            if (tile.index === idDeseado) {
                const item = this.createEnemiSprite(tile.getCenterX(), tile.getCenterY());
            }
        });
    }
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

    matterEventsPlayer(){
        // Usa eventos de materia para detectar si el jugador está tocando una superficie a la izquierda, derecha o
        // abajo.
        // Antes de la actualización de la materia, restablece el recuento del jugador de las superficies que está tocando.
        this.matter.world.on('beforeupdate', function (event) {
            this.enemiesGroup.forEach(enemy => {
                enemy.numTouching.left = 0;
                enemy.numTouching.right = 0;
                enemy.numTouching.bottom = 0;
                enemy.numTouching.up = 0;
                enemy.numTouching.attack = 0;
            });
            this.playerController.numTouching.left = 0;
            this.playerController.numTouching.right = 0;
            this.playerController.numTouching.bottom = 0;
        }, this);
        // Recorre los pares activos en colisión y cuenta las superficies que toca el jugador.
        this.matter.world.on('collisionactive', function (event) {
            const playerBody = this.playerController.matterSprite.body;
            for (let i = 0; i < event.pairs.length; i++) {
                const bodyA = event.pairs[i].bodyA;
                const bodyB = event.pairs[i].bodyB;
                this.checkCollisionPlayer(bodyA,bodyB);

                this.enemiesGroup.forEach(enemy => {
                    const playerBody2 = enemy;
                    const left = enemy.sensors.left;
                    const right = enemy.sensors.right;
                    const bottom = enemy.sensors.bottom;
                    const up = enemy.sensors.up;
                    const attack = enemy.sensors.attack;

                    if (bodyA === bottom || bodyB === bottom) {
                        // Standing on any surface counts (e.g. jumping off of a non-static crate).
                        playerBody2.numTouching.bottom += 1;
                    }else if ((bodyA === left ) || (bodyB === left )) {
                        playerBody2.numTouching.left += 1;
                        if(playerBody ===bodyA.gameObject.body || playerBody ===bodyB.gameObject.body){
                            const rock = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
                            // playerBody2.numTouching.attack += 1;
                        }
                    }
                    else if ((bodyA === right ) || (bodyB === right )) {
                        playerBody2.numTouching.right += 1;
                        if(playerBody ===bodyA.gameObject.body || playerBody ===bodyB.gameObject.body){
                            const rock = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);

                        }
                    }
                    else if ((bodyA === attack ) || (bodyB === attack )) {
                        // playerBody2.numTouching.attack += 1;
                        if(playerBody ===bodyA.gameObject.body || playerBody ===bodyB.gameObject.body){
                            playerBody2.numTouching.attack += 1;
                            // playerBody2.numTouching.attack += 1;
                            this.applyBounceForce(this.playerController.matterSprite);


                        }
                    }
                    else if ((bodyA === up ) || (bodyB === up )) {
                        playerBody2.numTouching.up += 1;
                        //eliminar enemigo al 2 sltar 2 vbeces encima
                        if(playerBody ===bodyA.gameObject.body || playerBody ===bodyB.gameObject.body){
                            const rock = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
                            if(rock){
                                if (rock.lives===0){
                                    this.killEnemi(rock);
                                }else{
                                    this.playerController.matterSprite.setVelocityX(-this.MAX_SPEED);
                                    this.playerController.matterSprite.setVelocityY(-this.MAX_SPEED*2);
                                    this.playerController.matterSprite.setFlipX(true);
                                    rock.matterSprite.anims.play('flip_enemi', true);
                                    // Establecer un temporizador para volver a la animación "step" después de 2 segundos
                                    const interval = setInterval(() => {
                                        // Reanudar la animación "step_enemi"
                                        rock.matterSprite.anims.play('run_enemi', true);
                                        // Limpiar el intervalo después de ejecutar una vez
                                        clearInterval(interval);
                                    }, 600); // 2000 milisegundos (2 segundos)
                                    rock.lives--;
                                }
                            }

                        }
                    }


                });
            }
        }, this);
        // Actualización finalizada, por lo que ahora podemos determinar si alguna dirección está bloqueada
        this.matter.world.on('afterupdate', function (event) {

            this.enemiesGroup.forEach(enemy => {
                enemy.blocked.right = enemy.numTouching.right > 0 ? true : false;
                enemy.blocked.left = enemy.numTouching.left > 0 ? true : false;
                enemy.blocked.bottom = enemy.numTouching.bottom > 0 ? true : false;
                enemy.blocked.up = enemy.numTouching.up > 0 ? true : false;
                enemy.blocked.attack = enemy.numTouching.attack > 0 ? true : false;
            });

            this.playerController.blocked.right = this.playerController.numTouching.right > 0 ? true : false;
            this.playerController.blocked.left = this.playerController.numTouching.left > 0 ? true : false;
            this.playerController.blocked.bottom = this.playerController.numTouching.bottom > 0 ? true : false;
        }, this);
    }
    checkCollisionPlayer(bodyA,bodyB){
        const playerBody = this.playerController.matterSprite.body;
        const left = this.playerController.sensors.left;
        const right = this.playerController.sensors.right;
        const bottom = this.playerController.sensors.bottom;

        // if (bodyA.gameObject.tile instanceof Phaser.Tilemaps.Tile &&
        //     this.tilesCollisionInfo.hasOwnProperty(bodyA.gameObject.tile.index)) {
        //     const tileDescription = this.tilesCollisionInfo[bodyA.gameObject.tile.index];
        // }
        // if (bodyB.gameObject.tile instanceof Phaser.Tilemaps.Tile &&
        //     this.tilesCollisionInfo.hasOwnProperty(bodyB.gameObject.tile.index)) {
        //     const tileDescription = this.tilesCollisionInfo[bodyB.gameObject.tile.index];
        // }

        // if (bodyA === playerBody || bodyB === playerBody)
        // {
        //     continue;
        // }else
            if (bodyA === bottom || bodyB === bottom) {
            // Standing on any surface counts (e.g. jumping off of a non-static crate).
            this.playerController.numTouching.bottom += 1;
            const enemie = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
            // if (enemie) {
            //     console.log(enemie)
            //     enemie.numTouching.bottom += 1;
            // }
        }
        else if ((bodyA === left ) || (bodyB === left )) {
            // Only static objects count since we don't want to be blocked by an object that we
            // can push around.
            this.playerController.numTouching.left += 1;
            const rock = this.rocksGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
            const enemie = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
            if (rock) {
                this.breakRock(rock);
            }
            // if (enemie) {
            //     enemie.numTouching.left += 1;
            // }
        }
        else if ((bodyA === right ) || (bodyB === right )) {
            this.playerController.numTouching.right += 1;
            // Verificar si uno de los cuerpos colisionando pertenece al grupo de rocas
            const rock = this.rocksGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
            const enemie = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
            if (rock) {
                this.breakRock(rock);
            }
            // if (enemie) {
            //     enemie.numTouching.right += 1;
            // }
        }
    }
    applyBounceForce(sprite) {
        const interval = setInterval(() => {
            // Reanudar la animación "step_enemi"
            // this.playerController.matterSprite.setVelocityX(-this.MAX_SPEED);
            // this.playerController.matterSprite.setVelocityY(-3);
            // Limpiar el intervalo después de ejecutar una vez

            this.playerController.matterSprite.anims.play('defeat', true);

            // const forceMagnitude = 0.01; // Reducir la magnitud de la fuerza
            // const forceX = -0.01; // Dirección horizontal hacia la izquierda
            // const forceY = -0.1; // Dirección vertical hacia arriba

            // Aplicar una fuerza al sprite Matter
            // sprite.applyForce({ x: forceX * forceMagnitude, y: forceY * forceMagnitude });
            this.playerController.matterSprite.setVelocityX(-this.MAX_SPEED-2);
            this.playerController.matterSprite.setVelocityY(-1.2);
            sprite.setBounce(1.5); // Un valor entre 0 y 1, donde 1 es un rebote completo
            this.time.delayedCall(500, () => {
                sprite.setBounce(0)
            }, [], this);
            clearInterval(interval);
        }, 200); // 2000 milisegundos (2 segundos)

    }
    matterEventsEnemies(){

    }
    populate(){
        this.createRocks();
        this.createEnemies();

    }
    //rocks
    createRockSprite(x, y) {
        const M = Phaser.Physics.Matter.Matter;
        const matterSprite = this.matter.add.sprite(x, y, 'rock_small_object', 0)
            .setBounce(0)
            .setFriction(0, 0, 0)
            .setCollisionGroup(this.matter.world.nextGroup())
            .setVelocityY(2);

        const w = matterSprite.width ;
        const h = matterSprite.height ;
        const playerBody = M.Bodies.rectangle(w / 2, h / 2, w * 0.75, h, { chamfer: { radius: 10 } });
        const sensors = {
            bottom: M.Bodies.rectangle(w / 2, h, w / 2, 5, { isSensor: true }),
            left: M.Bodies.rectangle(w / 2 - w * 0.45, h / 2, 5, h * 0.25, { isSensor: true }),
            right: M.Bodies.rectangle(w / 2 + w * 0.45, h / 2, 5, h * 0.25, { isSensor: true })
        };
        const compoundBody = M.Body.create({
            parts: [playerBody, sensors.bottom, sensors.left, sensors.right]
        });
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
    createEnemiSprite(x, y) {
        this.anims.createFromAseprite('enemi_1');

        let enemy = {
            matterSprite: this.matter.add.sprite(200, 200, 'enemi_1', 0)
                .setBounce(0)
                .setFriction(0, 0, 0)
                .setCollisionGroup(this.matter.world.nextGroup())
                .setVelocityY(2)
            .setScale(1.5)
            //     .setDisplaySize(100, 100)
            ,
            direction: {
                x: 1,
                y: 0,
            },
            lives: 10,
            isAttacking: false,
            blocked: {
                left: false,
                right: false,
                bottom: false,
                up: false,
                attack: false
            },
            numTouching: {
                left: 0,
                right: 0,
                bottom: 0,
                up: 0,
                attack: 0
            },
            sensors: {
                bottom: null,
                left: null,
                right: null,
                up: null,
                attack: null
            },
            time: {
                leftDown: 0,
                rightDown: 0
            },
            lastJumpedAt: 0,
            speed: {
                run: 5,
                jump: 8
            }
        };
        const M = Phaser.Physics.Matter.Matter;
        const w = enemy.matterSprite.width * 1.5;
        const h = enemy.matterSprite.height * 1.5;
        // El cuerpo del jugador va a ser un cuerpo compuesto:
        // - playerBody es el cuerpo sólido que interactuará físicamente con el mundo. Tiene un
        // chaflán (bordes redondeados) para evitar el problema de los vértices fantasma: http://www.iforce2d.net/b2dtut/ghost-vertices
        // - Sensores izquierdo/derecho/inferior que no interactuarán físicamente pero nos permitirán comprobar si
        // el jugador está parado sobre suelo sólido o empujado contra un objeto sólido.
        // Move the sensor to player center
        let sx = w / 2;
        let sy = h / 2;
        // The player's body is going to be a compound body.
        let playerBody = M.Bodies.rectangle(sx, sy*1.5, w * 0.5, h/2, {chamfer: {radius: 0}});
        enemy.sensors.bottom = M.Bodies.rectangle(sx, h, sx/4, 5, {isSensor: true});
        enemy.sensors.left = M.Bodies.rectangle(sx - w * 0.25, sy*1.5, 5, h * 0.25, {isSensor: true});
        enemy.sensors.right = M.Bodies.rectangle(sx + w * 0.25, sy*1.55, 5, h * 0.25, {isSensor: true});
        enemy.sensors.up = M.Bodies.rectangle(sx, sy+0.1, sx/4, 5, {isSensor: true});
        enemy.sensors.attack = M.Bodies.rectangle(sx, h, w, h/4, {isSensor: true});

        let compoundBody = M.Body.create({
            parts: [
                playerBody,
                // playerBody2,
                enemy.sensors.bottom,
                enemy.sensors.left,
                enemy.sensors.right,
                enemy.sensors.up,
                enemy.sensors.attack,
            ],
            friction: 0.1,
            restitution: 0.05 // Prevent body from sticking against a wall
        });
        enemy.matterSprite
            .setExistingBody(compoundBody)
            .setFixedRotation() // Sets max inertia to prevent rotation
            .setPosition(x,y)
            .setVelocityX(5)
            .setBounce(0)
            .setFriction(0, 0, 0)
            .setCollisionGroup(this.matter.world.nextGroup())
            .setVelocityY(2);

        // console.log(enemy.matterSprite.body)
        // enemy.matterSprite.body.gravityScale.y =1; // Define la gravedad específica para este sprite
        this.enemiesGroup.push(enemy);
    }
    breakRock(rock) {
        const index = this.rocksGroup.indexOf(rock);
        if (index !== -1) {
            this.addParticleEffect(rock.matterSprite.x, rock.matterSprite.y);
            this.rocksGroup.splice(index, 1);
            rock.matterSprite.body.gameObject.destroy();
        }
    }
    killEnemi(rock) {
        const index = this.enemiesGroup.indexOf(rock);
        if (index !== -1) {
            this.addParticleEffect(rock.matterSprite.x, rock.matterSprite.y);
            this.enemiesGroup.splice(index, 1);
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
    exitZone(obj) {
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
                y: 1.2
            },            enableSleep: false,
            debug: true
        }
    },
    scene: Example
};

const game = new Phaser.Game(config);

