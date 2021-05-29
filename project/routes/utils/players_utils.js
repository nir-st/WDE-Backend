const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const LEAGUE_ID = 271;

async function getPlayerIdsByTeam(team_id) {
  
  let player_ids_list = [];

  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}

function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { id, fullname, image_path, position_id } = player_info.data.data;
    const { name } = player_info.data.data.team.data;

    return {
      id: id,
      fullname: fullname,
      image_url: image_path,
      positionId: position_id,
      teamName: name,
    };
  });
}

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}


async function getPlayerPreviewsByName(player_name) {
  
  let league_players = []
  
  const players = await axios.get(`${api_domain}/players/search/${player_name}`, {
    params: {
      api_token: process.env.api_token,
      include: 'team.league',
    },
  });

  players.data.data.map((player) => {
    if (player.team != null && player.team.data.league != null && player.team.data.league.data.id == LEAGUE_ID) {
      league_players.push({
        id: player.player_id,
        fullname: player.fullname,
        teamName: player.team.data.name,
        positionId: player.position_id,
        image_url: player.image_path,
      });
    }
  });
  return league_players;
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayerPreviewsByName = getPlayerPreviewsByName;
