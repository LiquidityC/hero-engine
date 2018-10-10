const config = {
    type  : Phaser.AUTO,
    width : 1200,
    height: 929,
    scene : {
        preload: preload,
        create : create,
    },
};

new Phaser.Game(config);
let map = null;
let currentTextBox = null;

function preload() {
    // load the tileset image which is just a single tile for the background room
    this.load.image('room1_img', '../../assets/images/room1.png');
    this.load.image('window', '../../assets/images/window.png');

    // load the tilemap exported from Tiled
    this.load.tilemapTiledJSON('map', '../../assets/tilemaps/roomwithobject.json');
}

function create() {
    // parse the tilemap
    map = this.make.tilemap({ key: 'map' });

    // add the tileset image to the map
    let tiles = map.addTilesetImage('room1', 'room1_img');
    map.addTilesetImage('window', 'window');

    // add the room_map layer to the scene
    map.createStaticLayer('room_map', tiles, 0, 0);
    // create sprites for the objects layer
    map.createFromObjects('objects', 'window', { key: 'window' });

    this.input.on('pointerup', onPointerUp, this);
}

function onPointerUp(pointer) {
    checkObjectSelection.call(this, pointer);
}

function checkObjectSelection(pointer) {
    let objectLayer = map.getObjectLayer('objects');
    if (!objectLayer) return;

    // ensure we take the camera position into account
    let x = pointer.x - this.cameras.main.x;
    let y = pointer.y - this.cameras.main.y;

    let selectedObject = null;
    for (let object of objectLayer.objects) {
        // check if object is a polygon
        if (object.hasOwnProperty('polyline')) {
            // each point on the polyline is relative to it's parent object's position,
            // so need to map them to world values
            let points = object.polyline.map((value) => {
                return {
                    x: value.x + object.x,
                    y: value.y + object.y,
                };
            });
            let polygon = new Phaser.Geom.Polygon(points);
            let containsPoint = polygon.contains(x, y);
            if (containsPoint) {
                selectedObject = object;
                break;
            }
        }
        else {
            // not a polygon, so can just check against x,y,width,height
            if (x >= object.x && x <= object.x + object.width
                && y >= object.y - object.height && y <= object.y) {
                selectedObject = object;
                break;
            }
        }
    }
    if (selectedObject) {
        console.log('selected object description:' + selectedObject.properties['description']);
        createTextBox.call(this);
    }
}

function createTextBox() {
    let textbox = this.add.graphics({ x: Math.floor(window.innerWidth * 0.2), y: Math.floor(window.innerHeight * 0.6) });
    textbox.lineStyle(5, 0xffffff);
    textbox.fillStyle(0xffff00);

    let width = Math.floor(window.innerWidth * 0.66),
        height = Math.floor(window.innerHeight * 0.2);

    textbox.fillRect(0, 0, width, height);
    textbox.inputEnabled = true;
    this.input.on('poniterdown', function (pointer, object) {
        textbox.destroy();
    });
    console.log(textbox);
}
