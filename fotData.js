// https://www.fotmob.com/matches?date=20220315
// https://www.fotmob.com/matchDetails?matchId=3610214
// champleague=875880
//premierleague=47
//laliga=87
//bundensliga=54
//ligue 1 =53

const axios = require("axios");

const getData = async () => {
  let date = new Date();
  date = date.toLocaleDateString();
  date = date.split("/")[2] + date.split("/")[1] + date.split("/")[0];
  let response = await axios.get(`https://www.fotmob.com/matches?date=${date}`);

  return response.data;
};

const getMatchData = async (matchId) => {
  let response = await axios.get(
    `https://www.fotmob.com/matchDetails?matchId=${matchId}`
  );
  return response.data;
};

const fetchDetails = async (matchId) => {
  let matchData = await getMatchData(matchId);
  let responseStr = "\n";
  if (matchData.header.events !== null) {
    if (matchData.header.events.homeTeamGoals !== null) {
      let homeTeam = matchData.header.events.homeTeamGoals;
      homeTeam = Object.values(homeTeam);
      responseStr += `${matchData.general.homeTeam.name} :\n\n`;
      if (homeTeam !== null) {
        homeTeam.map((p) => {
          p.map((g) => {
            responseStr += `${g.nameStr}  ${g.timeStr} ${g.assistStr || ""}\n`;
          });
        });
      }
    }
    if (matchData.header.events.awayTeamGoals !== null) {
      let awayTeam = matchData.header.events.awayTeamGoals;
      awayTeam = Object.values(awayTeam);
      responseStr += `\n${matchData.general.awayTeam.name} :\n\n`;
      if (awayTeam !== null) {
        awayTeam.map((p) => {
          p.map((g) => {
            responseStr += `${g.nameStr}  ${g.timeStr} ${g.assistStr || ""}\n`;
          });
        });
      }
    }
  }
  return responseStr;
};
getMatchDetails = async (leg, bot, ctx) => {
  let data = await getData();
  let flag = 0;
  data.leagues.map((e) => {
    if (e.id === leg) {
      flag += 1;
      let match = e.matches;

      match.map(async (m) => {
        var responseValue = "";
        let details = await fetchDetails(m.id);
        responseValue += `Time      ::  ${m.time}\n`;
        responseValue += `Home    ::  ${m.home.name}\n`;
        responseValue += `Away     ::  ${m.away.name}\n`;
        responseValue += `Score    ::  ${m.status.scoreStr}\n`;
        responseValue += `Status   ::  ${m.status.reason.long}\n`;
        responseValue += details;
        bot.telegram.sendMessage(ctx.chat.id, responseValue);
        //console.log(responseValue);
      });
    }
  });
  if (flag === 0) {
    bot.telegram.sendMessage(
      ctx.chat.id,
      "Looks like no matches are sheduled today..."
    );
  }
};
module.exports = { getMatchDetails };
