const Item = require("../models/Item");
const Treasure = require("../models/Activity");
const Traveler = require("../models/Booking");
const Image = require("../models/Image");
const Category = require("../models/Category");
const Member = require("../models/Member");
const Booking = require("../models/Booking");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .populate({ path: "imageId", select: "imageUrl", perDocumentLimit: 1 })
        .select("_id title imageUrl price unit city country")
        .limit(5);


        const categories = await Category.find()
        .limit(5)
        .populate({
          path: "itemId",
          select: "_id title imageUrl isPopular price unit city country",
          perDocumentLimit: 4,
          option: {sort: {sumBooking: -1}},
          populate: {
            path: "imageId",
            select: "imageUrl",
            perDocumentLimit: 1,
          },
        })
        .select("_id name itemId");

      const traveler = await Traveler.find();
      const treasure = await Treasure.find();
      const city = await Item.find();

      for (let i = 0; i < categories.length; i++) {
        for (let x = 0; x < categories[i].itemId.length; x++) {
          const item = await Item.findOne({ _id:categories[i].itemId[x]._id })
          item.isPopular = false;
          await item.save();
          if (categories[i].itemId[0] === categories[i].itemId[x]) {
            item.isPopular = true
            await item.save()
          }
        }
      }

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "/images/testimonial-landingpages.png",
        name: "Happy Family",
        rate: 4.55,
        content: "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "Product Designer"
      }

      res.status(200).json({
        hero: {
          travelers: traveler.length,
          treasure: treasure.length,
          cities: city.length,
        },
        mostPicked,
        categories,
        testimonial
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({message: "Internal Server Error"})
    }
  },

  detailItem: async (req,res) => {
    try {
      const {id} = req.params

      const item = await Item.findOne({_id:id}).populate({path: "featureId", select: "qty name imageUrl"}).populate({path: "activityId", select: "type name imageUrl"}).populate({path: "imageId", select: "imageUrl"})

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "/images/testimonial-itemdetails.png",
        name: "Happy Family",
        rate: 4.25,
        content: "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "UI Designer"
      }

      res.status(200).json({
        ...item._doc,
        testimonial
      })
    } catch (error) {
      
    }
  },

  bookingAction: async (req,res) => {
    try {
      const {
        itemId,
        duration,
        price,
        bookingDateStart,
        bookingDateEnd,
        firstName,
        lastName,
        emailAddress,
        phoneNumber,
        accountHolder,
        bankFrom,
      } = req.body

      // res.send(req.body)
  
      if(!req.file) res.status(404).json({message: "Image Not Found"})
  
      if (
        itemId === undefined ||
        duration === undefined ||
        price === undefined ||
        bookingDateStart === undefined ||
        bookingDateEnd === undefined ||
        firstName === undefined ||
        lastName === undefined ||
        emailAddress === undefined ||
        phoneNumber === undefined ||
        accountHolder === undefined ||
        bankFrom === undefined ||
        itemId === "" ||
        duration === "" ||
        price === "" ||
        bookingDateStart === "" ||
        bookingDateEnd === "" ||
        firstName === "" ||
        lastName === "" ||
        emailAddress === "" ||
        phoneNumber === "" ||
        accountHolder === "" ||
        bankFrom === ""
      ) 
      {
        res.status(404).json({message: "Lengkapi Field"})
      }

      const item = await Item.findOne({_id:itemId})

      if(!item) res.status(404).json({message: "Kode Item Tidak ditemukan"})

      item.sumBooking += 1

      await item.save()

      let total = item.price * duration
      let tax = total * 0.1

      const invoice = Math.floor(1000000 + Math.random() * 9000000)

      const member = await Member.create({
        firstName,
        lastName,
        email: emailAddress,
        phoneNumber
      })

      const newBooking = {
        bookingStartDate: new Date(bookingDateStart) ,
        bookingEndDate: new Date(bookingDateEnd),
        invoice: invoice,
        itemId : {
          _id: item._id,
          title: item.title,
          price: item.price,
          duration: duration
        },
        total: total + tax,
        memberId: member._id,
        payments: {
          proofPayment: `images/${req.file.filename}`,
          bankFrom,
          accountHolder,
          status: "Proses"
        }
      }

      const booking = await Booking.create(newBooking)

      res.status(201).json({message: "Success Booking", booking})
    } catch (error) {
      console.log(error)
      res.status(500).json({message: "Internal Server Error"})
    }

  }
};
