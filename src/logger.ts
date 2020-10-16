

class Logger {

    private fs = require('fs');

    write(message: any) {

        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }

        this.fs.appendFile('app.log', message + '\n', (err: any) => {
            if (err) {
                // tslint:disable-next-line:no-console
                return console.log(err);
            }
            // tslint:disable-next-line:no-console
            console.log(message);
        });
    }

}

export default Logger;