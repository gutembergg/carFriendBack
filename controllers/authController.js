const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const authConfig = require("../config/authConfig");
const mailer = require("../modules/mailer");
const sgMail = require("@sendgrid/mail");

const router = express.Router();

/// generate token ///////////////////////////////////////////////////////////////////////////////////

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

/// Register user ////////////////////////////////////////////////////////////////////////////////////

router.post("/register", async (req, res) => {
    const { email } = req.body;
    if (await User.findOne({ email }))
        return res.status(400).send({ error: "Utilisateur existe déjà !" });

    try {
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ _id: user._id }),
        });
    } catch (err) {
        return res.status(400).send("error: Registraition failed");
    }
});

/// Authentication user //////////////////////////////////////////////////////////////////////////

router.post("/authenticate", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).send({ error: "Utilisateur non trouvé !" });
        } else if (!(await bcrypt.compare(password, user.password))) {
            return res.status(400).send({ error: "Mot de passe incorrect !" });
        }

        user.password = undefined;

        res.send({
            user,
            token: generateToken({ _id: user._id }),
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "Error in authenticate" });
    }
});

/// Forgot password /////////////////////////////////////////////////////////////////////////////

router.post("/forgot_password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send({ error: "User not found" });
        }

        const token = crypto.randomBytes(20).toString("hex");

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user._id, {
            $set: {
                passwordResetToken: token,
                passwordResetExpires: now,
            },
        });

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: `${email}`,
            from: "gmascarenhas3001@gmail.com",
            subject: `Reset Password ${user.name} `,
            html: `
              <p>Bonjour,</p>
              <p>Vous pouvez changer le password clickez sur le lien en dessus.</p>
              <p>"<strong>${user.name}</strong>"</p>
              <p>pour changer votre mot de passe : "https://car-friend-guto.herokuapp.com/resetpassword"</p>
            `,
        };

        (async () => {
            try {
                await sgMail.send(msg);
            } catch (error) {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body);
                }
            }
        })();

        return res.send("ok");
    } catch (err) {
        console.log(err);
        res.status(401).send(err);
    }
});

/// Reset password //////////////////////////////////////////////////////////////////////////////////

router.post("/reset_password", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select(
            "+passwordResetToken passwordResetExpires"
        );

        if (!user) {
            return res.status(401).send({ error: "User not found" });
        }

        const now = new Date();

        if (now > user.passwordResetExpires) {
            return res.status(400).send({ error: "Token expired" });
        }
        user.password = password;

        await user.save();
        res.send();
    } catch (err) {
        return res.status(400).send({ error: "Error on forgot password, try again!" });
    }
});

module.exports = app => app.use("/auth", router);
