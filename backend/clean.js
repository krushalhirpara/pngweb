const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { dbName: "pngwale" }).then(async () => {
    const db = mongoose.connection.db;
    const res = await db.collection('images').deleteMany({ slug: null });
    console.log("Deleted null slugs:", res.deletedCount);
    
    try {
        await db.collection('images').dropIndexes();
        console.log("Dropped indexes to recreate them fresh.");
    } catch (e) {
        console.log("No indexes to drop or error:", e.message);
    }
    
    process.exit();
}).catch(console.error);
