[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/x7leiH51)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=22959799&assignment_repo_type=AssignmentRepo)
Web Scraping Assignment with Axios and Cheerio
---

## Objective  
In this assignment, you will use **Axios** and **Cheerio** to scrape data from multiple web pages and save the extracted data in structured JSON files. Your results must be stored inside a `results` directory.  

## Setup  
Before starting, ensure you have the necessary dependencies installed. If you haven't already, install **Axios** and **Cheerio** using the following command:

```bash
npm install axios cheerio fs-extra
```

Also, create a `results` directory to store the extracted data:

```bash
mkdir results
```

## Tasks  

### 1. Scrape DU Bulletin for Upper-Division CS Courses Without Prerequisites  
Scrape the [DU bulletin](https://bulletin.du.edu/) to find all **Computer Science (COMP)** courses that are **upper-division (3000-level or higher)** and have **no prerequisites**. Extract the **course code** and **course title**, then save the data in a JSON file (`results/bulletin.json`) using the following format:

#### JSON Format:
```json
{
    "courses": [
        {
            "course": "COMP-XXXX",
            "title": "Course Title"
        },
        {
            "course": "COMP-XXXX",
            "title": "Course Title"
        },
        ...
    ]
}
```

### 2. Scrape DU Athletics Site for Upcoming Events  
Visit the [DU sports athletics site](https://denverpioneers.com/index.aspx) and extract event details from the **top carousel**. You need to extract:  
- **DU Team Name**  
- **Opponent Team Name**  
- **Event Date**  

Save the results in `results/athletic_events.json` using the following format:

#### JSON Format:
```json
{
    "events": [
        {
            "duTeam": "DU Team Name",
            "opponent": "Opponent Team Name",
            "date": "Event Date"
        },
        {
            "duTeam": "DU Team Name",
            "opponent": "Opponent Team Name",
            "date": "Event Date"
        },
        ...
    ]
}
```

#### Hint:  
Inspect the **HTML structure** of the page to determine where the carousel data is actually being sourced from. It might be dynamically loaded via JavaScript.

### 3. Scrape the DU Main Calendar for 2025 Events  
Scrape the [DU main calendar](https://www.du.edu/calendar) and extract all events occurring between **January 1, 2025 – December 31, 2025**. Extract the following details:  
- **Event Title**  
- **Event Date**  
- **Event Time** (if available)  
- **Event Description** (if available on the event page)  

Save the results in `results/calendar_events.json` using the format below:

#### JSON Format:
```json
{
    "events": [
        {
            "title": "Event Title",
            "date": "Event Date",
            "time": "Event Time",
            "description": "Event Description"
        },
        {
            "title": "Event Title",
            "date": "Event Date",
            "time": "Event Time",
            "description": "Event Description"
        },
        ...
    ]
}
```

**Note:**  
- If an event **does not have a time** listed, you can omit the `time` field.  
- If an event **does not have a description**, you can omit the `description` field. Note that descriptions are on the event page itself, so you will need to visit each event page to extract this information.  

---

## Submission Requirements  
- Ensure your results are stored in the `results` directory with correctly formatted JSON files.  
