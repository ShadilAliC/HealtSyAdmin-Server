import crypto from 'crypto'
export const generateOTP=()=>{
    return crypto.randomInt(1000, 10000).toString()
}