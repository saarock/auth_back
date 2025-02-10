import app from "./app.js";
import connectDB from "./db/index.js";
const port = 8000 || process.env.PORT




connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.error("DB connection error: ", error);
    process.exit(1);
});


