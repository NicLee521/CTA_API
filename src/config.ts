import mongoose, { ConnectOptions } from "mongoose";
import 'dotenv/config';
async function main() {
    await mongoose.connect(String(process.env.MONGO_URL),
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        } as ConnectOptions
    );
}

main()
    .then(res => console.log('mongo connected', res))
    .catch((err) => console.log(err));
