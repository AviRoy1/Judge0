import express from 'express';
import Submission from '../../model/Submission';
import Execution from '../../model/Execution';
import User from '../../model/User';
import { getErrorMessage } from '../../utils/joi.util';
import joi from 'joi';
import verifytoken from '../../middleware/verifyToken';
import { spawn } from 'child_process';
import { Performance } from 'perf_hooks';


const router = express.Router();

function replaceLineBreaks(code: string): string {
    const lineBreakSequence = '{LINE_BREAK}';
    const lineBreakCharacter = '\n';
  
    const updatedCode = code.replace(new RegExp(lineBreakSequence, 'g'), lineBreakCharacter);
  
    return updatedCode;
  }
  

const executionSchema = joi.object().keys({
    language: joi.string().lowercase().trim().required(),
    code: joi.any().required(),
})
router.post(
    '/submitcode',
    verifytoken,
    async(req,res,next) => {
        try {
            req.body = await executionSchema.validateAsync(req.body);
            next();
        } catch (err) {
            return res.status(422).json({message: getErrorMessage(err)});
        }
    },
    async(req: any, res) => {
        try {
            const language = req.body.language;
            const code = req.body.code;
            const updatedCode = replaceLineBreaks(code);
            
            const submission = await Submission.create({
                userId: req.user.id,
                language: language,
                code: updatedCode,
                createdAt: new Date(),
            });

            const execution = await Execution.create({
                submissionId: submission._id,
                status: "queued",
                output: "",
                error: "",
                createdAt: new Date(),
            })

            return res.status(200).json({sumitted: submission});

        } catch (err) {
            return res.status(400).json({ message: err });
        }
    }
)


export default router;