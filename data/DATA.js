const transformList = 
[
    new ShapeTransform(TRANSFORM_NONE, 'images/knife-scalable-vector-graphics-computer-icons-no-symbol-forbidden-save-icon-format.jpg', 'NONE', function(progress) { return 1; } ),
    new ShapeTransform(TRANSFORM_SHRINK, 'images/243_downarrow.jpg', 'SHRINK', function(progress) { return lerp(1,0.01, progress); } ),
    new ShapeTransform(TRANSFORM_GROW, 'images/44603.png', 'GROW', function(progress) { return lerp(0.01,1, progress); } ),
];

const sampleData = [ test01 ];

let animationCache = [];