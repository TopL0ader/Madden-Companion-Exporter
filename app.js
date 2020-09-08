const express = require('express');
const admin = require("firebase-admin");

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

const serviceAccount = require("./cfm-stats-firebase-adminsdk-bhkp7-2216e74e82.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cfm-stats.firebaseio.com/"
});

app.set('port', (process.env.PORT || 5000));

// get user
app.get('/:user', function(req, res) {
    return res.send("username is set to " + req.params.user);
});

// delete user data
app.get('/delete/:user', function(req, res) {
    const db = admin.database();
    const ref = db.ref();
    const dataRef = ref.child(req.params.user);
    dataRef.remove();
    return res.send('Madden Data Cleared for ' + req.params.user);
});

// league teams
app.post('/:username/:platform/:leagueId/leagueteams', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { leagueTeamInfoList: teams } = JSON.parse(body);
        const { params: { username, leagueId } } = req;
        teams.forEach(team => {
        const teamRef = ref.child(`league/${username}/teams/${team.teamId}`);
        teamRef.update(teams);
    });
        res.sendStatus(200);
    });
});

// standings
app.post('/:username/:platform/:leagueId/standings', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { teamStandingInfoList: teams } = JSON.parse(body);
        const {params: { username, leagueId }} = req;
        teams.forEach(team => {
        const teamRef = ref.child(`league/${username}/teams/${team.teamId}`);
        teamRef.update(team);
        });

        res.sendStatus(200);
    });
});

// capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// schedules and stats
app.post('/:username/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    const { params: { username, leagueId, weekType, weekNumber, dataType }, } = req;


    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        switch (dataType) {
            case 'schedules': {
                const weekRef = ref.child(`league/${username}/schedules/${weekType}/${weekNumber}/${dataType}`);
                const { gameScheduleInfoList: schedules } = JSON.parse(body);
                weekRef.update(schedules);
                break;
            }

            case 'teamstats': {
                const { teamStatInfoList: teamStats } = JSON.parse(body);
                teamStats.forEach(stat => {
                const weekRef = ref.child(`league/${username}/stats/}/${weekType}/${weekNumber}/${stat.teamId}/team-stats`);
                weekRef.update(stat);
            });
                break;
            }
            case 'defense': {
                const { playerDefensiveStatInfoList: defensiveStats } = JSON.parse(body);
                defensiveStats.forEach(stat => {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${stat.teamId}/player-stats/${stat.rosterId}`);
                weekRef.update(stat);
            });
                break;
            }
            case 'passing': {
                const { playerPassinngStatInfoList: passingStats } = JSON.parse(body);
                passingStats.forEach(stat => {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${stat.teamId}/player-stats/${stat.rosterId}`);
                weekRef.update(stat);
            });
                break;
            }
            case 'rushing': {
                const { playerRushingStatInfoList: rushingStats } = JSON.parse(body);
                rushingStats.forEach(stat => {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${stat.teamId}/player-stats/${stat.rosterId}`);
                weekRef.update(stat);
            });
                break;
            }
            case 'recieving': {
                const { playerRecievingStatInfoList: recievingStats } = JSON.parse(body);
                recievingStats.forEach(stat => {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${stat.teamId}/player-stats/${stat.rosterId}`);
                weekRef.update(stat);
            });
                break;
            }
            case 'kicking': {
                const { playerKickingStatInfoList: kickingStats } = JSON.parse(body);
                kickingStats.forEach(stat => {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${stat.teamId}/player-stats/${stat.rosterId}`);
                weekRef.update(stat);
            });
                break;
            }
        }
        res.sendStatus(200);
    });
});

// free agents
app.post('/:username/:platform/:leagueId/freeagents/roster', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { rosterInfoList: teams } = JSON.parse(body);
        const { params: { username } } = req;
        const teamRef = ref.child(`league/${username}/players/0`);
        teamRef.update(teams);

        res.sendStatus(200);
    });       
});

// rosters
app.post('/:username/:platform/:leagueId/team/:teamId/roster', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    const { params: { username, teamId } } = req;
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const {rosterInfoList} = JSON.parse(body);
        const teamRef = ref.child(`league/${username}/players/${teamId}`);
        const players = {};rosterInfoList.forEach(player => {players[player.rosterId] = player;});
        teamRef.update(players);

        res.sendStatus(200);
    });
});
app.listen(app.get('port'), () =>
    console.log('MaddenPFL Data is running on port', app.get('port'))
);
