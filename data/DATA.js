
const transformList = 
[
    new ShapeTransform(TRANSFORM_NONE, 'images/knife-scalable-vector-graphics-computer-icons-no-symbol-forbidden-save-icon-format.jpg', 'NONE', function(progress) { return 1; } ),
    new ShapeTransform(TRANSFORM_SHRINK, 'images/243_downarrow.jpg', 'SHRINK', function(progress) { return lerp(1,0.01, progress); } ),
    new ShapeTransform(TRANSFORM_GROW, 'images/44603.png', 'GROW', function(progress) { return lerp(0.01,1, progress); } ),
];


let assetList = 
[ 
    new Asset(1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukEhbRDPETDiNMl5ZO8Lm3nQRSzPLnvdsPK30nTmMig&s'),
    new Asset(2, 'images/136443.png'),
    new Asset(3, 'images/1950399.webp') 
];

const sampleData = [ test01 ];

let animationCache = [];