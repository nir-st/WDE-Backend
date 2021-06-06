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

function getCurrentTimeStamp() {
    const d = new Date();
    let year = d.getFullYear().toString();
    let month = (d.getMonth() + 1).toString();
    if (month.length === 1) { month = '0' + month; }
    let day = d.getDate().toString();
    if (day.length === 1) { day = '0' + day; }
    let hours = d.getHours().toString();
    if (hours.length === 1) { hours = '0' + hours; }
    let minutes = d.getMinutes().toString();
    if (minutes.length === 1) { minutes = '0' + minutes; }
    return year+month+day+hours+minutes;
}

// this function will check all future games' date and move the ones that happened to the past games table
async function updatePastFutureGames() {
    const past_games = await DButils.execQuery(
        `SELECT GameId, TimeStamp FROM FutureGames;`
    );
    promises = [];
    const current_timestamp = getCurrentTimeStamp();
    past_games.forEach((game) => {
        if (game.TimeStamp < current_timestamp) {
            promises.push(moveFutureGameToPast(game.GameId));
        }
    });
    Promise.all(promises);
}

// this function gets a game id (of a future game)
// it moves the game from the future games table to the past games table
// (puts null in home/away team scores)
async function moveFutureGameToPast(game_id) {
    try{
        game_info = await DButils.execQuery(
            `SELECT * FROM FutureGames WHERE GameId = ${game_id};`
        );
        const {Date, Time, TimeStamp, HomeTeamId, AwayTeamId, Stadium, Referee} = game_info[0];
        await DButils.execQuery(
            `DELETE FROM FutureGames
            WHERE GameId=${game_id};`
        );
        return new Promise(async (resolve, reject) => {
            resolve(
                await DButils.execQuery(
                    `INSERT INTO dbo.PastGames (GameId, Date, Time, TimeStamp, HomeTeamId, AwayTeamId, Stadium, Referee)
                    VALUES (${game_id}, '${Date}', '${Time}', '${TimeStamp}', '${HomeTeamId}', '${AwayTeamId}', '${Stadium}', '${Referee}');`
                )
            );
        });
    } catch(err) {
        throw new Error(err);
    }
}

async function addNewGameEvent(GameId, Date, Time, GameMinute, Description) {
    try {
        if (await checkPastGameExists(GameId)) {
            await DButils.execQuery(
                `INSERT INTO dbo.EventLog (GameId, Date, Time, GameMinute, Description)
                VALUES (${GameId}, '${Date}', '${Time}', '${GameMinute}', '${Description}');`
            );
            return true;
        }
        else {
            return false;
        }
    }catch(err) {
        throw new Error(err);
    }
}

async function updateGameScore(gameId, homeTeamScore, awayTeamScore) {
    try {
        await DButils.execQuery(
            `UPDATE dbo.PastGames
            SET HomeTeamScore = ${homeTeamScore}, AwayTeamScore = ${awayTeamScore}
            WHERE GameId=${gameId};`
        );
    }
    catch(err) {
        throw new Error (err);
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
    if (!gameInfo || gameInfo.length == 0) {
        return null;
    }
    return extractRelevantFutureGameData(gameInfo[0]);
}

async function extractRelevantPastGameData(game_info) {
    const game_events = await getEventsByGameId(game_info.GameId);
    return {
        gameId: game_info.GameId,
        date: game_info.Date,
        time: game_info.Time,
        timeStamp: parseFloat(game_info.TimeStamp),
        homeTeamId: parseInt(game_info.HomeTeamId),
        awayTeamId: parseInt(game_info.AwayTeamId),
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
        date: game_info.Date,
        time: game_info.Time,
        timeStamp: parseFloat(game_info.TimeStamp),
        homeTeamId: parseInt(game_info.HomeTeamId),
        awayTeamId: parseInt(game_info.AwayTeamId),
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
        const a = await DButils.execQuery(
            `SELECT * FROM dbo.FutureGames WHERE GameId='${game_id}'`
        );
        console.log(a[0]);
        return a[0];
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

async function checkPastGameExists(game_id) {
    // this should check if the game exist..
    const game = await DButils.execQuery(
        `SELECT 1 FROM dbo.PastGames WHERE GameId='${game_id}'`
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
        const given_date = year.concat('-').concat(month).concat('-').concat(day);
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
            `SELECT MAX(a.GameId) FROM
            (SELECT GameId FROM FutureGames 
            UNION 
            SELECT GameId FROM PastGames) a;
            `
        ));
    });
}

async function addNewGame(new_game) {
    const {gameId, date, time, timeStamp, homeTeamId, awayTeamId, stadium, referee} = new_game;
    const currentTimeStap = getCurrentTimeStamp();
    let table;
    if (timeStamp > currentTimeStap) {
        table = 'dbo.FutureGames';
    }
    else {
        table = 'dbo.PastGames';
    }
    return new Promise(async (resolve, reject) => {
        resolve(
            await DButils.execQuery(
                `INSERT INTO ${table} (GameId, Date, Time, TimeStamp, HomeTeamId, AwayTeamId, Stadium, Referee)
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
exports.updatePastFutureGames = updatePastFutureGames;
exports.updateGameScore = updateGameScore;
exports.addNewGameEvent = addNewGameEvent;