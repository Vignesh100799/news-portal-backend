var express = require("express");
const { firebaseApp } = require("../library/firebase");
const { Admin } = require("../model/admin")
var router = express.Router();
const jwt = require("jsonwebtoken");

router.post('/login-firebase', async (res, req) => {
    try {
        const token = req.body.token;
        const decodedToken = await firebaseApp.auth().verifyIdToken(token);
        if (decodedToken.email) {
            const admin = await Admin.findOne({ firebaseId: decodedToken.uid });
            if (admin) {
                // Generate JWT token
                const token = jwt.sign(
                    { id: admin._id, role: admin.role, name: admin.name },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
                );
                res.json({
                    token, admin: {
                        name: admin.name,
                        email: admin.email,
                        role: admin.role,
                        _id: admin._id,
                    }
                });
            } else {
                let newAdmin = new Admin({
                    name: decodedToken.name,
                    email: decodedToken.email,
                    firebaseId: decodedToken.uid,
                });
                await newAdmin.save();
                // Generate JWT token
                const token = jwt.sign(
                    { id: newAdmin._id, role: newAdmin.role, name: newAdmin.name },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
                );
                res.json({
                    token, admin: {
                        name: newAdmin.name,
                        email: newAdmin.email,
                        role: newAdmin.role,
                        _id: newAdmin._id,
                    }
                });
            }
        } else {
            res.status(404).json({ status: "error", message: "Sign in failed" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: "Something went wrong" });
    }


})






module.exports = router;
