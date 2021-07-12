const OxygenCenter = require('../models/oxygenCenter');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const oxygenCenters = await OxygenCenter.find({}).populate('popupText');
    res.render('oxygenCenters/index', { oxygenCenters })
}

module.exports.renderNewForm = (req, res) => {
    res.render('oxygenCenters/new');
}

module.exports.createOxygenCenter = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.oxygenCenter.location,
        limit: 1
    }).send()
    const oxygenCenter = new OxygenCenter(req.body.oxygenCenter);
    oxygenCenter.geometry = geoData.body.features[0].geometry;
    oxygenCenter.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    oxygenCenter.author = req.user._id;
    await oxygenCenter.save();
    console.log(oxygenCenter);
    req.flash('success', 'Successfully made a new oxygenCenter!');
    res.redirect(`/oxygenCenters/${oxygenCenter._id}`)
}

module.exports.showOxygenCenter = async (req, res,) => {
    const oxygenCenter = await OxygenCenter.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!oxygenCenter) {
        req.flash('error', 'Cannot find that oxygenCenter!');
        return res.redirect('/oxygenCenters');
    }
    res.render('oxygenCenters/show', { oxygenCenter });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const oxygenCenter = await OxygenCenter.findById(id)
    if (!oxygenCenter) {
        req.flash('error', 'Cannot find that oxygenCenter!');
        return res.redirect('/oxygenCenters');
    }
    res.render('oxygenCenters/edit', { oxygenCenter });
}

module.exports.updateOxygenCenter = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const oxygenCenter = await OxygenCenter.findByIdAndUpdate(id, { ...req.body.oxygenCenter });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    oxygenCenter.images.push(...imgs);
    await oxygenCenter.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await oxygenCenter.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated oxygenCenter!');
    res.redirect(`/oxygenCenters/${oxygenCenter._id}`)
}

module.exports.deleteOxygenCenter = async (req, res) => {
    const { id } = req.params;
    await OxygenCenter.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted oxygenCenter')
    res.redirect('/oxygenCenters');
}