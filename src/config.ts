import mongoose, { ConnectOptions } from "mongoose";
require('dotenv').config();

async function main() {
    await mongoose.connect(String(process.env.MONGO_URL),
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        } as ConnectOptions
    );
}

main().catch((err) => console.log(err));
