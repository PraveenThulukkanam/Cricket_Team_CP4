const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

console.log(dbPath)

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer();

const converDBtoResponse = (dbObj) => {
  return {
    playerId = dbObj.player_id,
    playerName = dbObj.player_name,
    jerseyNumber = dbObj.jersey_number,
    role = dbObj.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerDetailsQuery = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id`
  const playersArray = await db.all(getPlayerDetailsQuery)
  response.send(playersArray.map(eachPlayer => converDBtoResponse(eachPlayer)))
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerDetailsQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES (
        '${playerName}',
         ${jerseyNumber},
        '${role}');
    `
  const dbResponse = await db.run(addPlayerDetailsQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetailQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId}`
  const playerDetails = await db.get(getPlayerDetailQuery)
  response.send(converDBtoResponse(playerDetails))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerDetailQuery = `
    SET 
       player_name = '${playerName}',
       jersey_number=${jerseyNumber},
       role = '${role}'
    WHERE player_id = ${playerId}`
  await db.run(updatePlayerDetailQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const playerId = request.params
  const deletePlayerDetailQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId}`
  await db.run(deletePlayerDetailQuery)
  response.send('Player Details Removed')
})

module.exports = app
