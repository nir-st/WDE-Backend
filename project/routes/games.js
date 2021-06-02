var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const games_utils = require("./utils/games_utils");

router.get("/nextLeagueGame", async (req, res, next) => {
    try {
      const game = await games_utils.getNextGameInfo();
      
      if (game == null) {
        res.status(204).send('no future games');
      }

      res.status(200).send(game)

    } catch (error) {
      next(error);
    }
});

router.get("/allFutureGames", async (req, res, next) => {
  try {
    
    const games = await games_utils.getAllFutureGames();
    
    if (games == null) {
      res.status(204).send('no future games');
    }

    res.status(200).send(games);

  } catch (error) {
    next(error);
  }
});

router.get("/allPastGames", async (req, res, next) => {
  try {
    
    const games = await games_utils.getAllPastGames();
    
    if (games == null) {
      res.status(204).send('no past games');
    }

    res.status(200).send(games);

  } catch (error) {
    next(error);
  }
});

router.get("/Referees", async(req, res, next) => {
  try{
    const names = await games_utils.getAllReferees();
    if (names.length == 0) {
      res.status(204).send('no referees found');
    }
    else {
      res.status(200).send(names);
    }
  } catch(err) {
    res.status(400).send(err);
  }
});

module.exports = router;
