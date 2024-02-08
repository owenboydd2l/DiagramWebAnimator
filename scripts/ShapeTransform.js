const TRANSFORM_NONE = null;
const TRANSFORM_SHRINK = 0;
const TRANSFORM_GROW = 1;

class ShapeTransform
{
    constructor( id, icon, tooltip, functionDef)
    {
        this.id = id;
        this.formula = functionDef;
        this.icon = icon;
        this.tooltip = tooltip;
    }
}
