const isLogin = (req,res,next) => {

    try {
        if (req.session.user == null || req.session.user == undefined) {
            req.flash("msg", "Silahkan Login Terlebih dahulu");
            req.flash("status", "danger");
            res.redirect("/admin/login");
        } else {
            next()
        }
    } catch (error) {
        req.flash("msg", `${error.message}`);
            req.flash("status", "danger");
            res.redirect("/admin/login");
    }
    
}

module.exports = isLogin