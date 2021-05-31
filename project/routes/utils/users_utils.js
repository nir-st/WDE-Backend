const DButils = require("./DButils");

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into FavoritePlayers values ('${user_id}',${player_id})`
  );
}

async function getFavoritePlayers(user_id) {
    const player_ids = await DButils.execQuery(
    `select player_id from FavoritePlayers where user_id='${user_id}'`
  );
}

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

exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.getFavoriteGames = getFavoriteGames;
exports.markGameAsFavorite = markGameAsFavorite;
