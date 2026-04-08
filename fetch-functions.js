// ============================================================
// 📡 fetch-functions.js — Database Query Functions
// ============================================================
// This file contains all the functions that fetch (read) data
// from our Supabase "players" table.
//
// Each function uses the supabaseClient (from supabase-config.js)
// to make a query — similar to writing SQL like:
//   SELECT * FROM players;
//
// Supabase converts our JavaScript calls into SQL queries
// behind the scenes! ✨
// ============================================================

/**
 * 🏏 Fetch ALL players from the "players" table
 *
 * SQL equivalent: SELECT * FROM players ORDER BY runs DESC;
 *
 * @returns {Array} — An array of player objects
 */
async function fetchAllPlayers() {
  // .from("players")  → which table to query
  // .select("*")      → select all columns (id, name, team, runs, matches)
  // .order("runs")    → sort by runs in descending order
  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .order("runs", { ascending: false });

  // If something went wrong, log the error and return empty array
  if (error) {
    console.error("❌ Error fetching players:", error.message);
    return [];
  }

  console.log(`✅ Fetched ${data.length} players from database`);
  return data;
}

/**
 * 🏆 Find the TOP SCORER — the player with the highest runs
 *
 * SQL equivalent: SELECT * FROM players ORDER BY runs DESC LIMIT 1;
 *
 * @param {Array} players — The array of all players
 * @returns {Object} — The top scorer player object
 */
function findTopScorer(players) {
  if (players.length === 0) return null;

  // Since we already sorted by runs DESC in fetchAllPlayers,
  // the first player is the top scorer!
  // But here's how you'd do it manually with reduce():
  const topScorer = players.reduce((best, current) => {
    return current.runs > best.runs ? current : best;
  }, players[0]);

  return topScorer;
}

/**
 * 📊 Calculate the AVERAGE RUNS across all players
 *
 * SQL equivalent: SELECT AVG(runs) FROM players;
 *
 * @param {Array} players — The array of all players
 * @returns {number} — The average runs (rounded to 1 decimal)
 */
function calculateAverageRuns(players) {
  if (players.length === 0) return 0;

  // Step 1: Sum up all the runs
  const totalRuns = players.reduce((sum, player) => sum + player.runs, 0);

  // Step 2: Divide by number of players
  const average = totalRuns / players.length;

  // Step 3: Round to 1 decimal place
  return Math.round(average * 10) / 10;
}

/**
 * 🏟️ Calculate TEAM-WISE TOTAL RUNS
 *
 * SQL equivalent:
 *   SELECT team, SUM(runs) AS total_runs
 *   FROM players
 *   GROUP BY team
 *   ORDER BY total_runs DESC;
 *
 * @param {Array} players — The array of all players
 * @returns {Array} — Array of { team, totalRuns } objects
 */
function calculateTeamWiseRuns(players) {
  if (players.length === 0) return [];

  // Use an object to accumulate runs per team
  const teamMap = {};

  players.forEach((player) => {
    if (teamMap[player.team]) {
      // Team already exists → add runs
      teamMap[player.team] += player.runs;
    } else {
      // New team → initialize with this player's runs
      teamMap[player.team] = player.runs;
    }
  });

  // Convert the object into a sorted array
  const teamArray = Object.entries(teamMap)
    .map(([team, totalRuns]) => ({ team, totalRuns }))
    .sort((a, b) => b.totalRuns - a.totalRuns);

  return teamArray;
}

/**
 * 📈 Calculate AVERAGE RUNS PER MATCH for each player
 *
 * SQL equivalent:
 *   SELECT name, team, runs, matches,
 *          ROUND(runs::decimal / matches, 1) AS avg_per_match
 *   FROM players;
 *
 * @param {Array} players — The array of all players
 * @returns {Array} — Players with added avgPerMatch field
 */
function calculateAvgPerMatch(players) {
  return players.map((player) => ({
    ...player,
    avgPerMatch:
      player.matches > 0
        ? Math.round((player.runs / player.matches) * 10) / 10
        : 0,
  }));
}
