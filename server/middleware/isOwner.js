const Listing = require('../models/Listing');

const isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Listing not found' },
      });
    }

    const user = await require('../models/User').findOne({ uid: req.user.uid });
    
    if (!user || listing.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this listing' },
      });
    }

    req.listing = listing;
    req.userDoc = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isOwner;
