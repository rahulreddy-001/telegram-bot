var express = require("express");

const { Telegraf } = require("telegraf");
const TOKEN = "5299987586:AAFnDDwZkwBDOIpLgO2GxCEYfHaltZfRYKY";
const bot = new Telegraf(TOKEN);
const { getMatchDetails } = require("./fotData");
const cors = require("cors");
//________________________________________________________________________________________

app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5001;
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
