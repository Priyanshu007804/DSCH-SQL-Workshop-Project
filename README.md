# 🏏 Cricket Stats Analyzer — DSCH SQL Workshop

Welcome to the **Cricket Stats Analyzer**, a premium web application built for the **Data Science Club HIT (DSCH)** SQL Workshop. This project is designed to bridge the gap between database concepts and real-world application building for first-year students.

![DSCH Banner](assets/dsch-banner.png)

## 🌟 Project Overview
This application demonstrates how **SQL (PostgreSQL)** data can be fetched, analyzed, and visualized in a modern web interface. It uses a **Vanilla JavaScript** frontend and **Supabase** as a backend-as-a-service to handle live database queries without needing a custom Node.js/Express server.

---

## 🚀 Key Features

### 1. 🗄️ SQL Query Explorer (Educational)
The marquee feature of this project. Every statistic on the page—from total runs to team-wise averages—has a **"{ } Show SQL"** button. Clicking it reveals the exact SQL query (using functions like `COUNT`, `MAX`, `AVG`, `GROUP BY`, and `DISTINCT`) that powers that specific data block.

### 2. 📊 Team Runs Visualization
Using **Chart.js**, we've integrated a sleek horizontal bar chart that visualizes the distribution of runs across different teams. This teaches students how to map `GROUP BY` result sets to interactive graphical components.

### 3. 🔽 Interactive Player Rankings
A high-performance data table that features:
- **Real-time Search:** Filter players by name or team instantly as you type.
- **Dynamic Sorting:** Click on any column header (Runs, Matches, Average) to sort the data in ascending or descending order using JavaScript logic.

### 4. 🎨 Premium Branding & UI
- **DSCH Visual Identity:** A professional dark-themed UI matching the DSCH orange, black, and white color palette.
- **Glassmorphism:** Modern card designs with backdrop-blur effects and orange-tinted glows.
- **Responsive Design:** Optimized for both desktop and mobile viewing.

---

## 🔍 Database & Query Strategy

In this project, we prioritize efficiency by minimizing direct database calls. There is **only one actual query made directly to the Supabase database**. The rest of the "queries" (aggregations) are performed locally in JavaScript after all the data is fetched. This is a common pattern for smaller datasets to reduce the number of network requests and improve performance.

### 1. The Main Database Query (Supabase to PostgreSQL)
This is the single network request made to fetch the data.
- **Supabase Query (JS):**
  ```javascript
  supabaseClient.from("players").select("*").order("runs", { ascending: false });
  ```
- **SQL Equivalent:**
  ```sql
  SELECT * FROM players ORDER BY runs DESC;
  ```
- **Why it's used:** We need to fetch all the player data to display in our table and calculate our statistics. By adding `ORDER BY runs DESC`, we ask the database to sort the players from highest runs to lowest runs *before* sending it to us. This makes finding the "Top Scorer" later extremely easy and efficient.

### 2. Local "Queries" (JavaScript Aggregations)
Instead of asking the database for every single statistic (which would mean making multiple separate network requests), this project fetches all the data once using the query above, and then uses JavaScript array functions (`reduce`, `map`, `forEach`) to act as our SQL `GROUP BY`, `SUM()`, and `AVG()` functions.

If you were to do these directly in SQL, here is what they would look like:

#### A. Top Scorer
- **SQL Equivalent:**
  ```sql
  SELECT * FROM players ORDER BY runs DESC LIMIT 1;
  ```
- **Why it's used:** To display the "Top Scorer" stat card. Since our main query already sorted the array by runs, JavaScript simply grabs the first player in the list (`players[0]`).

#### B. Average Runs
- **SQL Equivalent:**
  ```sql
  SELECT AVG(runs) FROM players;
  ```
- **Why it's used:** To populate the "Average Runs" stat card. It gives users a quick summary of the baseline performance of all players. JavaScript does this by adding all runs together and dividing by the total number of players.

#### C. Team-Wise Total Runs
- **SQL Equivalent:**
  ```sql
  SELECT team, SUM(runs) AS total_runs
  FROM players
  GROUP BY team
  ORDER BY total_runs DESC;
  ```
- **Why it's used:** To power the "Runs by Team" bar chart. This groups all players by their team and calculates the sum of their runs, showing which team is performing the best overall.

#### D. Average Runs Per Match (Per Player)
- **SQL Equivalent:**
  ```sql
  SELECT name, team, runs, matches, 
         ROUND(runs::decimal / matches, 1) AS avg_per_match 
  FROM players;
  ```
- **Why it's used:** To add a calculated column to the data table. It divides a player's total runs by the number of matches they played, providing a better metric of consistency than just "total runs."

---

## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Backend:** Supabase (PostgreSQL Database).
- **Libraries:** 
  - [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
  - [Chart.js v4](https://www.chartjs.org/)
- **Fonts:** [Google Fonts](https://fonts.google.com/) (Inter & Outfit).

---

## 📂 Project Structure
```text
/
├── assets/               # DSCH Brand assets (logos, banner)
├── favicon.ico           # Application icon
├── fetch-functions.js    # Supabase queries & data logic
├── index.html            # Main UI structure
├── README.md             # Project documentation
├── script.js             # Main App brain (DOM, Sorting, Charts, Modal)
├── style.css             # Design system & glassmorphism styles
└── supabase-config.js    # Database connection parameters
```

---

## ⚙️ Local Setup

1. **Clone the project:**
   ```bash
   git clone https://github.com/Priyanshu007804/DSCH-SQL-Workshop-Project.git
   ```
2. **Configure Database:**
   Update `supabase-config.js` with your specific Supabase Project URL and Anon Key.
3. **Run Locally:**
   Open `index.html` using a local server (like VS Code Live Server or `http-server`).
   ```bash
   npx http-server ./ -p 8080
   ```

---

### 🧡 Built by Data Science Club HIT
*"Empowering the next generation of Data Scientists."*
