# SoonerView

SoonerView is a web application that provides Oklahomans with resources to explore votes in the Oklahoma Legislature, including committee votes. Inspired by Voteview.com, SoonerView makes state-level politics more accessible and transparent.

Overview

While many people pay attention to federal politics, state politics often falls under the radar. In a safe state like Oklahoma, this is even more pronounced. SoonerView aims to bridge this gap by providing an intuitive platform to explore legislative measures, votes, and representatives.

Features

- **Measure Search & Filtering**: Search measures by number, author name, or filter by date, chamber, and passage status
- **Interactive District Maps**: Visualize voting patterns across Oklahoma House and Senate districts using Leaflet maps
- **Vote Details**: View detailed information about each measure including:
  - Vote counts (Yea/Nay)
  - Primary author and coauthors
  - Measure descriptions
  - Full bill text (PDF format)
- User Accounts: Firebase-powered authentication with bookmarking functionality
- **AI-Powered Summaries: Cloudflare AI integration to generate concise summaries of legislative bills
- Responsive Design: Mobile-friendly interface with modern UI/UX

Tech Stack

 Frontend
- HTML/CSS/JavaScript: Core web technologies
- Firebase Authentication: User account management
- Leaflet.js: Interactive mapping
- PDF.js: PDF rendering for bill text
- Font Awesome: Icons

Backend
- Cloudflare Workers: Serverless functions
- Cloudflare D1: SQLite database
- Cloudflare AI: AI-powered bill summarization
- Firebase: Authentication and user data

Data Sources
- LegiScan Public API: Legislative data (measures, votes, legislators)
- Oklahoma State House GIS Services: Legislative district boundaries
- OpenStreetMap: Map data

Project Structure

```
soonerview/
├── Software-Engineering-Project/     # Main application
│   ├── functions/                    # Cloudflare Workers functions
│   │   ├── query.js                 # Main API endpoint (GET/POST/DELETE)
│   │   └── ai-summary/              # AI summarization endpoint
│   ├── Website Assets/               # Static assets
│   │   ├── BillStoragePDFs/         # PDF files of bills
│   │   ├── DatabaseDBFiles/         # SQLite database files
│   │   ├── DatabaseSQLFiles/       # SQL schema files
│   │   └── MapSHPFile/              # Geographic data
│   ├── index.html                   # Home page
│   ├── measure.html                 # Measure detail page
│   ├── measureDisplay.js           # Measure listing and filtering logic
│   ├── measurePage.js              # Measure detail page logic
│   ├── mapDisplay.js               # Map rendering logic
│   ├── ai-summary.js               # AI summary generation
│   └── wrangler.jsonc               # Cloudflare Workers configuration
└── d1-tutorial/                     # Database tutorial/development files
```

Getting Started

Prerequisites

- Node.js (for local development)
- Cloudflare account with Workers and D1 enabled
- Firebase project for authentication
- Wrangler CLI: `npm install -g wrangler`

Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd soonerview
   ```

2. Configure Cloudflare
   - Update `wrangler.jsonc` with your Cloudflare account ID and database IDs
   - Set up D1 database bindings

3. **Set up Firebase**
   - Create a Firebase project
   - Update Firebase configuration in `account.html` and `measureDisplay.js`
   - Configure Firebase API key in `wrangler.jsonc`

4. **Deploy to Cloudflare**
   ```bash
   cd Software-Engineering-Project
   wrangler deploy
   ```

Database Setup

The application uses SQLite databases (D1) with the following tables:
- `votes_1`, `votes_2`: Vote records and district-level voting data
- `measures`: Legislative measures/bills
- `legislators`: Representative information
- `terms`: Legislative terms and party affiliations
- `coauthors`: Bill coauthor relationships
- `user_info`: User bookmarks (user_id, roll_call_id)

SQL schema files are located in `Website Assets/DatabaseSQLFiles/`.

 API Endpoints

### GET `/query`
Main query endpoint with multiple query modes:

- **`?vote_id={id}`**: Get detailed information about a specific vote/measure
- **`?search`**: Search measures (default: returns all measures)
- **`?search&searchID={measure_number}`**: Search by measure number
- **`?search&searchAuthor={author_name}`**: Search by author name
- **`?district={district}&vote_id={id}`**: Get district-level vote data

POST `/query`
Add a bookmark (requires Firebase authentication token)
```json
{
  "roll_call_id": "12345"
}
```

 DELETE `/query`
Remove a bookmark (requires Firebase authentication token)
```json
{
  "roll_call_id": "12345"
}
```

POST `/ai-summary`
Generate AI summary of bill text
```json
{
  "bill_text": "Full text of the bill..."
}
```

Features in Detail

### Measure Search & Filtering
- Filter by date (ascending/descending)
- Filter by chamber (House/Senate)
- Filter by passage status (Passed/Failed)
- Filter by bookmarked measures (for logged-in users)
- Search by measure number or author name

Interactive Maps
- Color-coded districts based on vote (Yea/Nay/No vote)
- Party affiliation visualization (Republican/Democratic)
- Click districts to view representative information

User Features
- Create account / Sign in with Firebase
- Bookmark measures for later viewing
- View bookmarked measures in filtered list

 Contributors

This project was developed as part of a Software Engineering course at Oklahoma State University by:
- Jace Bormann
- Aaron Daugherty
- Aiden Maner
- Malik Melendez
- Ryan Price

 License & Attributions

- **LegiScan Data**: © LegiScan. Licensed under CC BY 4.0
- **Map Data**: © OpenStreetMap contributors
- **Oklahoma Legislative Districts**: Oklahoma State House of Representatives GIS Services
- **Firebase**: Google Firebase
- **Leaflet**: Open source mapping library
- **Cloudflare**: Hosting and serverless infrastructure

 Live Site

Visit the live application at: [https://soonerview.org](https://soonerview.org)

Notes

- The application is optimized for the 2025 Oklahoma Legislative Session
- PDF bill texts are stored in the repository under `Website Assets/BillStoragePDFs/`
- Database files are included for local development but should be managed through Cloudflare D1 in production

Contributing

This is an academic project, but suggestions and improvements are welcome. Please open an issue or submit a pull request for any enhancements.

---

Note: This project is designed for educational purposes as part of a Software Engineering course at Oklahoma State University.


