const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

function findArbitrage(oddsData, riskLevel) {
  let riskMultiplier = 10;

  const opportunities = []; // Array to store arbitrage opportunities

  oddsData.forEach(event => {
    const { home_team, away_team, bookmakers } = event; // Destructure the properties

    const bestOdds = {};

    // Find the best odds for each outcome
    bookmakers.forEach(bookmaker => {
      bookmaker.markets.forEach(market => {
        market.outcomes.forEach(outcome => {
          if (!bestOdds[outcome.name] || outcome.price > bestOdds[outcome.name].price) {
            bestOdds[outcome.name] = { price: outcome.price, bookmaker: bookmaker.title };
          }
        });
      });
    });

    const invSum = Object.values(bestOdds).reduce((acc, data) => acc + (1 / data.price), 0);

    if (invSum < 1) {
      const opportunity = {
        event: `${home_team} vs ${away_team}`, // Construct the event name
        bets: Object.entries(bestOdds).map(([outcome, data]) => {
          const betAmount = riskMultiplier * (1 / data.price) / invSum;
          return {
            outcome,
            betAmount: betAmount.toFixed(2),
            bookmaker: data.bookmaker
          };
        })
      };
      opportunities.push(opportunity);
    }
  });

  return opportunities; // Return the array of opportunities
}

const api_key = ""; // Use environment variable in production


// A mapping from common user input to your sports API keys
const sportKeyMap = {
    "football": [
      "americanfootball_cfl",
      "americanfootball_nfl",
    ],
    "basketball": [
      "basketball_euroleague",
      "basketball_nba",
    ],
    "boxing": [
      "boxing_boxing",
    ],
    "cricket": [
      "cricket_icc_world_cup",
    ],
    "golf": [
      "golf_masters_tournament_winner",
      "golf_pga_championship_winner",
      "golf_the_open_championship_winner",
      "golf_us_open_winner",
    ],
    "ice hockey": [
      "icehockey_nhl",
      "icehockey_nhl_championship_winner",
      "icehockey_sweden_allsvenskan",
      "icehockey_sweden_hockey_league",
    ],
    "mixed_martial_arts": [
      "mma_mixed_martial_arts",
    ],
    "politics": [
      "politics_us_presidential_election_winner",
    ],
    "soccer": [
      "soccer_australia_aleague",
      "soccer_austria_bundesliga",
      "soccer_belgium_first_div",
      "soccer_brazil_campeonato",
      "soccer_brazil_serie_b",
      "soccer_chile_campeonato",
      "soccer_denmark_superliga",
      "soccer_efl_champ",
      "soccer_england_league1",
      "soccer_england_league2",
      "soccer_epl",
      "soccer_fa_cup",
      "soccer_france_ligue_one",
      "soccer_france_ligue_two",
      "soccer_germany_bundesliga",
      "soccer_germany_bundesliga2",
      "soccer_germany_liga3",
      "soccer_greece_super_league",
      "soccer_italy_serie_a",
      "soccer_italy_serie_b",
      "soccer_japan_j_league",
      "soccer_korea_kleague1",
      "soccer_mexico_ligamx",
      "soccer_netherlands_eredivisie",
      "soccer_norway_eliteserien",
      "soccer_poland_ekstraklasa",
      "soccer_portugal_primeira_liga",
      "soccer_spain_la_liga",
      "soccer_spain_segunda_division",
      "soccer_spl",
      "soccer_sweden_allsvenskan",
      "soccer_sweden_superettan",
      "soccer_switzerland_superleague",
      "soccer_turkey_super_league",
      "soccer_uefa_champs_league",
      "soccer_uefa_euro_qualification",
      "soccer_uefa_europa_conference_league",
      "soccer_uefa_europa_league",
      "soccer_usa_mls",
    ],
  };

  function findSportKeys(userInput) {
    let keys = [];
    for (const [key, value] of Object.entries(sportKeyMap)) {
      if (key.toLowerCase().includes(userInput.toLowerCase())) {
        keys = keys.concat(value);
      }
    }
    return keys;
  }
  
  app.get('/getOdds', async (req, res) => {
    console.log('Received request for odds with query:', req.query); // Prints the query parameters
  
    const { sport, date } = req.query;
    
    // Find the specific sports keys from the user input
    const sportsKeys = findSportKeys(sport);
    console.log('Sports keys found:', sportsKeys); // Prints the sports keys found
  
    if (sportsKeys.length === 0) {
      console.log('Sport not found for:', sport); // Logs when a sport is not found
      return res.status(404).send({ message: "Sport not found" });
    }
  
    try {
      let allOdds = [];
      for (const key of sportsKeys) {
        console.log('Fetching odds for sport key:', key); // Logs the current sport key being fetched
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/odds`, {
          params: {
            apiKey: api_key,
            regions: 'us',
            markets: 'h2h',
            oddsFormat: 'decimal',
            dates: date,
          },
        });
        allOdds = allOdds.concat(response.data);
        console.log(`Odds fetched for ${key}:`, response.data); // Logs the odds data fetched
      }
      const arbitrageOpportunities = findArbitrage(allOdds);
      console.log('Arbitrage opportunities found:', arbitrageOpportunities);
      res.json(arbitrageOpportunities);
    } catch (error) {
      // ... error handling ...
    }
  });
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });