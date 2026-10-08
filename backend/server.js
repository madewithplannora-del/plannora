const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const app = require("./src/app");

const ConnectDB = require("./src/db/db");

const PORT = process.env.PORT || 3000;

/*
    Wait for the database before accepting traffic, so the app is never marked
    healthy while every request would fail.
*/
async function startServer() {

    await ConnectDB();

    // On production (Render), bind to 0.0.0.0. Locally, bind to localhost
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    
    const server = app.listen(PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${PORT}`);
    });

    /*
        Hosting platforms send SIGTERM on deploy / scale-in. Close the listener
        so in-flight requests finish instead of being cut off.
    */
    function shutdown(signal) {

        console.log(`${signal} received, shutting down`);

        server.close(() => {
            console.log("HTTP server closed");
            process.exit(0);
        });

    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

}

startServer();
