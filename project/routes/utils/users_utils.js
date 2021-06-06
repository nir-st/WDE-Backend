const DButils = require("./DButils");

// bring all favorite games from DB by username
async function getFavoriteGames(username) {
  const game_ids = await DButils.execQuery(
    `select gameId from FavoriteGames where Username='${username}'`
  );
  return game_ids.map((game) => { 
    return (game.gameId); 
  });
}

async function markGameAsFavorite(game_id, username) {
  await DButils.execQuery(
    `INSERT INTO dbo.FavoriteGames (gameId, Username)
    VALUES (${game_id}, '${username}');`
  );
}

exports.getFavoriteGames = getFavoriteGames;
exports.markGameAsFavorite = markGameAsFavorite;
