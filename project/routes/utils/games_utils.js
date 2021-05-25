const DButils = require("./DButils");

async function getNextGameInfo() {

    const gameInfo = await DButils.execQuery(
        `SELECT *
        FROM dbo.FutureGames AS t
        WHERE t.GameTimeStamp = (SELECT MIN(GameTimeStamp)
                     FROM dbo.FutureGames AS t2)`
    );

    return extractRelevantFutureGameData(gameInfo[0]);
}

function extractRelevantPastGameData(game_info) {
    return {
        gameId: game_info.GameId,
        date: game_info.GameDate,
        time: game_info.GameTime,
        homeTeamId: game_info.HomeTeamId,
        awayTeamId: game_info.AwayTeamId,
        stadium: game_info.Stadium,
        homeTeamScore: game_info.HomeTeamScore,
        awayTeamScore: game_info.AwayTeamScore,
        eventLogId: game_info.EventLogId,
    };
  }

  function extractRelevantFutureGameData(game_info) {
    return {
        gameId: game_info.GameId,
        date: game_info.GameDate,
        time: game_info.GameTime,
        homeTeamId: game_info.HomeTeamId,
        awayTeamId: game_info.AwayTeamId,
        stadium: game_info.Stadium,
    };
  }

exports.getNextGameInfo = getNextGameInfo;
exports.extractRelevantFutureGameData = extractRelevantFutureGameData;
exports.extractRelevantPastGameData = extractRelevantPastGameData;