const axios = require("axios");
const DButils = require("./DButils");

async function getTeamsPastGames(teamId) {
    try {
        const games = (
            await DButils.execQuery(
            `SELECT * FROM dbo.PastGames WHERE HomeTeamId = '${teamId}' OR AwayTeamId = '${teamId}'`
            )
        );    
        const promises = games.map(async (game) => {
            return await extractRelevantPastGameData(game);
        });
        return Promise.all(promises);
        } catch (error) {
        throw new Error(error);
    }
}

async function getTeamsFutureGames(teamId) {
    try {
        const games = (
            await DButils.execQuery(
                `SELECT * FROM dbo.FutureGames WHERE HomeTeamId = '${teamId}' OR AwayTeamId = '${teamId}'`
            )
        );

        return games.map((game_info) => { 
            return extractRelevantFutureGameData(game_info); 
        });

        } catch (error) {
        throw new Error(error);
    }
}

async function getEventsByGameId(gameId) {
    try {
        const events = (
            await DButils.execQuery(
                `SELECT * FROM dbo.EventLog WHERE GameId = '${gameId}'`
            )
        );
    return events;
    } catch (error) {
        throw new Error(error);
    }
}

async function getNextGameInfo() {
    const gameInfo = await DButils.execQuery(
        `SELECT *
        FROM dbo.FutureGames AS t
        WHERE t.TimeStamp = (SELECT MIN(TimeStamp)
                     FROM dbo.FutureGames AS t2)`
    );
    return extractRelevantFutureGameData(gameInfo[0]);
}

async function extractRelevantPastGameData(game_info) {
    const game_events = await getEventsByGameId(game_info.GameId);
    return {
        gameId: game_info.GameId,
        date: game_info.GameDate,
        time: game_info.GameTime,
        homeTeamId: game_info.HomeTeamId,
        awayTeamId: game_info.AwayTeamId,
        stadium: game_info.Stadium,
        homeTeamScore: game_info.HomeTeamScore,
        awayTeamScore: game_info.AwayTeamScore,
        eventLog: game_events,
        referee: game_info.Referee,
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
        referee: game_info.Referee,
    };
}

async function getAllFutureGames() {
    const gamesFromDB = await DButils.execQuery(
        `SELECT * FROM dbo.FutureGames`
    );
    let extractedData = []
    gamesFromDB.map((game) => {
        extractedData.push(extractRelevantFutureGameData(game));
    });
    return extractedData;
}

async function getAllPastGames() {
    const gamesFromDB = await DButils.execQuery(
        `SELECT * FROM dbo.PastGames`
    );
    const promises = gamesFromDB.map(async (game) => {
        return await extractRelevantPastGameData(game);
    });
    return Promise.all(promises);
}

async function getGamesInfoByIds(game_ids) {
    const promises = game_ids.map(async (game_id) => {
        return await DButils.execQuery(
            `SELECT * FROM dbo.FutureGames WHERE GameId='${game_id}'`
        );
    });
    return Promise.all(promises);
}

async function checkFutureGameExists(game_id) {
    // this should check if the game exist..
    const game = await DButils.execQuery(
        `SELECT 1 FROM dbo.FutureGames WHERE GameId='${game_id}'`
    );
    if (!game || game.length == 0) {
        return false;
    }
    return true;
}

function validateTimeAndDate(year, month, day, time) {
    // date should be yyyy/mm/dd
    // time should be hh:mm
    try {
        if (month.length != 2) {
            return false;
        }
        if (day.length != 2) {
            return false;
        }
        const given_date = year.concat('/').concat(month).concat('/').concat(day);
        const test_date = new Date(given_date);
        
        if (!/^([0:1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            return false;
        }
        return true;

    } catch (error) {
        return false;
    }
}

async function getAvailableGameId() {
    return new Promise(async (resolve, reject) => {
        resolve (await DButils.execQuery(
            `SELECT MAX(GameId) FROM dbo.FutureGames`
        ));
    });
}

async function addNewGame(new_game) {
    const {gameId, date, time, timeStamp, homeTeamId, awayTeamId, stadium, referee} = new_game;
    return new Promise(async (resolve, reject) => {
        resolve(
            await DButils.execQuery(
                `INSERT INTO dbo.FutureGames (GameId, Date, Time, TimeStamp, HomeTeamId, AwayTeamId, Stadium, Referee)
                VALUES (${gameId}, '${date}', '${time}', '${timeStamp}', '${homeTeamId}', '${awayTeamId}', '${stadium}', '${referee}');`
            )
        );
    });
}

async function getAllReferees() {
    return new Promise(async (resolve, reject) => {
        resolve(
            await DButils.execQuery(
                `SELECT * FROM dbo.Referees;`
            )
        );
    });
}


exports.getNextGameInfo = getNextGameInfo;
exports.getTeamsPastGames = getTeamsPastGames;
exports.getTeamsFutureGames = getTeamsFutureGames;
exports.getAllFutureGames = getAllFutureGames;
exports.getAllPastGames = getAllPastGames;
exports.getGamesInfoByIds = getGamesInfoByIds;
exports.checkFutureGameExists = checkFutureGameExists;
exports.validateTimeAndDate = validateTimeAndDate;
exports.getAvailableGameId = getAvailableGameId;
exports.addNewGame = addNewGame;
exports.getAllReferees = getAllReferees;