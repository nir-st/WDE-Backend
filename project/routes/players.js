var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");

router.get("/player/:playerId", async (req, res, next) => {
  try {
    const player_info = await players_utils.getPlayersInfo(
      [req.params.playerId]
    );
    if (player_info.length == 0 || player_info[0] == null) {
      res.status(204).send('Not found');
    }
    res.send(player_info[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/preview/:playerId", async (req, res, next) => {
  try {
    const player_info = await players_utils.getPlayersPreviews(
      [req.params.playerId]
    );
    res.send(player_info);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
