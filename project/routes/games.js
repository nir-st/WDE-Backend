var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const games_utils = require("./utils/games_utils");

router.get("/futureGames/:teamId", async (req, res, next) => {
    try {
      const games = (
        await DButils.execQuery(
          `SELECT * FROM dbo.FutureGames WHERE HomeTeamId = '${req.params.teamId}' OR AwayTeamId = '${req.params.teamId}'`
        )
      );
  
      if (games.length == 0) {
        res.status(204).send('no future games were found for that id');    
      }

      else {
        res.status(200).send(
          games.map((game_info) => { 
            return games_utils.extractRelevantFutureGameData(game_info); 
          }));
      }

    } catch (error) {
      next(error);
    }
  });

  router.get("/pastGames/:teamId", async (req, res, next) => {
    try {
      const games = (
        await DButils.execQuery(
          `SELECT * FROM dbo.PastGames WHERE HomeTeamId = '${req.params.teamId}' OR AwayTeamId = '${req.params.teamId}'`
        )
      );
  
      if (games.length == 0) {
        res.status(204).send('no past games were found for that id');    
      }
      
      else {
        res.status(200).send(
          games.map((game_info) => { 
            return games_utils.extractRelevantPastGameData(game_info); 
          }));
      }

    } catch (error) {
      next(error);
    }
  });

  router.get("/nextLeagueGame", async (req, res, next) => {
      try {
        const game = await games_utils.getNextGameInfo();
        
        if (game == null) {
          res.status(204).send('no future game to that team id')
        }

        res.status(200).send(game)

      } catch (error) {
        next(error)
      }
  });

module.exports = router;
