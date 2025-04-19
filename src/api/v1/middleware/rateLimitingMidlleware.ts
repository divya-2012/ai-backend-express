import { Request, Response, NextFunction } from 'express';
import Redis from "ioredis"

const moment = require("moment")
const redisClient = new Redis("rediss://default:96f028b6d4cb4c3b9ddb93ba43a62e13@generous-lobster-39431.upstash.io:39431");

const RATELIMIT_DURATION_IN_SECONDS = 60
const NUMBER_OF_REQUEST_ALLOWED = 5

module.exports = {
  rateLimiter: async (req: any, res: any, next: any) => {
    const userId = req.headers["user_id"]
    const currentTime = moment().unix()

    const result = await redisClient.hgetall(userId)
    if (Object.keys(result).length === 0) {
      await redisClient.hset(userId, {
        "created_at": currentTime,
        "count": 1
      })
      return next()
    }
    if (result) {
      let diff = (currentTime - parseInt(result["created_at"]))

      if (diff > RATELIMIT_DURATION_IN_SECONDS) {
        await redisClient.hset(userId, {
          "created_at": currentTime,
          "count": 1
        })
        return next()
      }
    }
    if (parseInt(result["count"]) >= NUMBER_OF_REQUEST_ALLOWED) {
      return res.status(429).json({
        "success": false,
        "message": "user-ratelimited"
      })
    } else {
      await redisClient.hset(userId, {
        "count": parseInt(result["count"]) + 1
      })
      return next()
    }
  }
}