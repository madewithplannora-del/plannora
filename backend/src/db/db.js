const mongoose = require("mongoose")

const MAX_ATTEMPTS = 10
const RETRY_DELAY_MS = 5000

async function ConnectDB(){
    for(let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++){
        try{
            await mongoose.connect(process.env.MONGODB)
            console.log("Connected to DATABASE")
            return
        }catch(error){
            console.log("Error in DATABASE (attempt " + attempt + "/" + MAX_ATTEMPTS + "):", error.message)
            if(attempt < MAX_ATTEMPTS){
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
            }
        }
    }
    console.log("DATABASE connection failed after " + MAX_ATTEMPTS + " attempts")

    /*
        Exit instead of staying up in a broken state. The hosting platform then
        restarts the process / fails the health check, rather than serving every
        request on a dead database connection.
    */
    process.exit(1)
}

module.exports = ConnectDB
