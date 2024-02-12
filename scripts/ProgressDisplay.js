class ProgressDisplay
{


    constructor(target)
    {
        this.progress = 0;       

        let existingProgressBar = null;
        
        for(let i=0; i != target.children.length && existingProgressBar == null; ++i)
            if(target.children[i].id == 'diagram-animator-progress')
                existingProgressBar = target.children[i];

        if(existingProgressBar == null)
        {
            console.log('new progress bar created');
            this.loadingControl = this.CreateProgressBar();

            if(this.loadingControl.parentElement != target)
                target.appendChild(this.loadingControl);
        }
        else
        {
            this.loadingControl = existingProgressBar;
        }
    }

    UpdateProgress(newProgress)
    {
        this.progress = newProgress;

        if(this.progress > 1)
            this.progress = 1;
        else if (this.progress < 0)
            this.progress = 0;
    }

    Redraw()
    {
        var newWidth = this.progress * 100;
        this.loadingControl.firstChild.style.width = newWidth + '%';
        this.loadingControl.style.display = "block";
    }

    Destroy()
    {
        delete this.loadingControl;
    }

    Hide()
    {
        this.loadingControl.style.display = "none";
    }

    CreateProgressBar()
    {
        let newProgressArea = document.createElement('div');
        newProgressArea.id = 'diagram-animator-progress';
        let progressBar = document.createElement('div');

        newProgressArea.style.position = 'absolute';
        newProgressArea.style.backgroundColor = 'silver';
        newProgressArea.style.bottom = 0;
        newProgressArea.style.width = '100%';
        newProgressArea.style.height = "10px";

        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = 'green';       

        newProgressArea.appendChild(progressBar);

        return newProgressArea;
    }

}