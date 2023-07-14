import express from 'express';
import User from '../../model/User';
import jwt from 'jsonwebtoken';
import bcrypt, { compare } from 'bcrypt';
import { getErrorMessage } from '../../utils/joi.util';
import joi from 'joi';
const JWTSEC = "@ee!$^$#@@#fekedek 99##";
import verifytoken from '../../middleware/verifyToken';

const router = express.Router();




const signupSchema = joi.object().keys({
    name: joi.string().required(),
    email: joi.string().lowercase().email().required(),
    password: joi.string().required(),
});

router.post(
    '/signup',
    async (req,res,next) => {
        try {
            req.body = await signupSchema.validateAsync(req.body);
            next();
        } catch (error) {
            return res.status(422).json({message: getErrorMessage(error)});
        }
    },
    async(req,res) => {
        try {
            const oldUser = await User.findOne({email: req.body.email});
            if(oldUser) {
                return res.status(400).json({message: "This email has already been registered"})
            }
            const salt = await bcrypt.genSalt(10);
            const encryptPass = await bcrypt.hash(req.body.password, salt);

            const newUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: encryptPass,
                createdAt: new Date(),
            });

            const accessToken = jwt.sign(
                {
                  id: newUser._id,
                  email: newUser.email,
                },
                JWTSEC,
                {expiresIn: '1d'}
            );
            const result = await User.findById(newUser._id).select("-password");
            return res.status(200).json({user: result, token: accessToken});
        } catch (err) {
            return res.status(400).json({ message: err });
        }
    }
)

const loginSchema = joi.object().keys({
    email: joi.string().lowercase().email().required(),
    password: joi.string().required(),
});
router.post(
    '/login',
    async (req,res,next) => {
        try {
            req.body = await loginSchema.validateAsync(req.body);
            next();
        } catch (error) {
            return res.status(422).json({message: getErrorMessage(error)});
        }
    },
    async(req,res) => {
        try {

            var user = await User.findOne({email: req.body.email});
            if(!user) {
                return res.status(400).json({message: "Email is not registered"});
            }

            
            const comparePassword = await bcrypt.compare(
                req.body.password.toString(),
                user.password.toString(),
            );
            
            if(!comparePassword) {
                return res.status(400).json({message: "Incorrect password!!"});
            }
            const result = await User.findOne({email: req.body.email}).select("-password");
            const accessToken = jwt.sign(
                {
                  id: user._id,
                  email: user.email,
                },
                JWTSEC
            );

            return res.status(200).json({user: result, token: accessToken});

        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: err });
        }
    }
);

// change password
const chagepasswordSchema = joi.object().keys({
    newpassword: joi.string().required(),
    conformnewpassword: joi.string().required(),
});
router.put(
    '/changepassword',
    verifytoken,
    async (req,res,next) => {
        try {
            req.body = await chagepasswordSchema.validateAsync(req.body);
            next();
        } catch (error) {
            return res.status(422).json({message: getErrorMessage(error)});
        }
    },
    async(req:any,res) => {
        try {

            var user = await User.findById(req.user.id);
            const salt = await bcrypt.genSalt(10);
            
            if(!user) {
                return res.status(404).json("User is not exist");
            }
            if(req.body.newpassword !== req.body.conformnewpassword) {
                return res.status(400).json("new password and conform password is not matching");
            }

            const secpass = await bcrypt.hash(req.body.newpassword, salt);
            user.password = secpass;
            await user.save();

            return res.status(200).json("Password changes successfully");

        } catch (err) {
            return res.status(400).json({ message: err });
        }
    }
);





export default router;