// ============================================================
// 🎯 script.js — Main Application Logic
// ============================================================
// This is the "brain" of our app. It:
//   1. Fetches player data from Supabase (using fetch-functions.js)
//   2. Calculates statistics (top scorer, averages, team totals)
//   3. Renders everything into the HTML page (DOM manipulation)
//   4. Handles search/filter functionality
//
// 💡 KEY CONCEPT: The "async/await" pattern
//    - Fetching data from a database takes time (like ordering food)
//    - "async" marks a function that will wait for something
//    - "await" pauses execution until the data arrives
//    - This prevents our app from freezing while waiting
// ============================================================

// ── 🎨 Color Palette for Player Avatars ─────────────────────
// Each player gets a colored circle with their initials
const AVATAR_COLORS = [
  "#059669", "#0284c7", "#7c3aed", "#db2777",
  "#ea580c", "#ca8a04", "#0891b2", "#4f46e5",
  "#be123c", "#15803d", "#1d4ed8", "#9333ea",
];

// ── 🏏 Team Emoji Map ───────────────────────────────────────
// Maps team names to flag/emoji for visual flair
const TEAM_EMOJIS = {
  "India": "🇮🇳",
  "Australia": "🇦🇺",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "South Africa": "🇿🇦",
  "New Zealand": "🇳🇿",
  "Pakistan": "🇵🇰",
  "Sri Lanka": "🇱🇰",
  "Bangladesh": "🇧🇩",
  "West Indies": "🌴",
  "Afghanistan": "🇦🇫",
  "Zimbabwe": "🇿🇼",
  "Ireland": "🇮🇪",
};

// ── 📦 Global State ─────────────────────────────────────────
// We store the fetched players here so the search filter
// can access them without re-fetching from the database
let allPlayers = [];

// ============================================================
// 🚀 MAIN INITIALIZATION — Runs when the page loads
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏏 Cricket Stats Analyzer — Starting up...");
  initializeApp();
});

/**
 * 🏗️ Initialize the entire application
 *
 * This is the "main" function that orchestrates everything:
 *   1. Fetch data from Supabase
 *   2. Calculate stats
 *   3. Render the UI
 *   4. Set up event listeners
 */
