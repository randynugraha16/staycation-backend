const router = require("express").Router();
const apiController = require("../controllers/apiController");
const {upload} = require("../middleware/multer");


/* GET home page. */

router.get("/landingpage", apiController.landingPage);
router.get("/item/:id", apiController.detailItem);
router.post("/booking", upload, apiController.bookingAction);


module.exports = router;
