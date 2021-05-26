var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const games_utils = require("./utils/games_utils");
const teams_utils = require("./utils/teams_utils");

router.get("/teamFullDetails/:teamId", async (req, res, next) => {
  let team_players = [];
  try {
    team_players = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
  
    const team_past_games = await games_utils.getTeamsPastGames(req.params.teamId);
    const team_future_games = await games_utils.getTeamsFutureGames(req.params.teamId);

    const team_info = teams_utils.getTeamInfo(req.params.teamId);

    res.send({
      id: req.params.teamId,
      name: team_info.name,
      founded: team_info.founded,
      logoPath: team_info.logoPath,
      players: team_players,
      pastGames: team_past_games,
      futureGames: team_future_games,
    });

  } catch (error) {
    next(error);
  }
});

router.get("/teamId/:teamName", async (req, res, next) => {
  let team_players = [];
  try {
    teamId = await teams_utils.getTeamId(
      req.params.teamId
    );

    res.send(teamId);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