async function initializeApp() {
  try {
    // ── Step 1: Fetch all players from Supabase ──
    // This calls the function defined in fetch-functions.js
    // SQL equivalent: SELECT * FROM players ORDER BY runs DESC;
    allPlayers = await fetchAllPlayers();

    // ── Step 2: Check if we got any data ──
    if (allPlayers.length === 0) {
      showEmptyState();
      return;
    }

    // ── Step 3: Calculate statistics ──
    const topScorer = findTopScorer(allPlayers);
    const averageRuns = calculateAverageRuns(allPlayers);
    const teamStats = calculateTeamWiseRuns(allPlayers);
    const playersWithAvg = calculateAvgPerMatch(allPlayers);

    // ── Step 4: Update the UI ──
    updateStatCards(allPlayers, topScorer, averageRuns, teamStats);
    renderPlayersTable(playersWithAvg, topScorer);
    renderTeamCards(teamStats, allPlayers);
    renderTeamChart(teamStats);  // NEW: Chart.js visualization

    // ── Step 5: Set up interactive features ──
    setupSearch();
    setupSorting();  // NEW: Clickable column sorting

    console.log("✅ App initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    showErrorState(error.message);
  }
}

// ============================================================
// 📊 STAT CARDS — Update the 4 overview cards at the top
// ============================================================

/**
 * 🔄 Populate the stat cards with computed values
 *
 * @param {Array} players   — All player data
 * @param {Object} topScorer — Player with highest runs
 * @param {number} avgRuns   — Average runs across all players
 * @param {Array} teamStats  — Team-wise run totals
 */
function updateStatCards(players, topScorer, avgRuns, teamStats) {
  // Card 1: Total Players (SQL: SELECT COUNT(*) FROM players)
  document.getElementById("stat-total-players").textContent = players.length;
  document.getElementById("stat-total-detail").textContent =
    `Across ${teamStats.length} teams`;

  // Card 2: Top Scorer (SQL: SELECT name, runs FROM players ORDER BY runs DESC LIMIT 1)
  if (topScorer) {
    document.getElementById("stat-top-scorer").textContent =
      topScorer.runs.toLocaleString();
    document.getElementById("stat-top-detail").textContent =
      `${topScorer.name} (${topScorer.team})`;
  }

  // Card 3: Average Runs (SQL: SELECT ROUND(AVG(runs), 1) FROM players)
  document.getElementById("stat-avg-runs").textContent =
    avgRuns.toLocaleString();
  document.getElementById("stat-avg-detail").textContent =
    `Per player average`;

  // Card 4: Teams (SQL: SELECT COUNT(DISTINCT team) FROM players)
  document.getElementById("stat-teams").textContent = teamStats.length;
  document.getElementById("stat-teams-detail").textContent =
    `Total runs: ${players.reduce((s, p) => s + p.runs, 0).toLocaleString()}`;

  // Update player count badge
  document.getElementById("player-count").textContent = players.length;
}

// ============================================================
// 📋 PLAYERS TABLE — Render the main data table
// ============================================================

/**
 * 🏗️ Build and insert the players table into the DOM
 *
 * DOM Manipulation Explained:
 *   - document.getElementById()  → Find an element by its ID
 *   - element.innerHTML          → Set the HTML content inside an element
 *   - Template literals (`...`)  → Build HTML strings with ${variables}
 *
 * @param {Array} players   — Players with avgPerMatch calculated
 * @param {Object} topScorer — The top scorer (for highlighting)
 */
function renderPlayersTable(players, topScorer) {
  const container = document.getElementById("table-container");

  // Build the HTML table using template literals
  // Each ${...} inserts a JavaScript value into the HTML string
  const tableHTML = `
    <table class="data-table" id="players-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Team</th>
          <th class="sortable" data-sort="runs" data-dir="desc">Runs</th>
          <th class="sortable" data-sort="matches">Matches</th>
          <th class="sortable" data-sort="avgPerMatch">Avg/Match</th>
        </tr>
      </thead>
      <tbody>
        ${players
          .map((player, index) => createPlayerRow(player, index, topScorer))
          .join("")}
      </tbody>
    </table>
  `;

  // Replace the loading spinner with the actual table
  container.innerHTML = tableHTML;
}

/**
 * 🧱 Create a single table row for one player
 *
 * @param {Object} player   — The player data object
 * @param {number} index    — Row index (0-based) for ranking
 * @param {Object} topScorer — Top scorer for highlighting
 * @returns {string} — HTML string for one <tr> element
 */
function createPlayerRow(player, index, topScorer) {
  const rank = index + 1;
  const isTopScorer = topScorer && player.id === topScorer.id;
  const initials = getInitials(player.name);
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const teamEmoji = TEAM_EMOJIS[player.team] || "🏏";

  return `
    <tr class="${isTopScorer ? "top-scorer-row" : ""}" data-player-name="${player.name.toLowerCase()}" data-team="${player.team.toLowerCase()}">
      <td>
        <span class="cell-rank ${rank <= 3 ? "top-3" : ""}">${rank}</span>
      </td>
      <td>
        <div class="cell-player">
          <div class="player-avatar" style="background: ${avatarColor}">
            ${initials}
          </div>
          <span class="player-name">${player.name}</span>
        </div>
      </td>
      <td>
        <span class="cell-team">${teamEmoji} ${player.team}</span>
      </td>
      <td>
        <span class="cell-runs">${player.runs.toLocaleString()}</span>
      </td>
      <td>
        <span class="cell-matches">${player.matches}</span>
      </td>
      <td>
        <span class="cell-avg">${player.avgPerMatch}</span>
      </td>
    </tr>
  `;
}

/**
 * 🔤 Get initials from a player's name
 * Example: "Virat Kohli" → "VK"
 *
 * @param {string} name — Full name
 * @returns {string} — First letters of first & last name
 */
function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================================
// 🏟️ TEAM CARDS — Render team-wise analysis section
// ============================================================

/**
 * 🏗️ Build and insert team stat cards
 *
 * @param {Array} teamStats  — Array of { team, totalRuns }
 * @param {Array} allPlayers — All player data
 */
function renderTeamCards(teamStats, allPlayers) {
  const container = document.getElementById("team-grid");
  const maxRuns = teamStats.length > 0 ? teamStats[0].totalRuns : 1;

  const cardsHTML = teamStats
    .map((teamData, index) => {
      const teamPlayers = allPlayers.filter(
        (p) => p.team === teamData.team
      );
      const teamEmoji = TEAM_EMOJIS[teamData.team] || "🏏";
      const barWidth = Math.round((teamData.totalRuns / maxRuns) * 100);
      const teamAvg =
        teamPlayers.length > 0
          ? Math.round(teamData.totalRuns / teamPlayers.length)
          : 0;
      const topInTeam = teamPlayers.reduce(
        (best, p) => (p.runs > best.runs ? p : best),
        teamPlayers[0]
      );

      return `
        <div class="team-card" style="animation-delay: ${index * 0.1}s">
          <div class="team-card-header">
            <span class="team-name">${teamEmoji} ${teamData.team}</span>
            <span class="team-badge">${teamPlayers.length} players</span>
          </div>

          <div class="team-stat-row">
            <span class="team-stat-label">Total Runs</span>
            <span class="team-stat-value" style="color: var(--color-primary)">
              ${teamData.totalRuns.toLocaleString()}
            </span>
          </div>

          <div class="team-stat-row">
            <span class="team-stat-label">Avg Runs / Player</span>
            <span class="team-stat-value">
              ${teamAvg.toLocaleString()}
            </span>
          </div>

          <div class="team-stat-row">
            <span class="team-stat-label">Top Scorer</span>
            <span class="team-stat-value" style="font-size: 0.85rem">
              ${topInTeam ? topInTeam.name : "—"}
            </span>
          </div>

          <div class="team-bar-container">
            <div class="team-bar-track">
              <div class="team-bar-fill" id="bar-${index}" data-width="${barWidth}"></div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = cardsHTML;

  // Animate the progress bars after a short delay
  // We use setTimeout so the bars animate AFTER the cards appear
  setTimeout(() => {
    teamStats.forEach((_, index) => {
      const bar = document.getElementById(`bar-${index}`);
      if (bar) {
        bar.style.width = bar.dataset.width + "%";
      }
    });
  }, 400);
}

// ============================================================
// 🔍 SEARCH — Filter players by name or team
// ============================================================

/**
 * 🎯 Set up the search input event listener
 *
 * Event Listeners Explained:
 *   - "input" event fires every time the user types a character
 *   - We filter the table rows to show only matching players
 *   - This happens in real-time (no button click needed!)
 */
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => {
    // Get the search term (convert to lowercase for case-insensitive search)
    const query = event.target.value.toLowerCase().trim();

    // Find all table rows in the tbody
    const rows = document.querySelectorAll("#players-table tbody tr");
    let visibleCount = 0;

    rows.forEach((row) => {
      // Each row has data attributes we set earlier:
      //   data-player-name="virat kohli"
      //   data-team="india"
      const playerName = row.getAttribute("data-player-name");
      const team = row.getAttribute("data-team");

      // Check if the search query matches name or team
      const matches =
        playerName.includes(query) || team.includes(query);

      // Show or hide the row using CSS display property
      row.style.display = matches ? "" : "none";

      if (matches) visibleCount++;
    });

    // Update the visible count badge
    document.getElementById("player-count").textContent = visibleCount;
  });
}

// ============================================================
// ⚠️ ERROR & EMPTY STATES
// ============================================================

/**
 * 📭 Show a message when no data is found in the database
 */
function showEmptyState() {
  const container = document.getElementById("table-container");
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🏏</div>
      <h3 class="empty-title">No Players Found</h3>
      <p class="empty-message">
        The "players" table is empty. Add some player data to your
        Supabase database to see it here!<br><br>
        <strong>Tip:</strong> Go to your Supabase dashboard → Table Editor
        → Insert rows into the "players" table.
      </p>
    </div>
  `;

  // Also hide the team section
  document.getElementById("team-section").style.display = "none";
}

/**
 * ❌ Show an error message when something goes wrong
 *
 * @param {string} message — The error description
 */
function showErrorState(message) {
  const container = document.getElementById("table-container");
  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">Oops! Something went wrong</h3>
      <p class="error-message">
        ${message || "Could not fetch data from Supabase."}<br>
        Make sure your Supabase URL and Key are correct in
        <code>supabase-config.js</code>
      </p>
      <button class="btn-retry" onclick="location.reload()">
        🔄 Try Again
      </button>
    </div>
  `;

  // Also hide the team section
  document.getElementById("team-section").style.display = "none";
}

// ============================================================
// 🗄️ SQL QUERY EXPLORER — Show SQL behind every stat
// ============================================================

/**
 * 📚 SQL Queries Map
 * Each key corresponds to a "Show SQL" button in the HTML.
 * The value contains the description and the raw SQL query.
 *
 * This is the CORE TEACHING FEATURE — students see exactly
 * what SQL query produces each piece of data they see on screen.
 */
const SQL_QUERIES = {
  count: {
    description: "Count all players in the database. The COUNT(*) function returns the number of rows.",
    sql: `SELECT COUNT(*) AS total_players\nFROM players;`,
  },
  topScorer: {
    description: "Find the player with the most runs. ORDER BY sorts the results, DESC means highest first, and LIMIT 1 takes only the top row.",
    sql: `SELECT name, team, runs\nFROM players\nORDER BY runs DESC\nLIMIT 1;`,
  },
  average: {
    description: "Calculate the average runs across all players. AVG() is an aggregate function that computes the mean value.",
    sql: `SELECT ROUND(AVG(runs), 1)\n  AS average_runs\nFROM players;`,
  },
  teams: {
    description: "Count the number of distinct (unique) teams. DISTINCT removes duplicate values before counting.",
    sql: `SELECT COUNT(DISTINCT team)\n  AS total_teams\nFROM players;`,
  },
  selectAll: {
    description: "Fetch all players sorted by runs in descending order. The asterisk (*) means 'select all columns'.",
    sql: `SELECT *\nFROM players\nORDER BY runs DESC;`,
  },
  groupBy: {
    description: "Calculate total runs per team using GROUP BY. SUM() adds up all runs for each group (team).",
    sql: `SELECT team,\n       SUM(runs)  AS total_runs,\n       COUNT(*)   AS player_count,\n       AVG(runs)  AS avg_runs\nFROM players\nGROUP BY team\nORDER BY total_runs DESC;`,
  },
  teamChart: {
    description: "This is the same GROUP BY query used to generate the bar chart. The visualization maps 'team' to the Y-axis and 'total_runs' to the X-axis.",
    sql: `-- Data behind the chart\nSELECT team,\n       SUM(runs) AS total_runs\nFROM players\nGROUP BY team\nORDER BY total_runs DESC;`,
  },
};

/**
 * 🔓 Open the SQL modal with the specified query
 * @param {string} queryKey — Key from SQL_QUERIES map
 */
function showSQL(queryKey) {
  const query = SQL_QUERIES[queryKey];
  if (!query) return;

  document.getElementById("sql-modal-description").textContent =
    query.description;
  document.getElementById("sql-modal-code").textContent = query.sql;
  document.getElementById("sql-modal-overlay").classList.add("active");

  // Prevent body scrolling while modal is open
  document.body.style.overflow = "hidden";
}

/**
 * 🔒 Close the SQL modal
 */
function closeSQL() {
  document.getElementById("sql-modal-overlay").classList.remove("active");
  document.body.style.overflow = "";
}

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSQL();
});

// ============================================================
// 📈 CHART.JS — Team Runs Visualization
// ============================================================

/**
 * 🏗️ Create a horizontal bar chart showing team total runs
 *
 * Chart.js Explained:
 *   - We create a new Chart() instance on a <canvas> element
 *   - "bar" type with indexAxis "y" = horizontal bars
 *   - We pass the team names as labels and runs as data
 *   - Chart.js handles all the drawing and animations!
 *
 * @param {Array} teamStats — Array of { team, totalRuns }
 */
function renderTeamChart(teamStats) {
  const canvas = document.getElementById("team-chart");
  if (!canvas || teamStats.length === 0) return;

  // Prepare data for Chart.js
  const labels = teamStats.map((t) => t.team);
  const data = teamStats.map((t) => t.totalRuns);

  // Generate orange gradient colors for each bar
  const barColors = teamStats.map((_, i) => {
    const opacity = 1 - i * (0.6 / teamStats.length);
    return `rgba(232, 101, 10, ${opacity})`;
  });

  const borderColors = teamStats.map(() => "rgba(232, 101, 10, 0.8)");

  // Create the chart
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Runs",
          data: data,
          backgroundColor: barColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 28,
        },
      ],
    },
    options: {
      indexAxis: "y", // Horizontal bar chart
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a1a1a",
          titleColor: "#e8650a",
          bodyColor: "#f5f5f5",
          borderColor: "rgba(232, 101, 10, 0.3)",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (ctx) => `  ${ctx.raw.toLocaleString()} runs`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#6b6b6b",
            font: { family: "Inter", size: 11 },
            callback: (v) => v.toLocaleString(),
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: "#a0a0a0",
            font: { family: "Inter", size: 12, weight: 600 },
          },
        },
      },
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },
    },
  });
}

// ============================================================
// 🔽 INTERACTIVE TABLE SORTING
// ============================================================

/**
 * Current sort state — tracks which column is sorted and direction
 */
let currentSort = { column: "runs", direction: "desc" };

/**
 * 🎯 Set up click event listeners on sortable table headers
 *
 * Event Delegation Explained:
 *   - Instead of attaching listeners when the table is first rendered,
 *     we wait for initializeApp to call this function.
 *   - Each <th class="sortable"> has data-sort (column name)
 *   - Clicking toggles between ascending and descending order
 */
function setupSorting() {
  // We use event delegation on the table container
  // so it works even after re-rendering
  const container = document.getElementById("table-container");

  container.addEventListener("click", (event) => {
    const th = event.target.closest("th.sortable");
    if (!th) return;

    const column = th.dataset.sort;

    // Toggle direction if same column, else default to desc
    if (currentSort.column === column) {
      currentSort.direction =
        currentSort.direction === "desc" ? "asc" : "desc";
    } else {
      currentSort.column = column;
      currentSort.direction = "desc";
    }

    // Sort the global allPlayers array
    const sorted = calculateAvgPerMatch([...allPlayers]).sort((a, b) => {
      const valA = a[column] ?? 0;
      const valB = b[column] ?? 0;
      return currentSort.direction === "desc"
        ? valB - valA
        : valA - valB;
    });

    // Re-render the table with sorted data
    const topScorer = findTopScorer(allPlayers);
    renderPlayersTable(sorted, topScorer);

    // Update the sort indicator on the correct header
    updateSortIndicators();
  });
}

/**
 * 🔄 Update the visual sort arrows on table headers
 */
function updateSortIndicators() {
  const headers = document.querySelectorAll(
    "#players-table th.sortable"
  );

  headers.forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");

    if (th.dataset.sort === currentSort.column) {
      th.classList.add(
        currentSort.direction === "asc" ? "sort-asc" : "sort-desc"
      );
    }
  });
}
