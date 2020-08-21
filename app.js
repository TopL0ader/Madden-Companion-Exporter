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

        const teamRef = ref.child(`league/${username}/leagueteams`);
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
    const { params: { username, weekType, weekNumber, dataType }, } = req;

    //const basePath = `${username}/data/week/${weekType}/${weekNumber}/${dataType}`;
    
    // "defense", "kicking", "passing", "punting", "receiving", "rushing"
    
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        switch (dataType) {
            case 'schedules': {
                const weekRef = ref.child(`league/${username}/schedules/${weekType}/${weekNumber}`);
                const {schedules} = JSON.parse(body);
                weekRef.update(schedules);
                break;
            }
            case 'teamstats': {
                const weekRef = ref.child(`league/${username}/teamstats/${weekType}/${weekNumber}`);
                const {teamstats} = JSON.parse(body);
                weekRef.update(teamstats);
                break;
            }
            case 'defense': {
                const weekRef = ref.child(`league/${username}/defstats/${weekType}/${weekNumber}`);
                const {defstats} = JSON.parse(body);
                weekRef.update(defstats);
                break;
            }
            default: {
                const weekRef = ref.child(`league/${username}/offstats/${weekType}/${weekNumber}`);
                const {offstats} = JSON.parse(body);
                weekRef.update(offstats);
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
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { rosterInfoList: players } = JSON.parse(body);
        const { params: { username } } = req;
        const teamRef = ref.child(`league/${username}/players`);
        teamRef.update(players);

        res.sendStatus(200);
    });
});
app.listen(app.get('port'), () =>
    console.log('Madden Data is running on port', app.get('port'))
);
