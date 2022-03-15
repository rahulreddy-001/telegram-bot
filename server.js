var express = require("express");

const { Telegraf } = require("telegraf");
const TOKEN = "5299987586:AAFnDDwZkwBDOIpLgO2GxCEYfHaltZfRYKY";
const bot = new Telegraf(TOKEN);
// const { getMatchDetails } = require("./fotData");
const cors = require("cors");
//________________________________________________________________________________________

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5003;
app.get("/", (req, res) => {
  res.status(200).send("Home Page");
});

var axios = require("axios").default;
const handleFetchNews = async (msg) => {
  var options = {
    method: "GET",
    url: "https://free-news.p.rapidapi.com/v1/search",
    params: { q: "test " + msg, lang: "en" },
    headers: {
      "x-rapidapi-host": "free-news.p.rapidapi.com",
      "x-rapidapi-key": "8e550ef178mshd85d2e5db848affp1d360fjsn61d9f3b29405",
    },
  };
  let response = await axios.request(options);
  return response.data;
};

//_________________________________________________________________________________________

bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(
    ctx.chat.id,
    `Hello ${ctx.from.first_name}, Welcome to my new telegram bot.`
  );
});

bot.command("test", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    `<i>This is the link for the advanced help</i>`,
    { parse_mode: "HTML" }
  );
});

const paramsData = (link) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Clink here to read more...",
            url: link,
          },
        ],
      ],
    },
    parse_mode: "HTML",
  };
};

const handleNews = () => {
  bot.on("message", async (ctx) => {
    console.log(ctx.message.text);
    let dataJSON = await handleFetchNews(ctx.message.text);
    let respMsgData = "";
    resArr = dataJSON.articles.slice(0, 5);
    resArr.map((e, index) => {
      respMsgData = `<b>${e.title}</b>\n\n` + `${e.summary}\n\n`;
      bot.telegram.sendMessage(ctx.chat.id, respMsgData, paramsData(e.link));
    });
  });
};

bot.command("news", async (ctx) => {
  ctx.reply("Enter keywords to fetch news...");
  handleNews();
});

//=================================================================
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

bot.command("fotscore", (ctx) => {
  console.log(ctx.from);
  let reqMsg = `Select any one of the league...`;
  bot.telegram.sendMessage(ctx.chat.id, reqMsg, {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "CHAMPIONS LEAGUE",
            callback_data: "champleague",
          },
        ],
        [
          {
            text: "PREMIER LEAGUE",
            callback_data: "premierleague",
          },
          {
            text: "LALIGA",
            callback_data: "laliga",
          },
        ],
        [
          {
            text: "BUNDESLIGA",
            callback_data: "bundensliga",
          },
          {
            text: "LIGUE 1",
            callback_data: "ligue1",
          },
        ],
      ],
    },
  });
});

bot.action("champleague", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    "<b>INTERNATIONAL CHAMPIONS LEAGUE</b>",
    {
      parse_mode: "HTML",
    }
  );
  getMatchDetails(875880, bot, ctx);
});

bot.action("premierleague", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "<b>ENGLAND PREMIER LEAGUE</b>", {
    parse_mode: "HTML",
  });
  getMatchDetails(47, bot, ctx);
});

bot.action("laliga", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "<b>SPAIN LALIGA</b>", {
    parse_mode: "HTML",
  });
  getMatchDetails(87, bot, ctx);
});

bot.action("bundensliga", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "<b>GERMANY BUNDESLIGA</b>", {
    parse_mode: "HTML",
  });
  getMatchDetails(54, bot, ctx);
});
bot.action("ligue1", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "<b>FRANCE LIGUE 1</b>", {
    parse_mode: "HTML",
  });
  getMatchDetails(53, bot, ctx);
});

//method to start get the script to pulling updates for telegram
bot.launch();

app.listen(PORT, () => {
  console.log(`Listening on PORT : ${PORT}`);
});
