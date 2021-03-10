const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary');
const { query } = require('express');

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render("campground/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render("campground/new")
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body)
    newCamp.geometry = geoData.body.features[0].geometry
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCamp.author = req.user._id
    await newCamp.save()
    console.log(newCamp)
    req.flash('success', 'Successfully added')
    res.redirect(`/campgrounds/${newCamp.id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', 'Cannot find the campground!')
        return res.redirect('/campgrounds')
    }
    res.render("campground/show", { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find the campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campground/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    // console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    const deletedCamp = await Campground.findByIdAndDelete(id)
    req.flash('success', 'The campground has been successfully deleted!')
    res.redirect('/campgrounds')
}
