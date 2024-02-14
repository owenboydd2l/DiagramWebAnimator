import { ShapeTransform, TRANSFORM_GROW, TRANSFORM_SHRINK, TRANSFORM_NONE } from '../build/ShapeTransform.js';
import { lerp } from '../build/Utility.js';

const transformList = 
[
    new ShapeTransform(TRANSFORM_NONE, 'static/images/knife-scalable-vector-graphics-computer-icons-no-symbol-forbidden-save-icon-format.jpg', 'NONE', function(progress) { return 1; } ),
    new ShapeTransform(TRANSFORM_SHRINK, 'static/images/243_downarrow.jpg', 'SHRINK', function(progress) { return lerp(1,0.01, progress); } ),
    new ShapeTransform(TRANSFORM_GROW, 'static/images/44603.png', 'GROW', function(progress) { return lerp(0.01,1, progress); } ),
];

const UserLiveData =
{
    animationCache : []
}


export { UserLiveData, transformList };