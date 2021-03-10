const mongoose = require("mongoose")
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})


const sample = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 200; i++) {
        const rand1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 20
        const camp = new Campground({
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'This is beautiful!!!',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },
            author: "6003932f45d33b0dccb94c03",
            images:
                [
                    {
                        url: 'https://res.cloudinary.com/div8rcjzg/image/upload/v1610830671/YelpCamp/p7s4ppc9bnjyogtm99y5.jpg',
                        filename: 'YelpCamp/p7s4ppc9bnjyogtm99y5'
                    },
                    {
                        url: 'https://res.cloudinary.com/div8rcjzg/image/upload/v1610830671/YelpCamp/d6kzbpkuy2iwbcncyyug.jpg',
                        filename: 'YelpCamp/d6kzbpkuy2iwbcncyyug'
                    }
                ]

        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
