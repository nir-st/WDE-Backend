var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const games_utils = require("./utils/games_utils");
const teams_utils = require("./utils/teams_utils");

router.get("/teamId/:teamName", async(req, res, next) => {
  try {
    const team_id = await teams_utils.getTeamId(req.params.teamName);
    if (team_id == -1) {
      res.status(204).send('team not found');
    }
    else {
      res.status(200).send(team_id);
    }
  } catch(err) {
    next(err);
  }
});

router.get("/allTeams", async(req, res, next) => {
  try {
    team_names = await teams_utils.getAllTeams();
    if (team_names.length == 0) {
      res.status(204).send('no teams found')
    }
    else {
      res.status(200).send(team_names);
    }
  } catch(err) {
    res.status(404);
  }
});

router.get("/teamFullDetails/:teamId", async (req, res, next) => {
  const team_info = await teams_utils.getTeamInfo(req.params.teamId);
  if (team_info == null) {
    res.sendStatus(204);
  }
  let team_players = [];
  try {
    team_players = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    
    const team_past_games = await games_utils.getTeamsPastGames(req.params.teamId);
    const team_future_games = await games_utils.getTeamsFutureGames(req.params.teamId);
    

    res.send({
      id: req.params.teamId,
      name: team_info.name,
      founded: team_info.founded,
      logoPath: team_info.logo_path,
      players: team_players,
      pastGames: team_past_games,
      futureGames: team_future_games,
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
