const fs = require('fs');

const scriptDirectory = './scripts';
const classRegex = /class \w+/g;

fs.readdir(scriptDirectory, (err, files) => {

    if(err)
    {
        console.error(err);
        return;
    }

    files.forEach(file => {
        console.log(`Checking: ${file}`);

        fs.readFile(scriptDirectory + '/' + file, 'utf8', (fileError, data) =>
        {
            if(fileError)
            {
                console.error('problem:' + fileError);
                return;
            }

            let foundClasses = data.match(classRegex);
            
            if(foundClasses == null)
                return;

            for(let i =0; i < foundClasses.length ; ++i)
            {
                console.log(foundClasses[i]);
            }

        });

      });
});