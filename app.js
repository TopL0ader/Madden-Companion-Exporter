const express = require('express');
const admin = require("firebase-admin");

const app = express();

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

        const teamRef = ref.child(`league/${username}/teams`);
        teamRef.update(teams);
        
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
        const {params: { username }} = req;

        const teamRef = ref.child(`league/${username}/standings`);
        teamRef.update(teams);

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

    //const basePath = `${username}/data/week/${weekType}/${weekNumber}/${dataType}`;
    
    // "defense", "kicking", "passing", "punting", "receiving", "rushing"
    
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
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${dataType}`);
                const { teamStatInfoList: teamStats } = JSON.parse(body);
                weekRef.update(teamStats);
                break;
            }
            case 'defense': {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${dataType}`);
                const { playerDefensiveStatInfoList: defensiveStats } = JSON.parse(body);
                weekRef.update(defensiveStats);
                break;
            }
            case 'passing': {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${dataType}`);
                const { playerPassingStatInfoList: passingStats } = JSON.parse(body);
                weekRef.update(passingStats);
                break;
            }
            case 'rushing': {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${dataType}`);
                const { playerRushingStatInfoList: rushingStats } = JSON.parse(body);
                weekRef.update(rushingStats);
                break;
            }
            case 'recieving': {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${dataType}`);
                const { playerReceivingStatInfoList: receivingStats } = JSON.parse(body);
                weekRef.update(receivingStats);
                break;
            }
            case 'kicking': {
                const weekRef = ref.child(`league/${username}/stats/${weekType}/${weekNumber}/${dataType}`);
                const { playerKickingStatInfoList: kickingStats } = JSON.parse(body);
                weekRef.update(kickingStats);
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
        const teamRef = ref.child(`league/${username}/freeagents`);
        teamRef.update(teams);

        res.sendStatus(200);
    });       
});

// team rosters
app.post('/:username/:platform/:leagueId/team/:teamId/roster', (req, res) => {
    const db = admin.database();
    const ref = db.ref();
    const {params: { username, leagueId }
    } = req;
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { rosterInfoList } = JSON.parse(body);
        const dataRef = ref.child(`data/${username}/${leagueId}/roster`);
        const players = {}; rosterInfoList.forEach(player => { players[player.id] = player;
        });
        dataRef.set(players, error => {
            if (error) {
                console.log('Data could not be saved.' + error);
            } else {
                console.log('Data saved successfully.');
            }
        });
        res.sendStatus(200);
    });
});
app.listen(app.get('port'), () =>
    console.log('MaddenPFL Data is running on port', app.get('port'))
);
