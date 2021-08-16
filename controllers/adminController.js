const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Image = require("../models/Image");
const fs = require("fs-extra");
const Item = require("../models/Item");
const Feature = require("../models/Feature");
const Activity = require("../models/Activity");
const Member = require("../models/Member");
const Users = require("../models/Users");
const Booking = require("../models/Booking");
const bycrypt = require('bcryptjs')

module.exports = {
  viewSignin: (req, res) => {
    try {
      if (req.session.user == null || req.session.user == undefined) {
        res.render("index", {
          title: "Staycation | Login",
          msg: req.flash("msg"),
          status: req.flash("status"),
        });
      } else {
        res.redirect("/admin/dashboard")
      }
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect("/admin/login");
    }
  },
  actionSignIn: async (req,res) => {
    try {
      const {username, password} = req.body
      const user = await Users.findOne({username})
      if(!user) {
        req.flash("msg", "Username Tidak Ada");
        req.flash("status", "danger");
        res.redirect("/admin/login");
      }
      const isMatchPassword = await bycrypt.compare(password, user.password)
      if(!isMatchPassword) {
        req.flash("msg", "Password Salah");
        req.flash("status", "danger");
        res.redirect("/admin/login");
      }

      req.session.user = {
        id: user.id,
        username: user.username
      }

      res.redirect("/admin/dashboard")
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect("/admin/login");
    }
  },

  actionSignout: async (req,res) => {
    await req.flash("msg", "Logout Berhasil");
    await req.flash("status", "success");


    await res.redirect("/admin/login")
    req.session.destroy()
  },

  viewDashboard: async (req, res) => {

    try {
      const member = await Member.find()
      const booking = await Booking.find()
      const item = await Item.find()
      res.render("admin/dashboard/view_dashboard", {
        title: "| Dashboard",
        msg: req.flash("msg"),
        status: req.flash("status"),
        user: req.session.user,
        member,
        booking,
        item
      });

    } catch (error) {
      req.flash("msg",`${error.message}`);
      req.flash("status", "danger");


      res.redirect("/admin/dashboard")
    }
  },

  viewCategory: async (req, res) => {
    const category = await Category.find();
    res.render("admin/dashboard/view_category", {
      title: "| Category",
      category,
      msg: req.flash("msg"),
      status: req.flash("status"),
      user: req.session.user
    });
  },

  addCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.create({ name });
      req.flash("msg", "Data berhasil ditambahkan");
      req.flash("status", "success");
      res.redirect("/admin/category");
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalah");
      req.flash("status", "danger");
      res.redirect("/admin/category");
    }
  },

  editCategory: async (req, res) => {
    try {
      const { id, name } = req.body;
      Category.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            name: name,
          },
        },
        (err, result) => {
          req.flash("msg", "Data berhasil diubah");
          req.flash("status", "success");
          res.redirect("/admin/category");
        }
      );
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalah");
      req.flash("status", "danger");
      res.redirect("/admin/category");
    }
  },

  deleteCategory: async (req, res) => {
    const { id } = req.body;

    await Category.findOneAndDelete({ _id: id });
    req.flash("msg", "Data berhasil dihapus");
    req.flash("status", "success");
    res.redirect("/admin/category");
  },

  viewBank: async (req, res) => {
    const bank = await Bank.find();
    res.render("admin/dashboard/view_bank", {
      title: "| Bank",
      bank,
      msg: req.flash("msg"),
      status: req.flash("status"),
      user: req.session.user
    });
  },

  addBank: async (req, res) => {
    try {
      const { name, nameBank, nomorRekening } = req.body;
      await Bank.create({
        name,
        nameBank,
        nomorRekening,
        imageUrl: `images/${req.file.filename}`,
      });
      req.flash("msg", "Data berhasil ditambahkan");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalah");
      req.flash("status", "danger");
      res.redirect("/admin/bank");
    }
  },
  editBank: async (req, res) => {
    try {
      const { id, nameBank, name, nomorRekening, imageUrl, imageUrlOld } =
        req.body;
      if (req.file == undefined) {
        await Bank.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              name: name,
              nameBank: nameBank,
              nomorRekening: nomorRekening,
            },
          },
          (err, result) => {
            req.flash("msg", "Data berhasil diubah");
            req.flash("status", "success");
            res.redirect("/admin/bank");
          }
        );
      } else {
        fs.unlink(`public/${imageUrlOld}`);
        await Bank.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              name: name,
              nameBank: nameBank,
              nomorRekening: nomorRekening,
              imageUrl: `images/${req.file.filename}`,
            },
          },
          (err, result) => {
            req.flash("msg", "Data berhasil diubah");
            req.flash("status", "success");
            res.redirect("/admin/bank");
          }
        );
      }
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalah");
      req.flash("status", "danger");
      res.redirect("/admin/bank");
    }
  },
  deleteBank: async (req, res) => {
    const { id, imageUrl } = req.body;
    fs.unlink(`public/${imageUrl}`);
    await Bank.findOneAndDelete({ _id: id });
    req.flash("msg", "Data berhasil dihapus");
    req.flash("status", "success");
    res.redirect("/admin/bank");
  },

  viewItem: async (req, res) => {
    try {
      const category = await Category.find();
      const item = await Item.find().populate({
        path: "imageId",
        select: "id imageUrl",
      });
      res.render("admin/dashboard/view_item", {
        title: "| Item",
        msg: req.flash("msg"),
        status: req.flash("status"),
        category,
        action: "data",
        item,
        user: req.session.user
      });
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalah");
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },

  addItem: async (req, res) => {
    try {
      const { title, price, city, categoryId, description } = req.body;
      if (req.files.length > 0) {
        const category = await Category.findOne({ _id: categoryId });
        const newItem = {
          title,
          price,
          city,
          categoryId: category._id,
          description,
        };
        const item = await Item.create(newItem);
        category.itemId.push({ _id: item._id });
        await category.save();
        for (let i = 0; i < req.files.length; i++) {
          const imageSave = await Image.create({
            imageUrl: `images/${req.files[i].filename}`,
          });
          item.imageId.push({ _id: imageSave._id });
          await item.save();
        }
        req.flash("msg", "Data berhasil ditambahkan");
        req.flash("status", "success");
        res.redirect("/admin/item");
      }
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalah");
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },

  detailItem: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.find();
      const item = await Item.findOne({ _id: id })
        .populate({ path: "imageId", select: "id imageUrl" })
        .populate("featureId")
        .populate("activityId")
        .populate({ path: "categoryId", select: "id name" });
      res.render("admin/dashboard/view_item", {
        title: "| Detail Item",
        msg: req.flash("msg"),
        status: req.flash("status"),
        item: item,
        action: "detail",
        category,
        user: req.session.user
      });
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalah");
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },

  editItem: async (req, res) => {
    const { id, title, price, city, categoryId, description } = req.body;
    try {
        await Item.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              title,
              price,
              city,
              categoryId,
              description,
            },
          },
          (err, result) => {
            req.flash("msg", "Data berhasil diubah");
            req.flash("status", "success");
            res.redirect(`/admin/item/${id}`);
          }
        );
    } catch (error) {
      req.flash("msg", `${error.message}`);
            req.flash("status", "danger");
            res.redirect(`/admin/item/${id}`);
    }
  },

  deletePhotoItem: async (req, res) => {
    const { oldImageId, imageUrl, idItem } = req.body;
    try {
      const item = await Item.findOne({ _id: idItem }).populate({
        path: "imageId",
        select: "id imageUrl",
      });
      const img = item.imageId;
      const result = img.filter((item) => item._id != oldImageId);
      fs.unlink(`public/${imageUrl}`);
      await Image.findOneAndDelete({ _id: oldImageId });
      await Item.updateOne(
        {
          _id: idItem,
        },
        {
          $set: {
            imageId: result,
          },
        },
        (err, result) => {
          req.flash("msg", "Foto berhasil Dihapus");
          req.flash("status", "success");
          res.redirect(`/admin/item/${idItem}`);
        }
      );
    } catch (error) {
      req.flash("msg", `Terdapat Kesahalan`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/${idItem}`);
    }
  },

  updatePhotoItem: async (req, res) => {
    const { idItem } = req.body;
    try {
      const item = await Item.findOne({ _id: idItem }).populate({
        path: "imageId",
        select: "id imageUrl",
      });
      const img = item.imageId;

      const imageSave = await Image.create({
        imageUrl: `images/${req.file.filename}`,
      });

      img.push(imageSave);
      await item.save();
      req.flash("msg", "Foto berhasil ditambah");
      req.flash("status", "success");
      res.redirect(`/admin/item/${idItem}`);
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/${idItem}`);
    }
  },

  deleteItem: async (req, res) => {
    
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id }).populate("imageId").populate("categoryId")
  
      const category = await Category.findOne({ _id: item.categoryId })
      const arrCategory = category.itemId
  
      const result = arrCategory.filter((item) => item._id != id);

      for (let i = 0; i < item.imageId.length; i++) {
        Image.findOne({ _id: item.imageId[i]._id })
          .then(async (image) => {
            await fs.unlink(`public/${image.imageUrl}`);
            image.remove();
          })
          .catch((error) => {
            req.flash("msg", `${error.message}`);
            req.flash("status", "danger");
            res.redirect(`/admin/item`);
          });
      }

      await item.remove();

      await Category.updateOne(
        {
          _id: category._id,
        },
        {
          $set: {
            itemId: result,
          },
        },
        (err, result) => {
          req.flash("msg", "Data berhasil dihapus");
          req.flash("status", "success");
          res.redirect("/admin/item");
        }
      );

      
     
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item`);
    }
  },

  addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body;
    try {
      const item = await Item.findOne({ _id: itemId });
      if (!req.file) {
        req.flash("msg", "Terdapat Kesahalan");
        req.flash("status", "danger");
        res.redirect(`/admin/item/${itemId}`);
      }
      const feature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      await item.featureId.push(feature._id);
      await item.save();
      req.flash("msg", "Feature berhasil ditambahkan");
      req.flash("status", "success");
      res.redirect(`/admin/item/${itemId}`);
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/${itemId}`);
    }
  },

  editFeature: async (req, res) => {
    const { id, itemId, name, qty, imageUrlOld } =
    req.body;
    try {
      if (req.file == undefined) {
        await Feature.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              name,
              qty
            },
          },
          (err, result) => {
            req.flash("msg", "Feature berhasil diubah");
            req.flash("status", "success");
            res.redirect(`/admin/item/${itemId}`);
          }
        );
      } else {
        fs.unlink(`public/${imageUrlOld}`);
        await Feature.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              name,
              qty,
              imageUrl: `images/${req.file.filename}`,
            },
          },
          (err, result) => {
            req.flash("msg", "Feature berhasil diubah");
            req.flash("status", "success");
            res.redirect(`/admin/item/${itemId}`);
          }
        );
      }
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalan");
      req.flash("status", "danger");
      res.redirect(`/admin/item/${itemId}`);
    }
  },

  deleteFeature: async (req, res) => {
    try {
      const { itemId, id, imageUrl } = req.body;

      const item = await Item.findOne({ _id: itemId }).populate("activityId");
      const feature = item.featureId;
      const result = feature.filter((item) => item._id != id);
      await Feature.findOneAndDelete({ _id: id });

      fs.unlink(`public/${imageUrl}`);
      await Item.updateOne(
        {
          _id: itemId,
        },
        {
          $set: {
            featureId: result,
          },
        },
        (err, result) => {
          req.flash("msg", "Feature berhasil Dihapus");
          req.flash("status", "success");
          res.redirect(`/admin/item/${itemId}`);
        }
      );
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/${itemId}`);
    }
  },

  addActivity: async (req, res) => {
    const { name, type, itemId } = req.body;
    try {
      const item = await Item.findOne({ _id: itemId });
      if (!req.file) {
        req.flash("msg", "Terdapat Kesahalan");
        req.flash("status", "danger");
        res.redirect(`/admin/item/${itemId}`);
      }
      const activity = await Activity.create({
        name,
        type,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      await item.activityId.push(activity._id);
      await item.save();
      req.flash("msg", "Activity berhasil ditambahkan");
      req.flash("status", "success");
      res.redirect(`/admin/item/${itemId}`);
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/${itemId}`);
    }
  },

  editActivity: async (req, res) => {
    const { id, itemId, name, type, imageUrlOld } =
    req.body;
    try {
      if (req.file == undefined) {
        await Activity.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              name,
              type
            },
          },
          (err, result) => {
            req.flash("msg", "Activity berhasil diubah");
            req.flash("status", "success");
            res.redirect(`/admin/item/${itemId}`);
          }
        );
      } else {
        fs.unlink(`public/${imageUrlOld}`);
        await Activity.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              name,
              type,
              imageUrl: `images/${req.file.filename}`,
            },
          },
          (err, result) => {
            req.flash("msg", "Activity berhasil diubah");
            req.flash("status", "success");
            res.redirect(`/admin/item/${itemId}`);
          }
        );
      }
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalan");
      req.flash("status", "danger");
      res.redirect(`/admin/item/${itemId}`);
    }
  },

  deleteActivity: async (req, res) => {
    const { itemId, id, imageUrl } = req.body;
    try {
      const item = await Item.findOne({ _id: itemId }).populate("activityId");
      console.log(item);
      const activity = item.activityId;
      const result = activity.filter((item) => item._id != id);
      await Activity.findOneAndDelete({ _id: id });
      fs.unlink(`public/${imageUrl}`);
      await Item.updateOne(
        {
          _id: itemId,
        },
        {
          $set: {
            activityId: result,
          },
        },
        (err, result) => {
          req.flash("msg", "Activity berhasil Dihapus");
          req.flash("status", "success");
          res.redirect(`/admin/item/${itemId}`);
        }
      );
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/${itemId}`);
    }
  },

  viewBooking: async (req, res) => {
    try {
      const booking = await Booking.find().populate("memberId").populate("bankId")
      res.render("admin/dashboard/view_booking", {
        title: "| Booking",
        msg: req.flash("msg"),
        user: req.session.user,
        status: req.flash("status"),
        booking,
        action: "data",
      });
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/booking`);
    }
  },

  detailBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await Booking.findOne({ _id: id }).populate("memberId").populate("bankId")
      res.render("admin/dashboard/view_booking", {
        title: "| Detail Booking",
        msg: req.flash("msg"),
        status: req.flash("status"),
        booking,
        action: "detail",
        user: req.session.user
      });
    } catch (error) {
      req.flash("msg", "Terdapat Kesahalan");
      req.flash("status", "danger");
      res.redirect("/admin/booking");
    }
  },

  actionAccept: async (req, res) => {
    const { id } = req.params
    try {
      const booking = await Booking.findOne({_id: id})
      booking.payments.status = "Accept"
      await booking.save()
      req.flash("msg", "Berhasil Menerima Pembayaran");
      req.flash("status", "success");
      res.redirect("/admin/booking");
    } catch (error) {
      req.flash("msg", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/booking/${id}`);
    }
  },

  actionReject: async (req, res) => {
    const { id } = req.params
    try {
      const booking = await Booking.findOne({_id: id})
      booking.payments.status = "Reject"
      await booking.save()
      req.flash("msg", "Berhasil Menolak Pembayaran");
      req.flash("status", "success");
      res.redirect("/admin/booking");
    } catch (error) {
      req.flash("msg",  `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/booking/${id}`);
    }
  }
};
