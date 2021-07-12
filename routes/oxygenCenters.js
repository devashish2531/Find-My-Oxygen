const express = require('express');
const router = express.Router();
const oxygenCenters = require('../controllers/oxygenCenters');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateOxygenCenter } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const OxygenCenter = require('../models/oxygenCenter');

router.route('/')
    .get(catchAsync(oxygenCenters.index))
    .post(isLoggedIn, upload.array('image'), validateOxygenCenter, catchAsync(oxygenCenters.createOxygenCenter))


router.get('/new', isLoggedIn, oxygenCenters.renderNewForm)

router.route('/:id')
    .get(catchAsync(oxygenCenters.showOxygenCenter))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateOxygenCenter, catchAsync(oxygenCenters.updateOxygenCenter))
    .delete(isLoggedIn, isAuthor, catchAsync(oxygenCenters.deleteOxygenCenter));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(oxygenCenters.renderEditForm))



module.exports = router;