const axios = require("axios");
const LEAGUE_ID = 271;

async function getLeagueDetails() {
  let league_name = 'not available';
  let season_name = 'not available';
  let stage_name = 'not available';

  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  if (league.data.data.current_stage_id != null) {
    const stage = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      }
    );
    if (!stage || !stage.data || stage.data.data || stage.data.data.name) {
      stage_name = stage.data.data.name;
    }
  }
  if (league.data.data.name != null) {
    league_name = league.data.data.name;
  }
  if (league.data.data.season.data.name != null) {
    season_name = league.data.data.season.data.name;
  }
  return {
    league_name: league_name,
    current_season_name: season_name,
    current_stage_name: stage_name,
  };
}
exports.getLeagueDetails = getLeagueDetails;
