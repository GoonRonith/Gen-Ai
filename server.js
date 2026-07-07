import "dotenv/config"
import {createServer} from 'node:http'
import app from "./multiple_model_decision/src/app.js"

async function main() {
    const httpServer = createServer(app)
    const PORT = process.env.PORT || 8000

    httpServer.listen(PORT , () =>{
        console.log(`server is running on PORT ${PORT}`);
        
    })
}

main()