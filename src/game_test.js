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
    enemiesBuGroup;
    enemiesRockGroup;
    tweens;
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
    MAX_SPEED=4;
    NORMAL_SPEED=3;
    MIN_SPEED=2.4;
    tilesCollisionInfo = {
        1: "platform",
        3: "collision_enemi",
        10: "stick_wall",
        113: "ramp",
        114: "Azulejo especial 2",
        115: "Azulejo especial 3",
        13: "ramp",
        14: "ramp",
        15: "ramp",
        16: "ramp"
    };

    enemyGroup;
    mapGroup;

    playerCategory;
    enemyCategory
    preload ()
    {

    }
    preload() {
        this.load.image('block', 'assets/sprites/block.png');
        this.load.image('strip', 'assets/sprites/strip1.png');
        this.load.spritesheet('fish', 'assets/sprites/fish-136x80.png', { frameWidth: 136, frameHeight: 80 });
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
        this.load.aseprite('paladin', 'assets/animations/aseprite/wario/wario_animations_booooooo.png', 'assets/animations/aseprite/wario/wario_animations_booooooo.json',{frameWidth: 45, frameHeight: 45});
        // this.load.aseprite('paladin', 'assets/animations/aseprite/wario/wario_animations3.png', 'assets/animations/aseprite/wario/wario_animations3.json');

        this.load.aseprite('enemi_3', 'assets/animations/aseprite/wario/enemi_rock.png', 'assets/animations/aseprite/wario/enemi_rock.json');
        this.load.aseprite('enemi_2', 'assets/animations/aseprite/wario/enemi_bu.png', 'assets/animations/aseprite/wario/enemi_bu.json');
        this.load.aseprite('enemi_1', 'assets/animations/aseprite/wario/enemi_1_2.png', 'assets/animations/aseprite/wario/enemi_1_2.json');
        this.load.spritesheet('rock1', 'assets/tilemaps/tiles/rock_1.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock2', 'assets/tilemaps/tiles/rock_2.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock3', 'assets/tilemaps/tiles/rock_3.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('rock_small_object', 'assets/tilemaps/tiles/wario/rock_small_object.png', {frameWidth: 32, frameHeight: 32});
    }
    createTileMap(){
        this.image0 = this.add.tileSprite(0, 0, 0, 0, 'background').setScale(1).setOrigin(0.1, 0.1);
        this.image0.displayWidth = this.sys.game.config.width * 2.5;
        this.image0.displayHeight = this.sys.game.config.height * 2.5;
        const map = this.add.tilemap("map");

        this.layer = map.createLayer('Tile Layer 1',
            map.addTilesetImage('kenney_redux_64x64', 'kenney_redux_64x64', 32, 32),
        );

        // Configura las colisiones, excluyendo el azulejo con el ID 3

        // Convierte la capa en cuerpos Matter
        this.layer.setCollisionByProperty({collides: true});
        this.matter.world.convertTilemapLayer(this.layer);
        // this.layer.setCollisionByExclusion([1]);

        // Jugador

        // Enemigo
        var enemy = this.matter.add.image(100, 100, 'enemy');
        enemy.setCircle();

        this.smoothedControls = new SmoothedHorionztalControl(0.003);
        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

            this.matter.world.setBounds();

            const canCollide = (filterA, filterB) =>
            {
                if (filterA.group === filterB.group && filterA.group !== 0)
                {
                    return filterA.group > 0;
                }

                return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
            };

            // Aquí crearemos el Grupo 1:
            // Este es un grupo en colisión, por lo que los objetos dentro de este grupo siempre colisionarán:
            const enemiGroup = this.matter.world.nextGroup();

            const enemi = this.matter.add.image(400, 450, 'strip').setStatic(true).setCollisionGroup(enemiGroup);
            const fish1 = this.matter.add.image(0, 100, 'fish', 0).setBounce(1).setFriction(0, 0, 0).setCollisionGroup(enemiGroup).setVelocityY(10);
            // Aquí crearemos el Grupo 2:
            // Este es un grupo que no colisiona, por lo que los objetos de este grupo nunca colisionan:
            const playerGroup = this.matter.world.nextGroup(true);

            // block2 no colisionará con player porque comparten la misma identificación de grupo que no colisiona
            const block2 = this.matter.add.image(400, 400, 'strip').setStatic(true).setCollisionGroup(playerGroup);
            const player = this.matter.add.image(250, 100, 'fish', 1).setBounce(1).setFriction(0, 0, 0).setCollisionGroup(playerGroup).setVelocityY(10);

            // sin embargo, player colisionará con enemi, ya que los grupos son diferentes y distintos de cero,
            // por lo que usan la prueba de máscara de categoría
            // por defecto los objetos reciben una categoría de 1 y una máscara de -1,
            // lo que significa que colisionarán (es decir, bloque1 vs pez2) si están en diferentes grupos
            // crea una nueva categoría (podemos tener hasta 32)
            const cat1 = this.matter.world.nextCategory();
            // Asigna la nueva categoría a block3 y fish3 y diles que deberían colisionar:
            // const block3 = this.matter.add.image(400, 500, 'strip').setStatic(true).setCollisionCategory(cat1).setCollidesWith(cat1);
            // const fish3 = this.matter.add.image(450, 100, 'fish', 2).setBounce(1).setFriction(0, 0, 0).setVelocityY(10).setCollisionCategory(cat1).setCollidesWith(cat1);
            player.setBounce(1).setFriction(0, 0, 0).setVelocityY(10).setCollisionCategory(cat1).setCollidesWith(cat1);

            console.log(this.layer)
            this.layer.forEachTile(tile => {
                // if (tile.physics.matterBody) {
                if (tile.index === 3) {
                    console.log(tile.physics.matterBody);
                    tile.physics.matterBody.setCollisionGroup(playerGroup);
                    // tile.physics.matterBody.setCollisionCategory(cat1).setCollidesWith(cat1);
                    // tile.physics.matterBody.setCollisionFromCollisionGroup(playerGroup)
                }
            });
            // console.log('enemi vs fish1', canCollide(this.layer, fish1.body.collisionFilter));
            // console.log('enemi vs player', canCollide(this.layer, player.body.collisionFilter));
            // console.log('enemi vs fish3', canCollide(this.layer, fish3.body.collisionFilter));
    }

    playerEnemyCollision(player, enemy) {
        console.log('¡El jugador ha colisionado con un enemigo!');
    }
    handleCollision(event) {
        const { gameObjectB } = event;
        if (gameObjectB && gameObjectB.layer && gameObjectB.layer.tilemapLayer) {
            const properties = gameObjectB.layer.tilemapLayer.getTilePropertiesAt(event.gameObjectB.x, event.gameObjectB.y);
            if (properties && properties[3]) {
                // ID 3 encontrado, manejar la colisión aquí si es necesario
                // Por ejemplo, puedes deshabilitar el movimiento del jugador
                // this.playerController.matterSprite.setVelocity(0, 0);
            } else {
                // ID diferente de 3, permitir colisión normalmente
                return true;
            }
        }
        return false;
    }
    parallaxBg(direction){

        this.image0.tilePositionX=this.image0.tilePositionX + 1.2 * direction;
        this.image1.tilePositionX=this.image0.tilePositionX + 0.8 * direction;
    }
    parallaxBgReset(){
        this.image0.x= this.cam.scrollX;
        this.image1.x= this.cam.scrollX;
    }
    populate(){
        this.createRocks();
        this.createEnemies();
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
    createPlayer(x,y){
        // this.matter.add.sprite(200, 200, 'enemi_1', 0).setScale(1.5)
        this.playerController = {
            matterSprite: this.matter.add.sprite(200, 200, 'paladin', 0)
                // .setExistingBody(compoundBody)
                // .setDensity(1000)
                // .setFrictionStatic(100)
                // .setFrictionAir(0.00001)
                // .setFriction(0, 0.02, 1)
                // .setBounce(0) // Sets max inertia to prevent rotation
                .setScale(1.7)
            ,
            actionDuration:1000,
            actionTimer:0,
            jump:false,
            step:false,
            run:false,
            crouch:false,
            punch:false,
            dash:false,
            pound:false,
            defeat:false,
            stick:false,
            climb:false,
            morte:false,
            stop:false,


            direction: {
                x: 1,
                y: 0,
            },
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
            jumpSpeed: 0,
            speed: {
                step: 3.5,
                run: 7,
                jump: 9
            }
        };

        const M = Phaser.Physics.Matter.Matter;
        const w = this.playerController.matterSprite.width *1.7;
        const h = this.playerController.matterSprite.height *1.7;
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

        let playerBody = M.Bodies.rectangle(sx, sy * 1.2, w * 0.5, h/1.2, {chamfer: {radius: 10}});
        this.playerController.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
        this.playerController.sensors.left = M.Bodies.rectangle(sx - w * 0.25, sy, 5, h * 0.25, {isSensor: true});
        this.playerController.sensors.right = M.Bodies.rectangle(sx + w * 0.25, sy, 5, h * 0.25, {isSensor: true});
        this.playerController.sensors.up = M.Bodies.rectangle(sx, h-h/1.3, sx, 5, {isSensor: true});

        let compoundBody = M.Body.create({
            parts: [
                playerBody,
                this.playerController.sensors.up,
                this.playerController.sensors.bottom,
                this.playerController.sensors.left,
                this.playerController.sensors.right
            ],
            friction: 0.01,
            restitution: 0.05 // Prevent body from sticking against a wall
        });
        this.playerController.matterSprite.play({key: 'delay', repeat: -1})
            .setExistingBody(compoundBody)
            .setPosition(x,y)
            .setFixedRotation() // Sets max inertia to prevent rotation

        // .setDensity(1000)
        // .setFrictionStatic(0)
        // .setFrictionAir(1)
        // .setFriction(0.01)
        // .setBounce(0) // Sets max inertia to prevent rotation
        // .setFixedRotation() // Sets max inertia to prevent rotation
        // .setPosition(x,y)
        // .setScale(1.5)
        // this.playerController.matterSprite.body.gravityScale.y =2; // Define la gravedad específica para este sprite

        this.smoothMoveCameraTowards(this.playerController.matterSprite);
    }
    createEnemies(){
        const id_enemi = 11;
        const id_enemi_bu = 12;
        const id_enemi_rock = 24;

        this.layer.forEachTile(tile => {
            if (tile.index === id_enemi) {
                this.createEnemiSprite(tile.getCenterX(), tile.getCenterY());
            }
        });

        this.layer.forEachTile(tile => {
            if (tile.index === id_enemi_bu) {
                this.createEnemiSprite3(tile.getCenterX(), tile.getCenterY());
            }
        });
        this.layer.forEachTile(tile => {
            if (tile.index === id_enemi_rock) {
                this.createEnemiSprite4(tile.getCenterX(), tile.getCenterY());
            }
        });
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
                .setDensity(1000)
                .setFrictionStatic(100)
                .setFrictionAir(0.00001)
                .setFriction(0, 0.02, 1)
                .setBounce(0) // Sets max inertia to prevent rotation
                .setFixedRotation() // Sets max inertia to prevent rotation
                .setPosition(x,y)
                .setScale(1.5)
            //     .setDisplaySize(100, 100)
            ,
            actionDuration:1000,
            actionTimer:800,
            fliped:false,
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
            enemy.sensors.up = M.Bodies.rectangle(sx, h/2.5, sx/2, 5, {isSensor: true});
            enemy.sensors.attack = M.Bodies.rectangle(sx, h, w/1.2, h/2, {isSensor: true});

            let compoundBody = M.Body.create({
                parts: [
                    playerBody,
                    enemy.sensors.bottom,
                    enemy.sensors.left,
                    enemy.sensors.right,
                    enemy.sensors.up,
                    enemy.sensors.attack,
                ],
                friction: 0.01,
                restitution: 0.05 // Prevent body from sticking against a wall
            });
        enemy.matterSprite
            .setExistingBody(compoundBody)
            .setDensity(0.01)
            .setFrictionStatic(10)
            .setFrictionAir(0.1)
            .setFriction(1)
            .setBounce(0) // Sets max inertia to prevent rotation
            .setFixedRotation(0) // Sets max inertia to prevent rotation
            .setPosition(x,y)

        // console.log(enemy.matterSprite.body)
        // enemy.matterSprite.body.gravityScale.y =1; // Define la gravedad específica para este sprite
        this.enemiesGroup.push(enemy);
    }
    createEnemiSprite3(x,  y) {
        this.anims.createFromAseprite('enemi_2');

        let enemy = {
            matterSprite: this.matter.add.sprite(200, 200, 'enemi_2', 0)
                .setDensity(1000)
                .setFrictionStatic(100)
                .setFrictionAir(0.00001)
                .setFriction(0, 0.02, 1)
                .setBounce(0) // Sets max inertia to prevent rotation
                .setFixedRotation() // Sets max inertia to prevent rotation
                .setPosition(x, y)
                .setScale(1.5),
            actionDuration: 1000,
            actionTimer: 0,
            fliped: false,
            direction: {
                x: 1,
                y: 0,
            },
            respawn: {
                x: 0,
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
        const w = enemy.matterSprite.width ;
        const h = enemy.matterSprite.height;
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
        // enemy.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
        // enemy.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy*1.5, 5, h * 0.25, {isSensor: true});
        // enemy.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy*1.55, 5, h * 0.25, {isSensor: true});
        // enemy.sensors.up = M.Bodies.rectangle(sx, sy+0.1, sx, 5, {isSensor: true});

        let playerBody = M.Bodies.rectangle(sx, sy , w -10, h-10, {chamfer: {radius: 10}});
        enemy.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
        enemy.sensors.left = M.Bodies.rectangle(sx - w * 0.50, sy, 5, h * 0.5, {isSensor: true});
        enemy.sensors.right = M.Bodies.rectangle(sx + w * 0.50, sy, 5, h * 0.5, {isSensor: true});
        // enemy.sensors.up = M.Bodies.rectangle(sx, 0, sx, 5, {isSensor: true});
        enemy.sensors.up = M.Bodies.rectangle(sx, 0, sx, 5, {isSensor: true});
        // enemy.sensors.attack = M.Bodies.rectangle(sx, sy , w *5, h*5, {isSensor: true});
        enemy.sensors.attack = M.Bodies.rectangle(sx, sy , w -10, h-10, {isSensor: true});
        // var enemyAttackCategory = this.matter.world.nextCategory();
        // enemy.sensors.attack.setCollisionCategory(this.enemyAttackCategory); // Establecer la categoría de colisión del sensor de ataque del enemigo
        // enemy.sensors.attack.setCollidesWith([this.playerCategory]);
        // this.playerController.matterSprite.body.collisionFilter.mask &= ~enemy.sensors.attack.collisionFilter.category;
        let compoundBody = M.Body.create({
            parts: [
                playerBody,
                // enemy.sensors.up,
                // enemy.sensors.bottom,
                // enemy.sensors.left,
                // enemy.sensors.right,
                enemy.sensors.attack
            ],
            friction: 0.01,
            restitution: 0.05 // Prevent body from sticking against a wall
        });

        enemy.matterSprite.setExistingBody(compoundBody).setFixedRotation();
        // enemy.matterSprite.body.collisionFilter.category = 0; // Desactiva las colisiones con todas las categorías
        // enemy.matterSprite.body.collisionFilter.mask = 0; // No colisiona con ninguna categoría

// Posicionar el sprite del enemigo
        enemy.matterSprite.setPosition(x, y);
        enemy.respawn.x=x;
        enemy.respawn.y=y;


        // console.log(enemy.matterSprite.body)
        enemy.matterSprite.body.gravityScale.y =0; // Define la gravedad específica para este sprite
        enemy.matterSprite.body.gravityScale.x =0; // Define la gravedad específica para este sprite
        this.enemiesBuGroup.push(enemy);
      enemy.matterSprite.body.gravityScale.y =0; // Define la gravedad específica para este sprite
        enemy.matterSprite.setIgnoreGravity(true)
        enemy.matterSprite.setAngularVelocity(0)

    }
    createEnemiSprite4(x,  y) {
        this.anims.createFromAseprite('enemi_3');

        let enemy = {
            matterSprite: this.matter.add.sprite(200, 200, 'enemi_3', 0)
                // .setDensity(1000)
                // .setFrictionStatic(100)
                // .setFrictionAir(0.00001)
                // .setFriction(0, 0.02, 1)
                // .setBounce(0) // Sets max inertia to prevent rotation
                // .setFixedRotation() // Sets max inertia to prevent rotation
                .setPosition(x, y)
                .setScale(1.5),
            actionDuration: 1000,
            actionTimer: 0,
            fliped: false,
            direction: {
                x: 1,
                y: 0,
            },
            respawn: {
                x: 0,
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
        const w = enemy.matterSprite.width ;
        const h = enemy.matterSprite.height;
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
        // enemy.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
        // enemy.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy*1.5, 5, h * 0.25, {isSensor: true});
        // enemy.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy*1.55, 5, h * 0.25, {isSensor: true});
        // enemy.sensors.up = M.Bodies.rectangle(sx, sy+0.1, sx, 5, {isSensor: true});

        let playerBody = M.Bodies.rectangle(sx, sy , w -10, h-10, {chamfer: {radius: 0}});
        enemy.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
        enemy.sensors.left = M.Bodies.rectangle(sx - w * 0.50, sy, 5, h * 0.5, {isSensor: true});
        enemy.sensors.right = M.Bodies.rectangle(sx + w * 0.50, sy, 5, h * 0.5, {isSensor: true});
        // enemy.sensors.up = M.Bodies.rectangle(sx, 0, sx, 5, {isSensor: true});
        enemy.sensors.up = M.Bodies.rectangle(sx, 0, sx, 5, {isSensor: true});
        // enemy.sensors.attack = M.Bodies.rectangle(sx, sy , w *5, h*5, {isSensor: true});
        enemy.sensors.attack = M.Bodies.rectangle(sx, sy , w, h, {isSensor: true});
        // var enemyAttackCategory = this.matter.world.nextCategory();
        // enemy.sensors.attack.setCollisionCategory(this.enemyAttackCategory); // Establecer la categoría de colisión del sensor de ataque del enemigo
        // enemy.sensors.attack.setCollidesWith([this.playerCategory]);
        // this.playerController.matterSprite.body.collisionFilter.mask &= ~enemy.sensors.attack.collisionFilter.category;
        let compoundBody = M.Body.create({
            parts: [
                playerBody,
                // enemy.sensors.up,
                // enemy.sensors.bottom,
                // enemy.sensors.left,
                // enemy.sensors.right,
                enemy.sensors.attack
            ],
            friction: 1,
            restitution: 0.05 // Prevent body from sticking against a wall
        });

        enemy.matterSprite.setExistingBody(compoundBody).setFixedRotation()
        .setDensity(1000)
        .setFrictionStatic(100)
        .setFrictionAir(0)
        .setFriction(0,0,0)
        .setBounce(0) // Sets max inertia to prevent rotation
        .setFixedRotation() // Sets max inertia to prevent rotation
        ;
        // enemy.matterSprite.body.collisionFilter.category = 0; // Desactiva las colisiones con todas las categorías
        // enemy.matterSprite.body.collisionFilter.mask = 0; // No colisiona con ninguna categoría

// Posicionar el sprite del enemigo
        enemy.matterSprite.setPosition(x, y);
        enemy.respawn.x=x;
        enemy.respawn.y=y;
        // console.log(enemy.matterSprite.body)
        enemy.matterSprite.body.gravityScale.y =0; // Define la gravedad específica para este sprite
        enemy.matterSprite.body.gravityScale.x =10; // Define la gravedad específica para este sprite
        this.enemiesRockGroup.push(enemy);
        enemy.matterSprite.setIgnoreGravity(true)
        enemy.matterSprite.setAngularVelocity(0)

    }
    create ()
    {
        // this.matter.world.setBounds();
        //
        // const canCollide = (filterA, filterB) =>
        // {
        //     if (filterA.group === filterB.group && filterA.group !== 0)
        //     { return filterA.group > 0; }
        //
        //     return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
        // };
        //
        // //  Here we'll create Group 1:
        //
        // //  This is a colliding group, so objects within this Group will always collide:
        // const enemiGroup = this.matter.world.nextGroup();
        //
        // const enemi = this.matter.add.image(400, 450, 'strip').setStatic(true).setCollisionGroup(enemiGroup);
        // const fish1 = this.matter.add.image(100, 100, 'fish', 0).setBounce(1).setFriction(0, 0, 0).setCollisionGroup(enemiGroup).setVelocityY(10);
        //
        // //  Here we'll create Group 2:
        // //  This is a non-colliding group, so objects in this Group never collide:
        // const playerGroup = this.matter.world.nextGroup(true);
        //
        // //  block2 won't collide with player because they share the same non-colliding group id
        // const block2 = this.matter.add.image(400, 400, 'strip').setStatic(true).setCollisionGroup(playerGroup);
        // const player = this.matter.add.image(250, 100, 'fish', 1).setBounce(1).setFriction(0, 0, 0).setCollisionGroup(playerGroup).setVelocityY(10);
        //
        // //  however, player WILL collide with enemi, as the groups are different and non-zero, so they use the category mask test
        //
        // //  by default objects are given a category of 1 and a mask of -1, meaning they will collide (i.e. enemi vs player) if in different groups
        //
        // //  create a new category (we can have up to 32 of them)
        // const cat1 = this.matter.world.nextCategory();
        //
        // //  Assign the new category to block3 and fish3 and tell them they should collide:
        // const block3 = this.matter.add.image(400, 500, 'strip').setStatic(true).setCollisionCategory(cat1).setCollidesWith(cat1);
        // const fish3 = this.matter.add.image(450, 100, 'fish', 2).setBounce(1).setFriction(0, 0, 0).setVelocityY(10).setCollisionCategory(cat1).setCollidesWith(cat1);
        //
        // console.log('enemi vs fish1', canCollide(enemi.body.collisionFilter, fish1.body.collisionFilter));
        // console.log('enemi vs player', canCollide(enemi.body.collisionFilter, player.body.collisionFilter));
        // console.log('enemi vs fish3', canCollide(enemi.body.collisionFilter, fish3.body.collisionFilter));
        // //
        // // console.log('block2 vs fish1', canCollide(block2.body.collisionFilter, fish1.body.collisionFilter));
        // // console.log('block2 vs player', canCollide(block2.body.collisionFilter, player.body.collisionFilter));
        // // console.log('block2 vs fish3', canCollide(block2.body.collisionFilter, fish3.body.collisionFilter));
        // //
        // // console.log('block3 vs fish1', canCollide(block3.body.collisionFilter, fish1.body.collisionFilter));
        // // console.log('block3 vs player', canCollide(block3.body.collisionFilter, player.body.collisionFilter));
        // console.log('block3 vs fish3', canCollide(block3.body.collisionFilter, fish3.body.collisionFilter));
        this.createTileMap()

    }
    create2() {
        // Calculamos el nuevo ancho y alto manteniendo la relación de aspecto
        const newWidth = 580 * 1.5;
        const newHeight = 320 *1.5;

        // Calculamos el zoom necesario para mantener la misma relación de aspecto
        const zoomX = newWidth / 580;
        const zoomY = newHeight / 320;

        // Ajustamos el zoom de la cámara para mantener la misma relación de aspecto
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));

        // Centramos la cámara en el centro del mundo
        this.cameras.main.centerOn(0, 0);
        this.rocksGroup=[];
        this.enemiesGroup=[];
        this.enemiesBuGroup=[];
        this.enemiesRockGroup=[];
        this.createTileMap()
        // this.decorWorld()


        // this.matterEvents();
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

        // this.parallaxBgReset();
        // this.movePlayer(time, delta);
        // this.moveEnemies(time, delta);
        // this.moveEnemies2(time, delta);
        // this.moveEnemies3(time, delta);
    }
    matterEvents(){
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
            this.enemiesBuGroup.forEach(enemy => {
                enemy.numTouching.left = 0;
                enemy.numTouching.right = 0;
                enemy.numTouching.bottom = 0;
                enemy.numTouching.up = 0;
                enemy.numTouching.attack = 0;
            });
            this.enemiesRockGroup.forEach(enemy => {
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

        // Detectar colisión del sensor de sombra con las paredes
        // this.matter.world.on('collisionstart', function (event) {
        //     for (let i = 0; i < event.pairs.length; i++) {
        //         console.log('isAttacking')
        //         const bodyA = event.pairs[i].bodyA;
        //         const bodyB = event.pairs[i].bodyB;
        //         this.enemiesBuGroup.forEach(enemy => {
        //                 if ((bodyA === enemy.sensors.attack ) || (bodyB === enemy.sensors.attack )) {
        //                     if(!enemy.isAttacking){
        //                     console.log('isAttacking')
        //                     enemy.isAttacking = true;
        //                     }
        //             }
        //     });
        //     }
        // }, this);
        // this.matter.world.on('collisionend', function (event) {
        //     for (let i = 0; i < event.pairs.length; i++) {
        //         console.log('isAttsssssssssssssssssssssssssacking')
        //         const bodyA = event.pairs[i].bodyA;
        //         const bodyB = event.pairs[i].bodyB;
        //         this.enemiesBuGroup.forEach(enemy => {
        //             if ((bodyA === enemy.sensors.attack ) || (bodyB === enemy.sensors.attack )) {
        //                 console.log('faassssssssssssssaaaaaaaaaisAttacking')
        //                 // enemy.isAttacking = false;
        //             }
        //         });
        //     }
        // }, this);
        // Recorre los pares activos en colisión y cuenta las superficies que toca el jugador.
        this.matter.world.on('collisionactive', function (event) {
            const playerBody = this.playerController.matterSprite.body;
            for (let i = 0; i < event.pairs.length; i++) {
                const bodyA = event.pairs[i].bodyA;
                const bodyB = event.pairs[i].bodyB;
                this.checkCollisionPlayer(bodyA,bodyB);
                this.checkCollisionEnemies(bodyA,bodyB);
                this.checkCollisionEnemies2(bodyA,bodyB);
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
            this.enemiesBuGroup.forEach(enemy => {
                enemy.blocked.right = enemy.numTouching.right > 0 ? true : false;
                enemy.blocked.left = enemy.numTouching.left > 0 ? true : false;
                enemy.blocked.bottom = enemy.numTouching.bottom > 0 ? true : false;
                enemy.blocked.up = enemy.numTouching.up > 0 ? true : false;
                enemy.blocked.attack = enemy.numTouching.attack > 0 ? true : false;
            });
            this.enemiesRockGroup.forEach(enemy => {
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
    checkTileCollision(body,player) {
        let collision=true;
        if (body.gameObject.tile instanceof Phaser.Tilemaps.Tile &&
            this.tilesCollisionInfo.hasOwnProperty(body.gameObject.tile.index)) {
            const tileDescription = this.tilesCollisionInfo[body.gameObject.tile.index];
            if(tileDescription==='stick_wall' ){
                this.playerController.stick=true;
            }
                if(tileDescription==='collision_enemi' ){
                    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
                    collision=false;
                    // var enemyAttackCategory = this.matter.world.nextCategory();
                    // enemy.sensors.attack.setCollisionCategory(this.enemyAttackCategory); // Establecer la categoría de colisión del sensor de ataque del enemigo
                    // enemy.sensors.attack.setCollidesWith([this.playerCategory]);
                        // Ignorar colisiones del jugador con este tipo de tile
                        // this.playerController.matterSprite.setCollisionCategory(0);
                        // this.playerController.matterSprite.setCollidesWith([]);
                    // Si es el tile con ID 3, el jugador no colisiona con este tipo de tile
                    this.playerController.matterSprite.setCollidesWith([2]); // El jugador sigue colisionando con la categoría del enemigo
                }else {
                    this.playerController.matterSprite.setCollidesWith([1, 2]); // El jugador colisiona con la categoría del jugador y la del enemigo                    // this.playerController.matterSprite.setCollisionCategory(1); // Esto es solo un ejemplo, ajusta según sea necesario
                    // this.playerController.matterSprite.setCollidesWith([1]); // Esto también es un ejemplo, ajusta según sea necesario

                }
            if(tileDescription==='platform'){
                this.playerController.stick=false;
            }
            if(tileDescription==='ramp' ){
                this.playerController.ball=true;
            } else  {
                this.playerController.ball=false;
            }
        }else if(body.gameObject.tile instanceof Phaser.Tilemaps.Tile){
            this.playerController.stick=false;
            this.playerController.ball=false;
            // player.attack=false;
            collision=true;

        }
        // player.attack=true;
        return collision;
    }
    checkTileCollisionEnemi(body,player) {
        if (body.gameObject.tile instanceof Phaser.Tilemaps.Tile &&
            this.tilesCollisionInfo.hasOwnProperty(body.gameObject.tile.index)) {
            const tileDescription = this.tilesCollisionInfo[body.gameObject.tile.index];
            if(tileDescription==='stick_wall' ){
            } if(tileDescription==='platform'){
                // player.attack=true;
            }
            if(tileDescription==='ramp' ){
            } else  {
            }
            // player.attack=true;
        }else if(body.gameObject.tile instanceof Phaser.Tilemaps.Tile){
            // player.attack=false;
        }
        // player.attack=true;

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
        if (bodyA === bottom || bodyB === bottom) {
            this.checkTileCollision(bodyA,playerBody);
            this.checkTileCollision(bodyB,playerBody);
            // Standing on any surface counts (e.g. jumping off of a non-static crate).
            this.playerController.numTouching.bottom += 1;
            // this.playerController.matterSprite.setFriction(0.5)
            // this.checkTileCollision(bodyA);
            // this.checkTileCollision(bodyB);
            const enemie = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
        }
        else if ((bodyA === left ) || (bodyB === left )) {
            this.checkTileCollision(bodyA,playerBody);
            this.checkTileCollision(bodyB,playerBody);

            // Only static objects count since we don't want to be blocked by an object that we
            // can push around.
            this.playerController.dash = false;
            this.playerController.punch = false;

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
            if(
                this.checkTileCollision(bodyA,playerBody)
                && this.checkTileCollision(bodyB,playerBody)
            ){
                // this.playerController.numTouching.right += 1;
                // var enemyAttackCategory = this.matter.world.nextCategory();
                // enemy.sensors.attack.setCollisionCategory(this.enemyAttackCategory); // Establecer la categoría de colisión del sensor de ataque del enemigo
                // enemy.sensors.attack.setCollidesWith([this.playerCategory]);
                // this.playerController.matterSprite.body.collisionFilter.mask &= ~enemy.sensors.attack.collisionFilter.category;
            }

            // Verificar si uno de los cuerpos colisionando pertenece al grupo de rocas
            const rock = this.rocksGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
            const enemie = this.enemiesGroup.find(rock => rock.matterSprite.body === bodyA.gameObject.body || rock.matterSprite.body === bodyB.gameObject.body);
            if (rock) {
                this.breakRock(rock);
            }
            // if (enemie) {
            //     enemie.numTouching.right += 1;
            // }
            this.playerController.dash = false;
            this.playerController.punch = false;
        }
    }
    checkCollisionEnemies(bodyA,bodyB){
        this.enemiesGroup.forEach(enemy => {
            const playerBody = this.playerController.matterSprite.body;
            const left = enemy.sensors.left;
            const right = enemy.sensors.right;
            const bottom = enemy.sensors.bottom;
            const up = enemy.sensors.up;
            const attack = enemy.sensors.attack;

            if (bodyA === bottom || bodyB === bottom) {
                // Standing on any surface counts (e.g. jumping off of a non-static crate).
                enemy.numTouching.bottom += 1;
            }else if ((bodyA === left ) || (bodyB === left )) {
                if(playerBody !==bodyA.gameObject.body && playerBody !==bodyB.gameObject.body){
                    enemy.numTouching.left += 1;
                }
            }
            else if ((bodyA === right ) || (bodyB === right )) {
                if(playerBody !==bodyA.gameObject.body && playerBody !==bodyB.gameObject.body){
                    enemy.numTouching.right += 1;
                }
            }
            else if ((bodyA === attack ) || (bodyB === attack )) {
                if(playerBody ===bodyA.gameObject.body || playerBody ===bodyB.gameObject.body){
                    enemy.numTouching.attack += 1;

                }
            }
            else if ((bodyA === up ) || (bodyB === up )) {
                enemy.numTouching.up += 1;
                //eliminar enemigo al 2 sltar 2 vbeces encima


            }


        });
    }
    checkCollisionEnemies2(bodyA,bodyB){
        this.enemiesBuGroup.forEach(enemy => {
            const playerBody = this.playerController.matterSprite.body;
            const left = enemy.sensors.left;
            const right = enemy.sensors.right;
            const bottom = enemy.sensors.bottom;
            const up = enemy.sensors.up;
            const attack = enemy.sensors.attack;

            // if (bodyA === bottom || bodyB === bottom) {
            //     enemy.numTouching.bottom += 1;
            // }else if ((bodyA === left ) || (bodyB === left )) {
            //     enemy.numTouching.left += 1;
            // }
            // else if ((bodyA === right ) || (bodyB === right )) {
            //         enemy.numTouching.right += 1;
            // }
            // // else if ((bodyA === attack ) || (bodyB === attack )) {
            // //         enemy.numTouching.attack += 1;
            // // }
            // else if ((bodyA === up ) || (bodyB === up )) {
            //     enemy.numTouching.up += 1;
            // }else

            if ((bodyA === attack && bodyB.gameObject.body === playerBody) || (bodyB === attack && bodyA.gameObject.body === playerBody)) {
                // Si el jugador está dentro del sensor de ataque del enemigo
                        enemy.numTouching.attack += 1;
                console.log("¡El jugador está dentro del sensor de ataque del enemigo!");
                // Realiza las acciones necesarias, como iniciar el ataque del enemigo, etc.
            }
        });
        this.enemiesRockGroup.forEach(enemy => {
            const playerBody = this.playerController.matterSprite.body;
            const left = enemy.sensors.left;
            const right = enemy.sensors.right;
            const bottom = enemy.sensors.bottom;
            const up = enemy.sensors.up;
            const attack = enemy.sensors.attack;

            // if (bodyA === bottom || bodyB === bottom) {
            //     enemy.numTouching.bottom += 1;
            // }else if ((bodyA === left ) || (bodyB === left )) {
            //     enemy.numTouching.left += 1;
            // }
            // else if ((bodyA === right ) || (bodyB === right )) {
            //         enemy.numTouching.right += 1;
            // }
            // // else if ((bodyA === attack ) || (bodyB === attack )) {
            // //         enemy.numTouching.attack += 1;
            // // }
            // else if ((bodyA === up ) || (bodyB === up )) {
            //     enemy.numTouching.up += 1;
            // }else

            if ((bodyA === attack && bodyB.gameObject.body === playerBody) || (bodyB === attack && bodyA.gameObject.body === playerBody)) {
                // Si el jugador está dentro del sensor de ataque del enemigo
                        enemy.numTouching.attack += 1;
                console.log("¡El jugador está dentro del sensor de ataque del enemigo!");
                // Realiza las acciones necesarias, como iniciar el ataque del enemigo, etc.
            }
        });
    }
    movePlayer(time, delta){
        // const matterSprite = this.playerController.matterSprite;
        //
        // // Horizontal movement
        // let oldVelocityX;
        // let targetVelocityX;
        // let newVelocityX;
        //
        // if (this.cursors.left.isDown && !this.playerController.blocked.left)
        // {
        //     this.smoothedControls.moveLeft(delta);
        //     matterSprite.anims.play('left', true);
        //
        //     // Lerp the velocity towards the max run using the smoothed controls. This simulates a
        //     // player controlled acceleration.
        //     oldVelocityX = matterSprite.body.velocity.x;
        //     targetVelocityX = -this.playerController.speed.run;
        //     newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);
        //
        //     matterSprite.setVelocityX(newVelocityX);
        // }
        // else if (this.cursors.right.isDown && !this.playerController.blocked.right)
        // {
        //     this.smoothedControls.moveRight(delta);
        //     matterSprite.anims.play('right', true);
        //
        //     // Lerp the velocity towards the max run using the smoothed controls. This simulates a
        //     // player controlled acceleration.
        //     oldVelocityX = matterSprite.body.velocity.x;
        //     targetVelocityX = this.playerController.speed.run;
        //     newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
        //
        //     matterSprite.setVelocityX(newVelocityX);
        // }
        // else
        // {
        //     this.smoothedControls.reset();
        //     matterSprite.anims.play('idle', true);
        // }
        //
        // // Jumping & wall jumping
        //
        // // Add a slight delay between jumps since the sensors will still collide for a few frames after
        // // a jump is initiated
        // const canJump = (time - this.playerController.lastJumpedAt) > 250;
        // if (this.cursors.up.isDown && canJump)
        // {
        //     if (this.playerController.blocked.bottom)
        //     {
        //         matterSprite.setVelocityY(-this.playerController.speed.jump);
        //         this.playerController.lastJumpedAt = time;
        //     }
        //     else if (this.playerController.blocked.left)
        //     {
        //         // Jump up and away from the wall
        //         matterSprite.setVelocityY(-this.playerController.speed.jump);
        //         matterSprite.setVelocityX(this.playerController.speed.run*2);
        //         this.playerController.lastJumpedAt = time;
        //     }
        //     else if (this.playerController.blocked.right)
        //     {
        //         // Jump up and away from the wall
        //         matterSprite.setVelocityY(-this.playerController.speed.jump);
        //         matterSprite.setVelocityX(-this.playerController.speed.run*2);
        //         this.playerController.lastJumpedAt = time;
        //     }
        // }

        // this.smoothMoveCameraTowards(matterSprite, 0.9);
        const player = this.playerController;
        player.actionTimer += delta;

        const matterSprite = this.playerController.matterSprite;

        // if(
        //     player.blocked.bottom
        //     && !this.playerController.climb
        //     && (!this.cursors.left.isDown ||  !this.cursors.right.isDown)
        //     && !this.playerController.stick
        //     && player.actionTimer >= player.actionDuration
        // ){
        //     this.playerController.matterSprite.anims.play('run_stop', true);
        //     player.actionDuration = 1000;
        //     player.actionTimer = 0;
        // }

        // if(player.actionTimer >= player.actionDuration ){
        //     // this.playerController.matterSprite.anims.play('look', true);
        //     player.actionTimer = 0;
        //     // // player.actionDuration=500;
        //     this.playerController.jump=false;
        //     this.playerController.run=false;
        //     this.playerController.crouch=false; //todo remove
        //     this.playerController.punch=false;
        //     this.playerController.dash=false;
        //     this.playerController.pound=false;
        //     this.playerController.defeat=false;
        //     this.playerController.stick=false;
        //     this.playerController.climb=false;
        //     this.playerController.morte=false;
        //     //
        //     // this.smoothedControls.reset();
        // }

        // if(player.actionTimer >= player.actionDuration ){
        //     // this.playerController.matterSprite.anims.play('look', true);
        //     // player.actionTimer = 0;
        //     // player.actionDuration=500;
        //     this.playerController.jump=false;
        //     this.playerController.run=false;
        //     // this.playerController.crouch=false; //todo remove
        //     this.playerController.punch=false;
        //     this.playerController.dash=false;
        //     this.playerController.pound=false;
        //     this.playerController.defeat=false;
        //     this.playerController.stick=false;
        //     this.playerController.climb=false;
        //     this.playerController.morte=false;
        //
        //     this.smoothedControls.reset();
        // }

        //stop player


        if(player.defeat && player.stop){
            this.playerController.matterSprite.anims.play('defeat', true)
        }
        if(player.defeat && player.stop){

            const duration = 1000; // Duración de cada parpadeo en milisegundos
            const alphaValues = [1, 0.4]; // Valores de alfa para el parpadeo
            const alphaValues2 = [0.4, 1]; // Valores de alfa para el parpadeo

            const blinkTween3 = this.tweens.add({
                targets: this.playerController.matterSprite,
                alpha: alphaValues2,
                duration: 400,
                ease: 'Linear',
                paused: true // Dejar el tween en pausa inicialmente
            });
            const blinkTween2 = this.tweens.add({
                targets: this.playerController.matterSprite,
                alpha: [1,0],
                duration: 100,
                ease: 'Linear',
                repeat: -1,
                yoyo: true,
                paused: true // Dejar el tween en pausa inicialmente
            });
            blinkTween2.play()
              this.time.delayedCall(500, () => {
                player.stop=false;

            }, [], this);
            this.time.delayedCall(3000, () => {
                this.playerController.defeat=false;
                // player.stop=false;
                this.playerController.matterSprite.anims.play('run', true);
                blinkTween3.play()
                blinkTween2.stop()

            }, [], this);

        }
        this.jumpPlayer(time,player); // Mover jugador hacia la izquierda

        // this.time.delayedCall(300, () => {
        //     // enemy.direction.x = 1;
        //     // enemy.isAttacking=false;
        //     enemy.actionTimer = 0;
        // }, [], this);
        //

        // if( player.blocked.bottom
        //     // && !this.playerController.morte
        //     && !this.playerController.dash
        //     && !this.playerController.punch
        //     && !this.playerController.morte
        //     && !this.playerController.ball
        //     // && !this.playerController.punch
        //     // && !this.playerController.run
        //     // && !this.playerController.climb
        //     // && (player.blocked.right ||  plrrayer.blocked.left)
        //     && (!this.cursors.left.isDown &&  !this.cursors.right.isDown)
        //     // && !this.playerController.stick
        // ){
        //     this.playerController.matterSprite.setFrame(4);
        //     this.playerController.matterSprite.anims.stop('run');
        //     // player.stop=true;
        // }
        //
        if(!player.stop){
            if(
                player.blocked.bottom
                // && (!player.blocked.right &&  !player.blocked.left)
                && !this.playerController.punch
                && !this.playerController.dash
                && !this.playerController.morte
                && !this.playerController.ball
                && (this.cursors.left.isDown ||  this.cursors.right.isDown)
                // && !this.playerController.stick
            ){
                this.playerController.matterSprite.anims.play('run', true);
            }


            if(
                player.blocked.bottom
                // && (!player.blocked.right &&  !player.blocked.left)
                && this.playerController.morte
                && !this.playerController.ball
                && (this.cursors.left.isDown ||  this.cursors.right.isDown)
                // && !this.playerController.stick
            ){
                this.playerController.matterSprite.anims.play('morte', true);
            }

            this.movePlayerDirection(delta,player); // Mover jugador hacia la izquierda
            this.mortePlayer(time,delta,player); // Mover jugador hacia la izquierda
            if(!player.morte && !player.stick){
                this.punchPlayer(time,player); // Mover jugador hacia la izquierda
                this.dashPlayer(time,delta,player); // Mover jugador hacia la izquierda
                // this.ballPlayer(time,delta,player); // Mover jugador hacia la izquierda
                this.stickWallPlayer(time,player); // Mover jugador hacia la izquierda
            }
        }

        //
        // if (
        //     this.cursors.down.isDown
        //     && !this.playerController.morte
        //     && this.playerController.blocked.bottom
        //     // && player.actionTimer >= player.actionDuration
        // ) {
        //     const newHeight = this.playerController.matterSprite.height * 0.5; // Reducir el alto al 75%
        //     const currentBody = this.playerController.matterSprite.body;
        //     const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
        //     const newBodyHeight = newHeight * 1.5;
        //     M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);
        //
        //     // Actualizar la posición visual del sprite
        //     // const newPositionY = this.playerController.matterSprite.y - (newHeight - this.playerController.matterSprite.height) / 2;
        //     // this.playerController.matterSprite.y = newPositionY-20;
        //     // this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);
        //     // this.playerController.matterSprite.setBounce(0)
        //     // Actualizar el tamaño del sprite
        //     // Marcar que la acción de escalar se ha realizado
        //     // this.playerController.morte = true;
        //     this.playerController.matterSprite.anims.play('morte', true);
        // }
        // // if (
        // //     this.cursors.down.isUp
        // //     && this.playerController.morte
        // // ) {
        // //     this.playerController.morte = true;
        // //
        // // }
        // if (
        //     this.playerController.morte
        // ) {
        //     player.actionDuration=0;
        //     // Modificar el alto del sprite
        //     // Modificar el alto del sprite
        //     const newHeight = this.playerController.matterSprite.height ; // Reducir el alto al 75%
        //     // Modificar el alto del cuerpo físico
        //     const currentBody = this.playerController.matterSprite.body;
        //     const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
        //     const newBodyHeight = newHeight * 1.5;
        //     // Calcular la nueva posición Y del cuerpo físico
        //     // const newPositionY = currentBody.position.y + (currentHeight - newBodyHeight) / 2;
        //     // Escalar el cuerpo físico
        //     M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);
        //     // Actualizar la posición Y del cuerpo físico
        //     // M.Body.setPosition(currentBody, { x: currentBody.position.x+1, y: newPositionY });
        //     // Actualizar el tamaño del sprite
        //     // this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);
        //     // Marcar que la acción de escalar se ha realizado
        //     this.playerController.morte = false;
        //     // this.playerController.matterSprite.anims.play('SHit', true);
        //     if (this.playerController.blocked.bottom)
        //     {
        //         // this.playerController.matterSprite.anims.play('run', true);
        //
        //     }else {
        //         // this.playerController.matterSprite.anims.play('jump', true);
        //     }
        // }
        this.smoothMoveCameraTowards(matterSprite, 0.9);
    }
    // Función para cambiar la forma del jugador a circular
    changeToBall(player) {
        const M = Phaser.Physics.Matter.Matter;
        const w = this.playerController.matterSprite.width *1.7;
        const h = this.playerController.matterSprite.height *1.7;
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
        let circleRadius = Math.min(sx, sy) / 2;
        // let playerBody = M.Bodies.circle(w, h, circleRadius, { chamfer: { radius: 10 } });
        // Actualizar la posición de los sensores
        let playerBody = M.Bodies.circle(sx, sy * 1.1, circleRadius, { chamfer: { radius: 10 } });

        this.playerController.sensors.bottom = M.Bodies.rectangle(sx, sy + circleRadius, sx * 0.5, 5, { isSensor: true });
        this.playerController.sensors.left = M.Bodies.rectangle(sx - circleRadius, sy, 5, sy * 0.5, { isSensor: true });
        this.playerController.sensors.right = M.Bodies.rectangle(sx + circleRadius, sy, 5, sy * 0.5, { isSensor: true });
        this.playerController.sensors.up = M.Bodies.rectangle(sx, sy - circleRadius, sx * 0.5, 5, { isSensor: true });

        let compoundBody = M.Body.create({
            parts: [
                playerBody,
                this.playerController.sensors.up,
                this.playerController.sensors.bottom,
                this.playerController.sensors.left,
                this.playerController.sensors.right
            ],
            friction: 0,
            restitution: 0.05 // Prevent body from sticking against a wall
        });


        const newHeight = this.playerController.matterSprite.height; // Reducir el alto al 75%
        const currentBody = this.playerController.matterSprite.body;
        const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
        const newBodyHeight = newHeight ;

// Escalar el cuerpo físico
        M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);

// Calcular la diferencia de altura para ajustar la posición vertical
        const heightDifference = currentHeight - newBodyHeight;

// Ajustar la posición vertical para mantener al jugador en el suelo
        const newPositionY = currentBody.position.y + heightDifference / 2;

// Establecer el cuerpo físico y ajustar la posición vertical
        this.playerController.matterSprite
            // .setExistingBody(currentBody)
            .setExistingBody(compoundBody)

            .setFixedRotation() // Evita que el jugador gire
            .setPosition(currentBody.position.x, newPositionY);
    }
    changeToNormal(player) {
        const M = Phaser.Physics.Matter.Matter;
        const w = this.playerController.matterSprite.width *1.7;
        const h = this.playerController.matterSprite.height *1.7;

        let sx = w / 2;
        let sy = h / 2;

        let playerBody = M.Bodies.rectangle(sx, sy * 1.1, w * 0.5, h/1.1, {chamfer: {radius: 10}});
        this.playerController.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, {isSensor: true});
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
            friction: 0.01,
            restitution: 0.05 // Prevent body from sticking against a wall
        });


        const newHeight = this.playerController.matterSprite.height ; // Reducir el alto al 75%
        // Modificar el alto del cuerpo físico
        const currentBody = this.playerController.matterSprite.body;
        const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
        const newBodyHeight = newHeight * 1.5;
        // Calcular la nueva posición Y del cuerpo físico
        // const newPositionY = currentBody.position.y + (currentHeight - newBodyHeight) / 2;
        // Escalar el cuerpo físico
        M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);
        // this.playerController.matterSprite
        //         .setPosition(currentBody.position.x,currentBody.position.y)
        //     .setExistingBody(currentBody).setRectangle(this.playerController.matterSprite.width, this.playerController.matterSprite.height)
        this.playerController.matterSprite
            .setExistingBody(compoundBody)
            .setFixedRotation() // Sets max inertia to prevent rotation
            .setPosition(currentBody.position.x,currentBody.position.y)

    }
    mortePlayer(time,delta,player) {
        const M = Phaser.Physics.Matter.Matter;
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;
        const isDirectionPositive = (player.direction.x === 1) ? true : false;

        let isCircular = false;
        const w = player.matterSprite.width * 1.5;
        const h = player.matterSprite.height * 1.5;
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

// Crear el jugador cuadrado inicialmente
        playerBody = M.Bodies.rectangle(1, w * 0.5, h / 1.1, { chamfer: { radius: 10 } });

        if( this.cursors.down.isDown && this.playerController.ball && this.playerController.morte){
            this.playerController.matterSprite.anims.play('ball', true);
            // this.smoothedControls.moveRight(delta);
            // if (
            //     !isDirectionPositive
            // ) {
            //     oldVelocityX = player.matterSprite.body.velocity.x;
            //     targetVelocityX = -this.playerController.speed.step;
            //     newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);
            //     player.matterSprite.setVelocityX(newVelocityX);
            //     this.smoothedControls.moveLeft(delta);
            //     this.parallaxBg(this.playerController.direction.x);
            // } else if (
            //     isDirectionPositive
            // ) {
            //     oldVelocityX = player.matterSprite.body.velocity.x;
            //     targetVelocityX = this.playerController.speed.step;
            //     newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
            //     player.matterSprite.setVelocityX(newVelocityX);
            //     this.smoothedControls.moveRight(delta);
            //     this.parallaxBg(this.playerController.direction.x);
            // }
        }

        if (
            this.playerController.blocked.bottom &&
            this.cursors.down.isDown
            && this.playerController.ball
            && !this.playerController.morte ){
            this.changeToBall(player);
            // this.playerController.morte=true;
        }
        this.input.keyboard.on('keyup', function (event) {
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) {
                if(
                    !player.ball &&
                    this.playerController.blocked.bottom

                ){
                    player.ball=false;
                    player.morte=false;
                    this.changeToNormal(player)
                }

            }
        }, this);
        if (
            this.cursors.down.isDown
            && !this.playerController.morte
            // && !this.playerController.ball
            && this.playerController.blocked.bottom
            // && player.actionTimer >= player.actionDuration
        ) {
            const newHeight = this.playerController.matterSprite.height * 0.5; // Reducir el alto al 75%
            const currentBody = this.playerController.matterSprite.body;
            const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
            const newBodyHeight = newHeight * 1.5;

// Escalar el cuerpo físico
            M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);

// Establecer el cuerpo físico y ajustar la posición vertical
            this.playerController.matterSprite
                .setExistingBody(currentBody)
                .setPosition(this.playerController.matterSprite.x, this.playerController.matterSprite.y + (currentHeight - newBodyHeight) / 2);

            this.playerController.morte = true;
            this.playerController.matterSprite.anims.play('morte', true);

            this.input.keyboard.on('keyup', function (event) {
                // Verifica si la tecla liberada es la tecla 'R'
                if (event.keyCode === this.keyD.keyCode) {
                    // Haz algo cuando la tecla 'R' sea liberada
                    // this.playerController.matterSprite.anims.play('start_ball', true);
                    this.smoothedControls.reset();
                    player.ball=false;
                    player.morte=false;
                    this.changeToNormal(player)
                }
            }, this);

            // this.playerController.matterSprite
            //     .setExistingBody(currentBody)
            //     .setPosition(currentBody.position.x,currentBody.position.y)
            //     .setCircle(20)
            //     .setPosition(currentBody.position.x,currentBody.position.y)
            //     .setCircle(20)
            // Actualizar la posición visual del sprite
            // const newPositionY = this.playerController.matterSprite.y - (newHeight - this.playerController.matterSprite.height) / 2;
            // this.playerController.matterSprite.y = newPositionY-20;
            // this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);
            // this.playerController.matterSprite.setBounce(0)
            // Actualizar el tamaño del sprite
            // Marcar que la acción de escalar se ha realizado
        }

        if (
            this.cursors.down.isUp
            && this.playerController.morte
            && this.playerController.ball
        ) {
            player.actionDuration=0;
            this.changeToNormal(player)
            // // Modificar el alto del sprite
            // // Modificar el alto del sprite
            // const newHeight = this.playerController.matterSprite.height ; // Reducir el alto al 75%
            // // Modificar el alto del cuerpo físico
            // const currentBody = this.playerController.matterSprite.body;
            // const currentHeight = currentBody.bounds.max.y - currentBody.bounds.min.y;
            // const newBodyHeight = newHeight * 1.5;
            // // Calcular la nueva posición Y del cuerpo físico
            // // const newPositionY = currentBody.position.y + (currentHeight - newBodyHeight) / 2;
            // // Escalar el cuerpo físico
            // M.Body.scale(currentBody, 1, newBodyHeight / currentHeight);
            // // this.playerController.matterSprite
            // //         .setPosition(currentBody.position.x,currentBody.position.y)
            // //     .setExistingBody(currentBody).setRectangle(this.playerController.matterSprite.width, this.playerController.matterSprite.height)
            // // this.playerController.matterSprite
            // //     .setExistingBody(currentBody)
            // //     .setCircle(20)
            // //     .setPosition(currentBody.position.x,currentBody.position.y)
            // //     .setCircle(20)
            // // Actualizar la posición Y del cuerpo físico
            // // M.Body.setPosition(currentBody, { x: currentBody.position.x+1, y: newPositionY });
            // // Actualizar el tamaño del sprite
            // // this.playerController.matterSprite.setSize(this.playerController.matterSprite.width, newHeight);
            // // Marcar que la acción de escalar se ha realizado
            this.playerController.morte = false;
            // this.playerController.matterSprite.anims.play('SHit', true);
            if (this.playerController.blocked.bottom)
            {
                // this.playerController.matterSprite.anims.play('run', true);

            }else {
                // this.playerController.matterSprite.anims.play('jump', true);
            }
        }
    }
    ballPlayer(time,delta,player) {
        //  let oldVelocityX;
        //  let targetVelocityX;
        //  let newVelocityX;
        //  const isDirectionPositive = (player.direction.x === 1) ? true : false;
        //
        // //ball
        //  if (this.keyD.isDown){
        //      this.playerController.run=true;
        //      this.playerController.ball=true;
        //      this.playerController.matterSprite.anims.play('ball', true);
        //      player.actionTimer = 0;
        //      player.actionDuration=1000;
        //
        //      // this.smoothedControls.moveRight(delta);
        //      if (
        //          !isDirectionPositive
        //      ) {
        //          oldVelocityX = player.matterSprite.body.velocity.x;
        //          targetVelocityX = -this.playerController.speed.step;
        //          newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);
        //          player.matterSprite.setVelocityX(newVelocityX);
        //          this.smoothedControls.moveLeft(delta);
        //          this.parallaxBg(this.playerController.direction.x);
        //      } else if (
        //          isDirectionPositive
        //      ) {
        //          oldVelocityX = player.matterSprite.body.velocity.x;
        //          targetVelocityX = this.playerController.speed.step;
        //          newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
        //          player.matterSprite.setVelocityX(newVelocityX);
        //          this.smoothedControls.moveRight(delta);
        //          this.parallaxBg(this.playerController.direction.x);
        //      }
        //  }
        //  this.input.keyboard.on('keyup', function (event) {
        //      // Verifica si la tecla liberada es la tecla 'R'
        //      if (event.keyCode === this.keyD.keyCode) {
        //          // Haz algo cuando la tecla 'R' sea liberada
        //          // this.playerController.matterSprite.anims.play('start_ball', true);
        //          this.smoothedControls.reset();
        //          player.ball=false;
        //
        //      }
        //  }, this);
    }
    dashPlayer(time,delta,player) {
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;
        const isDirectionPositive = (player.direction.x === 1) ? true : false;


        if (this.keyR.isDown){
            this.playerController.punch=false;
            this.playerController.matterSprite.anims.play('dash', true);
            player.actionTimer = 0;
            player.actionDuration=1000;
            this.playerController.dash=true;
            // this.smoothedControls.moveRight(delta);
            if (
                !isDirectionPositive
            ) {
                oldVelocityX = player.matterSprite.body.velocity.x;
                targetVelocityX = -this.playerController.speed.run;
                newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);
                player.matterSprite.setVelocityX(newVelocityX);
                this.smoothedControls.moveLeft(delta);
                this.parallaxBg(this.playerController.direction.x);
            } else if (
                isDirectionPositive
            ) {
                oldVelocityX = player.matterSprite.body.velocity.x;
                targetVelocityX = this.playerController.speed.run;
                newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
                player.matterSprite.setVelocityX(newVelocityX);
                this.smoothedControls.moveRight(delta);
                this.parallaxBg(this.playerController.direction.x);
            }
        }
        // else if(this.keyR.isUp){
        //     this.playerController.matterSprite.anims.play('ground_pound', true);
        //     this.smoothedControls.reset();
        //
        // }

        this.input.keyboard.on('keyup', function (event) {
            // Verifica si la tecla liberada es la tecla 'R'
            if (event.keyCode === this.keyR.keyCode) {
                // Haz algo cuando la tecla 'R' sea liberada
                // this.playerController.matterSprite.anims.play('run_stop', true);
                player.dash=false;
                this.smoothedControls.reset();
            }
        }, this);



    }
    punchPlayer(time,player) {
        // let timeAnimation
        // player.actionTimer += delta;
        // let timeAnimation+= delta;
        let durationAnimation=1000;
        //dash
        if(this.playerController.punch
            && !this.playerController.ball
            && !this.playerController.dash){
            const dashDistance = 4; // Ajusta según sea necesario
            this.playerController.matterSprite.x += dashDistance * this.playerController.direction.x;
            this.smoothedControls.reset();
            this.playerController.matterSprite.anims.play('punch', true);
            this.playerController.punch=true;

        }
        if (this.keyS.isDown
            && !this.playerController.ball
            && !this.playerController.punch
            && !this.playerController.blocked.left
            && !this.playerController.blocked.right
            && this.playerController.blocked.bottom
            && (!this.cursors.left.isDown || !this.cursors.right.isDown)
        ){
            this.playerController.punch=true;
            player.actionTimer = 0;
            player.actionDuration=1000;
            player.matterSprite.setVelocityY(-this.playerController.speed.jump/2.5);
        }
        if(this.playerController.punch && player.actionTimer >= player.actionDuration ){
            this.playerController.punch=false;
        }
    }
    stickWallPlayer(time,player) {
        if (this.playerController.stick ||
            (this.playerController.blocked.bottom &&
                !this.playerController.blocked.left &&
                !this.playerController.blocked.right)) {
            this.playerController.matterSprite.setFriction(0.05).setBounce(0);
        } else {
            this.playerController.matterSprite.setFriction(0).setBounce(0);
        }
    }
    jumpPlayer(time,player) {

        const canJump = (time - this.playerController.lastJumpedAt) > 250;

        if (this.cursors.up.isDown) {
            player.jumpSpeed += 4; // Ajusta el incremento de velocidad según sea necesario

            if (this.playerController.blocked.left && player.stick)
            {
                // Jump up and away from the wall
                player.matterSprite.setVelocityY(-this.playerController.speed.jump/1);
                player.matterSprite.setVelocityX(this.playerController.speed.run*1.5);
                this.playerController.lastJumpedAt = time;
                player.jumpSpeed = 0;
            }
            else if (this.playerController.blocked.right && player.stick)
            {
                // Jump up and away from the wall
                player.matterSprite.setVelocityY(-this.playerController.speed.jump/1);
                player.matterSprite.setVelocityX(-this.playerController.speed.run*1.5);
                this.playerController.lastJumpedAt = time;
                player.jumpSpeed = 0;
            }
        }
        if (this.cursors.up.isDown && player.jumpSpeed >=player.speed.jump)
        {
            player.jumpSpeed =player.speed.jump
        }
        if(!this.playerController.blocked.bottom && !player.morte){
            player.jumpSpeed = 0;
            if(!player.punch
                && !player.jump
                && !player.morte
                && !player.defeat
            ){
                this.playerController.matterSprite.anims.play('jump', true);
            }
            player.jump=true;
        }else {
            player.jump=false;
        }

        this.input.keyboard.on('keyup', function (event) {
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP) {
                if (player.blocked.bottom ){
                    player.matterSprite.setVelocityY(-player.jumpSpeed);
                }
                if(!player.punch
                    && !player.jump
                    && !player.morte
                ){
                    this.playerController.matterSprite.anims.play('jump', true);
                    this.playerController.matterSprite.anims.play('jump', true);
                    player.stop=false;
                }
            }
        }, this);
        /*
           if (this.cursors.up.isDown && canJump)
        {
            player.jump=true;
            player.jumpSpeed += 0.1; // Ajusta el incremento de velocidad según sea necesario
            if(player.jumpSpeed >=player.speed.jump && !player.jump){
                player.jumpSpeed = 0;
            }
            player.matterSprite.setVelocityY(-player.jumpSpeed);
            if (this.playerController.blocked.bottom)
            {
                player.jump=false;
                this.playerController.lastJumpedAt = time;
                // Restablecer la velocidad de salto
                // player.jumpSpeed = 0;

            }
           if (this.playerController.blocked.left && player.stick)
            {
                // Jump up and away from the wall
                player.matterSprite.setVelocityY(-this.playerController.speed.jump/1);
                player.matterSprite.setVelocityX(this.playerController.speed.run*1.5);
                this.playerController.lastJumpedAt = time;
            }
            else if (this.playerController.blocked.right && player.stick)
            {
                // Jump up and away from the wall
                player.matterSprite.setVelocityY(-this.playerController.speed.jump/1);
                player.matterSprite.setVelocityX(-this.playerController.speed.run*1.5);
                this.playerController.lastJumpedAt = time;
            }
        }
         */
    }
    movePlayerDirection(delta,player) {
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;
        if (this.cursors.left.isDown && !this.playerController.blocked.left)
        {
            this.playerController.matterSprite.setFlipX(true);
            this.smoothedControls.moveLeft(delta);
            // player.matterSprite.anims.play('run', true);
            this.playerController.direction.x = -1;
            oldVelocityX = player.matterSprite.body.velocity.x;
            targetVelocityX = -this.playerController.speed.step;
            // this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);
            player.matterSprite.setVelocityX(newVelocityX);
            this.parallaxBg(this.playerController.direction.x);

        }
        else if (this.cursors.right.isDown && !this.playerController.blocked.right)
        {
            this.playerController.matterSprite.setFlipX(false);
            this.smoothedControls.moveRight(delta);
            // player.matterSprite.anims.play('run', true);
            this.playerController.direction.x = 1;
            oldVelocityX = player.matterSprite.body.velocity.x;
            targetVelocityX = this.playerController.speed.step;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);
            player.matterSprite.setVelocityX(newVelocityX);
            this.parallaxBg(this.playerController.direction.x);
        }
        else
        {
            // this.smoothedControls.reset();
            // player.matterSprite.anims.play('run_stop', true);
            this.stopPlayer(player)
        }
    }
    stopPlayer(player) {
        this.input.keyboard.on('keyup', function (event) {
            if (event.keyCode ===Phaser.Input.Keyboard.KeyCodes.LEFT
                || event.keyCode ===Phaser.Input.Keyboard.KeyCodes.RIGHT) {
                // this.playerController.matterSprite.anims.play('run_stop', true);
                this.smoothedControls.reset(); // Reiniciar controles suavizados
            }
        }, this);
        // this.smoothedControls.reset(); // Reiniciar controles suavizados
        // player.matterSprite.anims.play('run_stop', true); // Reproducir animación de detenerse
    }
    // Función para manejar colisiones durante el "dash"
    moveEnemies(time, delta){
        this.enemiesGroup.forEach(enemy => {
            enemy.actionTimer += delta;
            const isDirectionPositive = (enemy.direction.x === 1) ? true : false;
            // Verificar si el enemigo no está haciendo ninguna acción bloqueada
            if (
                !enemy.blocked.attack &&
                !enemy.blocked.left &&
                !enemy.fliped &&
                !enemy.blocked.right &&
                !enemy.blocked.up &&
                !enemy.isAttacking &&
                enemy.actionTimer >= enemy.actionDuration
            ) {
                enemy.matterSprite.anims.play('run_enemi', true);
                // enemy.actionDuration = 100;
            }
            else
            {
                if (
                    enemy.blocked.left
                    // !enemy.blocked.attack
                ) {
                    enemy.direction.x = 1;
                } else if (
                    enemy.blocked.right
                    // !enemy.blocked.attack
                ) {
                    enemy.direction.x = -1;
                }
                if(enemy.fliped){
                    enemy.matterSprite.anims.play('flip_enemi', true);
                }
                if(enemy.isAttacking){
                    enemy.matterSprite.anims.play('dash_enemi', true);
                }else
                if (
                    enemy.blocked.attack &&
                    enemy.matterSprite.x > this.playerController.matterSprite.x &&
                    !isDirectionPositive) {
                    // enemy.matterSprite.anims.play('dash_enemi', true);
                    enemy.actionDuration = 500;
                    this.enemiHitPlayer(this.playerController.matterSprite,enemy);
                    this.playerController.matterSprite.anims.play('defeat', true);
                    this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
                    this.playerController.matterSprite.setVelocityY(-4);
                    this.playerController.defeat=true;
                    enemy.isAttacking=true;
                    this.time.delayedCall(300, () => {
                        enemy.direction.x = 1;
                        enemy.isAttacking=false;
                        enemy.actionTimer = 0;
                    }, [], this);
                    this.time.delayedCall(2000, () => {
                        this.playerController.defeat=false;
                    }, [], this);

                    //     // this.playerController.matterSprite.setBounce(1.5); // Un valor entre 0 y 1, donde 1 es un rebote completo
                    //     this.time.delayedCall(500, () => {
                    //         // this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
                    //         // this.playerController.matterSprite.setVelocityY(-1.2);
                    //         // this.playerController.matterSprite.setBounce(0)
                    //         enemy.direction.x = 1;
                    //         this.playerController.matterSprite.anims.play('run', true);
                    //         enemy.actionTimer = 0;
                    //     }, [], this);
                }else if (
                    enemy.blocked.attack &&
                    enemy.matterSprite.x<this.playerController.matterSprite.x &&
                    isDirectionPositive) {
                    // enemy.matterSprite.anims.play('dash_enemi', true);
                    enemy.actionDuration = 500;
                    this.enemiHitPlayer(this.playerController.matterSprite,enemy);
                    this.playerController.matterSprite.anims.play('defeat', true);
                    this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
                    this.playerController.matterSprite.setVelocityY(-4);
                    this.playerController.defeat=true;

                    enemy.isAttacking=true;
                    this.time.delayedCall(300, () => {
                        enemy.direction.x = -1;
                        enemy.isAttacking=false;
                        enemy.actionTimer = 0;
                    }, [], this);
                    this.time.delayedCall(2000, () => {
                        this.playerController.defeat=false;
                    }, [], this);
                    //     // this.playerController.matterSprite.setBounce(1.5); // Un valor entre 0 y 1, donde 1 es un rebote completo
                    //     this.time.delayedCall(500, () => {
                    //         // this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
                    //         // this.playerController.matterSprite.setVelocityY(-1.2);
                    //         // this.playerController.matterSprite.setBounce(0)
                    //         enemy.direction.x = 1;
                    //         this.playerController.matterSprite.anims.play('run', true);
                    //         enemy.actionTimer = 0;
                    //     }, [], this);

                }else
                if(enemy.blocked.up){
                    if (enemy.lives===0){
                        this.killEnemi(enemy);
                    }else{
                        this.playerController.matterSprite.setVelocityX(-this.MAX_SPEED*2);
                        this.playerController.matterSprite.setVelocityY(-this.MAX_SPEED*2);
                        this.playerController.matterSprite.setFlipX(true);
                        // enemy.matterSprite.anims.play('flip_enemi', true);
                        enemy.fliped=true;
                        enemy.actionDuration =100;
                        // enemy.actionTimer = 0;
                        this.playerController.matterSprite.setVelocityX(0);

                        this.time.delayedCall(1200, () => {
                            // this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
                            // this.playerController.matterSprite.setVelocityY(-1.2);
                            // this.playerController.matterSprite.setBounce(0)
                            // enemy.matterSprite.anims.play('flip_enemi', true);
                            enemy.fliped=false;
                            enemy.actionTimer = 0;
                        }, [], this);

                        // Establecer un temporizador para volver a la animación "step" después de 2 segundos
                        enemy.lives--;
                    }
                }

            }
            // else
            if(
                !enemy.isAttacking &&
                !enemy.fliped &&
                enemy.actionTimer >= enemy.actionDuration){
                // Reproducir la animación de carrera y ajustar la velocidad y orientación del sprite
                // enemy.matterSprite.anims.play('run_enemi', true);

                const velocityX = this.NORMAL_SPEED * enemy.direction.x;
                enemy.matterSprite.setVelocityX(velocityX);

                // Voltear el sprite horizontalmente según la dirección
                if (enemy.direction.x === 1) {
                    enemy.matterSprite.setFlipX(false); // No voltear
                } else {
                    enemy.matterSprite.setFlipX(true); // Voltear horizontalmente
                }
            }


        });
    }
    moveEnemies2(time, delta) {
        this.enemiesBuGroup.forEach(enemy => {
            enemy.actionTimer += delta;
            let player=this.playerController;
            const distance = Phaser.Math.Distance.Between(
                this.playerController.matterSprite.x,
                this.playerController.matterSprite.y,
                enemy.matterSprite.x, enemy.matterSprite.y);
            const visionRange = 100; // Definir el rango de visión deseado
            const inVisionRange = distance < visionRange;

            const playerPosition = this.playerController.matterSprite.getCenter();
            const directionToPlayer = Phaser.Math.Angle.BetweenPoints(enemy.matterSprite.getCenter(), playerPosition);
            // Introducir una variación más pronunciada en la dirección para cada enemigo
            const variation = Phaser.Math.FloatBetween(1, 1); // Ajusta el rango de variación según sea necesario
            const modifiedDirection = directionToPlayer + (variation * Math.PI / 180); // Convertir a radianes
            // Calcular la dirección x e y basada en la dirección modificada
            const directionX = Math.cos(modifiedDirection);
            const directionY = Math.sin(modifiedDirection);
            const isDirectionPositive = (this.playerController.direction.x === 1) ? true : false;
            //anims
            const duration = 1000; // Duración de cada parpadeo en milisegundos
            const alphaValues = [1, 0.4]; // Valores de alfa para el parpadeo
            const alphaValues2 = [0.4, 1]; // Valores de alfa para el parpadeo
            const blinkTween = this.tweens.add({
                targets: enemy.matterSprite,
                alpha: alphaValues,
                duration: duration,
                ease: 'Linear',
                paused: true // Dejar el tween en pausa inicialmente
            });
            const blinkTween2 = this.tweens.add({
                targets: enemy.matterSprite,
                alpha: alphaValues2,
                duration: 400,
                ease: 'Linear',
                paused: true // Dejar el tween en pausa inicialmente
            });
            const blinkTween3 = this.tweens.add({
                targets: enemy.matterSprite,
                alpha: alphaValues2,
                duration: 300,
                ease: 'Linear',
                repeat: -1,
                // yoyo: true,
                paused: true // Dejar el tween en pausa inicialmente
            });

            if (100 > distance && !player.defeat) {
                enemy.matterSprite.setCollisionCategory(1); // Activa las colisiones con todas las categorías
                enemy.matterSprite.setCollidesWith([-1]);
                // enemy.matterSprite.anims.play('dash_bu_enemi', true);
            }else {
                // enemy.matterSprite.setCollisionCategory(0);
                // enemy.matterSprite.setCollidesWith(0);
            }
            if ( enemy.blocked.attack && !player.defeat ) {
                // enemy.matterSprite.anims.play('dash_enemi', true);
                enemy.actionDuration = 500;
                // enemy.matterSprite.anims.play('dash_bu_enemi', true);
                this.playerController.matterSprite.setVelocityX(0);
                this.playerController.matterSprite.setVelocityY(0);
                this.playerController.defeat=true;
                this.playerController.stop=true;
                // enemy.isAttacking=true;
                // enemy.isAttacking=true;
                enemy.matterSprite.anims.play('flip_bu_enemi', true);
                blinkTween2.play()
                this.time.delayedCall(2000, () => {
                    blinkTween3.stop();
                    blinkTween2.play();
                    enemy.matterSprite.setPosition(
                        enemy.respawn.x,
                        enemy.respawn.y,
                    );
                    // enemy.matterSprite.anims.play('run_bu_enemi', true);
                }, [], this);
            }else
            if (enemy.visionRectangle) {
                // Actualizar la visibilidad y posición del rectángulo de visión
                // enemy.visionRectangle.setVisible(inVisionRange);
                // enemy.visionRectangle.setPosition(enemy.matterSprite.x, enemy.matterSprite.y);

                if (distance < visionRange ) {
                    // El jugador está dentro del rango de ataque
                    enemy.attack = true;
                    if (!enemy.isAttacking) {
                        // El enemigo no está actualmente atacando, así que comienza la animación de ataque
                        // enemy.matterSprite.anims.play('dash_bu_enemi', true);
                        enemy.matterSprite.setCollisionCategory(0);
                        enemy.matterSprite.setCollidesWith(0);

                        blinkTween3.play();
                        enemy.isAttacking = true;
                        this.time.delayedCall(1000, () => {
                            if (!enemy.blocked.attack && !player.defeat){
                                // Detener la animación de ataque y cambiar a la animación de caminar
                                enemy.matterSprite.anims.play('dash_bu_enemi', true);
                            var randomYOffset = Math.random() * 100 - 30;
                            var randomYOffset2 = Math.random() * 2 - 1;
                            blinkTween3.stop();
                            blinkTween2.play();
                            // Genera un número aleatorio entre 0 y 2
                            var randomIndex = Math.floor(Math.random() * 2);
                            // Define los posibles valores: -30, 10, 30
                            // var possibleValues = [-45, -10,45];
                            var possibleValues = [-50, 0,];
                            // Selecciona el valor según el índice aleatorio generado
                            var randomYOffset3 = possibleValues[randomIndex];
                            if (enemy.matterSprite.x > this.playerController.matterSprite.x) {
                                enemy.matterSprite.setPosition(
                                    this.playerController.matterSprite.x - visionRange - 60,
                                    this.playerController.matterSprite.y + randomYOffset3
                                );
                                enemy.matterSprite.setVelocity(3, 0);
                                enemy.direction.x = 1;
                                // enemy.matterSprite.setVelocity(4, randomYOffset2);
                            } else {
                                enemy.matterSprite.setPosition(
                                    this.playerController.matterSprite.x + visionRange + 60,
                                    this.playerController.matterSprite.y + randomYOffset3
                                );
                                enemy.matterSprite.setVelocity(-3, 0);
                                // enemy.matterSprite.setVelocity(-4, randomYOffset2);
                                enemy.direction.x = -1;
                            }
                            enemy.matterSprite.setFlipX(enemy.direction.x < 0); // Voltear si va hacia la izquierda
                        }
                        }, [], this);



                        // Establece un temporizador para detener la animación de ataque después de cierto tiempo
                        this.time.delayedCall(3000, () => {
                            // Detener la animación de ataque y cambiar a la animación de caminar
                            enemy.isAttacking = false;
                            // enemy.matterSprite.setVelocity(0, 0);
                            enemy.attack = false;

                            // enemy.matterSprite.anims.play('run_bu_enemi', true);
                        }, [], this);
                    }
                }


                if(!enemy.attack){
                    // enemy.attack = false;
                    if (
                        (isDirectionPositive && enemy.matterSprite.x > this.playerController.matterSprite.x) ||
                        (!isDirectionPositive && enemy.matterSprite.x < this.playerController.matterSprite.x)
                    ) {
                        enemy.matterSprite.setVelocity(0, 0);
                        blinkTween2.play();
                        enemy.matterSprite.setFrame(22);

                    }else {
                        // if (distanceToPlayer < 100) {
                        //     // enemy.matterSprite.setCollisionCategory(1); // Activa las colisiones con todas las categorías
                        //     // enemy.matterSprite.setCollidesWith([-1]);
                        //     // enemy.matterSprite.anims.play('dash_bu_enemi', true);
                        //
                        // }else {
                        if (!enemy.through_wall ) {
                            enemy.matterSprite.anims.play('run_bu_enemi', true);

                            enemy.matterSprite.setCollisionCategory(0);
                            enemy.matterSprite.setCollidesWith(0);
                            const velocityX = 5 * directionX;
                            const velocityY = 5 * directionY;
                            enemy.matterSprite.setVelocity(velocityX, velocityY);
                            enemy.matterSprite.setFlipX(this.playerController.direction.x < 0); // Voltear si va hacia la izquierda
                            enemy.through_wall=true;
                            blinkTween2.play();

                            // enemy.matterSprite.setVisible(true);
                            this.time.delayedCall(3000, () => {
                                enemy.through_wall=false;
                                // enemy.matterSprite.setVisible(false);
                                // enemy.matterSprite.setCollisionCategory(1); // Activa las colisiones con todas las categorías
                                // enemy.matterSprite.setCollidesWith([-1]);
                            }, [], this);
                            this.time.delayedCall(1000, () => {
                                blinkTween.play();
                            }, [], this);
                            this.time.delayedCall(1000, () => {
                                if(enemy.blocked.attack && !player.defeat){
                                    enemy.matterSprite.anims.play('look_bu_enemi', true);

                                }
                                // blinkTween.play();

                                enemy.matterSprite.setVelocity(0, 0);

                            }, [], this);
                        }
                        }
                        // }
                }
            }
            else {
                // Crear el rectángulo de visión si aún no existe
                enemy.visionRectangle = this.add.rectangle(
                    enemy.matterSprite.x,
                    enemy.matterSprite.y,
                    visionRange*2,
                    visionRange*2, // Reducir la altura a la mitad para representar el área de visión
                    0x00ff00, // Color verde para el área de visión
                    0.5 // Opacidad del rectángulo
                );
                enemy.visionRectangle.setStrokeStyle(2, 0x00ff00); // Color del borde verde
                enemy.visionRectangle.setOrigin(0.5); // Establecer el punto de origen en el centro
            }

        });
    }
    moveEnemies3(time, delta) {
        this.enemiesRockGroup.forEach(enemy => {
            enemy.actionTimer += delta;
            let player=this.playerController;
            const distance = Math.abs(this.playerController.matterSprite.x- enemy.matterSprite.x);

            // const verticalDistance = Math.abs(this.playerController.matterSprite.y - enemy.matterSprite.y);
            const visionRange = 100; // Definir el rango de visión deseado
            // const inVisionRange = distance < visionRange;
// Calcular la distancia vertical entre los sprites del jugador y el enemigo
            const verticalDistance = Math.abs(this.playerController.matterSprite.x- enemy.matterSprite.x);
            console.log(verticalDistance)
// Calcular la distancia de detección basada en el doble de la altura vertical
            const detectionDistance = Math.sqrt(Math.pow(visionRange, 2) + Math.pow(verticalDistance * 2, 2));
            const inVisionRange = distance < detectionDistance;
            const playerPosition = this.playerController.matterSprite.getCenter();
            const directionToPlayer = Phaser.Math.Angle.BetweenPoints(enemy.matterSprite.getCenter(), playerPosition);
            // Introducir una variación más pronunciada en la dirección para cada enemigo
            const variation = Phaser.Math.FloatBetween(1, 1); // Ajusta el rango de variación según sea necesario
            const modifiedDirection = directionToPlayer + (variation * Math.PI / 180); // Convertir a radianes
            // Calcular la dirección x e y basada en la dirección modificada
            const directionX = Math.cos(modifiedDirection);
            const directionY = Math.sin(modifiedDirection);
            const isDirectionPositive = (this.playerController.direction.x === 1) ? true : false;
            //anims
            const duration = 1000; // Duración de cada parpadeo en milisegundos
            const alphaValues = [1, 0.4]; // Valores de alfa para el parpadeo
            const alphaValues2 = [0.4, 1]; // Valores de alfa para el parpadeo
            const blinkTween = this.tweens.add({
                targets: enemy.matterSprite,
                alpha: alphaValues,
                duration: duration,
                ease: 'Linear',
                paused: true // Dejar el tween en pausa inicialmente
            });
            const blinkTween2 = this.tweens.add({
                targets: enemy.matterSprite,
                alpha: alphaValues2,
                duration: 400,
                ease: 'Linear',
                paused: true // Dejar el tween en pausa inicialmente
            });
            const blinkTween3 = this.tweens.add({
                targets: enemy.matterSprite,
                alpha: alphaValues2,
                duration: 300,
                ease: 'Linear',
                repeat: -1,
                // yoyo: true,
                paused: true // Dejar el tween en pausa inicialmente
            });

            if (100 > distance && !player.defeat) {
                enemy.matterSprite.setCollisionCategory(1); // Activa las colisiones con todas las categorías
                enemy.matterSprite.setCollidesWith([-1]);
                // enemy.matterSprite.anims.play('dash_bu_enemi', true);
            }else {
                // enemy.matterSprite.setCollisionCategory(0);
                // enemy.matterSprite.setCollidesWith(0);
            }
            if ( !enemy.blocked.attack && !enemy.isAttacking) {
                // enemy.matterSprite.setVelocityY(0);
                enemy.matterSprite.setVelocity(0, -10);
            }
            if ( enemy.blocked.attack && !player.defeat ) {
                // enemy.matterSprite.anims.play('dash_enemi', true);
                enemy.actionDuration = 500;
                // enemy.matterSprite.anims.play('dash_bu_enemi', true);
                this.playerController.matterSprite.setVelocityX(4+this.MAX_SPEED * this.playerController.direction.x);
                this.playerController.matterSprite.setVelocityY(0);
                this.playerController.defeat=true;
                this.playerController.stop=true;
                // enemy.isAttacking=true;
                // enemy.isAttacking=true;
                blinkTween2.play()
                this.time.delayedCall(2000, () => {
                    blinkTween3.stop();
                    blinkTween2.play();
                    enemy.matterSprite.setPosition(
                        enemy.respawn.x,
                        enemy.respawn.y,
                    );
                    // enemy.matterSprite.anims.play('run_bu_enemi', true);
                }, [], this);
            }else
            if (enemy.visionRectangle) {
                // Actualizar la visibilidad y posición del rectángulo de visión
                enemy.visionRectangle.setVisible(distance < visionRange);
                enemy.visionRectangle.setPosition(enemy.matterSprite.x, enemy.matterSprite.y);

                if (distance < visionRange ) {
                    // El jugador está dentro del rango de ataque
                    enemy.attack = true;
                    if (!enemy.isAttacking) {
                        // El enemigo no está actualmente atacando, así que comienza la animación de ataque
                        // enemy.matterSprite.anims.play('dash_bu_enemi', true);
                        // enemy.matterSprite.setCollisionCategory(0);
                        // enemy.matterSprite.setCollidesWith(0);
                        enemy.matterSprite.anims.play('attack_rock_enemi', true);

                        blinkTween3.play();
                        enemy.isAttacking = true;
                        this.time.delayedCall(500, () => {
                            if (!enemy.blocked.attack && !player.defeat){
                                // Detener la animación de ataque y cambiar a la animación de caminar
                            var randomYOffset = Math.random() * 100 - 30;
                            var randomYOffset2 = Math.random() * 2 - 1;
                            blinkTween3.stop();
                            blinkTween2.play();
                            // Genera un número aleatorio entre 0 y 2
                            var randomIndex = Math.floor(Math.random() * 2);
                            // Define los posibles valores: -30, 10, 30
                            // var possibleValues = [-45, -10,45];
                            var possibleValues = [-50, 0,];
                            // Selecciona el valor según el índice aleatorio generado
                            var randomYOffset3 = possibleValues[randomIndex];
                            enemy.matterSprite.setVelocity(0, 10);
                        }
                        }, [], this);

                        this.time.delayedCall(2000, () => {
                            // Detener la animación de ataque y cambiar a la animación de caminar
                            // enemy.isAttacking = false;
                            // enemy.attack = false;
                            // enemy.matterSprite.anims.play('run_bu_enemi', true);
                            enemy.matterSprite.setVelocity(0, -10);

                        }, [], this);

                        // Establece un temporizador para detener la animación de ataque después de cierto tiempo
                        this.time.delayedCall(5000, () => {
                            // Detener la animación de ataque y cambiar a la animación de caminar
                            enemy.isAttacking = false;
                            enemy.attack = false;
                            // enemy.matterSprite.anims.play('run_bu_enemi', true);
                        }, [], this);
                    }
                }
                else {
                    // enemy.matterSprite.anims.play('idle_rock_enemi', true);
                            enemy.matterSprite.setFrame(5);
                }
            }
            else {
                // Crear el rectángulo de visión si aún no existe
                enemy.visionRectangle = this.add.rectangle(
                    enemy.matterSprite.x,
                    enemy.matterSprite.y,
                    visionRange,
                    visionRange*2, // Reducir la altura a la mitad para representar el área de visión
                    0x00ff00, // Color verde para el área de visión
                    0.5 // Opacidad del rectángulo
                );
                enemy.visionRectangle.setStrokeStyle(2, 0x00ff00); // Color del borde verde
                enemy.visionRectangle.setOrigin(0.5); // Establecer el punto de origen en el centro
            }

        });
    }
    moveEnemiBuDirection(time,delta,enemi){
        enemy.matterSprite.setCollisionCategory(0);
        enemy.matterSprite.setCollidesWith(0);
    }

// Función para hacer que el enemigo desaparezca con un efecto brillante
    disappearWithEffect2(enemy) {
        console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeee')
        // Implementa aquí el efecto de desaparición brillante
        // Por ejemplo, podrías hacer que el enemigo se desvanezca gradualmente o haga una animación brillante antes de desaparecer
        // enemy.setVisible(false);
        // enemy.setActive(false);
        // Aquí puedes agregar más lógica según tu efecto de desaparición

        // Crear el tween de parpadeo
        const blinkTween = this.tweens.add({
            targets: enemy.matterSprite,
            alpha: alphaValues,
            duration: duration,
            ease: 'Linear',
            // repeat: -1, // Repetir infinitamente
            yoyo: false // Revertir la animación al final
        });

        // Iniciar el tween
        blinkTween.stop();
    }
    disappearWithEffect(enemy) {
        console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeee')
        // Implementa aquí el efecto de desaparición brillante
        // Por ejemplo, podrías hacer que el enemigo se desvanezca gradualmente o haga una animación brillante antes de desaparecer
        // enemy.setVisible(false);
        // enemy.setActive(false);
        // Aquí puedes agregar más lógica según tu efecto de desaparición
        const duration = 1000; // Duración de cada parpadeo en milisegundos
        const alphaValues = [1, 0]; // Valores de alfa para el parpadeo

        // Crear el tween de parpadeo
        const blinkTween = this.tweens.add({
            targets: enemy.matterSprite,
            alpha: alphaValues,
            duration: duration,
            ease: 'Linear',
            // repeat: -1, // Repetir infinitamente
            yoyo: false // Revertir la animación al final
        });

        // Iniciar el tween
        blinkTween.play();
    }

    killedEnemi(bodyA,bodyB){
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
                    // rock.matterSprite.anims.play('run_enemi', true);
                    // Limpiar el intervalo después de ejecutar una vez
                    clearInterval(interval);
                }, 600); // 2000 milisegundos (2 segundos)
                rock.lives--;
            }

        }
    }
    enemyAttack(enemy, player) {
        const isDirectionPositive = (this.playerController.direction.x === 1) ? true : false;
        const distanceToPlayer = Phaser.Math.Distance.Between(enemy.matterSprite.x, enemy.matterSprite.y, this.playerController.matterSprite.x, this.playerController.matterSprite.y);

        // if (distanceToPlayer < 100) {
        //     enemy.matterSprite.setCollisionCategory(1); // Activa las colisiones con todas las categorías
        //     enemy.matterSprite.setCollidesWith([-1]);
        //     // enemy.matterSprite.anims.play('dash_bu_enemi', true);
        // }



        // if (
        //     enemy.blocked.attack &&
        //     // enemy.matterSprite.x > this.playerController.matterSprite.x &&
        //     !isDirectionPositive) {
        //     // enemy.matterSprite.anims.play('dash_enemi', true);
        //     enemy.actionDuration = 500;
        //
        //     this.playerController.matterSprite.anims.play('defeat', true);
        //     enemy.matterSprite.anims.play('dash_bu_enemi', true);
        //     this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
        //     this.playerController.matterSprite.setVelocityY(-4);
        //     this.playerController.defeat=true;
        //     enemy.isAttacking=true;
        //     this.time.delayedCall(300, () => {
        //         enemy.direction.x = 1;
        //         enemy.isAttacking=false;
        //         enemy.actionTimer = 0;
        //     }, [], this);
        //     this.time.delayedCall(2000, () => {
        //         this.playerController.defeat=false;
        //     }, [], this);
        //
        //     //     // this.playerController.matterSprite.setBounce(1.5); // Un valor entre 0 y 1, donde 1 es un rebote completo
        //     //     this.time.delayedCall(500, () => {
        //     //         // this.playerController.matterSprite.setVelocityX(this.MAX_SPEED * enemy.direction.x);
        //     //         // this.playerController.matterSprite.setVelocityY(-1.2);
        //     //         // this.playerController.matterSprite.setBounce(0)
        //     //         enemy.direction.x = 1;
        //     //         this.playerController.matterSprite.anims.play('run', true);
        //     //         enemy.actionTimer = 0;
        //     //     }, [], this);
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
    }

    enemiHitPlayer(sprite,enemi) {

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


const aspectRatio = 16 / 9; // Relación de aspecto deseada (ancho / alto)

const screenWidth = 580; // Ancho original de la pantalla
const screenHeight = 320; // Alto original de la pantalla

// Calculamos el nuevo ancho y alto manteniendo la relación de aspecto
let newWidth = screenWidth;
let newHeight = screenHeight;

// Aumentamos el tamaño de la pantalla al doble
const scale =2; // Factor de escala deseado

newWidth *= scale;
newHeight *= scale;

// Ajustamos el alto para conservar la relación de aspecto
newHeight = newWidth / aspectRatio;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 1.5
            },
            enableSleep: false,
            debug: true
        }
    },
    scene: Example
};

const game = new Phaser.Game(config);

