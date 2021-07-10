var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const games_utils = require("./utils/games_utils");

/**
 * Authenticate all incoming requests by middleware
 */
// router.use(async function (req, res, next) {
//   if (req.session && req.session.username) {
//     DButils.execQuery("SELECT Username FROM dbo.Users")
//       .then((users) => {
//         if (users.find((x) => x.Username === req.session.username)) {
//           req.username = req.session.username;
//           next();
//         }
//       })
//       .catch((err) => next(err));
//   } else {
//     res.sendStatus(401);
//   }
// });

router.get("/favoriteGames", async (req, res, next) => {
  try {
    // const username = req.session.username;
    const username = req.body.username;
    const game_ids = await users_utils.getFavoriteGames(username);
    if (!game_ids || game_ids.length == 0) {
      res.status(204).send('no favorite games');
    }
    else {
      const results = await games_utils.getGamesInfoByIds(game_ids);
      res.status(200).send(results);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/favoriteGames", async (req, res, next) => {
  try {
    const game_id = req.body.gameId;
    const isExist = await games_utils.checkFutureGameExists(game_id);
    if (!isExist) {
      res.status(400).send('bad game id');
    }
    else {
      // const username = req.session.username;
      const username = req.body.username;
      const game_ids = await users_utils.markGameAsFavorite(game_id, username);
      res.status(201).send('game has been added to favorites!');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
