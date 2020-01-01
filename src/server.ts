import app from './app'
const server = require('http').createServer(app.express);
const port: string | number = process.env.PORT || 3000;

server.listen(port, (err: Error) => {
    if (err) {
        return console.log(err);
    }

    return console.log(`server is listening on ${port}`);
});