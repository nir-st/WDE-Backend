const axios = require("axios");
const { getLeagueDetails } = require("./league_utils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const LEAGUE_ID = 271;
const COUNTRY_ID = 320;

async function getTeamInfo(team_id) {
  try {
    const team = await axios.get(`${api_domain}/teams/${team_id}`, {
      params: {
        include: 'league',
        api_token: process.env.api_token,
      },
    });

    if (!team || !team.data.data.league || team.data.data.league.data.id != LEAGUE_ID) {
      return null;
    }
    const {name, logo_path, venue_id, founded} = team.data.data;

    return {
        name: name,
        logo_path: logo_path,
        founded: founded,
    };
   } catch (error) { 
     return null; 
    }
}

async function getTeamPreviewsByName(team_name) {
  
  let league_teams = []
  
  const teams = await axios.get(`${api_domain}/teams/search/${team_name}`, {
    params: {
      api_token: process.env.api_token,
      include: 'league',
    },
  });
  
  teams.data.data.map((team) => {
    if (team.league.data.id == LEAGUE_ID) {
      league_teams.push({
        id: team.id,
        name: team.name,
        logoPath: team.logo_path
      });
    }
  });

  return league_teams;

}

async function getAllTeams() {
  try {
    const league_teams = []
    const all_teams = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/countries/${COUNTRY_ID}/teams`,
      {
        params: {
          include: 'league',
          api_token: process.env.api_token,
        },
      }
    );
    all_teams.data.data.forEach(team => {
      if (team.league.data.id = LEAGUE_ID) {
        league_teams.push(
          {
            id: team.id,
            name: team.name,
            logoPath: team.logo_path,
          });
      }
    });
    return league_teams; 
  } catch(err) {
    throw new Error(err);
  }
}

exports.getTeamInfo = getTeamInfo;
exports.getTeamPreviewsByName = getTeamPreviewsByName;
exports.getAllTeams = getAllTeams;