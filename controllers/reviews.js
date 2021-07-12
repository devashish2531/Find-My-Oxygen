const OxygenCenter = require('../models/oxygenCenter');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const oxygenCenter = await OxygenCenter.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    oxygenCenter.reviews.push(review);
    await review.save();
    await oxygenCenter.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/oxygenCenters/${oxygenCenter._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await OxygenCenter.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/oxygenCenters/${id}`);
}
