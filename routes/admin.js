const router = require("express").Router();
const adminController = require("../controllers/adminController");
const isLogin = require("../middleware/auth");
const {upload, uploadMultiple} = require("../middleware/multer");


/* GET home page. */

router.get("/login", adminController.viewSignin);
router.post("/login", adminController.actionSignIn);
router.use(isLogin)
router.post("/logout", adminController.actionSignout);
router.get("/dashboard", adminController.viewDashboard);
router.get("/category", adminController.viewCategory);
router.post("/category", adminController.addCategory);
router.put("/category", adminController.editCategory);
router.delete("/category", adminController.deleteCategory);
router.get("/bank", adminController.viewBank);
router.post("/bank",upload, adminController.addBank);
router.put("/bank",upload, adminController.editBank);
router.delete("/bank", adminController.deleteBank);
router.get("/item", adminController.viewItem);
router.post("/item",uploadMultiple, adminController.addItem);
router.put("/item/photo", upload, adminController.updatePhotoItem);
router.post("/item/photo", upload, adminController.deletePhotoItem);
router.put("/item", adminController.editItem);
router.put("/item/feature",upload, adminController.editFeature);
router.post("/item/addfeature", upload, adminController.addFeature);
router.delete("/item/deleteFeature", adminController.deleteFeature);
router.post("/item/addActivity", upload, adminController.addActivity);
router.put("/item/activity",upload, adminController.editActivity);
router.delete("/item/deleteActivity", adminController.deleteActivity);
router.delete("/item/:id/delete", adminController.deleteItem);
router.get("/item/:id", adminController.detailItem);
router.get("/booking", adminController.viewBooking);
router.get("/booking/:id", adminController.detailBooking);
router.put("/booking/:id/accept", adminController.actionAccept);
router.put("/booking/:id/reject", adminController.actionReject);


module.exports = router;
