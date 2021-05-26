var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const games_utils = require("./utils/games_utils");

  router.get("/nextLeagueGame", async (req, res, next) => {
      try {
        const game = await games_utils.getNextGameInfo();
        
        if (game == null) {
          res.status(204).send('no future games')
        }

        res.status(200).send(game)

      } catch (error) {
        next(error)
      }
  });

module.exports = router;
