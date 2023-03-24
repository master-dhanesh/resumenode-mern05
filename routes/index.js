var express = require("express");
var router = express.Router();
const upload = require("../helpers/multer").single("avatar");
const fs = require("fs");
const User = require("../models/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {
        title: "Homepage",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});

router.get("/show", isLoggedIn, function (req, res, next) {
    res.render("show", {
        title: "Show",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});

router.get("/signup", function (req, res, next) {
    res.render("signup", {
        title: "Signup",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});

router.get("/signin", function (req, res, next) {
    res.render("signin", {
        title: "Signin",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
    res.render("profile", {
        title: "Profile",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});

router.post("/signup", function (req, res, next) {
    const { username, email, contact, password } = req.body;
    User.register({ username, email, contact }, password)
        .then((user) => {
            res.redirect("/signin");
        })
        .catch((err) => res.send(err));
});

router.post("/update/:id", isLoggedIn, async function (req, res, next) {
    try {
        const { username, email, contact, linkedin, github, behance } =
            req.body;

        const updatedUserInfo = {
            username,
            email,
            contact,
            links: { linkedin, github, behance },
        };

        await User.findOneAndUpdate(req.params.id, updatedUserInfo);
        res.redirect("/update/" + req.params.id);
    } catch (error) {
        res.send(err);
    }
});

router.post(
    "/signin",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/signin",
    }),
    function (req, res, next) {}
);

router.get("/signout", isLoggedIn, function (req, res, next) {
    req.logout(() => {
        res.redirect("/signin");
    });
});

// router.get("/forget-password", function (req, res, next) {
//     res.render("forget", {
//         title: "Forget-Password",
//         isLoggedIn: req.user ? true : false,
//         user: req.user,
//     });
// });

// router.post("/send-mail/", function (req, res, next) {
// how to send mail
// redirect to verify otp
// });

// router.get("/verify-otp/:id", function (req, res, next) {
//     open the page of verifyopt and  password
// });

// router.post("/verify-otp/:id", async function (req, res, next) {
// try {
// verify the otp
// code to change the password
// find the user on the basis of id
// await user.setPassword(req.body.newPassword);
// await user.save();
// redirect to signin
// } catch (error) {
//     res.send(err);
// }

// });

router.get("/reset-password", isLoggedIn, function (req, res, next) {
    res.render("reset", {
        title: "Reset-Password",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});
router.post("/reset-password", isLoggedIn, async function (req, res, next) {
    try {
        await req.user.changePassword(
            req.body.oldPassword,
            req.body.newPassword
        );
        await req.user.save();
        res.redirect("/profile");
    } catch (error) {
        res.send(err);
    }
});

router.post("/upload", isLoggedIn, async function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            console.log("ERROR>>>>>", err.message);
            res.send(err.message);
        }
        if (req.file) {
            fs.unlinkSync("./public/images/" + req.user.avatar);
            req.user.avatar = req.file.filename;
            req.user
                .save()
                .then(() => {
                    res.redirect("/update/" + req.user._id);
                })
                .catch((err) => {
                    res.send(err);
                });
        }
    });
});

// ----------------------------------resumes

router.get("/create", isLoggedIn, function (req, res, next) {
    res.render("create", {
        title: "Create",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});

router.get("/education", isLoggedIn, function (req, res, next) {
    res.render("Resume/Education", {
        title: "Education",
        isLoggedIn: req.user ? true : false,
        user: req.user,
    });
});

router.post("/add-edu", isLoggedIn, async function (req, res, next) {
    req.user.education.push(req.body);
    await req.user.save();
    res.redirect("/education");
});

router.get("/delete-edu/:index", isLoggedIn, async function (req, res, next) {
    const eduCopy = [...req.user.education];
    eduCopy.splice(req.params.index, 1);
    req.user.education = [...eduCopy];
    await req.user.save();
    res.redirect("/education");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/signin");
    }
}

module.exports = router;
