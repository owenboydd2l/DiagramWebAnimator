class FlowAnimation extends EntityID
{
    constructor(id, name, stages, assets)
    {
        super(id);
        this.name = name;
        this.stages = stages;
        this.assets = assets;
    }
}