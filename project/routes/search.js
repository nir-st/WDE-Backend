var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const teams_utils = require("./utils/teams_utils");
const players_utils = require("./utils/players_utils");

/**SEARCH TEAM BY NAME */
router.get("/teams/:teamName", async (req, res, next) => {
  let teamPreviews = []
  try {
    
    teamPreviews = await teams_utils.getTeamPreviewsByName(req.params.teamName);

    if (teamPreviews.length == 0) {
      res.status(204).send('no results');
    }
    else {
      res.status(200).send(teamPreviews);
    }

  } catch (error) {
    next(error);
  }
});

/**SEARCH PLAYER BY NAME */
router.get("/players/:playerName", async (req, res, next) => {
  let playerPreviews = []
  try {
    
    playerPreviews = await players_utils.getPlayerPreviewsByName(req.params.playerName);

    if (playerPreviews.length == 0) {
      res.status(204).send('no results');
    }
    else {
      res.status(200).send(playerPreviews);
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;
