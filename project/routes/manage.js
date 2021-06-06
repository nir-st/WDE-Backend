var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const games_utils = require("./utils/games_utils");

router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT Username FROM dbo.Users WHERE Permissions=1")
      .then((users) => {
        if (users.find((x) => x.Username === req.session.username)) {
          req.username = req.session.username;
          next();
        }
        else {
          res.sendStatus(403);
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

router.post("/gameEvent", async (req, res, next) => {
  try {
    const {GameId, Date, Time, GameMinute, Description} = req.body;
    const succeed = await games_utils.addNewGameEvent(GameId, Date, Time, GameMinute, Description);
    if (succeed) {
      res.status(201).send('game event successfully added');
    }
    else {
      res.status(204).send('game id was not found');
    }
  } catch(err) {
    res.status(400).send(err);
  }
});

router.post("/updateGameScore", async (req, res, next) => {
  try {
    const {gameId, homeTeamScore, awayTeamScore} = req.body;
    await games_utils.updateGameScore(gameId, homeTeamScore, awayTeamScore);
    res.status(201).send('game score successfully updated');
  } catch(err) {
    res.status(400).send(err);
  }
});

router.post("/addNewGame", async (req, res, next) => {
  try {
    const {year, month, day, time, homeTeamId, awayTeamId, stadium, referee} = req.body;

    if (games_utils.validateTimeAndDate(year, month, day, time)) {
      const timeStamp = year.concat(month).concat(day).concat(time.replace(':', ''));
      const game_id = await games_utils.getAvailableGameId();
      const new_game = {
        gameId: game_id[0][''] + 1,
        date: year.concat('-').concat(month).concat('-').concat(day),
        time: time,
        timeStamp: timeStamp,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        stadium: stadium,
        referee: referee,
      };
      await games_utils.addNewGame(new_game);
      res.status(201).send("The game was succesfully added");
    }
    else {
      res.status(400).send('bad input');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
